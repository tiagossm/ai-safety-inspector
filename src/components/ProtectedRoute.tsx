
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("Usuário não autenticado em rota protegida, redirecionando para login");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check for tier-based access control
  if (user.tier && !requiredTier.includes(user.tier)) {
    console.log(`Acesso negado: usuário com perfil ${user.tier} tentando acessar rota que requer ${requiredTier.join(', ')}`);
    
    // Redirect to appropriate dashboard based on tier
    if (user.tier === "super_admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  console.log("Acesso permitido à rota protegida:", location.pathname);
  return <>{children}</>;
}
