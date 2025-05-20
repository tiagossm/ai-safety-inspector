
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface YesNoInputProps {
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  readOnly?: boolean;
}

export function YesNoInput({ value, onChange, readOnly = false }: YesNoInputProps) {
  return (
    <div className="flex space-x-3 mt-1">
      <Button
        type="button"
        variant={value === true ? "default" : "outline"}
        size="sm"
        onClick={() => !readOnly && onChange(true)}
        disabled={readOnly}
        className={value === true ? "bg-green-600 hover:bg-green-700" : ""}
      >
        <Check className="h-4 w-4 mr-1" />
        Sim
      </Button>
      <Button
        type="button"
        variant={value === false ? "default" : "outline"}
        size="sm"
        onClick={() => !readOnly && onChange(false)}
        disabled={readOnly}
        className={value === false ? "bg-red-600 hover:bg-red-700" : ""}
      >
        <X className="h-4 w-4 mr-1" />
        Não
      </Button>
    </div>
  );
}
