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
        src="/lovable-uploads/5f39a04e-2f8f-449b-ab7f-7b2d67216c79.png"
        alt="IA SST Logo"
        className={`${dimensions} w-auto`}
      />
    </Link>
  );
}