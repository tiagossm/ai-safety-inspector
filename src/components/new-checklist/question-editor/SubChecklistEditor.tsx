import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Card, CardContent } from "@/components/ui/card";
import { v4 as uuidv4 } from 'uuid';

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
  const [questions, setQuestions] = useState<Partial<ChecklistQuestion>[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(true);
  
  // Fetch existing sub-checklist if available
  useEffect(() => {
    if (existingSubChecklistId) {
      setIsCreating(false);
      fetchExistingSubChecklist(existingSubChecklistId);
    } else {
      // Initialize with one empty question when creating new
      setQuestions([createEmptyQuestion()]);
    }
  }, [existingSubChecklistId]);
  
  const fetchExistingSubChecklist = async (checklistId: string) => {
    setLoading(true);
    try {
      console.log(`Fetching existing sub-checklist with ID: ${checklistId}`);
      
      // Fetch checklist
      const { data: checklistData, error: checklistError } = await supabase
        .from("checklists")
        .select("title, description")
        .eq("id", checklistId)
        .single();
      
      if (checklistError) throw checklistError;
      
      setTitle(checklistData.title);
      setDescription(checklistData.description || "");
      
      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", checklistId)
        .order("ordem", { ascending: true });
      
      if (questionsError) throw questionsError;
      
      if (questionsData && questionsData.length > 0) {
        const mappedQuestions = questionsData.map(q => ({
          id: q.id,
          text: q.pergunta,
          responseType: mapDbTypeToUiType(q.tipo_resposta),
          isRequired: q.obrigatorio,
          options: Array.isArray(q.opcoes) ? q.opcoes.map(opt => String(opt)) : [],
          weight: q.weight || 1,
          allowsPhoto: q.permite_foto || false,
          allowsVideo: q.permite_video || false,
          allowsAudio: q.permite_audio || false,
          order: q.ordem || 0
        }));
        
        setQuestions(mappedQuestions);
      } else {
        setQuestions([createEmptyQuestion()]);
      }
    } catch (error) {
      console.error("Error fetching sub-checklist:", error);
      toast.error("Failed to load sub-checklist");
      setQuestions([createEmptyQuestion()]);
    } finally {
      setLoading(false);
    }
  };
  
  const mapDbTypeToUiType = (dbType: string): ChecklistQuestion["responseType"] => {
    const typeMap: Record<string, ChecklistQuestion["responseType"]> = {
      'sim/não': 'yes_no',
      'seleção múltipla': 'multiple_choice',
      'texto': 'text',
      'numérico': 'numeric',
      'foto': 'photo',
      'assinatura': 'signature',
      'hora': 'time',   // ajuste para aceitar 'hora' vindo do banco
      'time': 'time',
      'data': 'date',   // ajuste para aceitar 'data' vindo do banco
      'date': 'date'
    };
    // @ts-ignore - Forçando o tipo para incluir time e date
    return typeMap[dbType] || 'text';
  };

  const mapUiTypeToDbType = (uiType: string): string => {
    const typeMap: Record<string, string> = {
      'yes_no': 'sim/não',
      'multiple_choice': 'seleção múltipla',
      'text': 'texto',
      'numeric': 'numérico',
      'photo': 'foto',
      'signature': 'assinatura',
      'time': 'time',   // sempre salva como 'time'
      'date': 'date'    // sempre salva como 'date'
    };
    return typeMap[uiType] || 'texto';
  };
  
  const createEmptyQuestion = (): Partial<ChecklistQuestion> => ({
    id: uuidv4(),
    text: "",
    responseType: "yes_no",
    isRequired: true,
    weight: 1,
    allowsPhoto: false,
    allowsVideo: false,
    allowsAudio: false,
    order: questions.length
  });
  
  const handleAddQuestion = () => {
    setQuestions([...questions, createEmptyQuestion()]);
  };
  
  const handleRemoveQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };
  
  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };
  
  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    if (questions.length === 0 || !questions.some(q => q.text?.trim())) {
      toast.error("At least one question with text is required");
      return;
    }
    
    setLoading(true);
    try {
      let checklistId = existingSubChecklistId;
      
      // Create or update checklist
      if (isCreating) {
        console.log(`Creating sub-checklist with parent question ID: ${parentQuestionId}`);
        const { data: checklistData, error: checklistError } = await supabase
          .from("checklists")
          .insert({
            title,
            description,
            is_template: false,
            status_checklist: "ativo",
            is_sub_checklist: true, // Mark as sub-checklist
            parent_question_id: parentQuestionId // Link to parent question
          })
          .select("id")
          .single();
        
        if (checklistError) throw checklistError;
        checklistId = checklistData.id;
        
        // Also update parent question to indicate it has a sub-checklist
        const { error: updateError } = await supabase
          .from("checklist_itens")
          .update({
            has_subchecklist: true,
            sub_checklist_id: checklistId
          })
          .eq("id", parentQuestionId);
          
        if (updateError) {
          console.error("Error updating parent question:", updateError);
          // Continue anyway since the sub-checklist was created
        }
      } else {
        const { error: updateError } = await supabase
          .from("checklists")
          .update({
            title,
            description,
            updated_at: new Date().toISOString(),
            is_sub_checklist: true, // Ensure it's marked as sub-checklist
            parent_question_id: parentQuestionId // Ensure link to parent question
          })
          .eq("id", checklistId);
        
        if (updateError) throw updateError;
        
        // Delete existing questions to replace them
        const { error: deleteError } = await supabase
          .from("checklist_itens")
          .delete()
          .eq("checklist_id", checklistId);
        
        if (deleteError) throw deleteError;
      }
      
      // Insert questions
      const questionInserts = questions
        .filter(q => q.text?.trim())
        .map((q, index) => ({
          checklist_id: checklistId,
          pergunta: q.text || "",
          tipo_resposta: mapUiTypeToDbType(q.responseType || "yes_no"),
          obrigatorio: q.isRequired !== false,
          opcoes: q.responseType === "multiple_choice" ? q.options : null,
          ordem: index,
          weight: q.weight || 1,
          permite_foto: q.allowsPhoto || false,
          permite_video: q.allowsVideo || false,
          permite_audio: q.allowsAudio || false
        }));
      
      if (questionInserts.length > 0) {
        const { error: insertError } = await supabase
          .from("checklist_itens")
          .insert(questionInserts);
        
        if (insertError) throw insertError;
      }
      
      console.log(`Sub-checklist ${isCreating ? 'created' : 'updated'} successfully with ID: ${checklistId}`);
      toast.success(`Sub-checklist ${isCreating ? "created" : "updated"} successfully`);
      onSubChecklistCreated(checklistId!);
    } catch (error: any) {
      console.error("Error saving sub-checklist:", error);
      toast.error(`Failed to ${isCreating ? "create" : "update"} sub-checklist: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !questions.length) {
    return <div className="flex justify-center p-6">Loading sub-checklist...</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="sub-checklist-title">Title</Label>
          <Input
            id="sub-checklist-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sub-checklist title"
          />
        </div>
        
        <div>
          <Label htmlFor="sub-checklist-description">Description (Optional)</Label>
          <Textarea
            id="sub-checklist-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the purpose of this sub-checklist"
            rows={2}
          />
        </div>
      </div>
      
      <Separator />
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Questions</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddQuestion}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Question</span>
          </Button>
        </div>
        
        <div className="space-y-3 max-h-[400px] overflow-y-auto p-1">
          {questions.map((question, index) => (
            <Card key={question.id || index} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">{index + 1}.</span>
                  <Input
                    value={question.text || ""}
                    onChange={(e) => handleQuestionChange(index, "text", e.target.value)}
                    placeholder="Question text"
                    className="flex-grow"
                  />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveQuestion(index)}
                    disabled={questions.length <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`response-type-${index}`} className="text-xs">Type</Label>
                    <select
                      id={`response-type-${index}`}
                      value={question.responseType || "yes_no"}
                      onChange={(e) => {
                        const value = e.target.value as ChecklistQuestion['responseType'];
                        handleQuestionChange(index, "responseType", value);
                      }}
                      className="text-xs p-1 border rounded"
                    >
                      <option value="yes_no">Yes/No</option>
                      <option value="text">Text</option>
                      <option value="numeric">Numeric</option>
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="time">Time</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`required-${index}`} className="text-xs">Required</Label>
                    <input
                      id={`required-${index}`}
                      type="checkbox"
                      checked={question.isRequired !== false}
                      onChange={(e) => handleQuestionChange(index, "isRequired", e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <Button 
          variant="default" 
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Sub-Checklist"}
        </Button>
      </div>
    </div>
  );
}
