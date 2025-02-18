
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AssignmentSectionProps {
  title: string;
  count: number;
  onAdd: () => void;
  disabled?: boolean;
  disabledMessage?: string;
  children: React.ReactNode;
}

export function AssignmentSection({ 
  title, 
  count, 
  onAdd, 
  disabled, 
  disabledMessage,
  children 
}: AssignmentSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {title} ({count})
        </h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onAdd}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-2" />
          {`Adicionar ${title.split(" ")[0]}`}
        </Button>
      </div>
      
      {disabled && disabledMessage && (
        <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md">
          {disabledMessage}
        </div>
      )}
      
      {children}
    </div>
  );
}
