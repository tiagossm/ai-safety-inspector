import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

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

export function ProtectedRoute({
  children,
  requiredTier = ["super_admin", "company_admin", "consultant", "technician"]
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const typedUser = user as AuthUser | null;

  console.log("🔒 ProtectedRoute - Rota:", location.pathname);
  console.log("👤 Usuário:", typedUser ? `${typedUser.email} (${typedUser.tier})` : "Não autenticado");
  console.log("⏳ Carregamento:", loading ? "Carregando" : "Completo");

  // Enquanto a autenticação estiver carregando, exibe o componente de loading
  if (loading) {
    console.log("⏳ Aguardando carregamento de autenticação...");
    return <LoadingScreen />;
  }

  // Se não houver usuário autenticado, redireciona para a tela de login
  if (!typedUser) {
    console.log("🚫 Acesso negado: usuário não autenticado, redirecionando para login");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Verificação das permissões com base no tier
  if (typedUser.tier && !requiredTier.includes(typedUser.tier)) {
    console.log(
      `🚫 Acesso negado: usuário com tier ${typedUser.tier} tentando acessar rota que requer [${requiredTier.join(", ")}]`
    );
    const redirectPath = typedUser.tier === "super_admin" ? "/admin/dashboard" : "/dashboard";
    console.log(`🔄 Redirecionando para ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  console.log("✅ Acesso permitido à rota:", location.pathname);
  return <>{children}</>;
}
