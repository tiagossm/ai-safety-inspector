
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { useChecklistCreate } from "@/hooks/new-checklist/useChecklistCreate";
import { NewChecklistPayload, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { useChecklistCompanies } from "@/hooks/checklist/form/useChecklistCompanies";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewChecklistCreate() {
  const navigate = useNavigate();
  const createChecklist = useChecklistCreate();
  const { companies, loadingCompanies } = useChecklistCompanies();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [checklist, setChecklist] = useState<NewChecklistPayload>({
    title: "",
    description: "",
    is_template: false,
    status: "active",
    category: ""
  });
  
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([
    {
      id: `new-${Date.now()}-0`,
      text: "",
      responseType: "yes_no",
      isRequired: true,
      weight: 1,
      allowsPhoto: false,
      allowsVideo: false,
      allowsAudio: false,
      allowsFiles: false,
      order: 0
    }
  ]);
  
  const [groups, setGroups] = useState<ChecklistGroup[]>([
    {
      id: "group-1",
      title: "Geral",
      order: 0
    }
  ]);
  
  React.useEffect(() => {
    if (questions.length > 0 && groups.length > 0 && !questions[0].groupId) {
      const updatedQuestions = [...questions];
      updatedQuestions[0] = {
        ...updatedQuestions[0],
        groupId: groups[0].id
      };
      setQuestions(updatedQuestions);
    }
  }, [questions, groups]);
  
  const handleAddQuestion = () => {
    const newQuestion: ChecklistQuestion = {
      id: `new-${Date.now()}-${questions.length}`,
      text: "",
      responseType: "yes_no",
      isRequired: true,
      weight: 1,
      allowsPhoto: false,
      allowsVideo: false,
      allowsAudio: false,
      allowsFiles: false,
      order: questions.length,
      groupId: groups[0]?.id
    };
    
    setQuestions([...questions, newQuestion]);
  };
  
  const handleRemoveQuestion = (id: string) => {
    if (questions.length <= 1) {
      toast.error("O checklist deve ter pelo menos uma pergunta.");
      return;
    }
    
    const updatedQuestions = questions.filter(q => q.id !== id);
    setQuestions(updatedQuestions);
  };
  
  const handleUpdateQuestion = (updatedQuestion: ChecklistQuestion) => {
    const index = questions.findIndex(q => q.id === updatedQuestion.id);
    if (index === -1) return;
    
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      if (!checklist.title) {
        toast.error("O título do checklist é obrigatório.");
        setIsSubmitting(false);
        return;
      }
      
      if (!checklist.category) {
        toast.error("A categoria do checklist é obrigatória.");
        setIsSubmitting(false);
        return;
      }
      
      const validQuestions = questions.filter(q => q.text.trim() !== "");
      if (validQuestions.length === 0) {
        toast.error("Adicione pelo menos uma pergunta válida.");
        setIsSubmitting(false);
        return;
      }
      
      const statusChecklistValue = checklist.status === "active" ? "ativo" : "inativo";
      const statusChecklist = statusChecklistValue as "ativo" | "inativo";
      
      const processedChecklist: NewChecklistPayload = {
        ...checklist,
        status_checklist: statusChecklist,
        origin: "manual"
      };
      
      const checklistForMutation: any = {
        ...processedChecklist,
      };
      
      const result = await createChecklist.mutateAsync({
        checklist: checklistForMutation,
        questions: validQuestions,
        groups
      });
      
      toast.success("Checklist criado com sucesso!");
      
      navigate(`/new-checklists/${result.id}`);
    } catch (error) {
      console.error("Error submitting checklist:", error);
      toast.error("Erro ao criar checklist. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => navigate("/new-checklists")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Criar Novo Checklist</h1>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Título <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={checklist.title}
                    onChange={(e) => setChecklist({ ...checklist, title: e.target.value })}
                    placeholder="Digite o título do checklist"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={checklist.description || ""}
                    onChange={(e) => setChecklist({ ...checklist, description: e.target.value })}
                    placeholder="Digite uma descrição para o checklist"
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Categoria <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="category"
                    value={checklist.category || ""}
                    onChange={(e) => setChecklist({ ...checklist, category: e.target.value })}
                    placeholder="Ex: NR-35, Inspeção de Equipamentos"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Select
                    value={checklist.company_id?.toString() || ""}
                    onValueChange={(value) =>
                      setChecklist({
                        ...checklist,
                        company_id: value === "__none" ? undefined : value
                      })
                    }
                  >
                    <SelectTrigger id="company">
                      <SelectValue placeholder="Selecione uma empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Nenhuma</SelectItem>
                      {loadingCompanies ? (
                        <SelectItem value="__loading" disabled>
                          Carregando empresas...
                        </SelectItem>
                      ) : (
                        companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.fantasy_name || "Empresa sem nome"}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="template"
                    checked={checklist.is_template || false}
                    onCheckedChange={(checked) => setChecklist({ ...checklist, is_template: checked })}
                  />
                  <Label htmlFor="template">Salvar como template</Label>
                </div>
              </div>
            </div>
            
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Perguntas</h3>
              
              <div className="space-y-4">
                {questions.map((question) => (
                  <div key={question.id} className="border rounded-md p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Pergunta</Label>
                        <Input
                          value={question.text}
                          onChange={(e) => handleUpdateQuestion({ ...question, text: e.target.value })}
                          placeholder="Digite a pergunta"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Label>Tipo de resposta</Label>
                          <select
                            value={question.responseType}
                            onChange={(e) => handleUpdateQuestion({ 
                              ...question, 
                              responseType: e.target.value as ChecklistQuestion["responseType"]
                            })}
                            className="w-full border rounded p-2"
                          >
                            <option value="yes_no">Sim/Não</option>
                            <option value="multiple_choice">Múltipla escolha</option>
                            <option value="text">Texto</option>
                            <option value="numeric">Numérico</option>
                            <option value="photo">Foto</option>
                            <option value="signature">Assinatura</option>
                          </select>
                        </div>
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveQuestion(question.id)}
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddQuestion}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar pergunta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/new-checklists")}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting || !checklist.title || !checklist.category || (questions.length <= 0)}
          >
            {isSubmitting ? (
              "Salvando..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar checklist
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
