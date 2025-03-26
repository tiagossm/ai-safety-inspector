
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";

interface YesNoInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function YesNoInput({ value, onChange }: YesNoInputProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <Button
        variant={value === "sim" ? "default" : "outline"}
        className={`flex items-center gap-1.5 text-xs h-8 ${value === "sim" ? "bg-green-500 hover:bg-green-600" : ""}`}
        onClick={() => onChange("sim")}
        size="sm"
      >
        <CheckCircle className="h-3.5 w-3.5" />
        <span>SIM</span>
      </Button>
      <Button
        variant={value === "não" ? "default" : "outline"}
        className={`flex items-center gap-1.5 text-xs h-8 ${value === "não" ? "bg-red-500 hover:bg-red-600" : ""}`}
        onClick={() => onChange("não")}
        size="sm"
      >
        <XCircle className="h-3.5 w-3.5" />
        <span>NÃO</span>
      </Button>
      <Button
        variant={value === "n/a" ? "default" : "outline"}
        className={`flex items-center gap-1.5 text-xs h-8 ${value === "n/a" ? "bg-gray-500 hover:bg-gray-600" : ""}`}
        onClick={() => onChange("n/a")}
        size="sm"
      >
        <HelpCircle className="h-3.5 w-3.5" />
        <span>N/A</span>
      </Button>
    </div>
  );
}
