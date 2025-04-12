
import { FC, ReactNode } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ChecklistEmptyStateProps {
  message?: string;
  icon?: ReactNode;
  title?: string;
  action?: ReactNode;
  showCreateButton?: boolean;
  createButtonText?: string;
  createButtonLink?: string;
}

/**
 * Displays an empty state for checklists when no data is available
 */
export const ChecklistEmptyState: FC<ChecklistEmptyStateProps> = ({ 
  message = "Nenhum checklist encontrado", 
  icon,
  title = "Nenhum checklist encontrado",
  action,
  showCreateButton = false,
  createButtonText = "Criar Checklist",
  createButtonLink = "/new-checklists/create"
}) => {
  return (
    <div 
      className="text-center py-12 border rounded-md"
      role="status"
      aria-live="polite"
    >
      {icon || <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />}
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">
        {message}
      </p>
      
      {action && <div className="flex justify-center mb-2">{action}</div>}
      
      {showCreateButton && (
        <div className="flex justify-center">
          <Button asChild>
            <Link to={createButtonLink}>
              <FileText className="mr-2 h-4 w-4" />
              {createButtonText}
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};
