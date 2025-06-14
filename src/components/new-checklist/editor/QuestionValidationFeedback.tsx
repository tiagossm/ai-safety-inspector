
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface QuestionValidationFeedbackProps {
  errors: string[];
  showSuccess?: boolean;
}

export function QuestionValidationFeedback({ 
  errors, 
  showSuccess = false 
}: QuestionValidationFeedbackProps) {
  if (errors.length === 0 && !showSuccess) {
    return null;
  }
  
  if (errors.length === 0 && showSuccess) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Pergunta válida e pronta para uso
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert variant="destructive" className="border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-1">
          <div className="font-medium">Problemas encontrados:</div>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm">{error}</li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
}
