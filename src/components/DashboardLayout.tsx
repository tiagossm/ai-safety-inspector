import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider } from "./ui/sidebar";
import { useAuth } from "@/components/AuthProvider";

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();

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
            {/* Logo no topo direito - 2,5x maior */}
            <div className="flex justify-end w-full">
              <img
                src="/lovable-uploads/5f39a04e-2f8f-449b-ab7f-7b2d67216c79.png" 
                alt="IA SST"
                className="h-[25px] md:h-[50px] w-auto"
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
