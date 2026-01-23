import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Transaction } from "@/lib/api";

export interface Notification {
  id: string;
  type: "transaction" | "system" | "info" | "warning" | "error";
  title: string;
  message: string;
  data?: unknown;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;

  addNotification: (
    notification: Omit<Notification, "id" | "read" | "createdAt">,
  ) => void;
  addTransactionNotification: (
    transaction: Transaction,
    type: "created" | "updated",
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const generateId = () =>
  `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getTransactionStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: "Menunggu Pembayaran",
    processing: "Diproses",
    success: "Berhasil",
    failed: "Gagal",
    expired: "Kadaluarsa",
  };
  return labels[status] || status;
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: generateId(),
          read: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50),
          unreadCount: state.unreadCount + 1,
        }));

        return newNotification;
      },

      addTransactionNotification: (transaction, type) => {
        const isCreated = type === "created";
        const statusLabel = getTransactionStatusLabel(transaction.status);

        const notification: Omit<Notification, "id" | "read" | "createdAt"> = {
          type: "transaction",
          title: isCreated ? "Transaksi Baru" : "Update Transaksi",
          message: isCreated
            ? `Transaksi #${transaction.invoice_number} telah dibuat. Status: ${statusLabel}`
            : `Transaksi #${transaction.invoice_number} diperbarui ke status: ${statusLabel}`,
          data: transaction,
        };

        get().addNotification(notification);
      },

      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (!notification || notification.read) return state;

          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n,
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          const wasUnread = notification && !notification.read;

          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: wasUnread
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          };
        });
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },
    }),
    {
      name: "notification-storage",
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 20),
        unreadCount: state.unreadCount,
      }),
    },
  ),
);
