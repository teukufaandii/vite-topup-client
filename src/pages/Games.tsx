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
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "Semua", icon: Gamepad2 },
  { id: "rpg", label: "RPG", icon: SwordIcon },
  { id: "battle-royale", label: "Battle Royale", icon: ExpandIcon },
];

export default function Games() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  const { games, isLoading, fetchGames, fetchGamesByCategory } = useGameStore();

  const category = searchParams.get("category") || "all";

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

  const handleCategoryChange = (cat: string) => {
    if (cat === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Katalog <span className="gradient-text">Game</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Temukan dan top up game favorit kamu dengan harga terbaik
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari game..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
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

          {/* Category Filter */}
          <div className="flex gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={category === cat.id ? "default" : "outline"}
                onClick={() => handleCategoryChange(cat.id)}
                className={cn(
                  "gap-2",
                  category === cat.id && "shadow-lg shadow-primary/25",
                )}
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
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
