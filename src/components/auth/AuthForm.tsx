
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
  isSignUp: boolean;
  setIsSignUp: (isSignUp: boolean) => void;
  handleAuth: (e: React.FormEvent) => Promise<void>;
}

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
            disabled={loading}
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
