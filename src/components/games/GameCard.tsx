import { Link } from 'react-router-dom';
import { type Game } from '@/lib/api';
import { Flame, Sparkles } from 'lucide-react';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link to={`/games/${game.code}`} className="group block">
      <div className="gaming-card relative aspect-[3/4] overflow-hidden">
        {/* Image */}
        <img
          src={game.image || '/placeholder.svg'}
          alt={game.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Popular Badge */}
        {game.total_sold >= 1 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-xs font-bold text-white shadow-lg">
            <Flame className="h-3 w-3" />
            Popular
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-xs font-medium text-primary">
          {game.category}
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {game.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {game.description}
          </p>
          
          {/* Hover Effect */}
          <div className="mt-3 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Top Up Sekarang</span>
          </div>
        </div>

        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/10 to-transparent" />
        </div>
      </div>
    </Link>
  );
}
