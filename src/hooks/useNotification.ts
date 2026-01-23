import { useCallback, useEffect } from "react";
import { useWebSocket, type WebSocketMessage } from "./useWebSocket";
import { useNotificationStore } from "@/stores/notificationStore";
import { useAuthStore } from "@/stores/authStore";
import { type Transaction } from "@/lib/api";
import { toast } from "sonner";

interface TransactionWSData {
  transaction: Transaction;
  previousStatus?: string;
}

interface SystemWSData {
  title: string;
  message: string;
  level: "info" | "warning" | "error";
}

export const useNotifications = () => {
  const { addNotification, addTransactionNotification } =
    useNotificationStore();
  const { user } = useAuthStore();

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      const { type, data } = message;

      switch (type) {
        case "transaction_created": {
          const txData = data as TransactionWSData;
          addTransactionNotification(txData.transaction, "created");

          toast.info("Transaksi Baru", {
            description: `Transaksi #${txData.transaction.invoice_number} telah dibuat`,
          });
          break;
        }

        case "transaction_updated":
        case "transaction_status_changed": {
          const txData = data as TransactionWSData;
          addTransactionNotification(txData.transaction, "updated");

          const statusMessages: Record<
            string,
            { title: string; type: "success" | "error" | "info" }
          > = {
            success: { title: "Transaksi Berhasil", type: "success" },
            failed: { title: "Transaksi Gagal", type: "error" },
            expired: { title: "Transaksi Kadaluarsa", type: "error" },
            processing: { title: "Transaksi Diproses", type: "info" },
          };

          const statusInfo = statusMessages[txData.transaction.status] || {
            title: "Update Transaksi",
            type: "info" as const,
          };

          if (statusInfo.type === "success") {
            toast.success(statusInfo.title, {
              description: `Transaksi #${txData.transaction.invoice_number} berhasil diproses`,
            });
          } else if (statusInfo.type === "error") {
            toast.error(statusInfo.title, {
              description: `Transaksi #${txData.transaction.invoice_number} ${txData.transaction.status === "expired" ? "telah kadaluarsa" : "gagal diproses"}`,
            });
          } else {
            toast.info(statusInfo.title, {
              description: `Transaksi #${txData.transaction.invoice_number} sedang diproses`,
            });
          }
          break;
        }

        case "system_notification": {
          const sysData = data as SystemWSData;

          addNotification({
            type:
              sysData.level === "warning"
                ? "warning"
                : sysData.level === "error"
                  ? "error"
                  : "info",
            title: sysData.title,
            message: sysData.message,
          });

          if (sysData.level === "error") {
            toast.error(sysData.title, { description: sysData.message });
          } else if (sysData.level === "warning") {
            toast.warning(sysData.title, { description: sysData.message });
          } else {
            toast.info(sysData.title, { description: sysData.message });
          }
          break;
        }

        default:
          console.log("Unknown WebSocket message type:", type);
      }
    },
    [addNotification, addTransactionNotification],
  );

  const handleConnect = useCallback(() => {
    console.log("Notifications WebSocket connected");
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log("Notifications WebSocket disconnected");
  }, []);

  const { isConnected, connectionState, sendMessage } = useWebSocket({
    onMessage: handleMessage,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
  });

  // Subscribe to user-specific notifications on connect
  useEffect(() => {
    if (isConnected && user?.id) {
      sendMessage({
        type: "subscribe",
        channel: `user:${user.id}`,
      });
    }
  }, [isConnected, user?.id, sendMessage]);

  return {
    isConnected,
    connectionState,
  };
};

export default useNotifications;
