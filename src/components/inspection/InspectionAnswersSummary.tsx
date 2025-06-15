
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { MediaRenderer } from "@/components/media/MediaRenderer";
import { ActionPlanModalInline } from "./ActionPlanModalInline";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

// Componente badge simples
function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={"inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700 mr-1 " + className}>
      {children}
    </span>
  );
}

// Renderização simplificada de objetos comuns
function renderInlineObject(answer: any) {
  // Múltipla escolha com "selectedOptions"
  if (
    answer &&
    typeof answer === "object" &&
    answer.multipleChoiceData &&
    Array.isArray(answer.multipleChoiceData.selectedOptions)
  ) {
    return (
      <span>
        {answer.multipleChoiceData.selectedOptions.map((item: any, idx: number) => (
          <Badge key={String(item) + idx}>{String(item)}</Badge>
        ))}
      </span>
    );
  }
  // Valor direto dentro de "value"
  if (answer && typeof answer === "object" && answer.value !== undefined && typeof answer.value !== "object") {
    return <span>{String(answer.value)}</span>;
  }
  // Checkbox do tipo { op1: true, op2: false }
  if (answer && typeof answer === "object" && Object.values(answer).every(v => typeof v === "boolean")) {
    const checked = Object.entries(answer).filter(([, v]) => v === true).map(([k]) => k);
    if (checked.length === 0) return <span className="text-amber-600">Não respondido</span>;
    return (
      <span>
        {checked.map((item, idx) => (
          <Badge key={item + idx}>{item}</Badge>
        ))}
      </span>
    );
  }
  // Fallback: outros objetos curtos
  if (answer && typeof answer === "object" && Object.values(answer).every(v => ["string","number"].includes(typeof v))) {
    return (
      <span>
        {Object.entries(answer).map(([k,v], idx) => (
          <Badge key={k + idx}>{k}: {String(v)}</Badge>
        ))}
      </span>
    );
  }
  // Falha: não extraiu nada legível
  return null;
}

// Função utilitária para identificar o tipo de questão
function getQuestionType(question: any) {
  return (
    question.responseType ||
    question.tipo_resposta ||
    question.type ||
    question.tipo ||
    ""
  ).toLowerCase();
}

function renderAnswerInline(answer: any, question: any) {
  const type = getQuestionType(question);

  // Casos "não respondido"
  if (
    answer === undefined ||
    answer === null ||
    (typeof answer === "string" && answer.trim() === "")
  ) {
    return <span className="text-amber-600">Não respondido</span>;
  }

  // Booleano
  if (typeof answer === "boolean") {
    return (
      <Badge className={answer ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
        {answer ? "Sim" : "Não"}
      </Badge>
    );
  }

  // Número
  if (typeof answer === "number") {
    return <Badge className="bg-blue-100 text-blue-700">{answer}</Badge>;
  }

  // Texto simples + datas
  if (typeof answer === "string") {
    if (["date", "datetime", "hora", "time"].includes(type) && answer.length >= 8) {
      return <Badge className="bg-purple-100 text-purple-700">{answer}</Badge>;
    }
    return <span>{answer}</span>;
  }

  // Múltipla escolha array
  if (Array.isArray(answer)) {
    if (answer.length === 0) {
      return <span className="text-amber-600">Não respondido</span>;
    }
    return (
      <span>
        {answer.map((v, idx) => (
          <Badge key={idx}>{String(v)}</Badge>
        ))}
      </span>
    );
  }

  // Objetos SPECIAL: tentar inline legível
  const triedInline = renderInlineObject(answer);
  if (triedInline) return triedInline;

  // Última opção: stringificada do objeto para consulta rápida (mas inline, não só "resposta complexa")
  if (typeof answer === "object" && answer !== null) {
    return (
      <span className="text-xs text-gray-800 bg-gray-50 px-2 py-1 rounded border font-mono max-w-full overflow-auto block whitespace-pre-wrap">
        {JSON.stringify(answer, null, 2)}
      </span>
    );
  }

  // Fallback geral
  return (
    <span className="text-amber-700" title="Tipo de resposta não reconhecido">{String(answer)}</span>
  );
}

interface InspectionAnswersSummaryProps {
  questions: any[];
  responses: Record<string, any>;
}

export function InspectionAnswersSummary({ questions, responses }: InspectionAnswersSummaryProps) {
  const [modalOpenId, setModalOpenId] = useState<string | null>(null);
  const [actionPlanToShow, setActionPlanToShow] = useState<any | null>(null);

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
        const actionPlan = response.actionPlan;

        return (
          <Card key={question.id} className="p-4 mb-2">
            <div className="space-y-2">
              <h3 className="font-medium">{question.text || question.pergunta}</h3>
              <div className="flex flex-col md:flex-row md:items-start md:gap-2">
                <span className="text-muted-foreground mr-2 min-w-[70px]">Resposta:</span>
                <div className="flex-1">
                  {renderAnswerInline(answer, question)}
                </div>
              </div>
              {!!mediaUrls.length && (
                <div className="pt-1 flex flex-col">
                  <span className="text-xs text-muted-foreground mb-1">Mídias:</span>
                  <div className="flex flex-wrap gap-3">
                    {mediaUrls.map((url, idx) => (
                      <div key={idx} className="border rounded h-20 w-20 overflow-hidden bg-gray-100 flex items-center justify-center">
                        <MediaRenderer url={url} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {notes && (
                <div className="pt-1">
                  <p className="text-xs text-muted-foreground mb-0.5">Observações:</p>
                  <p className="text-xs text-gray-800">{notes}</p>
                </div>
              )}
              {!!actionPlan && (
                <div className="pt-1 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setActionPlanToShow(actionPlan);
                      setModalOpenId(question.id);
                    }}
                    className="text-xs"
                  >
                    <Info className="w-4 h-4 mr-1" />
                    Ver Plano de Ação
                  </Button>
                </div>
              )}
              {/* Modal de plano de ação */}
              {modalOpenId === question.id && (
                <ActionPlanModalInline
                  open={modalOpenId === question.id}
                  onOpenChange={open => {
                    if (!open) setModalOpenId(null);
                  }}
                  actionPlan={actionPlanToShow}
                />
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
