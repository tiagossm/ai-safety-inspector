
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResponseButtonGroupProps {
  value: boolean | null | undefined;
  onChange: (value: boolean) => void;
  readOnly?: boolean;
}

export function ResponseButtonGroup({
  value,
  onChange,
  readOnly = false
}: ResponseButtonGroupProps) {
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        size="sm"
        variant={value === true ? "default" : "outline"}
        onClick={() => !readOnly && onChange(true)}
        disabled={readOnly}
        className={cn(
          value === true && "bg-green-500 hover:bg-green-600 text-white"
        )}
      >
        Sim
      </Button>
      <Button
        type="button"
        size="sm"
        variant={value === false ? "default" : "outline"}
        onClick={() => !readOnly && onChange(false)}
        disabled={readOnly}
        className={cn(
          value === false && "bg-red-500 hover:bg-red-600 text-white"
        )}
      >
        Não
      </Button>
      <Button
        type="button"
        size="sm"
        variant={value === null ? "default" : "outline"}
        onClick={() => !readOnly && onChange(null as any)}
        disabled={readOnly}
        className={cn(
          value === null && "bg-gray-500 hover:bg-gray-600 text-white"
        )}
      >
        N/A
      </Button>
    </div>
  );
}
