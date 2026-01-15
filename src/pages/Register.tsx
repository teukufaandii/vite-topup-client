import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores";
import { useToast } from "@/hooks/use-toast";
import {
  Gamepad2,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  PhoneCall,
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, clearError } = useAuthStore();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!name || !email || !password || !confirmPassword || !phone) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Password tidak sama",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password minimal 6 karakter",
        variant: "destructive",
      });
      return;
    }

    const success = await register(email, phone, password, name);

    if (success) {
      navigate("/");
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <Gamepad2 className="h-10 w-10 text-primary" />
              <span className="font-display text-2xl font-bold gradient-text">
                GameTop
              </span>
            </Link>
            <h1 className="font-display text-3xl font-bold mb-2">
              Buat Akun Baru
            </h1>
            <p className="text-muted-foreground">
              Daftar untuk mulai top up game favorit kamu
            </p>
          </div>

          {/* Form */}
          <div className="gaming-card">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <p className="block text-sm font-medium ml-2 mb-2 text-left">
                  Nama Lengkap
                </p>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <p className="block text-sm font-medium ml-2 mb-2 text-left">
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
                <p className="block text-sm font-medium ml-2 mb-2 text-left">
                  Nomor Telepon
                </p>
                <div className="relative">
                  <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="phone"
                    placeholder="081234xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <p className="block text-sm font-medium ml-2 mb-2 text-left">
                  Password
                </p>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
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

              {/* Confirm Password */}
              <div>
                <p className="block text-sm font-medium ml-2 mb-2 text-left">
                  Konfirmasi Password
                </p>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Terms */}
              <p className="text-xs text-muted-foreground">
                Dengan mendaftar, kamu menyetujui{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Syarat & Ketentuan
                </Link>{" "}
                dan{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Kebijakan Privasi
                </Link>{" "}
                kami.
              </p>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="gaming"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Memproses..." : "Daftar Sekarang"}
                {!isLoading && <ArrowRight className="h-5 w-5 ml-2" />}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">atau</span>
              </div>
            </div>

            {/* Login Link */}
            <p className="text-center text-muted-foreground">
              Sudah punya akun?{" "}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                Masuk disini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
