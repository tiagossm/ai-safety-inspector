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
          <div className="fixed left-0 top-0 h-screen w-60 bg-card border-r border-border/40">
            <AppSidebar />
          </div>
        )}

        {/* Cabeçalho fixo no topo */}
        {user && (
          <header className={`fixed top-0 right-0 left-60 flex items-center justify-between px-8 py-4 shadow-md transition-all duration-300 ${theme === 'light' ? 'bg-white border-b border-gray-300' : 'bg-gray-800'}`}>
            {/* Navegação superior */}
            <nav className="flex space-x-8">
              <Link to="/" className="text-lg font-medium hover:underline transition-all duration-200 ${theme === 'light' ? 'text-gray-900' : 'text-white'}">Página Inicial</Link>
              <Link to="/dashboard" className="text-lg font-medium hover:underline transition-all duration-200 ${theme === 'light' ? 'text-gray-900' : 'text-white'}">Dashboard</Link>
              <Link to="/reports" className="text-lg font-medium hover:underline transition-all duration-200 ${theme === 'light' ? 'text-gray-900' : 'text-white'}">Relatórios</Link>
            </nav>
            
            {/* Logo no topo direito - Ajuste de tamanho e alinhamento */}
            <div className="flex justify-end w-full pr-6">
              <img
                src={theme === 'light' 
                  ? "/lovable-uploads/728ca092-8e22-4a02-821f-6c88f2f7cc89.png"  // Logo azul para tema claro
                  : "/lovable-uploads/36e6d20d-9248-4e9f-967f-aeeea5a2bc30.png"  // Logo branca para tema escuro
                }
                alt="IA SST"
                className="h-[55px] md:h-[80px] w-auto transition-all duration-200"
              />
            </div>
          </header>
        )}

        <main
          className={`flex-1 p-10 transition-all duration-300 ${
            user ? "ml-60 mt-20" : "ml-0"
          }`}
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
