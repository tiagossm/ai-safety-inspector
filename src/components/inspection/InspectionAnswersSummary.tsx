
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { ActionPlanModalInline } from "./ActionPlanModalInline";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { ActionPlanInlineSummary } from "./ActionPlanInlineSummary";
import { CompactResponseDisplay } from "./CompactResponseDisplay";
import { extractResponseData } from "@/utils/inspection/responseDataExtractor";

interface InspectionAnswersSummaryProps {
  questions: any[];
  responses: Record<string, any>;
}

export function InspectionAnswersSummary({ questions, responses }: InspectionAnswersSummaryProps) {
  const [modalOpenId, setModalOpenId] = useState<string | null>(null);
  const [actionPlanToShow, setActionPlanToShow] = useState<any | null>(null);

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Este checklist não possui questões.</p>
      </div>
    );
  }

  const handleOpenPreview = (url: string) => {
    window.open(url, '_blank');
  };

  const handleOpenAnalysis = (url: string, questionText?: string) => {
    // Função vazia para readOnly - sem análise em modo summary
  };

  return (
    <div className="space-y-4">
      {questions.map((question) => {
        const response = responses?.[question.id] || {};
        console.log(`[InspectionAnswersSummary] Processando questão ${question.id}:`, response);
        
        // Usar o extrator de dados otimizado
        const extractedData = extractResponseData(response);
        
        return (
          <Card key={question.id} className="p-4">
            <div className="space-y-3">
              {/* Cabeçalho da questão */}
              <div className="border-b border-gray-100 pb-2">
                <h3 className="font-medium text-gray-900 leading-tight">
                  {question.text || question.pergunta}
                </h3>
              </div>
              
              {/* Display compacto da resposta */}
              <CompactResponseDisplay
                question={question}
                response={extractedData}
                onOpenPreview={handleOpenPreview}
                onOpenAnalysis={handleOpenAnalysis}
              />

              {/* Resumo inline do plano de ação */}
              {extractedData.actionPlan && (
                <div className="pt-2 border-t border-gray-50">
                  <ActionPlanInlineSummary actionPlan={extractedData.actionPlan} />
                </div>
              )}

              {/* Botão para ver plano de ação detalhado */}
              {extractedData.actionPlan && (
                <div className="flex items-center justify-end pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActionPlanToShow(extractedData.actionPlan);
                      setModalOpenId(question.id);
                    }}
                    className="text-xs h-7"
                  >
                    <Info className="w-3 h-3 mr-1" />
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
