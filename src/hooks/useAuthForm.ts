
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form validation
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

  // User redirect logic
  const handleUserRedirect = async (userId: string) => {
    try {
      console.log("Checking user tier and company association for:", userId);
      
      // Get user tier from the users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("tier")
        .eq("id", userId)
        .maybeSingle();
      
      if (userError) {
        console.error("Error fetching user tier:", userError);
        toast({ 
          title: "Erro ao verificar perfil do usuário", 
          description: userError.message,
          variant: "destructive" 
        });
        navigate("/dashboard");
        return;
      }
      
      // Redirect super_admin to admin dashboard
      if (userData?.tier === "super_admin") {
        console.log("User is super_admin, redirecting to admin dashboard");
        navigate("/admin/dashboard");
        return;
      }
      
      // Check user's company association
      const { data: companyUser, error: companyError } = await supabase
        .from("user_companies")
        .select("company_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (companyError) {
        console.error("Error fetching user_companies:", companyError);
        toast({ 
          title: "Erro ao verificar empresas do usuário", 
          description: companyError.message,
          variant: "destructive" 
        });
        navigate("/dashboard");
        return;
      }

      // Redirect based on company association
      if (!companyUser) {
        console.log("No company user record found, redirecting to company registration");
        navigate("/cadastro-empresa");
      } else {
        console.log("Company association found, redirecting to dashboard");
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Error in handleUserRedirect:", err);
      toast({ 
        title: "Erro no redirecionamento", 
        description: err.message,
        variant: "destructive" 
      });
      navigate("/dashboard");
    }
  };

  // Authentication function
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    console.log(`Tentando ${isSignUp ? 'cadastrar' : 'logar'} com o email: ${email}`);

    try {
      if (isSignUp) {
        // Sign Up Flow
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

        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Verifique seu email para confirmar sua conta."
        });
        
        console.log("Sign-up successful, redirecting to email confirmation page");
        navigate("/confirm-email");
      } else {
        // Sign In Flow
        console.log("Tentando login com:", email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        console.log("Login bem-sucedido:", data);
        
        // Store token
        if (data.session) {
          localStorage.setItem("user_token", data.session.access_token);
          console.log("Token armazenado no localStorage");
          
          toast({
            title: "Login realizado com sucesso",
            description: "Bem-vindo de volta!"
          });
          
          // Handle user redirection
          if (data.user) {
            await handleUserRedirect(data.user.id);
          } else {
            console.error("Usuário não retornado após login");
            navigate("/dashboard");
          }
        } else {
          console.error("Sessão não retornada após login");
          throw new Error("Falha na autenticação: Sessão não retornada");
        }
      }
    } catch (error: any) {
      console.error("Erro de autenticação:", error);
      
      let message = "Erro desconhecido";
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

      toast({ 
        title: "Erro de autenticação", 
        description: message, 
        variant: "destructive" 
      });
    } finally {
      // Garantir que o estado de carregamento seja sempre resetado
      setLoading(false);
      console.log("Estado de carregamento resetado");
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    isSignUp,
    setIsSignUp,
    handleAuth,
    handleUserRedirect
  };
};
