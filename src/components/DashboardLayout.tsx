import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider } from "./ui/sidebar";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Chama a função de logout do contexto
    localStorage.removeItem("authToken"); // Remove o token do usuário
    navigate("/login"); // Redireciona para a tela de login
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sidebar aparece apenas para usuários logados */}
        {user && (
          <div className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border/40">
            <AppSidebar />
          </div>
        )}

        {/* Cabeçalho fixo no topo */}
        {user && (
          <header className="fixed top-0 right-0 flex items-center justify-between p-4 w-full bg-card shadow-md border-b border-border">
            <div className="flex items-center gap-4">
              {/* Logotipo no topo direito */}
              <img
                src="/caminho-para-sua-logo.png"
                alt="IA SST"
                className="h-10 w-auto"
              />

              {/* Botão de Perfil */}
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/80 transition-all"
              >
                <User className="h-5 w-5" />
                <span>Perfil</span>
              </button>

              {/* Botão de Sair */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/80 transition-all"
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </button>
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
