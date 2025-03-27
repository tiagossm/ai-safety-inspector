
import React from "react";
import { Button } from "@/components/ui/button";
import { List, Loader2 } from "lucide-react";

interface SubChecklistButtonProps {
  hasSubChecklist: boolean;
  loading: boolean;
  onOpenSubChecklist: () => void;
}

export function SubChecklistButton({
  hasSubChecklist,
  loading,
  onOpenSubChecklist
}: SubChecklistButtonProps) {
  if (!hasSubChecklist) return null;
  
  return (
    <div className="mt-2.5">
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenSubChecklist}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs h-7"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 text-gray-500 animate-spin" />
            <span>Carregando...</span>
          </>
        ) : (
          <>
            <List className="h-3.5 w-3.5 text-gray-500" />
            <span>Abrir Sub-Checklist</span>
          </>
        )}
      </Button>
    </div>
  );
}
