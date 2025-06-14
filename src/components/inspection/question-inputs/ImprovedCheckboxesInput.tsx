
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ImprovedCheckboxesInputProps {
  options: string[];
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  readOnly?: boolean;
}

export function ImprovedCheckboxesInput({ 
  options, 
  value = [], 
  onChange, 
  readOnly = false 
}: ImprovedCheckboxesInputProps) {
  // Fallback para opções vazias ou inválidas  
  const validOptions = Array.isArray(options) && options.length > 0 
    ? options.filter(opt => opt && opt.trim()) 
    : ["Opção 1", "Opção 2"];

  // Se as opções originais estavam vazias, mostrar aviso
  const hasOriginalOptions = Array.isArray(options) && options.length > 0;

  const handleCheckboxChange = (option: string, checked: boolean) => {
    if (readOnly) return;
    
    const currentValue = Array.isArray(value) ? value : [];
    
    if (checked) {
      if (!currentValue.includes(option)) {
        onChange([...currentValue, option]);
      }
    } else {
      onChange(currentValue.filter(item => item !== option));
    }
  };

  return (
    <div className="space-y-3">
      {!hasOriginalOptions && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 text-sm">
            Esta pergunta não tinha opções configuradas. Opções padrão foram aplicadas.
            Entre em contato com o administrador para corrigir a configuração.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-3">
        {validOptions.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Checkbox
              id={`checkbox-${index}`}
              checked={Array.isArray(value) && value.includes(option)}
              onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
              disabled={readOnly}
            />
            <Label 
              htmlFor={`checkbox-${index}`} 
              className="text-sm cursor-pointer flex-1"
            >
              {option}
            </Label>
          </div>
        ))}
        
        {Array.isArray(value) && value.length > 0 && (
          <div className="text-xs text-gray-600 mt-2">
            {value.length} opção(ões) selecionada(s)
          </div>
        )}
      </div>
    </div>
  );
}
