
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Bot, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChecklistOriginFilterProps {
  selectedOrigin: string;
  setSelectedOrigin: (origin: string) => void;
}

export function ChecklistOriginFilter({
  selectedOrigin,
  setSelectedOrigin
}: ChecklistOriginFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {selectedOrigin === "manual" ? (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Manual
            </>
          ) : selectedOrigin === "ia" ? (
            <>
              <Bot className="mr-2 h-4 w-4" />
              IA
            </>
          ) : selectedOrigin === "csv" ? (
            <>
              <Upload className="mr-2 h-4 w-4" />
              CSV
            </>
          ) : (
            "Origem"
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
          <FileText className="mr-2 h-4 w-4" />
          Manual
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setSelectedOrigin("ia")}
          className={selectedOrigin === "ia" ? "bg-accent" : ""}
        >
          <Bot className="mr-2 h-4 w-4" />
          IA
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setSelectedOrigin("csv")}
          className={selectedOrigin === "csv" ? "bg-accent" : ""}
        >
          <Upload className="mr-2 h-4 w-4" />
          CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
