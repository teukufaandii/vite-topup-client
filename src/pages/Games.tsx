import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { GameCard } from "@/components/games/GameCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/stores";
import {
  Search,
  Gamepad2,
  X,
  Loader2,
  SwordIcon,
  ExpandIcon,
  Crosshair,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Games() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    games,
    categories,
    isLoading,
    fetchGames,
    fetchGamesByCategory,
    getCategories,
  } = useGameStore();

  const category = searchParams.get("category") || "all";

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  useEffect(() => {
    if (category === "all") {
      fetchGames();
    } else {
      fetchGamesByCategory(category);
    }
  }, [category, fetchGames, fetchGamesByCategory]);

  const filteredGames = useMemo(() => {
    if (!searchQuery) return games;

    const query = searchQuery.toLowerCase();
    return games.filter(
      (g) =>
        g.name.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query),
    );
  }, [games, searchQuery]);

  const handleCategoryChange = (catCode: string) => {
    if (catCode === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", catCode);
    }
    setSearchParams(searchParams);
  };

  const getCategoryIcon = (code: string) => {
    switch (code) {
      case "rpg":
        return SwordIcon;
      case "fps":
        return Crosshair;
      case "battle-royale":
      case "moba":
        return ExpandIcon;
      default:
        return Gamepad2;
    }
  };

  const displayCategories = [
    { id: "all", name: "Semua", code: "all", icon: Gamepad2 },
    ...(categories || []).map((cat) => ({
      ...cat,
      icon: getCategoryIcon(cat.code),
    })),
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Katalog <span className="gradient-text">Game</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Temukan dan top up game favorit kamu dengan harga terbaik
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1 md:max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari game..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="w-full md:w-auto overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 no-scrollbar">
            <div className="flex gap-2 min-w-max">
              {displayCategories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={category === cat.code ? "default" : "outline"}
                  onClick={() => handleCategoryChange(cat.code)}
                  size="sm"
                  className={cn(
                    "gap-2 rounded-full",
                    category === cat.code && "shadow-lg shadow-primary/25",
                  )}
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold mb-2">
              Game tidak ditemukan
            </h3>
            <p className="text-muted-foreground mb-4">
              Coba ubah filter atau kata kunci pencarian kamu
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                handleCategoryChange("all");
              }}
            >
              Reset Filter
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
