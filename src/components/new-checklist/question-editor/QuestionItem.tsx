
import React, { useState, useEffect } from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Card } from "@/components/ui/card";
import { Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SubChecklistButton } from "./SubChecklistButton";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface QuestionItemProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
  onDelete: (questionId: string) => void;
  enableAllMedia?: boolean;
  "data-drag-handle"?: DraggableProvidedDragHandleProps | null;
}

export function QuestionItem({ 
  question, 
  onUpdate, 
  onDelete, 
  enableAllMedia = false, 
  "data-drag-handle": dragHandleProps 
}: QuestionItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [subQuestions, setSubQuestions] = useState<ChecklistQuestion[]>([]);
  const [loadingSubChecklist, setLoadingSubChecklist] = useState(false);
  const [subChecklistOpen, setSubChecklistOpen] = useState(false);
  
  useEffect(() => {
    if (enableAllMedia && (!question.allowsPhoto || !question.allowsVideo || !question.allowsAudio || !question.allowsFiles)) {
      onUpdate({
        ...question,
        allowsPhoto: true,
        allowsVideo: true,
        allowsAudio: true,
        allowsFiles: true
      });
    }
  }, [enableAllMedia, question, onUpdate]);
  
  // Fetch sub-checklist questions if this question has one
  useEffect(() => {
    if (question.hasSubChecklist && question.subChecklistId && expanded) {
      fetchSubChecklistQuestions(question.subChecklistId);
    }
  }, [question.hasSubChecklist, question.subChecklistId, expanded]);
  
  const fetchSubChecklistQuestions = async (subChecklistId: string) => {
    if (!subChecklistId) return;
    
    setLoadingSubChecklist(true);
    try {
      console.log(`Fetching questions for sub-checklist: ${subChecklistId}`);
      const { data, error } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", subChecklistId)
        .order("ordem", { ascending: true });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const mappedQuestions: ChecklistQuestion[] = data.map(q => {
          // Ensure options are always strings
          const options = Array.isArray(q.opcoes) 
            ? q.opcoes.map(opt => String(opt)) // Convert all options to string
            : [];
            
          return {
            id: q.id,
            text: q.pergunta,
            responseType: mapDbTypeToUiType(q.tipo_resposta),
            isRequired: q.obrigatorio,
            options: options,
            weight: q.weight || 1,
            allowsPhoto: q.permite_foto || false,
            allowsVideo: q.permite_video || false,
            allowsAudio: q.permite_audio || false,
            allowsFiles: false,
            order: q.ordem || 0,
            hint: q.hint,
            parentQuestionId: question.id,
            hasSubChecklist: false,
            subChecklistId: null,
            groupId: question.groupId
          };
        });
        
        setSubQuestions(mappedQuestions);
      } else {
        setSubQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching sub-checklist questions:", error);
      setSubQuestions([]);
    } finally {
      setLoadingSubChecklist(false);
    }
  };
  
  const mapDbTypeToUiType = (dbType: string): ChecklistQuestion["responseType"] => {
    const typeMap: Record<string, ChecklistQuestion["responseType"]> = {
      'sim/não': 'yes_no',
      'seleção múltipla': 'multiple_choice',
      'texto': 'text',
      'numérico': 'numeric',
      'foto': 'photo',
      'assinatura': 'signature'
    };
    
    return typeMap[dbType] || 'text';
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...question,
      text: e.target.value
    });
  };
  
  const handleTypeChange = (value: string) => {
    onUpdate({
      ...question,
      responseType: value as any
    });
  };
  
  const handleRequiredChange = (checked: boolean) => {
    onUpdate({
      ...question,
      isRequired: checked
    });
  };
  
  const handleHintChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...question,
      hint: e.target.value
    });
  };
  
  const handleAllowMediaChange = (type: 'allowsPhoto' | 'allowsVideo' | 'allowsAudio' | 'allowsFiles', checked: boolean) => {
    onUpdate({
      ...question,
      [type]: checked
    });
  };
  
  const handleSubChecklistCreated = (subChecklistId: string) => {
    onUpdate({
      ...question,
      hasSubChecklist: true,
      subChecklistId
    });
  };
  
  return (
    <Card className="p-3 border">
      <div className="flex items-start">
        <div {...dragHandleProps} className="p-2 cursor-move mr-1" aria-label="Drag to reorder">
          <GripVertical size={18} className="text-muted-foreground" />
        </div>
        <div className="flex-grow">
          <Input
            value={question.text}
            onChange={handleTextChange}
            placeholder="Digite sua pergunta aqui"
            className="text-base mb-2"
          />
          
          <div className="flex items-center gap-2 text-sm">
            <Select
              value={question.responseType}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger className="w-40 h-8">
                <SelectValue placeholder="Tipo de resposta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes_no">Sim/Não</SelectItem>
                <SelectItem value="multiple_choice">Múltipla escolha</SelectItem>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="numeric">Numérico</SelectItem>
                <SelectItem value="photo">Foto</SelectItem>
                <SelectItem value="signature">Assinatura</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-1">
              <Checkbox
                id={`required-${question.id}`}
                checked={question.isRequired}
                onCheckedChange={handleRequiredChange}
              />
              <label htmlFor={`required-${question.id}`} className="text-sm">
                Obrigatório
              </label>
            </div>
            
            {question.parentQuestionId && (
              <Badge variant="outline" className="text-xs">
                Sub-pergunta
              </Badge>
            )}

            {question.hasSubChecklist && question.subChecklistId && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600">
                Tem Sub-checklist
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Recolher detalhes" : "Expandir detalhes"}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(question.id)}
            aria-label="Excluir pergunta"
          >
            <Trash2 size={18} className="text-destructive" />
          </Button>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-3 pt-3 border-t space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Dica para o inspetor
            </label>
            <Textarea
              value={question.hint || ""}
              onChange={handleHintChange}
              placeholder="Adicione detalhes ou instruções para quem estiver preenchendo"
              className="resize-none h-20"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              Opções de mídia
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`photo-${question.id}`}
                  checked={question.allowsPhoto}
                  onCheckedChange={(checked) => 
                    handleAllowMediaChange('allowsPhoto', checked as boolean)
                  }
                  disabled={enableAllMedia}
                />
                <label htmlFor={`photo-${question.id}`} className="text-sm">
                  Permite Fotos
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`video-${question.id}`}
                  checked={question.allowsVideo}
                  onCheckedChange={(checked) => 
                    handleAllowMediaChange('allowsVideo', checked as boolean)
                  }
                  disabled={enableAllMedia}
                />
                <label htmlFor={`video-${question.id}`} className="text-sm">
                  Permite Vídeos
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`audio-${question.id}`}
                  checked={question.allowsAudio}
                  onCheckedChange={(checked) => 
                    handleAllowMediaChange('allowsAudio', checked as boolean)
                  }
                  disabled={enableAllMedia}
                />
                <label htmlFor={`audio-${question.id}`} className="text-sm">
                  Permite Áudio
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`files-${question.id}`}
                  checked={question.allowsFiles}
                  onCheckedChange={(checked) => 
                    handleAllowMediaChange('allowsFiles', checked as boolean)
                  }
                  disabled={enableAllMedia}
                />
                <label htmlFor={`files-${question.id}`} className="text-sm">
                  Permite Arquivos
                </label>
              </div>
            </div>
          </div>
          
          {!question.parentQuestionId && (
            <div className="mt-3 pt-2 border-t">
              <label className="text-sm font-medium block mb-2">
                Sub-checklist
              </label>
              <SubChecklistButton
                parentQuestionId={question.id}
                hasSubChecklist={!!question.hasSubChecklist}
                subChecklistId={question.subChecklistId}
                onSubChecklistCreated={handleSubChecklistCreated}
              />
              
              {question.hasSubChecklist && question.subChecklistId && (
                <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  Sub-checklist vinculado (ID: {question.subChecklistId.substring(0, 8)}...)
                </div>
              )}
            </div>
          )}

          {/* Display sub-checklist questions if they exist */}
          {question.hasSubChecklist && question.subChecklistId && expanded && (
            <Collapsible
              open={subChecklistOpen}
              onOpenChange={setSubChecklistOpen}
              className="mt-3 pt-2 border-t"
            >
              <div className="flex items-center justify-between mb-2">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 p-0 h-auto">
                    <h4 className="text-sm font-medium">Perguntas do Sub-checklist</h4>
                    {subChecklistOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </Button>
                </CollapsibleTrigger>
                {loadingSubChecklist && <div className="text-xs text-muted-foreground">Carregando...</div>}
              </div>
              
              <CollapsibleContent>
                {!loadingSubChecklist && subQuestions.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Este sub-checklist não tem perguntas ou não pôde ser carregado.
                  </p>
                )}
                
                {!loadingSubChecklist && subQuestions.length > 0 && (
                  <div className="space-y-2 ml-4 border-l pl-3 border-gray-200">
                    {subQuestions.map((subQ, index) => (
                      <div key={subQ.id} className="text-sm p-2 border rounded-sm bg-slate-50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-xs">{index + 1}.</span>
                          <span>{subQ.text || "Sem texto"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            Tipo: {subQ.responseType === "yes_no" 
                                  ? "Sim/Não" 
                                  : subQ.responseType === "text" 
                                  ? "Texto" 
                                  : subQ.responseType === "multiple_choice"
                                  ? "Múltipla escolha"
                                  : subQ.responseType}
                          </span>
                          {subQ.isRequired && <span>• Obrigatório</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      )}
    </Card>
  );
}
