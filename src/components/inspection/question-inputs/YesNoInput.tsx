
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";

interface YesNoInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function YesNoInput({ value, onChange }: YesNoInputProps) {
  console.log("YesNoInput: rendering with value:", value);
  
  const handleClick = (newValue: string) => {
    console.log("YesNoInput: button clicked with value:", newValue);
    onChange(newValue);
  };
  
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <Button
        variant={value === "sim" ? "default" : "outline"}
        className={value === "sim" ? "bg-green-500 hover:bg-green-600 text-white" : ""}
        onClick={() => handleClick("sim")}
        size="sm"
        type="button"
      >
        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
        <span>SIM</span>
      </Button>
      <Button
        variant={value === "não" ? "default" : "outline"}
        className={value === "não" ? "bg-red-500 hover:bg-red-600 text-white" : ""}
        onClick={() => handleClick("não")}
        size="sm"
        type="button"
      >
        <XCircle className="h-3.5 w-3.5 mr-1.5" />
        <span>NÃO</span>
      </Button>
      <Button
        variant={value === "n/a" ? "default" : "outline"}
        className={value === "n/a" ? "bg-gray-500 hover:bg-gray-600 text-white" : ""}
        onClick={() => handleClick("n/a")}
        size="sm"
        type="button"
      >
        <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
        <span>N/A</span>
      </Button>
    </div>
  );
}
