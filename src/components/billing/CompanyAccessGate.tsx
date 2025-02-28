
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LockIcon } from "lucide-react";

type SubscriptionPlan = "free" | "pro" | "enterprise";
type Feature = "analytics" | "inspections" | "reports" | "users" | "export";

interface CompanyAccessGateProps {
  children: ReactNode;
  feature: Feature;
  requiredPlan: SubscriptionPlan;
  fallback?: ReactNode;
}

// Mapeamento de features para níveis de plano
const FEATURE_PLAN_MAP: Record<Feature, { [key in SubscriptionPlan]?: boolean }> = {
  analytics: { pro: true, enterprise: true },
  inspections: { free: true, pro: true, enterprise: true },
  reports: { pro: true, enterprise: true },
  users: { free: true, pro: true, enterprise: true },
  export: { enterprise: true }
};

export default function CompanyAccessGate({
  children,
  feature,
  requiredPlan,
  fallback
}: CompanyAccessGateProps) {
  // Mock da informação de assinatura (substituir por hook real)
  const subscription = {
    plan: "enterprise" as SubscriptionPlan, // Simulando acesso total
    active: true
  };

  // Verificar se a feature está disponível no plano
  const hasAccess = subscription.active && FEATURE_PLAN_MAP[feature]?.[subscription.plan];

  // Se não tiver acesso, mostrar bloqueio ou fallback
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card>
        <CardContent className="p-8 text-center">
          <LockIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">
            Recurso restrito ao plano {requiredPlan.toUpperCase()}
          </h3>
          <p className="mt-2 text-muted-foreground">
            Atualize seu plano para ter acesso a este recurso.
          </p>
          <Button className="mt-4" onClick={() => window.location.href = "/billing"}>
            Atualizar Plano
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Se tiver acesso, mostrar o conteúdo
  return <>{children}</>;
}
