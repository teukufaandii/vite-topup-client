import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, LogOut, Save, ArrowLeft } from "lucide-react";

export default function Profile() {
  const {
    user,
    isAuthenticated,
    isLoading,
    logout,
    updateProfile,
    fetchProfile,
  } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSave = async () => {
    const success = await updateProfile({ name, phone });

    if (success) {
      toast({
        title: "Profil diperbarui",
        description: "Perubahan berhasil disimpan",
      });
    } else {
      toast({
        title: "Gagal memperbarui profil",
        description: "Terjadi kesalahan, silakan coba lagi",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">
            Login Diperlukan
          </h1>
          <p className="text-muted-foreground mb-6">
            Silakan login untuk melihat profil kamu
          </p>
          <Button variant="gaming" asChild>
            <Link to="/login">Login Sekarang</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Link>
        </Button>

        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
              <span className="font-display text-4xl font-bold text-primary-foreground">
                {name.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">
              {name || "User"}
            </h1>
            <p className="text-muted-foreground">{email}</p>
          </div>

          {/* Profile Form */}
          <div className="gaming-card">
            <h2 className="font-display text-xl font-bold mb-6">
              Informasi Akun
            </h2>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Email tidak dapat diubah
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nomor Telepon
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+62 812 3456 7890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Save Button */}
              <Button
                variant="gaming"
                size="lg"
                className="w-full"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                {!isLoading && <Save className="h-5 w-5 ml-2" />}
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="gaming-card mt-6">
            <h2 className="font-display text-xl font-bold mb-6">
              Menu Lainnya
            </h2>

            <div className="space-y-3">
              <Link
                to="/transactions"
                className="flex relative items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="font-medium">Riwayat Transaksi</span>
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
              >
                <span className="font-medium relative flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
