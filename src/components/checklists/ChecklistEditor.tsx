
import React, { useState } from "react";
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
      conditionValue: q.conditionValue
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const createChecklistMutation = useCreateChecklist();
  const [users, setUsers] = useState<any[]>([]);
  
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

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        type: "sim/não",
        required: true,
        allowPhoto: false,
        allowVideo: false,
        allowAudio: false
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
      
      // Add questions if any
      if (questions.length > 0) {
        console.log("Inserting questions with types:", questions.map(q => q.type));
        
        const promises = questions.map((q, i) => {
          if (q.text.trim()) {
            // Convert UI-friendly type to database-compatible type
            const dbType = normalizeResponseType(q.type);
            
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
                hint: q.hint || null,
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
          <h2 className="text-xl font-semibold mb-4">Itens do Checklist</h2>
          <QuestionsSection
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onRemoveQuestion={handleRemoveQuestion}
            onQuestionChange={handleQuestionChange}
          />
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
