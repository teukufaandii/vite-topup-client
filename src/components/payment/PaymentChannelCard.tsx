import { type PaymentChannel } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  Building2,
  Wallet,
  QrCode,
  Smartphone,
} from "lucide-react";

interface PaymentChannelCardProps {
  channel: PaymentChannel;
  selected?: boolean;
  onSelect: (channel: PaymentChannel) => void;
}

const getChannelIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "qris":
      return QrCode;
    case "bank_transfer":
    case "va":
    case "virtual_account": 
      return Building2;
    case "ewallet":
    case "e-wallet":
      return Wallet;
    case "credit_card":
      return CreditCard;
    default:
      return Smartphone;
  }
};

export function PaymentChannelCard({
  channel,
  selected,
  onSelect,
}: PaymentChannelCardProps) {
  const Icon = getChannelIcon(channel.type);

  const formatFee = () => {
    const parts = [];
    if (channel.fee_flat > 0) {
      parts.push(`Rp ${channel.fee_flat.toLocaleString("id-ID")}`);
    }
    if (channel.fee_percent > 0) {
      parts.push(`${channel.fee_percent}%`);
    }
    return parts.length > 0 ? parts.join(" + ") : "Gratis";
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(channel)}
      disabled={channel.is_active === false} 
      className={cn(
        "gaming-card w-full text-left transition-all duration-300 flex items-center gap-4 cursor-pointer", // Tambah cursor-pointer eksplisit
        selected && "glow-border ring-2 ring-primary",
        channel.is_active === false && "opacity-50 cursor-not-allowed grayscale"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0",
          selected
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-6 w-6" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground truncate">
          {channel.name}
        </h4>
        <p className="text-sm text-muted-foreground">Biaya: {formatFee()}</p>
      </div>

      {/* Selected Indicator */}
      {selected && (
        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <svg
            className="h-4 w-4 text-primary-foreground"
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
      )}
    </button>
  );
}