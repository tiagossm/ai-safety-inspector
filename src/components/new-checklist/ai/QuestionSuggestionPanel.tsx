
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Lightbulb, Plus, Wand2, RefreshCw } from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { StandardResponseType } from "@/types/responseTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AISuggestion {
  id: string;
  text: string;
  responseType: StandardResponseType;
  hint?: string;
  options?: string[];
  reasoning: string;
  confidence: number;
}

interface QuestionSuggestionPanelProps {
  category: string;
  existingQuestions: ChecklistQuestion[];
  onAddSuggestion: (suggestion: Partial<ChecklistQuestion>) => void;
  groupId: string;
}

export function QuestionSuggestionPanel({
  category,
  existingQuestions,
  onAddSuggestion,
  groupId
}: QuestionSuggestionPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [context, setContext] = useState("");
  const [suggestionCount, setSuggestionCount] = useState(3);
  const [autoApplyBest, setAutoApplyBest] = useState(false);

  const generateSuggestions = async () => {
    if (!category) {
      toast.error("Selecione uma categoria primeiro");
      return;
    }

    setIsLoading(true);
    try {
      const existingTexts = existingQuestions.map(q => q.text).filter(Boolean);
      
      const { data, error } = await supabase.functions.invoke('generate-question-suggestions', {
        body: {
          category,
          context: context || `Checklist para ${category}`,
          existingQuestions: existingTexts,
          count: suggestionCount,
          language: 'pt-BR'
        }
      });

      if (error) throw error;

      if (data?.suggestions) {
        setSuggestions(data.suggestions);
        
        if (autoApplyBest && data.suggestions.length > 0) {
          const bestSuggestion = data.suggestions[0]; // Primeira sugestão tem maior confiança
          handleAddSuggestion(bestSuggestion);
        }
        
        toast.success(`${data.suggestions.length} sugestões geradas!`);
      }
    } catch (error: any) {
      console.error('Erro ao gerar sugestões:', error);
      toast.error(`Erro na IA: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestion = (suggestion: AISuggestion) => {
    const newQuestion: Partial<ChecklistQuestion> = {
      text: suggestion.text,
      responseType: suggestion.responseType,
      hint: suggestion.hint,
      options: suggestion.options || [],
      isRequired: true,
      weight: 1,
      allowsPhoto: false,
      allowsVideo: false,
      allowsAudio: false,
      allowsFiles: false,
      groupId,
      order: existingQuestions.length,
      level: 0,
      isConditional: false
    };

    onAddSuggestion(newQuestion);
    
    // Remover sugestão da lista
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    
    toast.success("Pergunta adicionada com sucesso!");
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          Sugestões de IA
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Configurações */}
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Contexto adicional (opcional)</Label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Ex: Inspeção de segurança em fábrica de alimentos..."
              rows={2}
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Quantidade</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={suggestionCount}
                onChange={(e) => setSuggestionCount(Number(e.target.value))}
                className="h-8"
              />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <Switch
                checked={autoApplyBest}
                onCheckedChange={setAutoApplyBest}
              />
              <Label className="text-xs">Auto-aplicar melhor</Label>
            </div>
          </div>
        </div>

        {/* Botão gerar */}
        <Button
          onClick={generateSuggestions}
          disabled={isLoading || !category}
          className="w-full"
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Lightbulb className="h-4 w-4 mr-2" />
              Gerar Sugestões
            </>
          )}
        </Button>

        {/* Lista de sugestões */}
        {suggestions.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Sugestões geradas:</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSuggestions([])}
                className="h-6 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            </div>

            {suggestions.map(suggestion => (
              <div key={suggestion.id} className="p-3 bg-white border border-purple-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {suggestion.text}
                    </p>
                    {suggestion.hint && (
                      <p className="text-xs text-gray-600 mb-2">
                        💡 {suggestion.hint}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.responseType}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}
                      >
                        {(suggestion.confidence * 100).toFixed(0)}% confiança
                      </Badge>
                    </div>
                    {suggestion.options && suggestion.options.length > 0 && (
                      <div className="text-xs text-gray-600">
                        <strong>Opções:</strong> {suggestion.options.join(', ')}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSuggestion(suggestion)}
                    className="ml-2"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Usar
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 border-t pt-2">
                  <strong>Justificativa:</strong> {suggestion.reasoning}
                </p>
              </div>
            ))}
          </div>
        )}

        {suggestions.length === 0 && !isLoading && (
          <div className="text-center py-4 text-gray-500 text-sm">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            Clique em "Gerar Sugestões" para receber perguntas inteligentes baseadas na categoria selecionada.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
