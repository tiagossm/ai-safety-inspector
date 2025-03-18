
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NewChecklist } from "@/types/checklist";
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

export function ChecklistEditor({
  initialChecklist,
  initialQuestions = [],
  mode,
  onSave,
  onCancel
}: ChecklistEditorProps) {
  const [checklist, setChecklist] = useState<NewChecklist>(initialChecklist);
  const [questions, setQuestions] = useState(initialQuestions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const createChecklist = useCreateChecklist();
  const [users, setUsers] = useState<any[]>([]);
  
  // Fetch users for the form
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('status', 'active')
          .order('name', { ascending: true });
          
        if (error) {
          console.error("Error fetching users:", error);
          throw error;
        }
        
        setUsers(data || []);
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
      
      // Create the checklist
      const { data: newChecklist, error } = await createChecklist.mutateAsync(checklist);
      
      if (error || !newChecklist?.id) {
        console.error("Error creating checklist:", error);
        toast.error("Erro ao criar checklist");
        setIsSubmitting(false);
        return;
      }
      
      // Add questions if any
      if (questions.length > 0) {
        const promises = questions.map((q, i) => {
          if (q.text.trim()) {
            return supabase
              .from("checklist_itens")
              .insert({
                checklist_id: newChecklist.id,
                pergunta: q.text,
                tipo_resposta: q.type,
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
        
        await Promise.all(promises.filter(Boolean));
      }
      
      toast.success("Checklist salvo com sucesso!");
      
      if (onSave) {
        onSave(newChecklist.id);
      } else {
        navigate(`/checklists/${newChecklist.id}`);
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
            checklist={checklist} 
            setChecklist={setChecklist} 
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
