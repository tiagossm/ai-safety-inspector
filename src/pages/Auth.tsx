
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // 🟢 Verifica se já há uma sessão ativa e redireciona
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking for existing session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          return;
        }
        
        if (data.session) {
          console.log("Active session found:", data.session.user.id);
          await handleUserRedirect(data.session.user.id);
        } else {
          console.log("No active session found");
        }
      } catch (err) {
        console.error("Error in checkSession:", err);
      }
    };
    checkSession();
  }, [navigate]);

  // 🟢 Validação de formulário
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({ title: "Email inválido", variant: "destructive" });
      return false;
    }
    if (isSignUp && password.length < 8) {
      toast({ title: "Senha deve ter 8+ caracteres", variant: "destructive" });
      return false;
    }
    return true;
  };

  // 🟢 Função para verificar se o usuário pertence a uma empresa e redirecioná-lo
  const handleUserRedirect = async (userId: string) => {
    try {
      console.log("Checking user company association for:", userId);
      const { data: companyUser, error } = await supabase
        .from("company_users")
        .select("company_id")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log("No company association found for user");
          navigate("/cadastro-empresa"); // Usuário sem empresa é direcionado para cadastro
          return;
        }
        console.error("Error fetching company_users:", error);
        throw error;
      }

      if (!companyUser) {
        console.log("No company user record found, redirecting to company registration");
        navigate("/cadastro-empresa"); // Usuário sem empresa é direcionado para cadastro
      } else {
        console.log("Company association found, redirecting to dashboard");
        navigate("/dashboard"); // Usuário com empresa vai para o dashboard
      }
    } catch (err) {
      console.error("Error in handleUserRedirect:", err);
      // Default redirect to dashboard if we can't determine user status
      navigate("/dashboard");
    }
  };

  // 🟢 Função de autenticação
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      console.log(`Attempting to ${isSignUp ? 'sign up' : 'sign in'} user:`, email);
      
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) throw error;

        if (data.user?.identities?.length === 0) {
          throw new Error("Usuário já cadastrado");
        }

        console.log("Sign-up successful, redirecting to email confirmation page");
        navigate("/confirm-email"); // Redireciona para confirmação
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        console.log("Sign-in successful, storing token and redirecting");
        
        // 🟢 Armazena o token no localStorage
        localStorage.setItem("user_token", data.session.access_token);

        // 🟢 Redireciona o usuário com base na empresa vinculada
        await handleUserRedirect(data.user.id);
      }
    } catch (error: any) {
      let message = "Erro desconhecido";

      console.error("Authentication error:", error);

      switch (error.message) {
        case "Email rate limit exceeded":
          message = "Muitas tentativas. Tente novamente mais tarde";
          break;
        case "Invalid login credentials":
          message = "Credenciais inválidas";
          break;
        default:
          message = error.message;
      }

      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <Shield className="h-12 w-12 text-primary" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {isSignUp ? "Criar nova conta" : "Entrar na plataforma"}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="••••••••"
                minLength={isSignUp ? 8 : undefined}
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Carregando..." : isSignUp ? "Cadastrar" : "Entrar"}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:text-primary/80"
            >
              {isSignUp
                ? "Já tem uma conta? Entre aqui"
                : "Não tem uma conta? Cadastre-se"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
