import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ui/ThemeContext";

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
            {/* Logo no topo direito - Ajuste de tamanho dinâmico */}
            <div className="flex justify-end w-full">
              <img
                src={theme === 'light' 
                  ? "/lovable-uploads/728ca092-8e22-4a02-821f-6c88f2f7cc89.png"  // Logo azul para tema claro
                  : "/lovable-uploads/36e6d20d-9248-4e9f-967f-aeeea5a2bc30.png"  // Logo branca para tema escuro
                }
                alt="IA SST"
                className="h-[75px] md:h-[150px] w-auto"
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
