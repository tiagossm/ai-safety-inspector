
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NewChecklist, Checklist } from "@/types/checklist";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionsSection } from "./create-forms/QuestionsSection";
import { BackButton } from "./create-forms/FormActions";
import ChecklistForm from "./ChecklistForm";
import { supabase } from "@/integrations/supabase/client";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist";
import { GroupedQuestionsSection } from "./create-forms/GroupedQuestionsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ALLOWED_RESPONSE_TYPES = ['sim/não', 'texto', 'seleção múltipla', 'numérico', 'foto', 'assinatura'];

const normalizeResponseType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'sim/não': 'sim/não',
    'múltipla escolha': 'seleção múltipla',
    'numérico': 'numérico',
    'texto': 'texto',
    'foto': 'foto',
    'assinatura': 'assinatura',
    'yes_no': 'sim/não',
    'multiple_choice': 'seleção múltipla',
    'numeric': 'numérico',
    'text': 'texto',
    'photo': 'foto',
    'signature': 'assinatura'
  };

  console.log(`Normalizing response type from "${type}" to "${typeMap[type] || 'texto'}"`);
  return typeMap[type] || 'texto';
};

interface ChecklistEditorProps {
  initialChecklist: NewChecklist;
  initialQuestions?: Array<{
    text: string;
    type: string;
    required: boolean;
    allowPhoto?: boolean;
    allowVideo?: boolean;
    allowAudio?: boolean;
    options?: string[];
    hint?: string;
    weight?: number;
    parentId?: string;
    conditionValue?: string;
    groupId?: string;
  }>;
  initialGroups?: Array<{
    id: string;
    title: string;
    questions: any[];
  }>;
  mode: "create" | "edit" | "ai-review" | "import-review";
  onSave?: (checklistId: string) => void;
  onCancel?: () => void;
}

type Question = {
  text: string;
  type: string;
  required: boolean;
  allowPhoto: boolean;
  allowVideo: boolean;
  allowAudio: boolean;
  options?: string[];
  hint?: string;
  weight?: number;
  parentId?: string;
  conditionValue?: string;
  groupId?: string;
};

type QuestionGroup = {
  id: string;
  title: string;
  questions: Question[];
};

export function ChecklistEditor({
  initialChecklist,
  initialQuestions = [],
  initialGroups = [],
  mode,
  onSave,
  onCancel
}: ChecklistEditorProps) {
  const transformedInitialChecklist: Partial<Checklist> = {
    ...initialChecklist,
    status_checklist: (initialChecklist.status_checklist as "ativo" | "inativo") || "ativo",
    status: (initialChecklist.status as "pendente" | "em_andamento" | "concluido") || "pendente"
  };

  const [checklist, setChecklist] = useState<Partial<Checklist>>(transformedInitialChecklist);
  const [questions, setQuestions] = useState<Question[]>(
    initialQuestions.map(q => ({
      text: q.text || "",
      type: q.type || "sim/não",
      required: q.required !== undefined ? q.required : true,
      allowPhoto: q.allowPhoto || false,
      allowVideo: q.allowVideo || false,
      allowAudio: q.allowAudio || false,
      options: Array.isArray(q.options) ? q.options : [],
      hint: q.hint || "",
      weight: q.weight || 1,
      parentId: q.parentId || null,
      conditionValue: q.conditionValue || null,
      groupId: q.groupId
    }))
  );
  const [groups, setGroups] = useState<QuestionGroup[]>(
    initialGroups.length > 0 
      ? initialGroups.map(g => ({
          ...g,
          questions: g.questions.map(q => ({
            text: q.text || "",
            type: q.type || "sim/não",
            required: q.required !== undefined ? q.required : true,
            allowPhoto: q.allowPhoto || false,
            allowVideo: q.allowVideo || false,
            allowAudio: q.allowAudio || false,
            options: Array.isArray(q.options) ? q.options : [],
            hint: q.hint || "",
            weight: q.weight || 1,
            parentId: q.parentId || null,
            conditionValue: q.conditionValue || null,
            groupId: g.id
          }))
        }))
      : []
  );
  const [viewMode, setViewMode] = useState<"flat" | "grouped">(
    initialGroups.length > 0 ? "grouped" : "flat"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const createChecklistMutation = useCreateChecklist();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (viewMode === "grouped" && groups.length === 0 && questions.length > 0) {
      const defaultGroup: QuestionGroup = {
        id: `group-default-${Date.now()}`,
        title: "Geral",
        questions: [...questions]
      };
      setGroups([defaultGroup]);
    } else if (viewMode === "flat" && questions.length === 0 && groups.length > 0) {
      const allQuestions = groups.flatMap(group => 
        group.questions.map(q => ({
          ...q,
          groupId: group.id
        }))
      );
      setQuestions(allQuestions);
    }
  }, [viewMode]);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await supabase
          .from('users')
          .select('id, name, email')
          .eq('status', 'active')
          .order('name', { ascending: true });
          
        if (response.error) {
          console.error("Error fetching users:", response.error);
          throw response.error;
        }
        
        setUsers(response.data || []);
      } catch (error) {
        console.error("Error in fetchUsers:", error);
      }
    };
    
    fetchUsers();
  }, []);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        type: "sim/não",
        required: true,
        allowPhoto: false,
        allowVideo: false,
        allowAudio: false,
        groupId: viewMode === "grouped" && groups.length > 0 ? groups[0].id : undefined
      }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (
    index: number,
    field: string,
    value: string | boolean | string[]
  ) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };

  const handleGroupsChange = (newGroups: QuestionGroup[]) => {
    setGroups(newGroups);
    
    if (viewMode === "flat") {
      const allQuestions = newGroups.flatMap(group => 
        group.questions.map(q => ({
          ...q,
          groupId: group.id
        }))
      );
      setQuestions(allQuestions);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/checklists");
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if (!checklist.title?.trim()) {
        toast.error("O título é obrigatório");
        setIsSubmitting(false);
        return;
      }
      
      let processedCompanyId = checklist.company_id;
      if (processedCompanyId === "none") {
        processedCompanyId = null;
      }
      
      let processedResponsibleId = checklist.responsible_id;
      if (processedResponsibleId === "none") {
        processedResponsibleId = null;
      }
      
      const newChecklistData: NewChecklist = {
        title: checklist.title,
        description: checklist.description,
        is_template: checklist.is_template,
        status_checklist: checklist.status_checklist as string,
        category: checklist.category,
        responsible_id: processedResponsibleId,
        company_id: processedCompanyId,
        due_date: checklist.due_date,
        user_id: checklist.user_id,
        status: checklist.status as string
      };
      
      console.log("Creating checklist with data:", newChecklistData);
      
      const result = await createChecklistMutation.mutateAsync(newChecklistData);
      
      if (!result || !result.id) {
        console.error("Error creating checklist: No valid result returned");
        toast.error("Erro ao criar checklist");
        setIsSubmitting(false);
        return;
      }
      
      const newChecklistId = result.id;
      console.log("Checklist created successfully with ID:", newChecklistId);
      
      const questionsToSave = viewMode === "grouped" 
        ? groups.flatMap(group => 
            group.questions.map((q, index) => ({
              ...q,
              groupId: group.id
            }))
          )
        : questions;
      
      if (questionsToSave.length > 0) {
        console.log("Total questions to save:", questionsToSave.length);
        
        // Filter valid questions and prepare them for insertion
        const questionDataArray = questionsToSave
          .filter(q => q.text.trim()) // Only process questions with text
          .map((q, i) => {
            const dbType = normalizeResponseType(q.type);
            
            if (!ALLOWED_RESPONSE_TYPES.includes(dbType)) {
              console.error(`Invalid question type after normalization: ${dbType}`);
              toast.warning(`Tipo de pergunta inválido após normalização: "${dbType}" para pergunta "${q.text}"`);
              q.type = 'texto';
            }
            
            if (dbType === "seleção múltipla" && (!q.options || !Array.isArray(q.options) || q.options.length === 0)) {
              console.error("Multiple choice question without valid options:", q);
              toast.warning(`Pergunta de múltipla escolha sem opções válidas: "${q.text}"`);
              q.options = ["Opção 1", "Opção 2"];
            }
            
            let groupTitle = "";
            let groupIndex = -1;
            
            if (q.groupId) {
              const group = groups.find(g => g.id === q.groupId);
              if (group) {
                groupTitle = group.title;
                groupIndex = groups.findIndex(g => g.id === q.groupId);
              }
            }
            
            const groupMetadata = q.groupId 
              ? JSON.stringify({
                  groupId: q.groupId,
                  groupTitle: groupTitle,
                  groupIndex: groupIndex
                })
              : null;
            
            const finalHint = q.hint || groupMetadata;
            
            console.log(`Preparing question ${i}: "${q.text}" (${dbType})`);
            
            return {
              checklist_id: newChecklistId,
              pergunta: q.text,
              tipo_resposta: dbType,
              obrigatorio: q.required,
              ordem: i,
              permite_audio: q.allowAudio || false,
              permite_video: q.allowVideo || false,
              permite_foto: q.allowPhoto || false,
              opcoes: q.options && q.options.length > 0 ? q.options : null,
              hint: finalHint,
              weight: q.weight || 1,
              parent_item_id: q.parentId || null,
              condition_value: q.conditionValue || null
            };
          });
        
        console.log(`Prepared ${questionDataArray.length} questions for insertion`);
        
        // Breaking down large batches into smaller chunks to prevent payload size issues
        const CHUNK_SIZE = 50; // Adjust this based on your database limits
        const chunks = [];
        
        for (let i = 0; i < questionDataArray.length; i += CHUNK_SIZE) {
          chunks.push(questionDataArray.slice(i, i + CHUNK_SIZE));
        }
        
        console.log(`Split questions into ${chunks.length} chunks of max ${CHUNK_SIZE} questions each`);
        
        let successCount = 0;
        let failureCount = 0;
        
        // Process each chunk
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          try {
            console.log(`Processing chunk ${i+1}/${chunks.length} with ${chunk.length} questions...`);
            
            const { data, error } = await supabase
              .from("checklist_itens")
              .insert(chunk)
              .select();
            
            if (error) {
              console.error(`Error inserting chunk ${i+1}:`, error);
              failureCount += chunk.length;
              
              // Fallback: Try to insert questions one by one if batch fails
              console.log(`Attempting individual inserts for chunk ${i+1} as fallback...`);
              
              for (const questionData of chunk) {
                try {
                  const { error: indivError } = await supabase
                    .from("checklist_itens")
                    .insert(questionData);
                  
                  if (!indivError) {
                    successCount++;
                  } else {
                    failureCount++;
                    console.error(`Error inserting individual question: ${questionData.pergunta}`, indivError);
                  }
                } catch (indivInsertError) {
                  failureCount++;
                  console.error(`Exception inserting question: ${questionData.pergunta}`, indivInsertError);
                }
              }
            } else {
              successCount += chunk.length;
              console.log(`Successfully inserted chunk ${i+1}`);
            }
          } catch (chunkError) {
            console.error(`Exception processing chunk ${i+1}:`, chunkError);
            failureCount += chunk.length;
          }
        }
        
        console.log(`Question insertion complete: ${successCount} succeeded, ${failureCount} failed`);
        
        if (failureCount > 0) {
          toast.warning(`${failureCount} perguntas não puderam ser salvas.`);
        }
      }
      
      toast.success("Checklist salvo com sucesso!");
      
      if (onSave) {
        onSave(newChecklistId);
      } else {
        navigate(`/new-checklists/${newChecklistId}`);
      }
    } catch (error) {
      console.error("Error submitting checklist:", error);
      toast.error(`Erro ao salvar checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton onClick={handleCancel} />
          <h1 className="text-2xl font-bold">
            {mode === "create" 
              ? "Criar Nova Lista de Verificação"
              : mode === "edit" 
                ? "Editar Lista de Verificação" 
                : mode === "ai-review" 
                  ? "Revisar Checklist Gerado por IA"
                  : "Revisar Checklist Importado"}
          </h1>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <ChecklistForm 
            checklist={checklist as Checklist} 
            setChecklist={setChecklist as (checklist: Checklist) => void} 
            users={users} 
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Itens do Checklist</h2>
            
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "flat" | "grouped")}>
              <TabsList>
                <TabsTrigger value="flat">Lista Simples</TabsTrigger>
                <TabsTrigger value="grouped">Agrupados</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {viewMode === "flat" ? (
            <QuestionsSection
              questions={questions}
              onAddQuestion={handleAddQuestion}
              onRemoveQuestion={handleRemoveQuestion}
              onQuestionChange={handleQuestionChange}
            />
          ) : (
            <GroupedQuestionsSection
              groups={groups}
              onGroupsChange={handleGroupsChange}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button 
          variant="outline" 
          type="button" 
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button 
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar Checklist"}
        </Button>
      </div>
    </div>
  );
}
