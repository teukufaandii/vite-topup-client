import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Gamepad2, 
  Package, 
  CreditCard, 
  Receipt,
  Settings,
  Home,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Gamepad2, label: 'Games', path: '/admin/games' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: Receipt, label: 'Transactions', path: '/admin/transactions' },
  { icon: CreditCard, label: 'Payment Channels', path: '/admin/payments' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuthStore();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Gamepad2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Game Top-Up</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
              isActive(item.path)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Back to Site</span>
        </Link>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};