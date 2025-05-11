
import React from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ResponseButtonGroupProps {
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  readOnly: boolean;
}

export function ResponseButtonGroup({ value, onChange, readOnly }: ResponseButtonGroupProps) {
  console.log("ResponseButtonGroup rendering with value:", value);
  
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        <Button
          variant={value === true ? "default" : "outline"}
          onClick={() => onChange(true)}
          disabled={readOnly}
          className={value === true ? "bg-green-500 hover:bg-green-600 text-white" : ""}
          type="button"
          aria-pressed={value === true}
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          <span>Sim</span>
        </Button>

        <Button
          variant={value === false ? "default" : "outline"}
          onClick={() => onChange(false)}
          disabled={readOnly}
          className={value === false ? "bg-red-500 hover:bg-red-600 text-white" : ""}
          type="button"
          aria-pressed={value === false}
        >
          <ThumbsDown className="h-4 w-4 mr-2" />
          <span>Não</span>
        </Button>

        {value === true && (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">OK</Badge>
        )}

        {value === false && (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Necessita de Plano de Ação</Badge>
        )}
      </div>
    </div>
  );
}
