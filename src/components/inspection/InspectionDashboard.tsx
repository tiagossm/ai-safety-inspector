
import { StatsCard } from "@/components/inspection/StatsCard";
import { CheckCircle, Clock, AlertTriangle, Calendar } from "lucide-react";
import { InspectionDetails } from "@/types/newChecklist";

interface InspectionDashboardProps {
  inspections: InspectionDetails[];
}

export function InspectionDashboard({ inspections }: InspectionDashboardProps) {
  // Get counts by status
  const totalInspections = inspections.length;
  const completedInspections = inspections.filter(i => i.status === "completed").length;
  const pendingInspections = inspections.filter(i => i.status === "pending").length;
  const inProgressInspections = inspections.filter(i => i.status === "in_progress").length;
  
  // Calculate percentage of completed inspections
  const completionPercentage = totalInspections > 0 
    ? Math.round((completedInspections / totalInspections) * 100) 
    : 0;
  
  // Count high priority inspections
  const highPriorityInspections = inspections.filter(i => i.priority === "high").length;
  
  // Calculate today's scheduled inspections
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayInspections = inspections.filter(i => {
    if (!i.scheduledDate) return false;
    const scheduleDate = new Date(i.scheduledDate);
    return scheduleDate >= today && scheduleDate < tomorrow;
  }).length;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Inspeções Concluídas"
        value={completedInspections}
        description={`${completionPercentage}% do total`}
        icon={<CheckCircle />}
        progress={completionPercentage}
        variant="success"
      />
      
      <StatsCard
        title="Inspeções Pendentes"
        value={pendingInspections}
        description={`${totalInspections} inspeções no total`}
        icon={<Clock />}
      />
      
      <StatsCard
        title="Prioridade Alta"
        value={highPriorityInspections}
        description="Requerem atenção imediata"
        icon={<AlertTriangle />}
        variant={highPriorityInspections > 0 ? "danger" : "default"}
      />
      
      <StatsCard
        title="Agendadas Hoje"
        value={todayInspections}
        description="Para o dia atual"
        icon={<Calendar />}
        variant={todayInspections > 0 ? "warning" : "default"}
      />
    </div>
  );
}
