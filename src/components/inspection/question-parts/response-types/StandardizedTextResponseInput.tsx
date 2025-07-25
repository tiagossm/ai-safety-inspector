import React, { useCallback, useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { BaseResponseInput } from "./base/BaseResponseInput";
import { standardizeResponse } from "@/utils/responseTypeStandardization";

interface StandardizedTextResponseInputProps {
  question: any;
  response: any;
  onResponseChange: (data: any) => void;
  inspectionId?: string;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
  onMediaChange?: (mediaUrls: string[]) => void;
  onApplyAISuggestion?: (suggestion: string) => void;
  readOnly?: boolean;
}

export function StandardizedTextResponseInput(props: StandardizedTextResponseInputProps) {
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const standardResponse = standardizeResponse(props.response);

  // Find AI suggestion from media analysis results
  useEffect(() => {
    const analysisResults = standardResponse.mediaAnalysisResults || {};
    const suggestion = Object.values(analysisResults).find((result: any) => 
      result?.actionPlanSuggestion
    )?.actionPlanSuggestion || null;
    
    setAiSuggestion(suggestion);
  }, [standardResponse.mediaAnalysisResults]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (props.readOnly) return;
    
    const updatedResponse = {
      ...standardResponse,
      value: e.target.value
    };
    props.onResponseChange(updatedResponse);
  }, [props.readOnly, standardResponse, props.onResponseChange]);

  const handleApplyAISuggestion = useCallback(() => {
    if (aiSuggestion && props.onApplyAISuggestion) {
      props.onApplyAISuggestion(aiSuggestion);
      toast.success("Sugestão da IA aplicada", {
        description: "O plano de ação foi preenchido com a sugestão da IA",
      });
    }
  }, [aiSuggestion, props.onApplyAISuggestion]);

  // Check if we have non-conformity results in any media analysis
  const hasNonConformityInAnalysis = Object.values(standardResponse.mediaAnalysisResults || {}).some((result: any) => 
    result?.hasNonConformity
  );

  return (
    <BaseResponseInput {...props}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Textarea
            value={standardResponse.value || ""}
            onChange={handleTextChange}
            placeholder="Digite sua resposta..."
            rows={3}
            disabled={props.readOnly}
            className="w-full text-sm"
          />
          
          {/* Show AI analysis indicator if we have non-conformity in media analysis */}
          {hasNonConformityInAnalysis && (
            <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1" variant="outline">
              <AlertCircle className="h-3 w-3" />
              <span>IA detectou não conformidade</span>
            </Badge>
          )}
        </div>

        {/* AI Suggestion for Action Plan */}
        {aiSuggestion && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-center mb-2">
              <Sparkles className="h-4 w-4 mr-1 text-amber-500" />
              <span className="text-sm font-medium text-amber-700">Sugestão da IA</span>
            </div>
            <p className="text-sm mb-3 text-amber-800">{aiSuggestion}</p>
            <Button 
              size="sm" 
              type="button"
              variant="outline" 
              className="w-full bg-amber-100 hover:bg-amber-200 border-amber-300"
              onClick={handleApplyAISuggestion}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Aplicar esta sugestão
            </Button>
          </div>
        )}

        {/* Display analysis results summary */}
        {Object.keys(standardResponse.mediaAnalysisResults || {}).length > 0 && (
          <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
            <h4 className="text-sm font-medium mb-2">
              Análises de IA
            </h4>
            <div className="space-y-3">
              {Object.entries(standardResponse.mediaAnalysisResults || {}).map(([url, result], index) => {
                let summary = (result as any)?.analysis || '';
                
                if (summary && summary.length > 100) {
                  summary = summary.substring(0, 100) + '...';
                }
                
                const mediaType = (result as any)?.type || 'document';
                
                return (
                  <div key={index} className="text-xs border-l-2 border-blue-300 pl-3 py-1">
                    <div className="font-medium mb-1">
                      {mediaType === 'image' && 'Análise de Imagem'}
                      {mediaType === 'video' && 'Análise de Vídeo'}
                      {mediaType === 'audio' && 'Transcrição de Áudio'}
                      {mediaType === 'document' && 'Análise de Documento'}
                    </div>
                    <p className="text-gray-600">{summary}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </BaseResponseInput>
  );
}