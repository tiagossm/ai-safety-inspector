import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export function Navbar() {
  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-primary font-montserrat">
            <Shield className="h-6 w-6" />
            <span>IA SST Inspections</span>
          </Link>
          <div className="flex space-x-6 font-opensans">
            <Link to="/" className="text-gray-600 hover:text-primary transition-colors">Home</Link>
            <Link to="/companies" className="text-gray-600 hover:text-primary transition-colors">Empresas</Link>
            <Link to="/blog" className="text-gray-600 hover:text-primary transition-colors">Blog</Link>
            <Link to="/contact" className="text-gray-600 hover:text-primary transition-colors">Contato</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}