
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb } from "lucide-react";

interface ActionPlanInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ActionPlanInput({
  value,
  onChange,
  placeholder = "Descreva o plano de ação para resolver este problema..."
}: ActionPlanInputProps) {
  return (
    <div className="bg-amber-50 p-2.5 rounded-md border border-amber-200">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
        <h4 className="text-xs font-medium text-amber-700">Plano de Ação</h4>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="bg-white text-xs"
      />
    </div>
  );
}
