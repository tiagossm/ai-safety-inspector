
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { ActionPlanModalInline } from "./ActionPlanModalInline";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { ActionPlanInlineSummary } from "./ActionPlanInlineSummary";
import { ResponseInputRenderer } from "./question-parts/ResponseInputRenderer";
import { MediaAttachments } from "./question-inputs/MediaAttachments";

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

  const handleOpenPreview = (url: string) => {
    window.open(url, '_blank');
  };

  const handleOpenAnalysis = (url: string, questionText?: string) => {
    // Função vazia para readOnly
  };

  return (
    <div className="space-y-6">
      {questions.map((question) => {
        const response = responses?.[question.id] || {};
        const notes = response.comment ?? response.comments ?? "";
        
        // Garantir que mediaUrls seja sempre um array
        let mediaUrls: string[] = [];
        if (Array.isArray(response.mediaUrls)) {
          mediaUrls = response.mediaUrls;
        } else if (Array.isArray(response.media_urls)) {
          mediaUrls = response.media_urls;
        } else if (typeof response.mediaUrls === 'string') {
          mediaUrls = [response.mediaUrls];
        } else if (typeof response.media_urls === 'string') {
          mediaUrls = [response.media_urls];
        }

        const actionPlan = response.actionPlan || response.action_plan;
        const mediaAnalysisResults = response.mediaAnalysisResults || {};

        // Prepara o response no formato esperado pelo ResponseInputRenderer
        const formattedResponse = {
          value: response.value,
          mediaUrls: mediaUrls,
          mediaAnalysisResults: mediaAnalysisResults,
          comment: notes,
          actionPlan: actionPlan,
          ...response
        };

        return (
          <Card key={question.id} className="p-4 mb-2">
            <div className="space-y-2">
              <h3 className="font-medium">{question.text || question.pergunta}</h3>
              
              {/* Usa ResponseInputRenderer em modo readOnly para renderizar a resposta */}
              <div className="flex flex-col md:flex-row md:items-start md:gap-2">
                <span className="text-muted-foreground mr-2 min-w-[70px]">Resposta:</span>
                <div className="flex-1">
                  <ResponseInputRenderer
                    question={question}
                    response={formattedResponse}
                    onResponseChange={() => {}} // Função vazia pois é readOnly
                    onMediaChange={() => {}} // Função vazia pois é readOnly
                    readOnly={true}
                  />
                  
                  {/* Exibe resumo compacto do plano de ação se houver */}
                  {!!actionPlan && <ActionPlanInlineSummary actionPlan={actionPlan} />}
                </div>
              </div>

              {/* Exibe mídias anexadas se houver - usando componente independente */}
              {mediaUrls && mediaUrls.length > 0 && (
                <div className="pt-1">
                  <p className="text-xs text-muted-foreground mb-1">Mídias anexadas:</p>
                  <MediaAttachments
                    mediaUrls={mediaUrls}
                    onOpenPreview={handleOpenPreview}
                    onOpenAnalysis={handleOpenAnalysis}
                    readOnly={true}
                    questionText={question.text || question.pergunta}
                    analysisResults={mediaAnalysisResults}
                  />
                </div>
              )}

              {notes && (
                <div className="pt-1">
                  <p className="text-xs text-muted-foreground mb-0.5">Observações:</p>
                  <p className="text-xs text-gray-800">{notes}</p>
                </div>
              )}

              {/* Botão e modal para plano de ação */}
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
