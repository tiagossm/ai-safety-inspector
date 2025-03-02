import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

type AuthFormProps = {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  loading: boolean;
  isSignUp: boolean;
  setIsSignUp: (value: boolean) => void;
  handleAuth: (e: React.FormEvent) => Promise<void>;
};

export const AuthForm = ({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  isSignUp,
  setIsSignUp,
  handleAuth
}: AuthFormProps) => {
  // Estado para rastrear tentativas de envio e exibir o botão de cancelamento após um período
  const [hasBeenLoadingFor, setHasBeenLoadingFor] = useState(0);
  
  // Monitor de carregamento prolongado
  useEffect(() => {
    let interval: number | undefined;
    
    if (loading) {
      interval = window.setInterval(() => {
        setHasBeenLoadingFor(prev => prev + 1);
      }, 1000);
    } else {
      setHasBeenLoadingFor(0);
    }
    
    return () => {
      if (interval !== undefined) {
        clearInterval(interval);
      }
    };
  }, [loading]);
  
  // Função para redefinir o formulário se ficar preso
  const resetForm = () => {
    window.location.reload();
  };

  return (
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
            autoComplete="email"
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
            minLength={8}
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Carregando..." : isSignUp ? "Cadastrar" : "Entrar"}
        </Button>
        
        {/* Botão de cancelamento que aparece após 5 segundos de carregamento */}
        {hasBeenLoadingFor > 5 && (
          <div className="mt-4">
            <Button 
              type="button" 
              variant="destructive"
              className="w-full" 
              onClick={resetForm}
            >
              Cancelar tentativa
            </Button>
            <p className="text-xs text-red-400 mt-2 text-center">
              O login está demorando muito. Clique em cancelar para tentar novamente.
            </p>
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-primary hover:text-primary/80"
          disabled={loading}
        >
          {isSignUp
            ? "Já tem uma conta? Entre aqui"
            : "Não tem uma conta? Cadastre-se"}
        </button>
      </div>
    </form>
  );
};
