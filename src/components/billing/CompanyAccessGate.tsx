
import { ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AuthUser } from "@/hooks/auth/useAuthState";

interface CompanyAccessGateProps {
  children: ReactNode;
  feature: "checklists" | "inspections" | "analytics" | "users" | "storage";
  requiredPlan: "free" | "pro" | "enterprise";
}

// Simulação de contexto de empresa (em um sistema real, isso viria de um hook ou Context)
const useCompanyContext = () => {
  return {
    company: {
      name: "Empresa Demo",
      plan_type: "free" as const,
      subscription_active: true,
    }
  };
};

export default function CompanyAccessGate({
  children,
  feature,
  requiredPlan
}: CompanyAccessGateProps) {
  const { user } = useAuth();
  const { company } = useCompanyContext();
  const navigate = useNavigate();
  const typedUser = user as AuthUser | null;
  
  // Mapeamento de planos para níveis (para comparação)
  const planLevels = {
    free: 1,
    pro: 2,
    enterprise: 3
  };
  
  // Verificar se o plano atual é suficiente
  const currentPlanLevel = planLevels[company.plan_type];
  const requiredPlanLevel = planLevels[requiredPlan];
  
  const hasAccess = 
    currentPlanLevel >= requiredPlanLevel && 
    company.subscription_active;
  
  // Texto de recurso por feature
  const featureText: Record<string, string> = {
    checklists: "checklists ilimitados",
    inspections: "inspeções avançadas",
    analytics: "relatórios analíticos",
    users: "usuários adicionais",
    storage: "armazenamento expandido"
  };

  if (!hasAccess && typedUser?.role !== "super_admin") {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertTitle>Acesso Restrito</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>
              Sua empresa precisa atualizar para o plano {requiredPlan.toUpperCase()} 
              para acessar {featureText[feature]}.
            </p>
            <div className="flex justify-end">
              <Button onClick={() => navigate("/billing")}>
                Ver Planos de Assinatura
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
