
import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider } from "./ui/sidebar";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
          <header className="fixed top-0 right-0 left-64 flex items-center justify-between px-6 py-3 bg-card shadow-md">
            {/* Logo no topo direito */}
            <div className="flex justify-end w-full">
              <img
                src="/lovable-uploads/556ba9a4-9912-4d74-96a7-0f4630a0386f.png"
                alt="IA SST"
                className="h-10 w-auto"
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
