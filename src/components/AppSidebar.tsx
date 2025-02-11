
import { Link } from "react-router-dom";
import { Sidebar, SidebarHeader } from "@/components/ui/sidebar";
import { Logo } from "./Logo";

export function AppSidebar() {
  return (
    <Sidebar className="fixed left-0 top-0 h-20 w-full bg-gray-900 border-b border-gray-800 z-50">
      <SidebarHeader className="h-full p-4 flex items-center justify-center">
        <Logo size="small" />
      </SidebarHeader>
    </Sidebar>
  );
}
