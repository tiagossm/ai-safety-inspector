import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🔍 Tentando autenticar com:", { email, isSignUp });
      
      if (isSignUp) {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Exibir o logo no topo */}
        <div className="flex justify-center">
          <img
            src="/36e6d20d-9248-4e9f-967f-aeeea5a2bc30.png" // ajuste a extensão se necessário
            alt="Logo"
            className="h-16 w-auto"
          />
        </div>
        <div className="flex flex-col items-center">
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
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Carregando..." : isSignUp ? "Cadastrar" : "Entrar"}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            {/* Checkbox "Lembrar-me" */}
            <label className="flex items-center text-sm text-white">
              <input type="checkbox" className="mr-2" />
              Lembrar-me
            </label>
            {/* Link para Recuperação de Senha */}
            <button
              type="button"
              onClick={async () => {
                if (!email) {
                  toast({
                    title: "Atenção",
                    description: "Por favor, informe seu e-mail para recuperar a senha.",
                    variant: "destructive",
                  });
                  return;
                }
                try {
                  const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: "https://seu-dominio.com/reset-password", // ajuste conforme necessário
                  });
                  if (error) throw error;
                  toast({
                    title: "Recuperação de senha",
                    description: "E-mail de recuperação enviado com sucesso!",
                  });
                } catch (err: any) {
                  toast({
                    title: "Erro",
                    description: err.message,
                    variant: "destructive",
                  });
                }
              }}
              className="text-sm text-blue-400 hover:underline"
              disabled={loading}
            >
              Esqueci minha senha
            </button>
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
