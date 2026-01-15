import { type ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background grid-bg">
      <Navbar />
      <main className="pt-16">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
