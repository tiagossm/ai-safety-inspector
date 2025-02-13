import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ui/ThemeContext";
import { Link } from "react-router-dom";

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
          <div className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border/40">
            <AppSidebar />
          </div>
        )}

        {/* Cabeçalho fixo no topo */}
        {user && (
          <header className="fixed top-0 right-0 left-64 flex items-center justify-between px-6 py-3 bg-gray-800 shadow-md">
            {/* Navegação superior */}
            <nav className="flex space-x-6">
              <Link to="/" className="text-white hover:underline">Página Inicial</Link>
              <Link to="/dashboard" className="text-white hover:underline">Dashboard</Link>
              <Link to="/reports" className="text-white hover:underline">Relatórios</Link>
            </nav>
            
            {/* Logo no topo direito - Ajuste de tamanho e alinhamento */}
            <div className="flex justify-end w-full pr-4">
              <img
                src={theme === 'light' 
                  ? "/lovable-uploads/728ca092-8e22-4a02-821f-6c88f2f7cc89.png"  // Logo azul para tema claro
                  : "/lovable-uploads/36e6d20d-9248-4e9f-967f-aeeea5a2bc30.png"  // Logo branca para tema escuro
                }
                alt="IA SST"
                className="h-[42px] md:h-[60px] w-auto" // Aumento sutil do tamanho
              />
            </div>
          </header>
        )}

        <main
          className={`flex-1 p-8 transition-all duration-300 ${
            user ? "ml-64 mt-16" : "ml-0"
          }`}
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
