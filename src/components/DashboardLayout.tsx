
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
      <div className="min-h-screen flex w-full bg-gray-900">
        {user && <AppSidebar />}
        <main className={`flex-1 ${user ? 'ml-20 lg:ml-64' : ''} p-8 transition-all duration-300`}>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
