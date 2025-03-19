
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

// Define the question type to avoid type errors
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

// Define the group type
type QuestionGroup = {
  id: string;
  title: string;
  questions: Question[];
};

// Helper function to convert UI-friendly type to database type
const normalizeResponseType = (type: string): string => {
  // Map of user-friendly types to database-compatible types
  const typeMap: Record<string, string> = {
    'sim/não': 'yes_no',
    'múltipla escolha': 'multiple_choice',
    'numérico': 'numeric',
    'texto': 'text',
    'foto': 'photo',
    'assinatura': 'signature'
  };

  return typeMap[type] || type; // Return original if no mapping found
};

export function ChecklistEditor({
  initialChecklist,
  initialQuestions = [],
  initialGroups = [],
  mode,
  onSave,
  onCancel
}: ChecklistEditorProps) {
  // Transform the initialChecklist to ensure both status_checklist and status are properly typed
  const transformedInitialChecklist: Partial<Checklist> = {
    ...initialChecklist,
    // Cast status_checklist to the specific union type expected by Checklist
    status_checklist: (initialChecklist.status_checklist as "ativo" | "inativo") || "ativo",
    // Cast status to the specific union type expected by Checklist
    status: (initialChecklist.status as "pendente" | "em_andamento" | "concluido") || "pendente"
  };
  
  // Now use the transformed object with useState
  const [checklist, setChecklist] = useState<Partial<Checklist>>(transformedInitialChecklist);
  
  // Ensure all questions have required properties
  const [questions, setQuestions] = useState<Question[]>(
    initialQuestions.map(q => ({
      text: q.text,
      type: q.type,
      required: q.required,
      allowPhoto: q.allowPhoto || false,
      allowVideo: q.allowVideo || false,
      allowAudio: q.allowAudio || false,
      options: q.options,
      hint: q.hint,
      weight: q.weight,
      parentId: q.parentId,
      conditionValue: q.conditionValue,
      groupId: q.groupId
    }))
  );
  
  // State for question groups
  const [groups, setGroups] = useState<QuestionGroup[]>(
    initialGroups.length > 0 
      ? initialGroups.map(g => ({
          ...g,
          questions: g.questions.map(q => ({
            text: q.text,
            type: q.type,
            required: q.required,
            allowPhoto: q.allowPhoto || false,
            allowVideo: q.allowVideo || false,
            allowAudio: q.allowAudio || false,
            options: q.options,
            hint: q.hint,
            weight: q.weight,
            parentId: q.parentId,
            conditionValue: q.conditionValue,
            groupId: g.id
          }))
        }))
      : []
  );
  
  // State for view mode (flat list or grouped)
  const [viewMode, setViewMode] = useState<"flat" | "grouped">(
    initialGroups.length > 0 ? "grouped" : "flat"
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const createChecklistMutation = useCreateChecklist();
  const [users, setUsers] = useState<any[]>([]);
  
  // Sync between flat list and groups
  useEffect(() => {
    if (viewMode === "grouped" && groups.length === 0 && questions.length > 0) {
      // If switching to grouped mode and no groups exist, create a default group
      const defaultGroup: QuestionGroup = {
        id: `group-default`,
        title: "Geral",
        questions: [...questions]
      };
      setGroups([defaultGroup]);
    } else if (viewMode === "flat" && questions.length === 0 && groups.length > 0) {
      // If switching to flat mode, flatten all questions from groups
      const allQuestions = groups.flatMap(group => 
        group.questions.map(q => ({
          ...q,
          groupId: group.id
        }))
      );
      setQuestions(allQuestions);
    }
  }, [viewMode]);
  
  // Fetch users for the form
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

  // Handlers for flat question list
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
  
  // Handlers for groups
  const handleGroupsChange = (newGroups: QuestionGroup[]) => {
    setGroups(newGroups);
    
    // Update flat list if in that mode
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
      
      // Prepare the checklist data, ensuring proper handling of special values
      let processedCompanyId = checklist.company_id;
      if (processedCompanyId === "none") {
        processedCompanyId = null;
      }
      
      let processedResponsibleId = checklist.responsible_id;
      if (processedResponsibleId === "none") {
        processedResponsibleId = null;
      }
      
      // Create the checklist - we need to cast it to NewChecklist since we're using Partial<Checklist>
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
      
      // Determine which questions to save based on view mode
      const questionsToSave = viewMode === "grouped" 
        ? groups.flatMap(group => 
            group.questions.map((q, groupIndex) => ({
              ...q,
              groupId: group.id,
              groupTitle: group.title,
              groupIndex
            }))
          )
        : questions;
      
      // Add questions if any
      if (questionsToSave.length > 0) {
        console.log("Inserting questions with types:", questionsToSave.map(q => q.type));
        
        const promises = questionsToSave.map((q, i) => {
          if (q.text.trim()) {
            // Convert UI-friendly type to database-compatible type
            const dbType = normalizeResponseType(q.type);
            
            // Add metadata about group in the hint field if it exists
            const groupMetadata = q.groupId 
              ? JSON.stringify({
                  groupId: q.groupId,
                  groupTitle: q.groupTitle || '',
                  groupIndex: q.groupIndex || 0
                })
              : null;
            
            // If hint already exists, don't override it with group metadata
            const finalHint = q.hint || groupMetadata;
            
            return supabase
              .from("checklist_itens")
              .insert({
                checklist_id: newChecklistId,
                pergunta: q.text,
                tipo_resposta: dbType, // Use the normalized type for database
                obrigatorio: q.required,
                ordem: i,
                permite_audio: q.allowAudio || false,
                permite_video: q.allowVideo || false,
                permite_foto: q.allowPhoto || false,
                opcoes: q.options || null,
                hint: finalHint,
                weight: q.weight || 1,
                parent_item_id: q.parentId || null,
                condition_value: q.conditionValue || null
              });
          }
          return Promise.resolve(null);
        });
        
        const results = await Promise.all(promises.filter(Boolean));
        console.log(`Added ${results.length} questions to checklist ${newChecklistId}`);
        
        // Check for errors in question creation
        const errors = results.filter(r => r && r.error);
        if (errors.length > 0) {
          console.warn(`${errors.length} questions failed to save:`, errors);
          toast.warning(`${errors.length} perguntas não puderam ser salvas.`);
        }
      }
      
      toast.success("Checklist salvo com sucesso!");
      
      if (onSave) {
        onSave(newChecklistId);
      } else {
        navigate(`/checklists/${newChecklistId}`);
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
