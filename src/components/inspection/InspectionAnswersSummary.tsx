
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { ActionPlanModalInline } from "./ActionPlanModalInline";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { ActionPlanInlineSummary } from "./ActionPlanInlineSummary";
import { ResponseInputRenderer } from "./question-parts/ResponseInputRenderer";
import { MediaAttachmentRenderer } from "@/components/media/renderers/MediaAttachmentRenderer";

interface InspectionAnswersSummaryProps {
  questions: any[];
  responses: Record<string, any>;
}

// Função para extrair mediaUrls de estruturas aninhadas
const extractMediaUrls = (response: any): string[] => {
  console.log('[InspectionAnswersSummary] Extraindo mediaUrls de:', response);
  
  let mediaUrls: string[] = [];
  
  // Tentar extrair de diferentes localizações possíveis
  const possiblePaths = [
    response.mediaUrls,
    response.media_urls,
    response.value?.mediaUrls,
    response.value?.media_urls,
    response.answer?.mediaUrls,
    response.answer?.media_urls,
    response.answer?.value?.mediaUrls,
    response.answer?.value?.media_urls,
  ];
  
  for (const path of possiblePaths) {
    if (Array.isArray(path) && path.length > 0) {
      mediaUrls = path;
      console.log('[InspectionAnswersSummary] MediaUrls encontradas em:', path);
      break;
    } else if (typeof path === 'string' && path.trim() !== '') {
      mediaUrls = [path];
      console.log('[InspectionAnswersSummary] MediaUrl string encontrada:', path);
      break;
    }
  }
  
  console.log('[InspectionAnswersSummary] MediaUrls extraídas:', mediaUrls);
  return mediaUrls;
};

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
        console.log(`[InspectionAnswersSummary] Processando questão ${question.id}:`, response);
        
        const notes = response.comment ?? response.comments ?? "";
        const mediaUrls = extractMediaUrls(response);
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
              
              {/* Container flex para resposta e mídia na mesma linha */}
              <div className="flex flex-col space-y-2">
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

                {/* Renderização compacta das mídias inline */}
                {mediaUrls && mediaUrls.length > 0 && (
                  <div className="flex flex-col md:flex-row md:items-start md:gap-2 pt-1">
                    <span className="text-muted-foreground text-xs mr-2 min-w-[70px]">Mídias:</span>
                    <div className="flex-1">
                      <MediaAttachmentRenderer
                        urls={mediaUrls}
                        onOpenPreview={handleOpenPreview}
                        onOpenAnalysis={handleOpenAnalysis}
                        readOnly={true}
                        questionText={question.text || question.pergunta}
                        analysisResults={mediaAnalysisResults}
                        smallSize={true}
                      />
                    </div>
                  </div>
                )}

                {notes && (
                  <div className="flex flex-col md:flex-row md:items-start md:gap-2 pt-1">
                    <span className="text-muted-foreground text-xs mr-2 min-w-[70px]">Observações:</span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-800">{notes}</p>
                    </div>
                  </div>
                )}
              </div>

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
