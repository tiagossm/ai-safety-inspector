import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider } from "./ui/sidebar";
import { useAuth } from "@/components/ui/AuthContext"; // Importando autenticação

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated } = useAuth(); // Verificando se o usuário está autenticado

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-900">
        {isAuthenticated && <AppSidebar />} {/* Sidebar só aparece após o login */}
        <main className={`flex-1 ${isAuthenticated ? 'ml-20 lg:ml-64' : ''} p-8 transition-all duration-300`}>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
