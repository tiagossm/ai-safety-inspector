
import { Progress } from "@/components/ui/progress";
import { Checklist } from "@/types/checklist";

interface ChecklistProgressProps {
  checklist: Checklist;
  totalItems: number;
}

export default function ChecklistProgress({ checklist, totalItems }: ChecklistProgressProps) {
  const completedItems = checklist.items_completed || 0;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  
  return <Progress value={progressPercentage} className="mt-2" />;
}
