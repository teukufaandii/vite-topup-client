import { useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatsCard } from "@/components/admin/StatsCard";
import { DataTable } from "@/components/admin/DataTable";
import { useAdminStore } from "@/stores/adminStores";
import { Users, Receipt, DollarSign, Clock, Gamepad2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type Transaction } from "@/lib/api";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "success":
      return "bg-success/20 text-success border-success/30";
    case "pending":
      return "bg-warning/20 text-warning border-warning/30";
    case "processing":
      return "bg-primary/20 text-primary border-primary/30";
    case "failed":
    case "expired":
      return "bg-destructive/20 text-destructive border-destructive/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function AdminDashboard() {
  const {
    stats,
    transactions,
    games,
    fetchStats,
    fetchAllTransactions,
    fetchAllGames,
    isLoading,
  } = useAdminStore();

  useEffect(() => {
    fetchStats();
    fetchAllTransactions();
    fetchAllGames();
  }, [fetchStats, fetchAllTransactions, fetchAllGames]);

  const safeTransactions = transactions || [];
  const safeGames = games || [];

  const recentTransactions = safeTransactions.slice(0, 5);

  const transactionColumns = [
    {
      key: "order_id",
      header: "Order ID",
      render: (item: Transaction) => (
        <span className="font-mono text-sm">{item.invoice_number}</span>
      ),
    },
    {
      key: "game",
      header: "Game",
      render: (item: Transaction) => item.game_name || "-",
      className: "text-left",
    },
    {
      key: "total",
      header: "Amount",
      render: (item: Transaction) => (
        <span className="font-semibold">
          {formatCurrency(item.total_amount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: Transaction) => (
        <Badge className={getStatusColor(item.status)}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      render: (item: Transaction) => (
        <span className="text-muted-foreground">
          {formatDate(item.created_at)}
        </span>
      ),
      className: "text-left",
    },
  ];

  function getPopularGamesByTotalSold(games: any[]) {
    return [...games]
      .sort((a: any, b: any) => b.total_sold - a.total_sold)
      .slice(0, 5);
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-left">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-left">
            Welcome back! Here's what's happening.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={stats?.total_users || 0}
            icon={<Users className="w-6 h-6" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Total Transactions"
            value={stats?.total_transactions || safeTransactions.length}
            icon={<Receipt className="w-6 h-6" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(
              stats?.total_revenue ||
                safeTransactions.reduce((acc, t) => acc + t.total_amount, 0),
            )}
            icon={<DollarSign className="w-6 h-6" />}
            trend={{ value: 15, isPositive: true }}
          />
          <StatsCard
            title="Pending Orders"
            value={
              stats?.pending_transactions ||
              safeTransactions.filter((t) => t.status === "pending").length
            }
            icon={<Clock className="w-6 h-6" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Recent Transactions
              </h2>
              <a
                href="/admin/transactions"
                className="text-primary hover:underline text-sm"
              >
                View All
              </a>
            </div>
            <DataTable
              columns={transactionColumns}
              data={recentTransactions}
              keyField="id"
              isLoading={isLoading}
              emptyMessage="No transactions yet"
            />
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Popular Games
              </h2>
              <a
                href="/admin/games"
                className="text-primary hover:underline text-sm"
              >
                View All
              </a>
            </div>
            <div className="space-y-4">
              {getPopularGamesByTotalSold(safeGames).map((game) => (
                <div
                  key={game.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                    {game.icon_url ? (
                      <img
                        src={game.icon_url}
                        alt={game.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gamepad2 className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{game.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {game.category}
                    </p>
                  </div>
                  <Badge
                    variant={game.status === "active" ? "default" : "secondary"}
                  >
                    {game.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
              {safeGames.filter((g) => g.is_popular).length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No popular games yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
