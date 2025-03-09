
import { Button } from "@/components/ui/button";
import { Menu, Search, Bell, User, WifiOff } from "lucide-react";
import { useTheme } from "@/components/ui/ThemeContext";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  isOnline: boolean;
  toggleTheme: () => void;
  theme: string;
}

export function Header({ setSidebarOpen, isOnline, toggleTheme, theme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto">
        <div className="flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden md:flex md:flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Buscar..."
                  className="w-full h-9 rounded-md border border-input bg-transparent px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {!isOnline && <WifiOff className="h-5 w-5 text-destructive" />}
            <Button variant="ghost" size="icon" className="hidden md:inline-flex">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? "🌙" : "☀️"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
