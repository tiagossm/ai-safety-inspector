
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb } from "lucide-react";

interface ActionPlanInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
}

export function ActionPlanInput({
  value,
  onChange,
  placeholder = "Descreva o plano de ação para resolver este problema...",
  required = false,
  maxLength = 500
}: ActionPlanInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Limit text to maxLength if specified
    const newValue = maxLength ? e.target.value.slice(0, maxLength) : e.target.value;
    onChange(newValue);
  };
  
  return (
    <div className="bg-amber-50 p-2.5 rounded-md border border-amber-200">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
        <h4 className="text-xs font-medium text-amber-700">
          Plano de Ação{required && <span className="text-red-500 ml-1">*</span>}
        </h4>
      </div>
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={3}
        className="bg-white text-xs"
        required={required}
      />
      {maxLength && (
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${value.length > maxLength * 0.9 ? "text-amber-700" : "text-gray-500"}`}>
            {value.length}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
}
