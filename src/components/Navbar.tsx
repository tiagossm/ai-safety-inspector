import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

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
    <nav className="bg-gray-900 border-b border-gray-800 shadow-sm fixed top-0 left-0 w-full z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link 
                  to="/" 
                  className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/companies" 
                  className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors"
                >
                  Empresas
                </Link>
                <Link 
                  to="/inspections" 
                  className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors"
                >
                  Inspeções
                </Link>
                <Link 
                  to="/reports" 
                  className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors"
                >
                  Relatórios
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  Sair
                </Button>
              </>
            ) : (
              <div className="flex space-x-6 font-opensans">
                <Link to="/plans" className="text-gray-300 hover:text-primary transition-colors">
                  Planos
                </Link>
                <Link to="/blog" className="text-gray-300 hover:text-primary transition-colors">
                  Blog
                </Link>
                <Link to="/contact" className="text-gray-300 hover:text-primary transition-colors">
                  Contato
                </Link>
                <Link to="/auth" className="text-gray-300 hover:text-primary transition-colors">
                  <Button variant="secondary">Teste Grátis</Button>
                </Link>
                <Link to="/auth" className="text-gray-300 hover:text-primary transition-colors">
                  <Button variant="ghost">Login</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}