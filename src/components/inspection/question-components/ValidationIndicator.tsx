
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ValidationIndicatorProps {
  isValid: boolean;
  responseValue: any;
}

export function ValidationIndicator({ isValid, responseValue }: ValidationIndicatorProps) {
  if (isValid || responseValue === undefined) {
    return null;
  }
  
  return (
    <div className="border-l-4 border-l-red-500 pl-2">
      <Alert variant="destructive" className="py-2">
        <AlertDescription>Esta pergunta requer uma resposta</AlertDescription>
      </Alert>
    </div>
  );
}
