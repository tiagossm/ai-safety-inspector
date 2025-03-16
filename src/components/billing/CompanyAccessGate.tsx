
import { ReactNode } from "react";

interface CompanyAccessGateProps {
  children: ReactNode;
  feature: "checklists" | "inspections" | "analytics" | "users" | "storage";
  requiredPlan: "free" | "pro" | "enterprise";
}

export default function CompanyAccessGate({
  children,
  feature,
  requiredPlan
}: CompanyAccessGateProps) {
  // Always allow access to all features regardless of plan
  return <>{children}</>;
}
