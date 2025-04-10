
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Bot, FileSpreadsheet, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChecklistOriginBadge } from "./ChecklistOriginBadge";

interface ChecklistOriginFilterProps {
  selectedOrigin: string;
  setSelectedOrigin: (origin: string) => void;
}

export function ChecklistOriginFilter({ selectedOrigin, setSelectedOrigin }: ChecklistOriginFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          {selectedOrigin === "all" ? (
            <span>Origem</span>
          ) : (
            <div className="flex items-center gap-1">
              {selectedOrigin === "manual" && <FileText className="h-3.5 w-3.5 mr-1" />}
              {selectedOrigin === "ia" && <Bot className="h-3.5 w-3.5 mr-1" />}
              {selectedOrigin === "csv" && <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />}
              <span>
                {selectedOrigin === "manual" && "Manual"}
                {selectedOrigin === "ia" && "IA"}
                {selectedOrigin === "csv" && "Importado"}
              </span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem 
          onClick={() => setSelectedOrigin("all")}
          className={selectedOrigin === "all" ? "bg-accent" : ""}
        >
          Todas as origens
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setSelectedOrigin("manual")}
          className={selectedOrigin === "manual" ? "bg-accent" : ""}
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Manual
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setSelectedOrigin("ia")}
          className={selectedOrigin === "ia" ? "bg-accent" : ""}
        >
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            IA
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setSelectedOrigin("csv")}
          className={selectedOrigin === "csv" ? "bg-accent" : ""}
        >
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Importado
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
