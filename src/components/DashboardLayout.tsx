
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
      <div className="flex min-h-screen w-full bg-gray-900">
        {user && (
          <div className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-700">
            <AppSidebar />
          </div>
        )}
        <main
          className={`flex-1 p-8 transition-all duration-300 ${
            user ? "ml-64" : "ml-0"
          }`}
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
