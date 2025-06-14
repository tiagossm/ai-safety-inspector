
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ImprovedDropdownInputProps {
  options: string[];
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export function ImprovedDropdownInput({ 
  options, 
  value, 
  onChange, 
  placeholder = "Selecione uma opção...",
  readOnly = false 
}: ImprovedDropdownInputProps) {
  // Fallback para opções vazias ou inválidas
  const validOptions = Array.isArray(options) && options.length > 0 
    ? options.filter(opt => opt && opt.trim()) 
    : ["Opção 1", "Opção 2"];

  // Se as opções originais estavam vazias, mostrar aviso
  const hasOriginalOptions = Array.isArray(options) && options.length > 0;

  return (
    <div className="space-y-2">
      {!hasOriginalOptions && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 text-sm">
            Esta pergunta não tinha opções configuradas. Opções padrão foram aplicadas.
            Entre em contato com o administrador para corrigir a configuração.
          </AlertDescription>
        </Alert>
      )}
      
      <Select 
        value={value || ""} 
        onValueChange={onChange}
        disabled={readOnly}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-white z-50">
          {validOptions.map((option, index) => (
            <SelectItem key={index} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
