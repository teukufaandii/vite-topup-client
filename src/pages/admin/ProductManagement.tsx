import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useAdminStore } from "@/stores/adminStores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { type Product } from "@/lib/api";
import { toast } from "sonner";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export default function ProductsManagement() {
  const {
    products,
    games,
    fetchAllProducts,
    fetchAllGames,
    createProduct,
    updateProduct,
    deleteProduct,
    isLoading,
  } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGameId, setSelectedGameId] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [iconFile, setIconFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    game_id: "",
    sku: "",
    name: "",
    description: "",
    icon_url: "",
    price: 0,
    original_price: 0,
    denomination: 0,
    status: "active",
    sort_order: 0,
    provider_code: "",
    provider_sku: "",
  });

  useEffect(() => {
    fetchAllProducts();
    fetchAllGames();
  }, [fetchAllProducts, fetchAllGames]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame =
      selectedGameId === "all" || product.game_id === selectedGameId;
    return matchesSearch && matchesGame;
  });

  const resetForm = () => {
    setFormData({
      game_id: "",
      sku: "",
      name: "",
      description: "",
      icon_url: "",
      price: 0,
      original_price: 0,
      denomination: 0,
      status: "active",
      sort_order: 0,
      provider_code: "",
      provider_sku: "",
    });
    setIconFile(null);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      game_id: product.game_id,
      sku: product.sku,
      name: product.name,
      description: product.description || "",
      icon_url: product.icon_url || "", // This is for display only
      price: product.price,
      original_price: product.original_price || 0,
      denomination: product.denomination,
      status: product.is_active ? "active" : "inactive",
      sort_order: product.sort_order,
      provider_code: "",
      provider_sku: "",
    });
    setIconFile(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("game_id", formData.game_id);
      payload.append("sku", formData.sku);
      payload.append("name", formData.name);
      payload.append("description", formData.description);
      payload.append("price", formData.price.toString());
      payload.append("original_price", formData.original_price.toString());
      payload.append("denomination", formData.denomination.toString());
      payload.append("status", formData.status);
      payload.append("sort_order", formData.sort_order.toString());
      payload.append("provider_code", formData.provider_code);
      payload.append("provider_sku", formData.provider_sku);

      if (iconFile) {
        payload.append("icon_file", iconFile);
      }

      let success: boolean;
      if (editingProduct) {
        success = await updateProduct(editingProduct.id, payload as any);
        if (success) toast.success("Product updated successfully");
      } else {
        if (!iconFile) {
          toast.error("Product icon is required");
          setIsSubmitting(false);
          return;
        }
        success = await createProduct(payload as any);
        if (success) toast.success("Product created successfully");
      }

      if (success) {
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      toast.error("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      const success = await deleteProduct(product.id);
      if (success) toast.success("Product deleted successfully");
    }
  };

  const getGameName = (gameId: string) => {
    const game = games.find((g) => g.id === gameId);
    return game?.name || "-";
  };

  const columns = [
    {
      key: "sku",
      header: "SKU",
      render: (item: Product) => (
        <span className="font-mono text-sm">{item.sku}</span>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (item: Product) => (
        <div>
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            {getGameName(item.game_id)}
          </p>
        </div>
      ),
    },
    {
      key: "denomination",
      header: "Denomination",
      render: (item: Product) => <span>{item.denomination}</span>,
    },
    {
      key: "price",
      header: "Price",
      render: (item: Product) => (
        <div>
          <p className="font-semibold text-foreground">
            {formatCurrency(item.price)}
          </p>
          {item.original_price && item.original_price > item.price && (
            <p className="text-sm text-muted-foreground line-through">
              {formatCurrency(item.original_price)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: Product) => (
        <Badge variant={item.is_active ? "default" : "secondary"}>
          {item.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: Product) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(item);
            }}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
      className: "w-24",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground mt-1">
              Manage game products and pricing
            </p>
          </div>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="game_id">Game</Label>
                  <Select
                    value={formData.game_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, game_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a game" />
                    </SelectTrigger>
                    <SelectContent>
                      {games.map((game) => (
                        <SelectItem key={game.id} value={game.id}>
                          {game.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <ImageUpload
                  label="Product Icon"
                  value={formData.icon_url}
                  onChange={(url) =>
                    setFormData({ ...formData, icon_url: url })
                  }
                  onFileSelect={(file) => setIconFile(file)}
                  className="w-full"
                  aspectRatio="square"
                />

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (IDR)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="original_price">Original Price (IDR)</Label>
                    <Input
                      id="original_price"
                      type="number"
                      value={formData.original_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          original_price: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="denomination">Denomination</Label>
                    <Input
                      id="denomination"
                      type="number"
                      value={formData.denomination}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          denomination: parseInt(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sort_order">Sort Order</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sort_order: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider_code">Provider Code</Label>
                    <Input
                      id="provider_code"
                      value={formData.provider_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          provider_code: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider_sku">Provider SKU</Label>
                    <Input
                      id="provider_sku"
                      value={formData.provider_sku}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          provider_sku: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    id="status"
                    checked={formData.status === "active"}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        status: checked ? "active" : "inactive",
                      })
                    }
                  />
                  <Label htmlFor="status">Active</Label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || isLoading}>
                    {(isSubmitting || isLoading) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingProduct ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedGameId} onValueChange={setSelectedGameId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by game" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games</SelectItem>
              {games.map((game) => (
                <SelectItem key={game.id} value={game.id}>
                  {game.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={filteredProducts}
          keyField="id"
          isLoading={isLoading}
          emptyMessage="No products found"
        />
      </div>
    </AdminLayout>
  );
}
