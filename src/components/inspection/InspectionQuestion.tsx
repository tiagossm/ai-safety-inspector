
import React, { useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, FileText, ExternalLink, Scale } from "lucide-react";
import { ResponseInputRenderer } from "./question-parts/ResponseInputRenderer";
import { ActionPlanFormData } from "@/components/action-plans/form/types";
import { ActionPlan } from "@/services/inspection/actionPlanService";
import { normalizeResponseType } from "@/utils/responseTypeMap";

interface InspectionQuestionProps {
  question: any;
  index: number;
  response: any;
  onResponseChange: (data: any) => void;
  onOpenSubChecklist?: () => void;
  allQuestions?: any[];
  numberLabel: string;
  inspectionId?: string;
  actionPlan?: ActionPlan;
  onSaveActionPlan?: (data: ActionPlanFormData) => Promise<ActionPlan | void>;
}

export function InspectionQuestion({
  question,
  index,
  response,
  onResponseChange,
  onOpenSubChecklist,
  allQuestions = [],
  numberLabel,
  inspectionId,
  actionPlan,
  onSaveActionPlan
}: InspectionQuestionProps) {
  // Normalizar o tipo de resposta
  const rawResponseType = question.responseType || question.tipo_resposta;
  const normalizedType = normalizeResponseType(rawResponseType);
  
  console.log(`[InspectionQuestion] Question ${question.id}:`, {
    rawType: rawResponseType,
    normalizedType,
    question: question.text || question.pergunta
  });

  const handleResponseChange = useCallback(
    (data: any) => {
      console.log(`[InspectionQuestion] Response change for question ${question.id}:`, data);
      onResponseChange(data);
    },
    [question.id, onResponseChange]
  );

  const handleMediaChange = useCallback(
    (mediaUrls: string[]) => {
      console.log(`[InspectionQuestion] Media change for question ${question.id}:`, mediaUrls);
      onResponseChange({
        ...response,
        mediaUrls
      });
    },
    [question.id, response, onResponseChange]
  );

  const parseHint = (hint?: string | null): string => {
    if (!hint) return "";

    try {
      if (typeof hint === 'string' && hint.startsWith("{") && hint.endsWith("}")) {
        const parsed = JSON.parse(hint);
        if (parsed.groupId && parsed.groupTitle) {
          return "";
        }
      }
    } catch (e) {}
    return hint;
  };

  const userHint = parseHint(question.hint);
  const questionText = question.text || question.pergunta || "";
  const isRequired = question.isRequired ?? question.obrigatorio ?? false;
  const weight = question.weight || 1;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Badge variant="outline" className="shrink-0 mt-1">
              {numberLabel}
            </Badge>
            <div className="flex-1">
              <h3 className="text-lg font-medium leading-tight">
                {questionText}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </h3>
              
              {userHint && (
                <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50 rounded-md">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-blue-800">{userHint}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Scale className="h-3 w-3" />
              {weight}
            </Badge>
            
            <Badge variant="outline">
              {normalizedType}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          <ResponseInputRenderer
            question={question}
            response={response}
            inspectionId={inspectionId}
            onResponseChange={handleResponseChange}
            onMediaChange={handleMediaChange}
            actionPlan={actionPlan}
            onSaveActionPlan={onSaveActionPlan}
          />

          {question.hasSubChecklist && onOpenSubChecklist && (
            <div className="pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onOpenSubChecklist}
                className="w-full gap-2"
              >
                <FileText className="h-4 w-4" />
                Abrir Sub-checklist
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
