
import { Link } from "react-router-dom";
import { useTheme } from "@/components/ui/ThemeContext";

interface LogoProps {
  className?: string;
  size?: "small" | "large";
}

export function Logo({ className = "", size = "small" }: LogoProps) {
  const { theme } = useTheme();
  const dimensions = size === "large" ? "h-64" : "h-32";
  
  return (
    <Link to="/" className={`block ${className}`}>
      <img 
        src={theme === 'light' 
          ? "/lovable-uploads/728ca092-8e22-4a02-821f-6c88f2f7cc89.png"  // Logo azul para tema claro
          : "/lovable-uploads/36e6d20d-9248-4e9f-967f-aeeea5a2bc30.png"  // Logo branco para tema escuro
        }
        alt="IA SST Logo"
        className={`${dimensions} w-auto`}
      />
    </Link>
  );
}
