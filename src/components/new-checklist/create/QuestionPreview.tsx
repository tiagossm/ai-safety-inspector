
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Edit, Eye } from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { RESPONSE_TYPE_MAP } from "@/lib/constants";

interface QuestionPreviewProps {
  title: string;
  category: string;
  description: string;
  companyId: string;
  isTemplate: boolean;
  questions: ChecklistQuestion[];
  onBack: () => void;
  onSave: () => void;
  isSubmitting: boolean;
}

export function QuestionPreview({
  title,
  category,
  description,
  companyId,
  isTemplate,
  questions,
  onBack,
  onSave,
  isSubmitting
}: QuestionPreviewProps) {
  const getResponseTypeLabel = (type: string) => {
    return RESPONSE_TYPE_MAP.frontend[type as keyof typeof RESPONSE_TYPE_MAP.frontend] || type;
  };

  const getResponseTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      "sim/não": "bg-green-100 text-green-800",
      "texto": "bg-blue-100 text-blue-800",
      "numérico": "bg-purple-100 text-purple-800",
      "seleção múltipla": "bg-orange-100 text-orange-800",
      "foto": "bg-pink-100 text-pink-800",
      "assinatura": "bg-indigo-100 text-indigo-800",
      "data": "bg-cyan-100 text-cyan-800",
      "hora": "bg-yellow-100 text-yellow-800"
    };
    return colorMap[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Visualização do Checklist</h1>
          <p className="text-muted-foreground">Revise todas as informações antes de salvar</p>
        </div>
      </div>

      {/* Informações básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Título</label>
              <p className="font-medium">{title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Categoria</label>
              <p className="font-medium">{category}</p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Descrição</label>
            <p className="text-gray-700">{description}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {isTemplate && (
              <Badge variant="secondary">Template</Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {questions.length} pergunta{questions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Lista de perguntas */}
      <Card>
        <CardHeader>
          <CardTitle>Perguntas do Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {index + 1}.
                      </span>
                      <p className="font-medium">{question.text}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getResponseTypeColor(question.responseType)}>
                        {getResponseTypeLabel(question.responseType)}
                      </Badge>
                      
                      {question.isRequired && (
                        <Badge variant="outline">Obrigatória</Badge>
                      )}
                      
                      {question.allowsPhoto && (
                        <Badge variant="outline">📷 Foto</Badge>
                      )}
                      
                      {question.allowsVideo && (
                        <Badge variant="outline">🎥 Vídeo</Badge>
                      )}
                      
                      {question.allowsAudio && (
                        <Badge variant="outline">🎤 Áudio</Badge>
                      )}
                      
                      {question.allowsFiles && (
                        <Badge variant="outline">📎 Arquivos</Badge>
                      )}
                    </div>

                    {question.options && question.options.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground mb-1">Opções:</p>
                        <div className="flex flex-wrap gap-1">
                          {question.options.map((option, optIndex) => (
                            <Badge key={optIndex} variant="secondary" className="text-xs">
                              {option}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {question.hint && (
                      <p className="text-sm text-muted-foreground italic">
                        💡 {question.hint}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right text-sm text-muted-foreground">
                    Peso: {question.weight}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações finais */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>
          <Edit className="h-4 w-4 mr-2" />
          Voltar para Edição
        </Button>
        
        <Button onClick={onSave} disabled={isSubmitting} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Salvando..." : "Salvar Checklist"}
        </Button>
      </div>
    </div>
  );
}
