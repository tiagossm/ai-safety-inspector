
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Loader2, Sparkles } from "lucide-react";

interface SubChecklistAIGeneratorProps {
  parentQuestion: ChecklistQuestion;
  onSubChecklistCreated: (subChecklistId: string) => void;
}

export function SubChecklistAIGenerator({
  parentQuestion,
  onSubChecklistCreated
}: SubChecklistAIGeneratorProps) {
  const [prompt, setPrompt] = useState(`Gere um sub-checklist detalhado para a seguinte pergunta: "${parentQuestion.text}"`);
  const [questionCount, setQuestionCount] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor, digite um prompt");
      return;
    }
    
    setGenerating(true);
    setPreviewData(null);
    
    try {
      // Call the sub-checklist generator edge function
      const { data, error } = await supabase.functions.invoke('generate-sub-checklist', {
        body: {
          prompt,
          parentQuestionId: parentQuestion.id,
          parentQuestionText: parentQuestion.text,
          questionCount
        }
      });
      
      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || "Falha ao gerar sub-checklist");
      }
      
      setPreviewData(data.subChecklist);
      toast.success("Sub-checklist gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar sub-checklist:", error);
      toast.error(`Erro ao gerar sub-checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    } finally {
      setGenerating(false);
    }
  };
  
  const handleSave = async () => {
    if (!previewData) {
      toast.error("Gere um sub-checklist primeiro");
      return;
    }
    
    setSaving(true);
    
    try {
      // Create the sub-checklist in the database
      const { data: newChecklist, error: checklistError } = await supabase
        .from("checklists")
        .insert({
          title: previewData.title,
          description: previewData.description,
          is_template: false,
          status_checklist: "ativo",
          category: "subchecklist",
          is_sub_checklist: true,
          parent_question_id: parentQuestion.id
        })
        .select()
        .single();
      
      if (checklistError) throw checklistError;
      
      if (!newChecklist || !newChecklist.id) {
        throw new Error("Falha ao criar sub-checklist");
      }
      
      // Add the questions to the sub-checklist
      const questionsToInsert = previewData.questions.map((q: any, index: number) => ({
        checklist_id: newChecklist.id,
        pergunta: q.text,
        tipo_resposta: (() => {
          switch (q.responseType) {
            case "yes_no": return "sim/não";
            case "text": return "texto";
            case "numeric": return "numérico";
            case "multiple_choice": return "seleção múltipla";
            default: return "sim/não";
          }
        })(),
        obrigatorio: q.isRequired !== false,
        opcoes: q.options || null,
        permite_foto: q.allowsPhoto || false,
        permite_video: q.allowsVideo || false,
        permite_audio: q.allowsAudio || false,
        ordem: index
      }));
      
      const { error: questionsError } = await supabase
        .from("checklist_itens")
        .insert(questionsToInsert);
      
      if (questionsError) throw questionsError;
      
      // Update the parent question to link to this sub-checklist
      const { error: updateError } = await supabase
        .from("checklist_itens")
        .update({ 
          has_subchecklist: true,
          subchecklist_id: newChecklist.id
        })
        .eq("id", parentQuestion.id);
      
      if (updateError) throw updateError;
      
      toast.success("Sub-checklist salvo com sucesso!");
      onSubChecklistCreated(newChecklist.id);
    } catch (error) {
      console.error("Erro ao salvar sub-checklist:", error);
      toast.error(`Erro ao salvar sub-checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="prompt">Prompt para gerar o sub-checklist</Label>
        <Textarea
          id="prompt"
          placeholder="Descreva o tipo de sub-checklist que você deseja gerar..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="mt-1"
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="questionCount">Número de perguntas (2-5)</Label>
        <Input
          id="questionCount"
          type="number"
          min={2}
          max={5}
          value={questionCount}
          onChange={(e) => setQuestionCount(Math.min(Math.max(parseInt(e.target.value) || 2, 2), 5))}
          className="mt-1 w-24"
        />
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className="flex items-center gap-1"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Gerando...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Gerar Sub-checklist</span>
            </>
          )}
        </Button>
        
        {previewData && (
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="outline"
          >
            {saving ? "Salvando..." : "Salvar Sub-checklist"}
          </Button>
        )}
      </div>
      
      {previewData && (
        <div className="mt-4 space-y-4">
          <Separator />
          
          <div>
            <h3 className="font-medium">Prévia do Sub-checklist</h3>
            <p className="text-sm text-muted-foreground">{previewData.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{previewData.description}</p>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Perguntas</h4>
            {previewData.questions.map((q: any, idx: number) => (
              <div key={idx} className="bg-muted p-2 rounded-md">
                <p className="text-sm">
                  <span className="font-medium">{idx + 1}.</span> {q.text}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tipo: {q.responseType} | Obrigatório: {q.isRequired ? "Sim" : "Não"}
                  {q.options && q.options.length > 0 && ` | Opções: ${q.options.join(", ")}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
