import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  size?: "small" | "large";
}

export function Logo({ className = "", size = "small" }: LogoProps) {
  const dimensions = size === "large" ? "h-24" : "h-12";
  
  return (
    <Link to="/" className={`block ${className}`}>
      <img 
        src="/lovable-uploads/556ba9a4-9912-4d74-96a7-0f4630a0386f.png"
        alt="IA SST Logo"
        className={`${dimensions} w-auto`}
      />
    </Link>
  );
}