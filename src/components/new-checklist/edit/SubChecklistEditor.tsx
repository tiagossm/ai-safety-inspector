
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QuestionGroupsList } from "./QuestionGroupsList";

interface SubChecklistEditorProps {
  parentQuestionId: string;
  existingSubChecklistId?: string;
  onSubChecklistCreated: (subChecklistId: string) => void;
}

export function SubChecklistEditor({
  parentQuestionId,
  existingSubChecklistId,
  onSubChecklistCreated
}: SubChecklistEditorProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Load existing sub-checklist data if available
  useEffect(() => {
    const loadExistingSubChecklist = async () => {
      if (existingSubChecklistId) {
        try {
          const { data, error } = await supabase
            .from("checklists")
            .select("*")
            .eq("id", existingSubChecklistId)
            .single();
            
          if (error) throw error;
          
          if (data) {
            setTitle(data.title || "");
            setDescription(data.description || "");
            
            // Load questions for this sub-checklist
            const { data: questionsData, error: questionsError } = await supabase
              .from("checklist_itens")
              .select("*")
              .eq("checklist_id", existingSubChecklistId)
              .order("ordem", { ascending: true });
              
            if (questionsError) throw questionsError;
            
            if (questionsData && questionsData.length > 0) {
              // Transform the database questions to the format expected by the editor
              const transformedQuestions = questionsData.map(q => ({
                id: q.id,
                text: q.pergunta,
                responseType: mapDbTypeToEditor(q.tipo_resposta),
                isRequired: q.obrigatorio,
                options: q.opcoes,
                hint: q.hint,
                weight: q.weight || 1,
                parentQuestionId: q.parent_item_id,
                conditionValue: q.condition_value,
                allowsPhoto: q.permite_foto,
                allowsVideo: q.permite_video,
                allowsAudio: q.permite_audio,
                order: q.ordem,
                groupId: q.group_id
              }));
              
              setQuestions(transformedQuestions);
            }
          }
        } catch (error) {
          console.error("Error loading sub-checklist:", error);
          toast.error("Erro ao carregar sub-checklist");
        } finally {
          setInitialLoading(false);
        }
      } else {
        setInitialLoading(false);
      }
    };
    
    loadExistingSubChecklist();
  }, [existingSubChecklistId]);
  
  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("O título é obrigatório");
      return;
    }
    
    setLoading(true);
    
    try {
      let subChecklistId = existingSubChecklistId;
      
      // If no existing sub-checklist, create one
      if (!subChecklistId) {
        const { data, error } = await supabase
          .from("checklists")
          .insert({
            title,
            description,
            is_template: false,
            status_checklist: "active",
            is_sub_checklist: true
          })
          .select("id")
          .single();
          
        if (error) throw error;
        subChecklistId = data.id;
        
        // Update the parent question with the sub-checklist ID
        const { error: updateError } = await supabase
          .from("checklist_itens")
          .update({ 
            sub_checklist_id: subChecklistId,
            has_sub_checklist: true 
          })
          .eq("id", parentQuestionId);
          
        if (updateError) throw updateError;
      } else {
        // Update existing sub-checklist
        const { error } = await supabase
          .from("checklists")
          .update({
            title,
            description
          })
          .eq("id", subChecklistId);
          
        if (error) throw error;
      }
      
      // TODO: Save questions for the sub-checklist
      
      toast.success("Sub-checklist salvo com sucesso!");
      onSubChecklistCreated(subChecklistId);
    } catch (error) {
      console.error("Error saving sub-checklist:", error);
      toast.error("Erro ao salvar sub-checklist");
    } finally {
      setLoading(false);
    }
  };
  
  // Utility function to map DB types to editor types
  const mapDbTypeToEditor = (type: string): 'yes_no' | 'multiple_choice' | 'text' | 'numeric' | 'photo' | 'signature' => {
    const typeMap: Record<string, any> = {
      'sim/não': 'yes_no',
      'seleção múltipla': 'multiple_choice',
      'texto': 'text',
      'numérico': 'numeric',
      'foto': 'photo',
      'assinatura': 'signature'
    };
    
    return typeMap[type] || 'text';
  };
  
  if (initialLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Carregando sub-checklist...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="sub-checklist-title">Título</Label>
          <Input
            id="sub-checklist-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do sub-checklist"
          />
        </div>
        
        <div>
          <Label htmlFor="sub-checklist-description">Descrição</Label>
          <Textarea
            id="sub-checklist-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição do sub-checklist"
            rows={3}
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Perguntas do Sub-checklist</h3>
        {/* Placeholder for question editor - this would be where you add questions */}
        <div className="border rounded-md p-4 min-h-[200px] bg-muted/10">
          <p className="text-center text-muted-foreground">
            Editor de perguntas - implementação em desenvolvimento
          </p>
        </div>
      </div>
      
      <div className="flex justify-end gap-4">
        <Button 
          variant="outline" 
          onClick={() => onSubChecklistCreated(existingSubChecklistId || "")}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar Sub-checklist"}
        </Button>
      </div>
    </div>
  );
}
