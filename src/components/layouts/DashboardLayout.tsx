
import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Outlet, useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "../dashboard/Sidebar";
import { Header } from "../dashboard/Header";

interface DashboardLayoutProps {
  children?: ReactNode;
}

export function DashboardLayout({
  children
}: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Fechar sidebar quando em mobile
    if (isMobile) {
      setSidebarOpen(false);
    }
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, [isMobile]);

  const handlers = useSwipeable({
    onSwipedLeft: () => isMobile && setSidebarOpen(false),
    onSwipedRight: () => isMobile && setSidebarOpen(true)
  });

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  return (
    <div className="min-h-screen flex bg-background" {...handlers}>
      {/* Sidebar Component */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        user={user} 
        onLogout={handleLogout}
        isMobile={isMobile} 
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header Component */}
        <Header 
          setSidebarOpen={setSidebarOpen} 
          isOnline={isOnline} 
          toggleTheme={toggleTheme}
          theme={theme}
        />

        {/* Page Content */}
        <div className="flex-1 container mx-auto py-6">
          <Outlet />
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}
    </div>
  );
}
