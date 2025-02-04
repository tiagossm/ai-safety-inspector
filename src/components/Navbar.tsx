import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-primary">
            IA SST Inspections
          </Link>
          <div className="flex space-x-4">
            <Link to="/" className="text-gray-600 hover:text-primary">Home</Link>
            <Link to="/companies" className="text-gray-600 hover:text-primary">Empresas</Link>
            <Link to="/blog" className="text-gray-600 hover:text-primary">Blog</Link>
            <Link to="/contact" className="text-gray-600 hover:text-primary">Contato</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}