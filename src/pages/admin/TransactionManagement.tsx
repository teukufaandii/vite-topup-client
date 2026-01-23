import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { useAdminStore } from "@/stores/adminStores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Eye } from "lucide-react";
import { type Transaction } from "@/lib/api";
import { toast } from "sonner";

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

export default function TransactionsManagement() {
  const {
    transactions,
    fetchAllTransactions,
    updateTransactionStatus,
    isLoading,
  } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchAllTransactions();
  }, [fetchAllTransactions]);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.target_user_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetail = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setIsDetailOpen(true);
  };

  const handleStatusChange = async (txId: string, newStatus: string) => {
    const success = await updateTransactionStatus(txId, newStatus);
    if (success) {
      toast.success("Transaction status updated");
      if (selectedTransaction?.id === txId) {
        setSelectedTransaction({
          ...selectedTransaction,
          status: newStatus as Transaction["status"],
        });
      }
    }
  };

  const columns = [
    {
      key: "order_id",
      header: "Order ID",
      render: (item: Transaction) => (
        <span className="font-mono text-sm">{item.invoice_number}</span>
      ),
      className: "text-center",
    },
    {
      key: "player_id",
      header: "Player ID",
      render: (item: Transaction) => (
        <span className="font-mono text-sm">{item.target_user_id}</span>
      ),
      className: "text-center",
    },
    {
      key: "game",
      header: "Game / Product",
      render: (item: Transaction) => (
        <div>
          <p className="font-medium text-foreground">{item.game_name || "-"}</p>
          <p className="text-sm text-muted-foreground">
            {item.product_name || "-"}
          </p>
        </div>
      ),
      className: "text-center",
    },
    {
      key: "payment",
      header: "Payment",
      render: (item: Transaction) => (
        <span className="text-sm">{item.payment_name}</span>
      ),
      className: "text-center",
    },
    {
      key: "total",
      header: "Amount",
      render: (item: Transaction) => (
        <span className="font-semibold">
          {formatCurrency(item.total_amount)}
        </span>
      ),
      className: "text-center",
    },
    {
      key: "status",
      header: "Status",
      render: (item: Transaction) => (
        <Badge className={getStatusColor(item.status)}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      ),
      className: "text-center",
    },
    {
      key: "created_at",
      header: "Date",
      render: (item: Transaction) => (
        <span className="text-muted-foreground text-sm">
          {formatDate(item.created_at)}
        </span>
      ),
      className: "text-center",
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: Transaction) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetail(item);
          }}
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
      className: "w-16 text-center",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all transactions
          </p>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID or player ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={filteredTransactions}
          keyField="id"
          isLoading={isLoading}
          emptyMessage="No transactions found"
        />

        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-mono">
                      {selectedTransaction.invoice_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge
                      className={getStatusColor(selectedTransaction.status)}
                    >
                      {selectedTransaction.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Player ID</p>
                    <p className="font-mono">
                      {selectedTransaction.target_user_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment Channel
                    </p>
                    <p>{selectedTransaction.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Game</p>
                    <p>{selectedTransaction.game_name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Product</p>
                    <p>{selectedTransaction.product_name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p>{formatCurrency(selectedTransaction.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fee</p>
                    <p>{formatCurrency(selectedTransaction.admin_fee)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-semibold text-lg">
                      {formatCurrency(selectedTransaction.total_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p>{formatDate(selectedTransaction.created_at)}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    Update Status
                  </p>
                  <Select
                    value={selectedTransaction.status}
                    onValueChange={(value) =>
                      handleStatusChange(selectedTransaction.id, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
