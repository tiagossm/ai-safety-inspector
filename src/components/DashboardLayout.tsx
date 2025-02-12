
import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider } from "./ui/sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-900">
        <AppSidebar />
        <main className="flex-1 ml-20 lg:ml-64 p-8 transition-all duration-300">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
