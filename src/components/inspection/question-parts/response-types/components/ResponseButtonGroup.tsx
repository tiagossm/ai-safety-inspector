
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";

interface ResponseButtonGroupProps {
  value?: boolean | string;
  onChange: (value: boolean) => void;
  readOnly?: boolean;
}

export function ResponseButtonGroup({ value, onChange, readOnly = false }: ResponseButtonGroupProps) {
  const currentValue = value === true || value === "sim" || value === "yes";
  const isNo = value === false || value === "não" || value === "no";
  const isNA = value === "n/a" || value === "na";

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant={currentValue ? "default" : "outline"}
        className={`flex items-center gap-2 ${
          currentValue ? "bg-green-500 hover:bg-green-600 text-white" : ""
        }`}
        onClick={() => !readOnly && onChange(true)}
        disabled={readOnly}
      >
        <CheckCircle className="h-4 w-4" />
        SIM
      </Button>
      
      <Button
        type="button"
        variant={isNo ? "default" : "outline"}
        className={`flex items-center gap-2 ${
          isNo ? "bg-red-500 hover:bg-red-600 text-white" : ""
        }`}
        onClick={() => !readOnly && onChange(false)}
        disabled={readOnly}
      >
        <XCircle className="h-4 w-4" />
        NÃO
      </Button>
      
      <Button
        type="button"
        variant={isNA ? "default" : "outline"}
        className={`flex items-center gap-2 ${
          isNA ? "bg-gray-500 hover:bg-gray-600 text-white" : ""
        }`}
        onClick={() => !readOnly && onChange("n/a" as any)}
        disabled={readOnly}
      >
        <HelpCircle className="h-4 w-4" />
        N/A
      </Button>
    </div>
  );
}
