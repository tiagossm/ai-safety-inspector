
import React, { memo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";

interface ActionPlanInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const ActionPlanInput = memo(function ActionPlanInput({ value, onChange }: ActionPlanInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <h4 className="text-sm font-medium text-amber-700">Plano de Ação</h4>
      </div>
      <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
        <Textarea
          placeholder="Descreva as ações que serão tomadas para corrigir o problema identificado..."
          value={value}
          onChange={handleChange}
          className="bg-white text-sm min-h-[100px]"
        />
      </div>
    </div>
  );
});
