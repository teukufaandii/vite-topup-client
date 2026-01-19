import { type Product } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Zap, Tag } from "lucide-react";

interface ProductCardProps {
  product: Product;
  selected?: boolean;
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, selected, onSelect }: ProductCardProps) {
  const discount = product.original_price
    ? Math.round(
        ((product.original_price - product.price) / product.original_price) *
          100,
      )
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <button
      onClick={() => onSelect(product)}
      className={cn(
        "gaming-card relative w-full text-left transition-all duration-300",
        selected && "glow-border ring-2 ring-primary",
      )}
    >
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-xs font-bold text-white shadow-lg z-10">
          <Tag className="h-3 w-3" />-{discount}%
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Product Name */}
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-foreground">{product.name}</h4>
          </div>

          {/* Denomination */}
          <p className="text-sm text-muted-foreground mt-1">
            {product.denomination} {product.denomination_type}
          </p>

          {/* Description */}
          {product.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="text-right">
          <p className="font-display font-bold text-lg text-primary">
            {formatPrice(product.price)}
          </p>
          {product.original_price && product.original_price > product.price && (
            <p className="text-sm text-muted-foreground line-through">
              {formatPrice(product.original_price)}
            </p>
          )}
        </div>
      </div>

      {/* Selected Indicator */}
      {selected && (
        <div className="absolute top-3 left-3">
          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
            <svg
              className="h-3 w-3 text-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      )}
    </button>
  );
}
