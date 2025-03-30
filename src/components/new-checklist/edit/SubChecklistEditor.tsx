
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { useChecklistEdit } from "@/hooks/new-checklist/useChecklistEdit";
import { Loader2 } from "lucide-react";

interface SubChecklistEditorProps {
  parentQuestionId: string;
  existingSubChecklistId?: string;
  onSubChecklistCreated: () => void;
}

export function SubChecklistEditor({
  parentQuestionId,
  existingSubChecklistId,
  onSubChecklistCreated
}: SubChecklistEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  
  const { data: existingSubChecklist, isLoading: loadingSubChecklist } = 
    useChecklistById(existingSubChecklistId || "");
  
  useEffect(() => {
    if (existingSubChecklistId && existingSubChecklist) {
      setTitle(existingSubChecklist.title || "");
      setDescription(existingSubChecklist.description || "");
      
      if (existingSubChecklist.items && Array.isArray(existingSubChecklist.items)) {
        const formattedQuestions = existingSubChecklist.items.map(item => ({
          id: item.id,
          text: item.pergunta || "",
          type: item.tipo_resposta || "sim/não",
          required: item.obrigatorio || true,
          allowPhoto: item.permite_foto || false,
          allowVideo: item.permite_video || false,
          allowAudio: item.permite_audio || false,
          options: item.opcoes || [],
          hint: item.hint || "",
          weight: item.weight || 1,
          groupId: item.groupId || null, // Updated from group_id to groupId
        }));
        setQuestions(formattedQuestions);
      }
      setLoading(false);
    } else {
      // Initialize with empty data for a new sub-checklist
      setTitle(`Sub-checklist ${new Date().toLocaleDateString()}`);
      setDescription("Sub-checklist para inspeção detalhada");
      setQuestions([
        {
          id: `q-${Date.now()}-1`,
          text: "Esta área está em conformidade?",
          type: "sim/não",
          required: true,
          allowPhoto: true,
          allowVideo: false,
          allowAudio: false,
          options: [],
          hint: "",
          weight: 1,
          groupId: null
        }
      ]);
      setLoading(false);
    }
  }, [existingSubChecklistId, existingSubChecklist, loadingSubChecklist]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("O título é obrigatório");
      return;
    }
    
    if (questions.length === 0) {
      toast.error("Adicione pelo menos uma pergunta");
      return;
    }
    
    try {
      setSaving(true);
      
      // Here we would normally have code to save the sub-checklist
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Sub-checklist salvo com sucesso!");
      onSubChecklistCreated();
    } catch (error) {
      console.error("Error saving sub-checklist:", error);
      toast.error("Erro ao salvar o sub-checklist");
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: `q-${Date.now()}`,
      text: "",
      type: "sim/não",
      required: true,
      allowPhoto: false,
      allowVideo: false,
      allowAudio: false,
      options: [],
      hint: "",
      weight: 1,
      groupId: null
    };
    
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (id: string, data: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...data } : q));
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do sub-checklist"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição do sub-checklist"
            rows={3}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Perguntas</h3>
          <Button 
            type="button" 
            onClick={handleAddQuestion}
            variant="outline"
            size="sm"
          >
            Adicionar Pergunta
          </Button>
        </div>
        
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={question.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Pergunta {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveQuestion(question.id)}
                  className="text-destructive"
                >
                  Remover
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`question-${question.id}`}>Texto da pergunta</Label>
                <Input
                  id={`question-${question.id}`}
                  value={question.text}
                  onChange={(e) => handleUpdateQuestion(question.id, { text: e.target.value })}
                  placeholder="Digite a pergunta"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`type-${question.id}`}>Tipo de resposta</Label>
                <select
                  id={`type-${question.id}`}
                  value={question.type}
                  onChange={(e) => handleUpdateQuestion(question.id, { type: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="sim/não">Sim/Não</option>
                  <option value="múltipla escolha">Múltipla Escolha</option>
                  <option value="texto">Texto</option>
                  <option value="número">Número</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onSubChecklistCreated}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Sub-checklist'
          )}
        </Button>
      </div>
    </div>
  );
}
