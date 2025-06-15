
import React from "react";
import { Card } from "@/components/ui/card";
import { MediaRenderer } from "@/components/media/MediaRenderer";

interface InspectionAnswersSummaryProps {
  questions: any[];
  responses: Record<string, any>;
}

function renderAnswer(answer: any) {
  if (
    answer === undefined ||
    answer === null ||
    (typeof answer === "string" && answer.trim() === "")
  ) {
    return <span className="text-amber-600">Não respondido</span>;
  }
  // Se for objeto ou array, mostra string ou badge
  if (typeof answer === "object") {
    // Renderiza JSON humanizado ou badge simples para múltipla escolha
    try {
      // Se for múltipla escolha, tentar converter p/ string amigável
      if (Array.isArray(answer)) {
        return answer.length === 0
          ? <span className="text-amber-600">Não respondido</span>
          : <span>{answer.join(", ")}</span>;
      }
      // Se for objeto simples com choices true, pega chaves marcadas
      if (
        answer &&
        Object.values(answer).length > 0 &&
        Object.values(answer).every(
          (v) => typeof v === "boolean" || typeof v === "string"
        )
      ) {
        // Exemplo: { a: true, b: false, c: true }
        const checked =
          Object.entries(answer)
            .filter(([k, v]) => v === true || v === "true")
            .map(([k]) => k);
        return checked.length > 0
          ? <span>{checked.join(", ")}</span>
          : <span className="text-amber-600">Não respondido</span>;
      }
      // Fallback: texto JSON
      return (
        <span title="Resposta detalhada">
          (Resposta complexa)
        </span>
      );
    } catch {
      return <span>(Resposta não suportada)</span>;
    }
  }
  // booleanos
  if (typeof answer === "boolean") {
    return <span>{answer ? "Sim" : "Não"}</span>;
  }
  // resto (string, number)
  return <span>{String(answer)}</span>;
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
        const answer = response.value;
        const notes = response.comment ?? "";
        const mediaUrls: string[] = response.mediaUrls || [];

        return (
          <Card key={question.id} className="p-4 mb-2">
            <div className="space-y-2">
              <h3 className="font-medium">{question.text || question.pergunta}</h3>
              <div className="flex flex-col md:flex-row md:justify-between gap-2">
                <span className="text-muted-foreground mr-2">Resposta:</span>
                {renderAnswer(answer)}
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
