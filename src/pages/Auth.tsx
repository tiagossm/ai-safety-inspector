
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LoaderCircle, 
  AlertCircle 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Limite de tentativas de login
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 60000; // 1 minuto em ms

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string; general?: string}>({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdownProgress, setCountdownProgress] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verificar se já existe uma sessão
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          // Usuário já está logado, redirecionar para dashboard
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };
    checkSession();
  }, [navigate]);

  // Countdown timer para desbloqueio
  useEffect(() => {
    if (lockedUntil) {
      const interval = setInterval(() => {
        const now = Date.now();
        if (now >= lockedUntil) {
          setLockedUntil(null);
          setLoginAttempts(0);
          setCountdownProgress(0);
          clearInterval(interval);
        } else {
          const remaining = lockedUntil - now;
          const progress = 100 - (remaining / LOCKOUT_TIME) * 100;
          setCountdownProgress(progress);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockedUntil]);

  // Validar email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar formulário
  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    let isValid = true;

    if (!email) {
      newErrors.email = "Email é obrigatório";
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Formato de email inválido";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Senha é obrigatória";
      isValid = false;
    } else if (isSignUp && password.length < 8) {
      newErrors.password = "A senha deve ter pelo menos 8 caracteres";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Checar se a conta está bloqueada
    if (lockedUntil && Date.now() < lockedUntil) {
      const remainingSeconds = Math.ceil((lockedUntil - Date.now()) / 1000);
      toast({
        title: "Conta temporariamente bloqueada",
        description: `Tente novamente em ${remainingSeconds} segundos`,
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      if (isSignUp) {
        // Cadastro
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Verifique seu email para confirmar o cadastro.",
        });
        
        // Reset loading state after sign up
        setLoading(false);
      } else {
        // Login
        console.log("Tentando login com:", email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          // Incrementar tentativas de login falhas
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);
          
          // Verificar se excedeu o limite
          if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            setLockedUntil(Date.now() + LOCKOUT_TIME);
            throw new Error("Muitas tentativas de login. Tente novamente em 1 minuto.");
          }
          
          throw error;
        }
        
        // Login bem-sucedido
        console.log("User signed in:", data.user?.email);
        setLoginAttempts(0);
        
        // Important: Show success toast before navigation
        toast({
          title: "Login realizado com sucesso",
          description: "Você será redirecionado para o dashboard",
        });
        
        // Wait a moment before redirecting to allow toast to show
        setTimeout(() => {
          navigate("/dashboard");
          // Reset loading state after redirect
          setLoading(false);
        }, 500);
        
        return; // Important: Avoid resetting loading before redirect
      }
    } catch (error: any) {
      let errorMessage = "Erro ao processar solicitação";
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos";
      } else if (error.message.includes("network")) {
        errorMessage = "Erro de conexão. Verifique sua internet.";
      } else if (error.message.includes("rate limited")) {
        errorMessage = "Muitas solicitações. Tente novamente mais tarde.";
      } else if (error.message.includes("Muitas tentativas")) {
        errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Reset loading state on error
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email || !validateEmail(email)) {
      setErrors({ email: "Informe um email válido" });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o email de recuperação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-xl">
        <div className="flex flex-col items-center">
          <Shield className="h-12 w-12 text-primary animate-pulse" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {isSignUp ? "Criar nova conta" : "Entrar na plataforma"}
          </h2>
        </div>
        
        {lockedUntil && (
          <div className="py-4 px-3 bg-red-900/40 rounded-md">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-red-300 font-medium">Conta temporariamente bloqueada</p>
            </div>
            <p className="text-gray-300 text-sm mb-2">
              Muitas tentativas de login. Aguarde para tentar novamente.
            </p>
            <Progress value={countdownProgress} className="h-2" />
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          {errors.general && (
            <div className="bg-red-900/30 border border-red-800 p-3 rounded-md flex items-start">
              <AlertCircle className="text-red-400 mr-3 mt-0.5 flex-shrink-0" size={18} />
              <p className="text-red-300 text-sm">{errors.general}</p>
            </div>
          )}
          
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <Label htmlFor="email" className="text-white flex items-center space-x-1">
                <Mail size={16} className="text-gray-400" />
                <span>Email</span>
              </Label>
              <div className="relative mt-1">
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({...errors, email: undefined});
                  }}
                  className={`bg-gray-700 border-gray-600 text-white pr-10 ${
                    errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                  placeholder="seu@email.com"
                  disabled={loading || (lockedUntil !== null && Date.now() < lockedUntil)}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="password" className="text-white flex items-center space-x-1">
                <Lock size={16} className="text-gray-400" />
                <span>Senha</span>
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({...errors, password: undefined});
                  }}
                  className={`bg-gray-700 border-gray-600 text-white pr-10 ${
                    errors.password ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                  placeholder="••••••••"
                  disabled={loading || (lockedUntil !== null && Date.now() < lockedUntil)}
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>
          </div>

          {!isSignUp && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:text-primary/80 focus:outline-none"
                disabled={loading}
              >
                Esqueceu sua senha?
              </button>
            </div>
          )}

          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full relative group overflow-hidden transition-all"
              disabled={loading || (lockedUntil !== null && Date.now() < lockedUntil)}
            >
              {loading ? (
                <span className="inline-flex items-center">
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Carregando...
                </span>
              ) : isSignUp ? (
                "Criar conta"
              ) : (
                "Entrar"
              )}
              <span className="absolute bottom-0 left-0 w-full h-1 bg-primary-foreground transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform"></span>
            </Button>
            
            {loading && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => setLoading(false)}
              >
                Cancelar
              </Button>
            )}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
              }}
              className="text-primary hover:text-primary/80 text-sm focus:outline-none focus:underline"
              disabled={loading}
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
