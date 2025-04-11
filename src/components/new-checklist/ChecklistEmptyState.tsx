
import { FC } from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistEmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
  className?: string;
  iconClassName?: string;
  titleClassName?: string;
  messageClassName?: string;
  actionClassName?: string;
}

/**
 * Displays an empty state for checklists when no data is available
 * Enhanced with additional customization options
 */
export const ChecklistEmptyState: FC<ChecklistEmptyStateProps> = ({ 
  message = "Nenhum checklist encontrado", 
  icon,
  title = "Nenhum checklist encontrado",
  action,
  className = "text-center py-12 border rounded-md",
  iconClassName = "mx-auto h-12 w-12 text-muted-foreground mb-4",
  titleClassName = "text-lg font-medium mb-2",
  messageClassName = "text-muted-foreground mb-6",
  actionClassName = "flex justify-center"
}) => {
  return (
    <div className={className}>
      {icon || <FileText className={iconClassName} />}
      <h3 className={titleClassName}>{title}</h3>
      <p className={messageClassName}>
        {message}
      </p>
      {action && <div className={actionClassName}>{action}</div>}
    </div>
  );
};

/**
 * Predefined empty state for search results
 */
export const ChecklistSearchEmptyState: FC<Omit<ChecklistEmptyStateProps, 'title' | 'message'>> = (props) => {
  return (
    <ChecklistEmptyState
      title="Nenhum resultado encontrado"
      message="Tente ajustar seus filtros ou critérios de pesquisa"
      {...props}
    />
  );
};

/**
 * Predefined empty state for when no checklists are available
 */
export const ChecklistNoDataEmptyState: FC<Omit<ChecklistEmptyStateProps, 'title' | 'message'>> = (props) => {
  return (
    <ChecklistEmptyState
      title="Nenhum checklist disponível"
      message="Crie seu primeiro checklist para começar"
      {...props}
    />
  );
};
