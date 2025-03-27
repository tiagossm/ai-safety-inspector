
import React, { useState } from "react";
import { QuestionGroup } from "./QuestionGroup";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GroupProps {
  id: string;
  title: string;
  questions: any[];
}

interface GroupedQuestionsSectionProps {
  groups: GroupProps[];
  onGroupsChange: (groups: GroupProps[]) => void;
}

export function GroupedQuestionsSection({
  groups,
  onGroupsChange
}: GroupedQuestionsSectionProps) {
  const [aiPromptOpen, setAiPromptOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  
  const handleAddGroup = () => {
    const newGroup = {
      id: `group-${Date.now()}`,
      title: `Grupo ${groups.length + 1}`,
      questions: []
    };
    
    onGroupsChange([...groups, newGroup]);
  };
  
  const handleGroupTitleChange = (id: string, title: string) => {
    const newGroups = groups.map(group => {
      if (group.id === id) {
        return { ...group, title };
      }
      return group;
    });
    
    onGroupsChange(newGroups);
  };
  
  const handleAddQuestion = (groupId: string) => {
    const newGroups = groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          questions: [
            ...group.questions,
            {
              text: "",
              type: "sim/não",
              required: true,
              allowPhoto: false,
              allowVideo: false,
              allowAudio: false
            }
          ]
        };
      }
      return group;
    });
    
    onGroupsChange(newGroups);
  };
  
  const handleRemoveQuestion = (groupId: string, questionIndex: number) => {
    const newGroups = groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          questions: group.questions.filter((_, index) => index !== questionIndex)
        };
      }
      return group;
    });
    
    onGroupsChange(newGroups);
  };
  
  const handleQuestionChange = (groupId: string, questionIndex: number, field: string, value: any) => {
    const newGroups = groups.map(group => {
      if (group.id === groupId) {
        const newQuestions = [...group.questions];
        newQuestions[questionIndex] = {
          ...newQuestions[questionIndex],
          [field]: value
        };
        
        return {
          ...group,
          questions: newQuestions
        };
      }
      return group;
    });
    
    onGroupsChange(newGroups);
  };
  
  const handleRemoveGroup = (id: string) => {
    // Don't remove if it's the last group
    if (groups.length <= 1) {
      toast.warning("É necessário pelo menos um grupo");
      return;
    }
    
    onGroupsChange(groups.filter(group => group.id !== id));
  };
  
  const handleOpenAiPrompt = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    setSelectedGroupId(groupId);
    setPrompt(`Gere perguntas para uma inspeção de segurança do trabalho para o grupo "${group.title}"`);
    setAiPromptOpen(true);
  };
  
  const handleGenerateQuestions = async () => {
    if (!selectedGroupId || !prompt) {
      toast.error("Grupo ou prompt não selecionado");
      return;
    }
    
    setGenerating(true);
    
    try {
      // Call the Edge Function to generate questions
      const { data, error } = await supabase.functions.invoke("generate-sub-checklist", {
        body: {
          prompt,
          parentQuestionId: "dummy", // We don't need an actual parent question ID for this case
          parentQuestionText: prompt,
          questionCount: 5
        }
      });
      
      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || "Falha ao gerar perguntas");
      }
      
      const generatedQuestions = data.subChecklist.questions.map((q: any) => ({
        text: q.text,
        type: q.responseType === 'yes_no' ? 'sim/não' : 
              q.responseType === 'text' ? 'texto' : 
              q.responseType === 'multiple_choice' ? 'seleção múltipla' : 
              q.responseType === 'numeric' ? 'numérico' : 'sim/não',
        required: q.isRequired,
        allowPhoto: q.allowsPhoto || false,
        allowVideo: q.allowsVideo || false,
        allowAudio: q.allowsAudio || false,
        options: q.options
      }));
      
      // Update the group with new questions
      const updatedGroups = groups.map(group => {
        if (group.id === selectedGroupId) {
          return {
            ...group,
            questions: [...group.questions, ...generatedQuestions]
          };
        }
        return group;
      });
      
      onGroupsChange(updatedGroups);
      toast.success(`${generatedQuestions.length} perguntas geradas com sucesso!`);
      setAiPromptOpen(false);
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error("Erro ao gerar perguntas. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {groups.map((group, index) => (
        <div key={group.id} className="mb-2 relative">
          <QuestionGroup
            id={group.id}
            title={group.title}
            questions={group.questions}
            onTitleChange={handleGroupTitleChange}
            onAddQuestion={handleAddQuestion}
            onRemoveQuestion={handleRemoveQuestion}
            onQuestionChange={handleQuestionChange}
            onRemoveGroup={handleRemoveGroup}
            isDragging={false}
            onGenerateWithAI={() => handleOpenAiPrompt(group.id)}
          />
        </div>
      ))}
      
      <div className="flex justify-center gap-2">
        <Button 
          type="button" 
          variant="outline" 
          className="w-auto" 
          onClick={handleAddGroup}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Grupo
        </Button>
      </div>
      
      {/* AI Prompt Dialog */}
      <Dialog open={aiPromptOpen} onOpenChange={setAiPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Perguntas com IA</DialogTitle>
            <DialogDescription>
              Descreva o tipo de perguntas que você deseja gerar para este grupo.
              Seja específico para obter melhores resultados.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="Ex: Gere perguntas sobre equipamentos de proteção individual para trabalho em altura"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            className="mt-2"
          />
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAiPromptOpen(false)}
              disabled={generating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGenerateQuestions}
              disabled={generating || !prompt.trim()}
            >
              {generating ? (
                <>
                  <span>Gerando...</span>
                  <Sparkles className="h-4 w-4 ml-2 animate-pulse" />
                </>
              ) : (
                <>
                  <span>Gerar Perguntas</span>
                  <Sparkles className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
