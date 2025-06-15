
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { MediaRenderer } from "@/components/media/MediaRenderer";
import { ActionPlanModalInline } from "./ActionPlanModalInline";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { ActionPlanInlineSummary } from "./ActionPlanInlineSummary";

// Componente badge simples
function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={"inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700 mr-1 " + className}>
      {children}
    </span>
  );
}

// Nova função para extrair valor de estruturas aninhadas
function extractValueFromNestedStructure(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  
  // Se tem propriedade 'value', usa ela
  if (obj.hasOwnProperty('value')) {
    return obj.value;
  }
  
  // Se tem multipleChoiceData com selectedOptions
  if (obj.multipleChoiceData?.selectedOptions) {
    return obj.multipleChoiceData.selectedOptions;
  }
  
  // Se o objeto tem apenas uma propriedade, retorna seu valor
  const keys = Object.keys(obj);
  if (keys.length === 1) {
    return obj[keys[0]];
  }
  
  return obj;
}

// Função melhorada para detectar tipo de múltipla escolha
function isMultipleChoiceStructure(obj: any): boolean {
  if (!obj || typeof obj !== "object") return false;
  
  // Detecta estrutura com multipleChoiceData
  if (obj.multipleChoiceData?.selectedOptions) return true;
  
  // Detecta estrutura onde value é array
  if (obj.value && Array.isArray(obj.value)) return true;
  
  // Detecta estrutura de checkbox (todas as propriedades são boolean)
  const values = Object.values(obj);
  if (values.length > 1 && values.every(v => typeof v === "boolean")) return true;
  
  return false;
}

// Função melhorada para renderizar múltipla escolha
function renderMultipleChoice(obj: any): React.ReactNode {
  let selectedOptions: string[] = [];
  
  if (obj.multipleChoiceData?.selectedOptions) {
    selectedOptions = obj.multipleChoiceData.selectedOptions;
  } else if (obj.value && Array.isArray(obj.value)) {
    selectedOptions = obj.value;
  } else if (typeof obj === "object") {
    // Checkbox structure - pega keys onde valor é true
    selectedOptions = Object.entries(obj)
      .filter(([, value]) => value === true)
      .map(([key]) => key);
  }
  
  if (selectedOptions.length === 0) {
    return <span className="text-amber-600">Não respondido</span>;
  }
  
  return (
    <span>
      {selectedOptions.map((option, idx) => (
        <Badge key={String(option) + idx}>{String(option)}</Badge>
      ))}
    </span>
  );
}

// Função melhorada para renderizar objetos inline
function renderInlineObject(answer: any): React.ReactNode | null {
  if (!answer || typeof answer !== "object") return null;
  
  // Múltipla escolha
  if (isMultipleChoiceStructure(answer)) {
    return renderMultipleChoice(answer);
  }
  
  // Estruturas com valor aninhado
  const extractedValue = extractValueFromNestedStructure(answer);
  if (extractedValue !== answer && extractedValue !== undefined) {
    // Se conseguiu extrair um valor, tenta renderizar recursivamente
    if (typeof extractedValue === "string" || typeof extractedValue === "number" || typeof extractedValue === "boolean") {
      return <span>{String(extractedValue)}</span>;
    }
    if (Array.isArray(extractedValue)) {
      return (
        <span>
          {extractedValue.map((item, idx) => (
            <Badge key={idx}>{String(item)}</Badge>
          ))}
        </span>
      );
    }
  }
  
  // Objetos simples com apenas valores primitivos
  const entries = Object.entries(answer);
  const isPrimitiveObject = entries.every(([, v]) => 
    typeof v === "string" || typeof v === "number" || typeof v === "boolean"
  );
  
  if (isPrimitiveObject && entries.length <= 5) { // Limite para evitar sobrecarga visual
    return (
      <span>
        {entries.map(([k, v], idx) => (
          <Badge key={k + idx}>{k}: {String(v)}</Badge>
        ))}
      </span>
    );
  }
  
  return null; // Falha em extrair algo legível
}

// Função utilitária para identificar o tipo de questão
function getQuestionType(question: any): string {
  return (
    question.responseType ||
    question.tipo_resposta ||
    question.type ||
    question.tipo ||
    ""
  ).toLowerCase();
}

function renderAnswerInline(answer: any, question: any): React.ReactNode {
  const type = getQuestionType(question);

  // Casos "não respondido"
  if (
    answer === undefined ||
    answer === null ||
    (typeof answer === "string" && answer.trim() === "") ||
    (typeof answer === "object" && answer !== null && Object.keys(answer).length === 0)
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

  // Múltipla escolha array direto
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

  // Objetos complexos: tentar renderização inline inteligente
  if (typeof answer === "object" && answer !== null) {
    const inlineResult = renderInlineObject(answer);
    if (inlineResult) {
      return inlineResult;
    }

    // Se não conseguiu renderizar inline, mostra JSON compacto apenas para respostas pequenas
    const jsonString = JSON.stringify(answer);
    if (jsonString.length <= 200) {
      return (
        <span className="text-xs text-gray-800 bg-gray-50 px-2 py-1 rounded border font-mono">
          {jsonString}
        </span>
      );
    } else {
      // Para objetos muito grandes, mostra indicador
      return (
        <span className="text-amber-700 bg-amber-50 px-2 py-1 rounded text-xs">
          Resposta complexa (ver detalhes no modal)
        </span>
      );
    }
  }

  // Fallback geral
  return (
    <span className="text-amber-700" title="Tipo de resposta não reconhecido">
      {String(answer)}
    </span>
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
                  {/* Exibe resumo compacto do plano de ação se houver */}
                  {!!actionPlan && <ActionPlanInlineSummary actionPlan={actionPlan} />}
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
              {/* Botão e modal - manteve igual */}
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
