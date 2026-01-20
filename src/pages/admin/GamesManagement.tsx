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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Pencil, Trash2, Gamepad2, Loader2 } from "lucide-react";
import { type Game } from "@/lib/api";
import { toast } from "sonner";
import api from "@/lib/api";

export default function GamesManagement() {
  const { games, fetchAllGames, updateGame, deleteGame, isLoading } =
    useAdminStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    publisher: "",
    description: "",
    image: "",
    banner: "",
    category: "",
    status: "active",
    sort_order: 0,
  });

  useEffect(() => {
    fetchAllGames();
  }, [fetchAllGames]);

  const filteredGames = games.filter(
    (game) =>
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      publisher: "",
      description: "",
      image: "",
      banner: "",
      category: "",
      status: "active",
      sort_order: 0,
    });
    setImageFile(null);
    setBannerFile(null);
    setEditingGame(null);
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setFormData({
      name: game.name || "",
      code: game.code || "",
      publisher: game.publisher || "",
      description: game.description || "",
      image: game.icon_url || "",
      banner: game.banner_url || "",
      category: game.category || "",
      status: game.status || "active",
      sort_order: game.sort_order ?? 0, 
    });
    setImageFile(null);
    setBannerFile(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataPayload = new FormData();

      formDataPayload.append("name", formData.name);
      formDataPayload.append("code", formData.code);
      formDataPayload.append("publisher", formData.publisher);
      formDataPayload.append("category", formData.category);
      formDataPayload.append("description", formData.description);
      formDataPayload.append("status", formData.status);

      const sortOrderVal = formData.sort_order ?? 0;
      formDataPayload.append("sort_order", sortOrderVal.toString());

      formDataPayload.append("input_fields", JSON.stringify([]));

      if (imageFile) {
        formDataPayload.append("icon_file", imageFile);
      }

      if (bannerFile) {
        formDataPayload.append("banner_file", bannerFile);
      }

      let success = false;

      if (editingGame) {
        // @ts-ignore
        success = await updateGame(editingGame.id, formDataPayload);
        if (success) toast.success("Game updated successfully");
      } else {
        if (!imageFile) {
          toast.error("Icon file is required for new game");
          setIsSubmitting(false);
          return;
        }

        if (!bannerFile) {
          toast.error("Banner file is required for new game");
          setIsSubmitting(false);
          return;
        }

        success = await api
          .createGame(formDataPayload)
          .then((res) => res.success);
        if (success) {
          await fetchAllGames();
          toast.success("Game created successfully");
        } else {
          toast.error("Failed to create game");
        }
      }

      if (success) {
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save game",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!gameToDelete) return;

    const success = await deleteGame(gameToDelete.id);
    if (success) {
      toast.success("Game deleted successfully");
      setIsDeleteDialogOpen(false);
      setGameToDelete(null);
    }
  };

  const columns = [
    {
      key: "image",
      header: "Image",
      render: (item: Game) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          {item.icon_url ? (
            <img
              src={item.icon_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
      ),
      className: "w-20",
    },
    {
      key: "name",
      header: "Name",
      render: (item: Game) => (
        <div>
          <p className="font-medium text-foreground">{item.name}</p>
        </div>
      ),
      className: "text-center",
    },
    {
      key: "category",
      header: "Category",
      render: (item: Game) => <Badge variant="outline">{item.category}</Badge>,
      className: "text-center",
    },
    {
      key: "status",
      header: "Status",
      render: (item: Game) => (
        <div className="flex gap-2 justify-center">
          <Badge variant={item.status === "active" ? "default" : "secondary"}>
            {item.status === "active" ? "Active" : "Inactive"}
          </Badge>
        </div>
      ),
      className: "text-center",
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: Game) => (
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
              setGameToDelete(item);
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
      className: "w-24 text-center",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground text-left">
              Games
            </h1>
            <p className="text-muted-foreground mt-1">Manage game catalog</p>
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
                Add Game
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingGame ? "Edit Game" : "Add New Game"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publisher">Publisher</Label>
                  <Input
                    id="publisher"
                    value={formData.publisher}
                    onChange={(e) =>
                      setFormData({ ...formData, publisher: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ImageUpload
                    label="Game Image"
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                    onFileSelect={(file) => setImageFile(file)}
                    className="w-full"
                    aspectRatio="square"
                  />
                  <ImageUpload
                    label="Banner Image"
                    value={formData.banner}
                    onChange={(url) =>
                      setFormData({ ...formData, banner: url })
                    }
                    onFileSelect={(file) => setBannerFile(file)}
                    className="w-full"
                    aspectRatio="banner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
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
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setFormData({
                          ...formData,
                          sort_order: isNaN(val) ? 0 : val,
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={formData.status === "active"}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          status: checked ? "active" : "inactive",
                        })
                      }
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
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
                    {editingGame ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredGames}
          keyField="id"
          isLoading={isLoading}
          emptyMessage="No games found"
        />

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete "
                {gameToDelete?.name}" and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setGameToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
