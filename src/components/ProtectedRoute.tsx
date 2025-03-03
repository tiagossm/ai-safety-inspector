
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredTier?: ("super_admin" | "company_admin" | "consultant" | "technician")[];
}

export function ProtectedRoute({ 
  children, 
  requiredTier = ["super_admin", "company_admin", "consultant", "technician"] 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log("🔒 ProtectedRoute - Verificando acesso à rota:", location.pathname);
  console.log("👤 Usuário:", user ? `${user.email} (${user.tier})` : "Não autenticado");
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
  if (!user) {
    console.log("🚫 Acesso negado: usuário não autenticado, redirecionando para login");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Verificação de permissão baseada no tier
  if (user.tier && !requiredTier.includes(user.tier)) {
    console.log(`🚫 Acesso negado: usuário com tier ${user.tier} tentando acessar rota que requer [${requiredTier.join(', ')}]`);
    
    // Redireciona para o dashboard apropriado com base no tier
    const redirectPath = user.tier === "super_admin" ? "/admin/dashboard" : "/dashboard";
    console.log(`🔄 Redirecionando para ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  console.log("✅ Acesso permitido à rota protegida:", location.pathname);
  return <>{children}</>;
}
