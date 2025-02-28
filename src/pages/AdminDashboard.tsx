
import { SuperAdminDashboard } from "@/components/platform/SuperAdminDashboard";
import CompanyAccessGate from "@/components/billing/CompanyAccessGate";

export default function AdminDashboard() {
  return (
    <CompanyAccessGate feature="analytics" requiredPlan="enterprise">
      <SuperAdminDashboard />
    </CompanyAccessGate>
  );
}
