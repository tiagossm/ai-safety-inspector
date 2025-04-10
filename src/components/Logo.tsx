
import { Link } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";

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
        src={theme === 'dark' || theme === 'system' 
          ? "/lovable-uploads/logobrancoFT.png"  // Logo branco para tema escuro
          : "/lovable-uploads/LogoazulFT.png"  // Logo azul para tema claro
        }
        alt="IA SST Logo"
        className={`${dimensions} w-auto`}
      />
    </Link>
  );
}
