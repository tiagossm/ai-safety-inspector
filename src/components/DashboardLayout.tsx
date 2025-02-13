
import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ui/ThemeContext";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {user && (
          <div className="fixed left-0 top-0 h-screen w-60 bg-card border-r border-border/40">
            <AppSidebar />
          </div>
        )}

        {/* Cabeçalho fixo no topo */}
        {user && (
          <header
            className={cn(
              "fixed top-0 right-0 left-60 flex items-center justify-between px-8 py-4 shadow-md transition-all duration-300",
              {
                "bg-white border-b border-gray-300 text-gray-900": theme === "light",
                "bg-gray-800 text-white": theme === "dark",
              }
            )}
          >
            {/* Navegação superior */}
            <nav className="flex space-x-8">
              <Link to="/" className="text-lg font-medium hover:underline transition-all duration-200">
                Página Inicial
              </Link>
              <Link to="/dashboard" className="text-lg font-medium hover:underline transition-all duration-200">
                Dashboard
              </Link>
              <Link to="/reports" className="text-lg font-medium hover:underline transition-all duration-200">
                Relatórios
              </Link>
            </nav>

            {/* Logo no topo direito */}
            <div className="flex justify-end w-full pr-10">
              <img
                src={
                  theme === "light"
                    ? "/lovable-uploads/728ca092-8e22-4a02-821f-6c88f2f7cc89.png" // Logo azul para tema claro
                    : "/lovable-uploads/36e6d20d-9248-4e9f-967f-aeeea5a2bc30.png" // Logo branca para tema escuro
                }
                alt="IA SST"
                className="h-[60px] md:h-[90px] w-auto transition-all duration-200"
              />
            </div>
          </header>
        )}

        <main className={`flex-1 p-10 transition-all duration-300 ${user ? "ml-60 mt-20" : "ml-0"}`}>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
