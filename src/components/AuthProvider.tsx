import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

// Define os tiers permitidos
export type UserTier = "super_admin" | "company_admin" | "consultant" | "technician";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredTier?: UserTier[];
}

// Componente de loading reutilizável
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-lg">Verificando permissões...</p>
    </div>
  </div>
);

// Função auxiliar para log apenas em desenvolvimento
const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
};

export function ProtectedRoute({
  children,
  requiredTier = ["super_admin", "company_admin", "consultant", "technician"]
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const typedUser = user as AuthUser | null;

  devLog("🔒 ProtectedRoute - Rota:", location.pathname);
  devLog("👤 Usuário:", typedUser ? `${typedUser.email} (${typedUser.tier})` : "Não autenticado");
  devLog("⏳ Carregamento:", loading ? "Carregando" : "Completo");

  // Enquanto a autenticação estiver carregando, exibe o componente de loading
  if (loading) {
    devLog("⏳ Aguardando carregamento de autenticação...");
    return <LoadingScreen />;
  }

  // Se não houver usuário autenticado, redireciona para a tela de login
  if (!typedUser) {
    devLog("🚫 Acesso negado: usuário não autenticado, redirecionando para login");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Verificação das permissões com base no tier do usuário
  if (typedUser.tier && !requiredTier.includes(typedUser.tier)) {
    devLog(
      `🚫 Acesso negado: usuário com tier ${typedUser.tier} tentando acessar rota que requer [${requiredTier.join(", ")}]`
    );
    const redirectPath = typedUser.tier === "super_admin" ? "/admin/dashboard" : "/dashboard";
    devLog(`🔄 Redirecionando para ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  devLog("✅ Acesso permitido à rota:", location.pathname);
  return <>{children}</>;
}
