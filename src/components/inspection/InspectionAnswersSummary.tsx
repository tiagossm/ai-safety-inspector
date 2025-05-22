
import React from "react";
import { Card } from "@/components/ui/card";
import { MediaRenderer } from "@/components/media/MediaRenderer";

interface InspectionAnswersSummaryProps {
  questions: any[];
  responses: Record<string, any>;
}

function formatAnswer(rawAnswer: any): string {
  if (rawAnswer === null || rawAnswer === undefined) return "Não respondido";

  // Caso seja string simples
  if (typeof rawAnswer === "string") {
    // Verificamos se é uma data no formato ISO
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(rawAnswer)) {
      try {
        const date = new Date(rawAnswer);
        return date.toLocaleDateString('pt-BR');
      } catch {
        return rawAnswer;
      }
    }
    // Verificamos se é uma hora no formato HH:mm
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(rawAnswer)) {
      return rawAnswer;
    }
    return rawAnswer;
  }
  
  // Caso seja um boolean
  if (typeof rawAnswer === "boolean") {
    return rawAnswer ? "Sim" : "Não";
  }
  
  // Caso seja um número
  if (typeof rawAnswer === "number") {
    return rawAnswer.toString();
  }

  // Caso seja um objeto com propriedade value
  if (rawAnswer && typeof rawAnswer === "object") {
    if ("value" in rawAnswer) {
      const value = rawAnswer.value;
      // Tratamos diferentes tipos de valores dentro do objeto
      if (typeof value === "string") {
        return value;
      } else if (typeof value === "boolean") {
        return value ? "Sim" : "Não";
      } else if (typeof value === "number") {
        return value.toString();
      } else if (value === null || value === undefined) {
        return "Não respondido";
      } else {
        return String(value);
      }
    }
  }

  // Caso não consiga extrair, tenta converter para string
  try {
    return String(rawAnswer);
  } catch {
    return "Não respondido";
  }
}

export function InspectionAnswersSummary({ questions, responses }: InspectionAnswersSummaryProps) {
  if (!questions || questions.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Este checklist não possui questões.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((question) => {
        const response = responses?.[question.id] || {};
        const answer = formatAnswer(response.value);
        const notes = response.comment ?? "";
        const mediaUrls: string[] = response.mediaUrls || [];

        return (
          <Card key={question.id} className="p-4 mb-2">
            <div className="space-y-2">
              <h3 className="font-medium">{question.text || question.pergunta}</h3>
              <div className="flex flex-col md:flex-row md:justify-between gap-2">
                <span className="text-muted-foreground mr-2">Resposta:</span>
                <span className={answer === "Não respondido" ? "text-amber-600" : undefined}>
                  {answer}
                </span>
              </div>
              {notes && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">Observações:</p>
                  <p className="text-sm">{notes}</p>
                </div>
              )}
              {mediaUrls.length > 0 && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-1">Mídias:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {mediaUrls.map((url, idx) => (
                      <div key={idx} className="border rounded overflow-hidden h-24 bg-gray-100 flex items-center justify-center">
                        <MediaRenderer url={url} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
