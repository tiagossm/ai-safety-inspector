import React from "react";
import { Card } from "@/components/ui/card";
import { MediaRenderer } from "@/components/media/MediaRenderer";

interface InspectionAnswersSummaryProps {
  questions: any[];
  responses: Record<string, any>;
}

function formatAnswer(rawAnswer: any): string {
  if (!rawAnswer) return "Não respondido";

  if (typeof rawAnswer === "string") {
    try {
      const parsed = JSON.parse(rawAnswer);
      if (parsed && typeof parsed === "object" && "value" in parsed) {
        return parsed.value ?? "Não respondido";
      }
      return rawAnswer;
    } catch {
      return rawAnswer;
    }
  }

  return String(rawAnswer);
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
