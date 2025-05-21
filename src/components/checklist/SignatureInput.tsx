
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";
import { toast } from "sonner";

interface SignatureInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SignatureInput: React.FC<SignatureInputProps> = ({ value, onChange }) => {
  // Esta é uma implementação simplificada
  // Em um cenário real, você implementaria um componente de captura de assinatura
  // usando canvas ou uma biblioteca como react-signature-canvas
  
  const handleOpenSignatureDialog = () => {
    // Em uma implementação real, abriria um diálogo para capturar a assinatura
    // Por enquanto, apenas simula a captura de uma assinatura
    const simulatedSignature = `assinatura_${new Date().toISOString()}`;
    onChange(simulatedSignature);
    toast.success("Assinatura capturada com sucesso");
  };
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          placeholder="Assinatura" 
          className="flex-1"
          readOnly
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleOpenSignatureDialog}
          className="flex items-center gap-1"
        >
          <Edit3 className="h-4 w-4" />
          <span>Assinar</span>
        </Button>
      </div>
      {value && (
        <div className="text-xs text-gray-500">
          Assinatura registrada: {value}
        </div>
      )}
    </div>
  );
};
