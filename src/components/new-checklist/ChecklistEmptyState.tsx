
import { FileText } from "lucide-react";

interface ChecklistEmptyStateProps {
  message?: string;
}

export function ChecklistEmptyState({ message = "Nenhum checklist encontrado" }: ChecklistEmptyStateProps) {
  return (
    <div className="text-center py-12 border rounded-md">
      <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">Nenhum checklist encontrado</h3>
      <p className="text-muted-foreground mb-6">
        {message}
      </p>
    </div>
  );
}
