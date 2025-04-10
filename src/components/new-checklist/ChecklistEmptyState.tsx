
import { FC } from "react";
import { FileText } from "lucide-react";

interface ChecklistEmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
}

/**
 * Displays an empty state for checklists when no data is available
 */
export const ChecklistEmptyState: FC<ChecklistEmptyStateProps> = ({ 
  message = "Nenhum checklist encontrado", 
  icon,
  title = "Nenhum checklist encontrado",
  action
}) => {
  return (
    <div className="text-center py-12 border rounded-md">
      {icon || <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />}
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">
        {message}
      </p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
};
