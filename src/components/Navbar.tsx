import { Link, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

export function Navbar() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-primary font-montserrat">
            <Shield className="h-6 w-6" />
            <span>IA SST Inspections</span>
          </Link>
          <div className="flex items-center space-x-6">
            <div className="flex space-x-6 font-opensans">
              <Link to="/" className="text-gray-300 hover:text-primary transition-colors">Home</Link>
              <Link to="/companies" className="text-gray-300 hover:text-primary transition-colors">Empresas</Link>
              <Link to="/blog" className="text-gray-300 hover:text-primary transition-colors">Blog</Link>
              <Link to="/contact" className="text-gray-300 hover:text-primary transition-colors">Contato</Link>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-gray-300 hover:text-primary transition-colors"
            >
              Sair
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}