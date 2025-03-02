
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
      console.log("Checking user company association for:", userId);
      // Using the correct table name: user_companies
      const { data: companyUser, error } = await supabase
        .from("user_companies")
        .select("company_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
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
      // Reset loading state in case of error
      setLoading(false);
      // Default redirect to dashboard if we can't determine user status
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
        setLoading(false);
      } else {
        console.log("Attempting login with:", email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        console.log("Sign-in successful, storing token");
        
        // Armazena o token no localStorage
        if (data.session) {
          localStorage.setItem("user_token", data.session.access_token);
          console.log("Token stored, checking user tier");
        } else {
          console.error("No session returned after login");
          throw new Error("Falha na autenticação: Sessão não retornada");
        }

        // Obtém dados adicionais do usuário e verifica seu tier
        if (data.user) {
          console.log("Fetching user tier information");
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("tier")
            .eq("id", data.user.id)
            .maybeSingle();
          
          if (userError) {
            console.error("Error fetching user tier:", userError);
          }
          
          if (userData?.tier === "super_admin") {
            console.log("User is super_admin, redirecting to admin dashboard");
            navigate("/admin/dashboard");
          } else {
            console.log("User is not super_admin, checking company association");
            // Redireciona o usuário com base na empresa vinculada
            await handleUserRedirect(data.user.id);
          }
        } else {
          console.error("No user returned after login");
          throw new Error("Falha na autenticação: Usuário não retornado");
        }
        
        // Ensure loading is set to false after all operations
        setLoading(false);
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
      // Make sure loading state is reset on error
      setLoading(false);
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
