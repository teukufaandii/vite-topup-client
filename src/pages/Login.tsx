import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores";
import { useToast } from "@/hooks/use-toast";
import { Gamepad2, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import api from "@/lib/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as { from?: string })?.from || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      toast({
        title: "Failed",
        description: "Email dan password harus diisi",
        variant: "destructive",
      });
      return;
    }

    const success = await login(email, password);

    if (success) {
      toast({
        title: "Login berhasil!",
        description: "Selamat datang kembali",
      });

      const profile = await api.getProfile();
      if (profile.success && profile.data) {
        if (from !== "/") {
          navigate(from);
        } else if (profile.data.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        navigate("/");
      }
    } else {
      toast({
        title: "Login gagal",
        description: error || "Email atau password salah",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <Gamepad2 className="h-10 w-10 text-primary" />
              <span className="font-display text-2xl font-bold gradient-text">
                GameTop
              </span>
            </Link>
            <h1 className="font-display text-3xl font-bold mb-2">
              Selamat Datang!
            </h1>
            <p className="text-muted-foreground">
              Masuk ke akun kamu untuk melanjutkan
            </p>
          </div>

          <div className="gaming-card">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <p
                  className="block text-sm font-medium mb-2 text-left ml-2
                "
                >
                  Email
                </p>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <p className="block text-sm font-medium mb-2 text-left ml-2">
                  Password
                </p>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Lupa password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="gaming"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Memproses..." : "Masuk"}
                {!isLoading && <ArrowRight className="h-5 w-5 ml-2" />}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">atau</span>
              </div>
            </div>

            <p className="relative text-center text-muted-foreground">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="text-primary font-medium hover:underline"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
