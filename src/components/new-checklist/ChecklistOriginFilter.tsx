
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Bot, FileSpreadsheet } from "lucide-react";
import { ChecklistOrigin } from "@/types/newChecklist";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ChecklistOriginFilterProps {
  selectedOrigin: string;
  setSelectedOrigin: (origin: string) => void;
}

export function ChecklistOriginFilter({
  selectedOrigin,
  setSelectedOrigin
}: ChecklistOriginFilterProps) {
  const originOptions = [
    { value: "all", label: "Todas as origens", icon: null },
    { value: "manual", label: "Manual", icon: <FileText className="h-4 w-4" /> },
    { value: "ia", label: "IA", icon: <Bot className="h-4 w-4" /> },
    { value: "csv", label: "Importado", icon: <FileSpreadsheet className="h-4 w-4" /> }
  ];

  const getSelectedLabel = () => {
    const found = originOptions.find(o => o.value === selectedOrigin);
    return found ? found.label : "Todas as origens";
  };

  const getSelectedIcon = () => {
    const found = originOptions.find(o => o.value === selectedOrigin);
    if (!found || !found.icon) {
      return null;
    }
    return found.icon;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          {getSelectedIcon()}
          <span>Origem: {getSelectedLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {originOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setSelectedOrigin(option.value)}
            className={selectedOrigin === option.value ? "bg-accent" : ""}
          >
            {option.icon && <span className="mr-2">{option.icon}</span>}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
