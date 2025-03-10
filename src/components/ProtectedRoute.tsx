
import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

export type UserTier = "super_admin" | "company_admin" | "consultant" | "technician";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredTier?: UserTier[];
}

export function ProtectedRoute({
  children,
  requiredTier = ["super_admin", "company_admin", "consultant", "technician"]
}: ProtectedRouteProps) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const typedUser = user as AuthUser | null;
  
  // Log route access attempt
  console.log("🔒 ProtectedRoute - Verificando acesso à rota:", location.pathname);
  console.log("👤 Usuário:", typedUser ? `${typedUser.email} (${typedUser.tier})` : "Não autenticado");
  
  // Fast path for super_admin users - skip lengthy checks
  if (typedUser?.tier === "super_admin") {
    console.log("✅ Acesso automático concedido para super_admin");
    return <>{children}</>;
  }
  
  // Continue with normal authorization flow for other users
  console.log("⏳ Estado de carregamento:", loading ? "Carregando" : "Completo");

  if (loading) {
    console.log("⏳ Aguardando carregamento de autenticação...");
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se não houver usuário autenticado, redirecione para a página de login
  if (!typedUser) {
    console.log("🚫 Acesso negado: usuário não autenticado, redirecionando para login");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Verificação de permissão baseada no tier
  const userTier = typedUser.tier as UserTier | undefined;
  if (userTier && !requiredTier.includes(userTier)) {
    console.log(
      `🚫 Acesso negado: usuário com tier ${typedUser.tier} tentando acessar rota que requer [${requiredTier.join(
        ", "
      )}]`
    );
    // Redireciona para o dashboard apropriado com base no tier
    const redirectPath = userTier === "super_admin" ? "/admin/dashboard" : "/dashboard";
    console.log(`🔄 Redirecionando para ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  console.log("✅ Acesso permitido à rota protegida:", location.pathname);
  return <>{children}</>;
}
