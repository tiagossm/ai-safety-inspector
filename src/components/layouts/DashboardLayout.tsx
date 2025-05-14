
import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/theme-provider";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "../dashboard/Sidebar";
import { Header } from "../dashboard/Header";
import { GlobalFloatingActionButton } from "../inspection/GlobalFloatingActionButton";

interface DashboardLayoutProps {
  children?: ReactNode;
}

export function DashboardLayout({
  children
}: DashboardLayoutProps) {
  const {
    theme,
    setTheme
  } = useTheme();
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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
    setTheme(theme === "light" ? "dark" : "light");
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
        
        {/* Global Floating Action Button */}
        <GlobalFloatingActionButton />
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
