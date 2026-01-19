import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuthStore, useTransactionStore } from "@/stores";
import {
  History,
  ExternalLink,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Gamepad2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Transactions() {
  const { isAuthenticated } = useAuthStore();
  const { transactions, isLoading, fetchTransactions } = useTransactionStore();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated, fetchTransactions]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "success":
        return {
          label: "Berhasil",
          icon: CheckCircle2,
          className: "status-success",
        };
      case "pending":
        return {
          label: "Menunggu Pembayaran",
          icon: Clock,
          className: "status-pending",
        };
      case "processing":
        return {
          label: "Diproses",
          icon: Loader2,
          className: "status-processing",
        };
      case "failed":
      case "expired":
        return {
          label: status === "failed" ? "Gagal" : "Kadaluarsa",
          icon: XCircle,
          className: "status-failed",
        };
      default:
        return {
          label: status,
          icon: Clock,
          className: "status-pending",
        };
    }
  };

  const copyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId);
    toast({
      title: "Disalin!",
      description: "Order ID berhasil disalin",
    });
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <History className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">
            Login Diperlukan
          </h1>
          <p className="text-muted-foreground mb-6">
            Silakan login untuk melihat riwayat transaksi kamu
          </p>
          <Button variant="gaming" asChild>
            <Link to="/login">Login Sekarang</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Riwayat <span className="gradient-text">Transaksi</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Lihat dan pantau semua transaksi top up kamu
          </p>
        </div>

        {/* Transactions List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((tx) => {
              const status = getStatusConfig(tx.status);
              const StatusIcon = status.icon;

              return (
                <div key={tx.id} className="gaming-card">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Game Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <img
                        src={tx.game?.image || "/placeholder.svg"}
                        alt={tx.game?.name || "Game"}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          {tx.game?.name || "Game"}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {tx.product_name || "Product"}
                        </p>
                        <div className="flex items-center gap-2 mt-1 relative">
                          <button
                            onClick={() => copyOrderId(tx.invoice_number)}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                          >
                            <Copy className="h-3 w-3" />
                            {tx.invoice_number}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Status & Price */}
                    <div className="flex items-center justify-between md:justify-end gap-4">
                      <div className="text-right">
                        <p className="font-display font-bold text-lg text-primary">
                          {formatPrice(tx.total_amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(tx.created_at)}
                        </p>
                        <p>
                          <span className="font-semibold">Method:</span>{" "}
                          {tx.payment_method}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium",
                          status.className,
                        )}
                      >
                        <StatusIcon
                          className={cn(
                            "h-4 w-4",
                            tx.status === "processing" && "animate-spin",
                          )}
                        />
                        {status.label}
                      </div>
                    </div>
                  </div>

                  {/* Action for Pending */}
                  {tx.status === "pending" && tx.payment_url && (
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Selesaikan pembayaran sebelum{" "}
                        <span className="text-warning font-medium">
                          {tx.expired_at ? formatDate(tx.expired_at) : "-"}
                        </span>
                      </p>
                      <Button variant="gaming" size="sm" asChild>
                        <a
                          href={tx.payment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Bayar Sekarang
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  )}

                  {/* Player Data */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Player ID:
                      </span>{" "}
                      {tx.target_user_id}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold mb-2">
              Belum ada transaksi
            </h3>
            <p className="text-muted-foreground mb-6">
              Mulai top up game favorit kamu sekarang
            </p>
            <Button variant="gaming" asChild>
              <Link to="/games">Lihat Game</Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
