
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in on page load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setInitialCheckDone(true);
          return;
        }
        
        if (data.session) {
          console.log("User already logged in, redirecting...");
          navigate("/companies");
        }
        
        setInitialCheckDone(true);
      } catch (err) {
        console.error("Unexpected error in session check:", err);
        setInitialCheckDone(true);
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🔍 Tentando autenticar com:", { email, isSignUp });
      
      if (resetPasswordMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        
        if (error) throw error;
        
        toast({
          title: "Email enviado",
          description: "Verifique seu email para redefinir sua senha.",
        });
        
        setResetPasswordMode(false);
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Verifique seu email para confirmar o cadastro.",
        });
      } else {
        console.log("🔑 Iniciando login...");
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        console.log("✅ Login bem-sucedido:", data);
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta!",
        });

        navigate("/companies");
      }
    } catch (error: any) {
      console.error("❌ Erro na autenticação:", error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while initial check is running
  if (!initialCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo com tamanho menor e margem inferior */}
        <div className="flex justify-center mb-6">
          <img
            src="/lovable-uploads/logobrancoFT.png"
            alt="Logo"
            className="h-24 w-auto"
          />
        </div>

        {/* Título */}
        <div className="flex flex-col items-center">
          <h2 className="text-center text-4xl font-extrabold text-white">
            {resetPasswordMode 
              ? "Recuperar senha" 
              : isSignUp 
                ? "Criar nova conta" 
                : "Entrar na plataforma"}
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
                disabled={loading}
              />
            </div>
            
            {!resetPasswordMode && (
              <div>
                <Label htmlFor="password" className="text-white">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  required={!resetPasswordMode}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            )}
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregando...
                </span>
              ) : resetPasswordMode 
                ? "Enviar email de recuperação" 
                : isSignUp 
                  ? "Cadastrar" 
                  : "Entrar"}
            </Button>
          </div>

          {/* Linha com checkbox e link de recuperação, alinhados horizontalmente */}
          {!resetPasswordMode && (
            <div className="flex items-center justify-between text-sm text-white">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Lembrar-me
              </label>
              <button
                type="button"
                onClick={() => setResetPasswordMode(true)}
                className="text-blue-400 hover:underline"
                disabled={loading}
              >
                Esqueci minha senha
              </button>
            </div>
          )}

          {resetPasswordMode && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setResetPasswordMode(false)}
                className="text-blue-400 hover:underline"
              >
                Voltar ao login
              </button>
            </div>
          )}

          {!resetPasswordMode && (
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
          )}
        </form>
      </div>
    </div>
  );
};

export default Auth;
