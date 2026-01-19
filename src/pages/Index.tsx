import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { GameCard } from '@/components/games/GameCard';
import { useGameStore } from '@/stores';
import { Gamepad2, Zap, Shield, Clock, ArrowRight, Sparkles, Loader2 } from 'lucide-react';

export default function Index() {
  const { games, popularGames, isLoading, fetchGames, fetchPopularGames } = useGameStore();

  useEffect(() => {
    fetchGames();
    fetchPopularGames();
  }, [fetchGames, fetchPopularGames]);

  const allGames = games.slice(0, 6);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden hero-gradient">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow delay-1000" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Platform Top-Up #1 di Indonesia
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-5xl md:text-7xl font-black mb-6 animate-slide-up">
              <span className="text-foreground">Top Up Game</span>
              <br />
              <span className="gradient-text">Cepat & Aman</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up">
              Isi ulang diamond, crystal, dan voucher game favorit kamu dengan harga termurah. 
              Proses instan, pembayaran mudah, 100% aman.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <Button variant="gaming" size="lg" asChild>
                <Link to="/games" className="gap-2">
                  <Gamepad2 className="h-5 w-5" />
                  Mulai Top Up
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/games" className="gap-2">
                  Lihat Semua Game
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-primary">1M+</p>
                <p className="text-sm text-muted-foreground">Transaksi</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-primary">50+</p>
                <p className="text-sm text-muted-foreground">Game</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-primary">24/7</p>
                <p className="text-sm text-muted-foreground">Support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Kenapa Pilih <span className="gradient-text">GameTop</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Kami menyediakan layanan top-up terbaik dengan berbagai keunggulan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Proses Instan',
                description: 'Top up langsung masuk ke akun game kamu dalam hitungan detik.',
              },
              {
                icon: Shield,
                title: '100% Aman',
                description: 'Transaksi terenkripsi dan data kamu terlindungi dengan baik.',
              },
              {
                icon: Clock,
                title: 'Layanan 24/7',
                description: 'Customer service siap membantu kapanpun kamu butuhkan.',
              },
            ].map((feature, index) => (
              <div key={index} className="gaming-card group">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Games Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
                Game <span className="gradient-text">Populer</span>
              </h2>
              <p className="text-muted-foreground">
                Game yang paling banyak di top up minggu ini
              </p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link to="/games" className="gap-2">
                Lihat Semua
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : popularGames.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {popularGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Belum ada game populer
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild>
              <Link to="/games" className="gap-2">
                Lihat Semua Game
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* All Games Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
                Semua <span className="gradient-text">Game</span>
              </h2>
              <p className="text-muted-foreground">
                Pilih game favorit kamu dan top up sekarang
              </p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link to="/games" className="gap-2">
                Lihat Semua
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : allGames.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {allGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Belum ada game tersedia
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="gaming-card relative overflow-hidden p-8 md:p-12">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
              <div className="absolute top-1/2 right-8 -translate-y-1/2 w-64 h-64 bg-primary rounded-full blur-3xl" />
              <div className="absolute top-1/2 right-24 -translate-y-1/2 w-48 h-48 bg-secondary rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-2xl">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Siap Top Up <span className="gradient-text">Sekarang</span>?
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Daftar sekarang dan nikmati promo menarik untuk pengguna baru.
                Proses cepat, harga bersaing, dan layanan 24/7.
              </p>
              <div className="flex flex-col justify-center sm:flex-row gap-4">
                <Button variant="gaming" size="lg" asChild>
                  <Link to="/register">Daftar Gratis</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/games">Lihat Game</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
