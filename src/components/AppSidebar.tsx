
import { LayoutDashboard, Building2, ClipboardCheck, History, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Sidebar, SidebarHeader } from "@/components/ui/sidebar";
import { Logo } from "./Logo";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/" },
  { title: "Empresas", icon: Building2, url: "/companies" },
  { title: "Inspeções", icon: ClipboardCheck, url: "/inspections" },
  { title: "Relatórios", icon: History, url: "/reports" },
  { title: "Perfil", icon: User, url: "/profile" },
];

export function AppSidebar() {
  return (
    <Sidebar className="fixed left-0 top-0 h-20 w-full bg-gray-900 border-b border-gray-800 z-50">
      <div className="h-full container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Logo size="small" />
        </div>
        
        <nav className="flex items-center gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
    </Sidebar>
  );
}
