import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/games/ProductCard";
import { PaymentChannelCard } from "@/components/payment/PaymentChannelCard";
import {
  useGameStore,
  useProductStore,
  usePaymentStore,
  useTransactionStore,
  useAuthStore,
} from "@/stores";
import type { Product, PaymentChannel } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Gamepad2,
  Zap,
  CreditCard,
  User,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

export default function GameDetail() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const { isAuthenticated } = useAuthStore();
  const {
    currentGame,
    isLoading: gameLoading,
    fetchGameByCode,
    clearCurrentGame,
  } = useGameStore();
  const {
    products,
    isLoading: productsLoading,
    fetchActiveProductsByGame,
    clearProducts,
  } = useProductStore();
  const {
    groupedChannels,
    isLoading: channelsLoading,
    fetchGroupedChannels,
    calculateFee,
    feeCalculation,
  } = usePaymentStore();
  const { createTransaction, isLoading: transactionLoading } =
    useTransactionStore();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel | null>(
    null,
  );
  const [playerData, setPlayerData] = useState<Record<string, string>>({});
  const [expandedChannelType, setExpandedChannelType] = useState<string | null>(
    "qris",
  );

  useEffect(() => {
    if (code) {
      fetchGameByCode(code);
      fetchGroupedChannels();
    }

    return () => {
      clearCurrentGame();
      clearProducts();
    };
  }, [
    code,
    fetchGameByCode,
    fetchGroupedChannels,
    clearCurrentGame,
    clearProducts,
  ]);

  useEffect(() => {
    if (currentGame?.id) {
      fetchActiveProductsByGame(currentGame.id);
    }
  }, [currentGame?.id, fetchActiveProductsByGame]);

  useEffect(() => {
    if (selectedProduct && selectedChannel) {
      calculateFee(selectedProduct.price, selectedChannel.code);
    }
  }, [selectedProduct, selectedChannel, calculateFee]);

  const fee = feeCalculation?.fee_amount || 0;
  const total =
    feeCalculation?.total || (selectedProduct ? selectedProduct.price : 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handlePlayerDataChange = (name: string, value: string) => {
    setPlayerData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = useMemo(() => {
    if (!selectedProduct || !selectedChannel) return false;
    if (!currentGame?.input_fields) return true;
    return currentGame.input_fields.every((field) => {
      if (field.required) {
        return playerData[field.name]?.trim();
      }
      return true;
    });
  }, [selectedProduct, selectedChannel, playerData, currentGame]);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login diperlukan",
        description: "Silakan login untuk melanjutkan transaksi",
        variant: "destructive",
      });
      navigate("/login", { state: { from: `/games/${code}` } });
      return;
    }

    if (!isFormValid || !selectedProduct || !selectedChannel) {
      toast({
        title: "Data tidak lengkap",
        description: "Silakan lengkapi semua data yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    const playerId =
      playerData[currentGame?.input_fields?.[0]?.name || "player_id"] || "";

    const transaction = await createTransaction({
      product_item_id: selectedProduct.id,
      channel_code: selectedChannel.code,
      player_id: playerId,
      player_data: playerData,
      customer_name: user?.name || "",
      customer_email: user?.email || "",
      customer_phone: user?.phone || "",
    });

    if (transaction) {
      toast({
        title: "Transaksi berhasil dibuat!",
        description: "Silakan selesaikan pembayaran dalam waktu 1 jam",
      });

      if (transaction.payment_url) {
        window.open(transaction.payment_url, "_blank");
      }

      navigate("/transactions");
    } else {
      toast({
        title: "Transaksi gagal",
        description: "Terjadi kesalahan, silakan coba lagi",
        variant: "destructive",
      });
    }
  };

  const toggleChannelGroup = (type: string) => {
    setExpandedChannelType((prev) => (prev === type ? null : type));
  };

  if (gameLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat game...</p>
        </div>
      </Layout>
    );
  }

  if (!currentGame) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">
            Game tidak ditemukan
          </h1>
          <p className="text-muted-foreground mb-6">
            Game yang kamu cari tidak tersedia
          </p>
          <Button variant="outline" asChild>
            <Link to="/games">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Katalog
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const channelTypeLabels: Record<string, string> = {
    qris: "QRIS",
    virtual_account: "Virtual Account",
    ewallet: "E-Wallet",
    bank_transfer: "Bank Transfer",
  };

  return (
    <Layout>
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img
          src={currentGame.banner || currentGame.image}
          alt={currentGame.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="flex items-end gap-4 mb-8">
          <img
            src={currentGame.image}
            alt={currentGame.name}
            className="w-24 h-32 md:w-32 md:h-44 rounded-xl object-cover border-4 border-background shadow-2xl"
          />
          <div className="pb-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                {currentGame.category}
              </span>
            </div>
            <h1 className="font-display text-2xl md:text-4xl font-bold">
              {currentGame.name}
            </h1>
            <p className="text-muted-foreground mt-1 hidden md:block">
              {currentGame.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
          <div className="lg:col-span-2 space-y-8">
            {currentGame.input_fields &&
              currentGame.input_fields.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="font-display text-xl font-bold">
                      Data Akun
                    </h2>
                  </div>
                  <div className="gaming-card space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentGame.input_fields.map((field) => (
                        <div key={field.name} className="relative">
                          <label className="block text-sm font-medium mb-2 text-left ml-2">
                            {field.label}
                            {field.required && (
                              <span className="text-destructive ml-1">*</span>
                            )}
                          </label>

                          {field.type === "select" && field.options ? (
                            <div className="relative">
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                value={playerData[field.name] || ""}
                                onChange={(e) =>
                                  handlePlayerDataChange(
                                    field.name,
                                    e.target.value,
                                  )
                                }
                              >
                                <option value="" disabled>
                                  {field.placeholder || "Pilih salah satu"}
                                </option>
                                {field.options.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              {/* Chevron Icon untuk Select */}
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                          ) : (
                            <Input
                              type={field.type === "number" ? "number" : "text"}
                              placeholder={field.placeholder}
                              value={playerData[field.name] || ""}
                              onChange={(e) =>
                                handlePlayerDataChange(
                                  field.name,
                                  e.target.value,
                                )
                              }
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-display text-xl font-bold">
                  Pilih Nominal
                </h2>
              </div>
              {productsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      selected={selectedProduct?.id === product.id}
                      onSelect={setSelectedProduct}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  Tidak ada produk tersedia
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-display text-xl font-bold">
                  Metode Pembayaran
                </h2>
              </div>
              {channelsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : groupedChannels &&
                Array.isArray(groupedChannels) &&
                groupedChannels.length > 0 ? (
                <div className="space-y-4">
                  {groupedChannels.map((group) => (
                    <div key={group.type} className="gaming-card p-0">
                      <button
                        type="button"
                        onClick={() => toggleChannelGroup(group.type)}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer relative z-10"
                      >
                        <span className="font-semibold">
                          {channelTypeLabels[group.type] || group.type}
                        </span>
                        {expandedChannelType === group.type ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>

                      {expandedChannelType === group.type && (
                        <div className="p-4 pt-0 space-y-3 border-t border-border/50 relative z-10">
                          {group.channels.map((channel: PaymentChannel) => (
                            <PaymentChannelCard
                              key={channel.code}
                              channel={channel}
                              selected={selectedChannel?.code === channel.code}
                              onSelect={(c) => setSelectedChannel(c)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  Tidak ada metode pembayaran tersedia
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="gaming-card sticky top-24">
              <h3 className="font-display text-lg font-bold mb-4">
                Ringkasan Pesanan
              </h3>

              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <img
                  src={currentGame.image}
                  alt={currentGame.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <p className="font-medium">{currentGame.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentGame.category}
                  </p>
                </div>
              </div>

              {selectedProduct ? (
                <div className="py-4 border-b border-border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{selectedProduct.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedProduct.denomination}{" "}
                        {selectedProduct.denomination_type}
                      </p>
                    </div>
                    <p className="font-semibold text-primary">
                      {formatPrice(selectedProduct.price)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-4 border-b border-border">
                  <p className="text-muted-foreground text-sm">
                    Pilih nominal terlebih dahulu
                  </p>
                </div>
              )}

              {selectedChannel && (
                <div className="py-4 border-b border-border">
                  <p className="text-sm text-muted-foreground mb-1">
                    Metode Pembayaran
                  </p>
                  <p className="font-medium">{selectedChannel.name}</p>
                </div>
              )}

              <div className="py-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {selectedProduct ? formatPrice(selectedProduct.price) : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Biaya Admin</span>
                  <span>{fee > 0 ? formatPrice(fee) : "-"}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">
                    {total > 0 ? formatPrice(total) : "-"}
                  </span>
                </div>
              </div>

              <Button
                variant="gaming"
                size="lg"
                className="w-full"
                disabled={!isFormValid || transactionLoading}
                onClick={handleCheckout}
              >
                {transactionLoading
                  ? "Memproses..."
                  : isAuthenticated
                    ? "Bayar Sekarang"
                    : "Login untuk Bayar"}
              </Button>

              {!isAuthenticated && (
                <p className="relative text-xs text-muted-foreground text-center mt-3">
                  Belum punya akun?{" "}
                  <Link to="/register" className="text-primary hover:underline">
                    Daftar disini
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
