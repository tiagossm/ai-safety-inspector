
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  History,
  User,
  Settings,
  LogOut,
  Menu,
  FileText,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const { user } = useAuth();

  const handleKeyDown = (e) => {
    if ((e.ctrlKey && e.key === "b") || e.key === "m") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Check on initial load
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to check if a route is active
  const isActive = (url: string) => {
    // Exact match
    if (location.pathname === url) return true;
    
    // Check for active sub-route (for nested routes)
    if (url !== '/' && location.pathname.startsWith(url)) return true;
    
    return false;
  };

  if (!user) return null;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 shadow-lg z-50",
        isOpen ? "w-64" : "w-16"
      )}
    >
      {/* Menu Button - Positioned at the top */}
      <div className="flex justify-center p-4">
        <button
          aria-label={isOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
          className="p-2 bg-accent rounded-md transition-all duration-300 hover:scale-105 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-130px)]" role="navigation" aria-label="Menu principal">
        <Link
          to="/"
          className={cn(
            "flex items-center gap-3 p-2 rounded-md transition-all duration-300 hover:bg-accent hover:text-accent-foreground",
            isActive("/") && "bg-primary/10 text-primary"
          )}
        >
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          {isOpen && <span className="text-sm">Dashboard</span>}
        </Link>
        
        <Link
          to="/companies"
          className={cn(
            "flex items-center gap-3 p-2 rounded-md transition-all duration-300 hover:bg-accent hover:text-accent-foreground",
            isActive("/companies") && "bg-primary/10 text-primary"
          )}
        >
          <Building2 className="h-4 w-4" aria-hidden="true" />
          {isOpen && <span className="text-sm">Empresas</span>}
        </Link>
        
        <Link
          to="/new-checklists"
          className={cn(
            "flex items-center gap-3 p-2 rounded-md transition-all duration-300 hover:bg-accent hover:text-accent-foreground",
            isActive("/new-checklists") && "bg-primary/10 text-primary"
          )}
        >
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          {isOpen && <span className="text-sm">Checklists</span>}
        </Link>
        
        <Link
          to="/inspections"
          className={cn(
            "flex items-center gap-3 p-2 rounded-md transition-all duration-300 hover:bg-accent hover:text-accent-foreground",
            isActive("/inspections") && "bg-primary/10 text-primary"
          )}
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          {isOpen && <span className="text-sm">Inspeções</span>}
        </Link>
      </nav>
    </aside>
  );
}
