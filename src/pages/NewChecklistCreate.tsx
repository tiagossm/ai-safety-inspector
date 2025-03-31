import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Bot, Upload, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useChecklistCreate } from "@/hooks/new-checklist/useChecklistCreate";
import { useChecklistAI } from "@/hooks/new-checklist/useChecklistAI";
import { AIAssistantSelector } from "@/components/checklists/create-forms/AIAssistantSelector";
import { CSVImportSection } from "@/components/checklists/create-forms/CSVImportSection";
import { NewChecklistPayload, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";

export default function NewChecklistCreate() {
  const navigate = useNavigate();
  const createChecklist = useChecklistCreate();
  const { 
    prompt, 
    setPrompt, 
    questionCount, 
    setQuestionCount, 
    isGenerating, 
    selectedAssistant, 
    setSelectedAssistant,
    openAIAssistant,
    setOpenAIAssistant,
    generateChecklist 
  } = useChecklistAI();
  
  const [activeTab, setActiveTab] = useState<"manual" | "ai" | "import">("manual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [checklist, setChecklist] = useState<NewChecklistPayload>({
    title: "",
    description: "",
    isTemplate: false,
    status: "active",
    category: "general"
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
      
      const validQuestions = questions.filter(q => q.text.trim() !== "");
      if (validQuestions.length === 0) {
        toast.error("Adicione pelo menos uma pergunta válida.");
        setIsSubmitting(false);
        return;
      }
      
      const result = await createChecklist.mutateAsync({
        checklist,
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
  
  const handleGenerateWithAI = async () => {
    if (!prompt.trim()) {
      toast.error("Digite um prompt para gerar o checklist.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const result = await generateChecklist(checklist);
      
      if (result.success && result.questions && result.groups) {
        setChecklist(result.checklistData || checklist);
        setQuestions(result.questions);
        setGroups(result.groups);
        
        setActiveTab("manual");
        
        toast.success("Checklist gerado com sucesso! Revise antes de salvar.");
      }
    } catch (error) {
      console.error("Error generating checklist:", error);
      toast.error("Erro ao gerar checklist. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCsvDataParsed = (data: any[]) => {
    try {
      const importedQuestions: ChecklistQuestion[] = data.map((row, index) => {
        const responseTypeMap: Record<string, ChecklistQuestion["responseType"]> = {
          'sim/não': 'yes_no',
          'múltipla escolha': 'multiple_choice',
          'texto': 'text',
          'numérico': 'numeric',
          'foto': 'photo',
          'assinatura': 'signature'
        };
        
        let responseType: ChecklistQuestion["responseType"] = 'yes_no';
        const rawType = (row.tipo_resposta || row.type || '').toLowerCase();
        
        if (responseTypeMap[rawType]) {
          responseType = responseTypeMap[rawType];
        }
        
        let options: string[] | undefined = undefined;
        if (responseType === 'multiple_choice' && row.opcoes) {
          options = row.opcoes.split('|').map((opt: string) => opt.trim());
        }
        
        return {
          id: `imported-${Date.now()}-${index}`,
          text: row.pergunta || row.question || `Pergunta ${index + 1}`,
          responseType: responseType,
          isRequired: row.obrigatorio === 'true' || row.required === 'true' || true,
          weight: 1,
          allowsPhoto: false,
          allowsVideo: false,
          allowsAudio: false,
          order: index,
          options: options,
          groupId: questions[0]?.groupId
        };
      });
      
      if (importedQuestions.length > 0) {
        setQuestions(importedQuestions);
        
        setActiveTab("manual");
        
        if (!checklist.title) {
          setChecklist({
            ...checklist,
            title: `Checklist importado (${new Date().toLocaleDateString()})`,
            description: `Checklist importado com ${importedQuestions.length} perguntas`
          });
        }
      }
    } catch (error) {
      console.error("Error processing CSV data:", error);
      toast.error("Erro ao processar dados importados");
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
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Criação Manual</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span>Gerado por IA</span>
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span>Importar</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
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
                      <Label htmlFor="category">Categoria</Label>
                      <Input
                        id="category"
                        value={checklist.category || ""}
                        onChange={(e) => setChecklist({ ...checklist, category: e.target.value })}
                        placeholder="Ex: Segurança, Qualidade, etc."
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="template"
                        checked={checklist.isTemplate || false}
                        onCheckedChange={(checked) => setChecklist({ ...checklist, isTemplate: checked })}
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
          </TabsContent>
          
          <TabsContent value="ai">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="prompt">Prompt para gerar o checklist *</Label>
                      <Textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Descreva o checklist que você deseja gerar. Ex: Checklist de segurança para trabalho em altura..."
                        className="min-h-[150px]"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="questionCount">Número de perguntas</Label>
                      <Input
                        id="questionCount"
                        type="number"
                        min={1}
                        max={30}
                        value={questionCount}
                        onChange={(e) => setQuestionCount(parseInt(e.target.value) || 5)}
                      />
                    </div>
                    
                    <AIAssistantSelector
                      selectedAssistant={selectedAssistant}
                      onChange={setSelectedAssistant}
                      openAIAssistant={openAIAssistant}
                      onOpenAIAssistantChange={setOpenAIAssistant}
                    />
                    
                    <Button
                      type="button"
                      onClick={handleGenerateWithAI}
                      disabled={isSubmitting || isGenerating || !prompt.trim()}
                      className="w-full"
                    >
                      {isGenerating ? (
                        "Gerando..."
                      ) : (
                        <>
                          <Bot className="h-4 w-4 mr-2" />
                          Gerar com IA
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div>
                    <div className="bg-muted rounded-md p-4">
                      <h3 className="font-medium mb-2">Como funciona</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Nosso assistente de IA irá gerar um checklist com base na sua descrição. 
                        Quanto mais detalhado for o prompt, melhores serão os resultados.
                      </p>
                      
                      <h4 className="font-medium text-sm mt-4 mb-1">Exemplos de prompts:</h4>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li>"Checklist para inspeção de segurança em andaimes"</li>
                        <li>"Lista de verificação para manutenção preventiva de empilhadeiras"</li>
                        <li>"Auditoria de conformidade para normas de proteção contra incêndio"</li>
                      </ul>
                      
                      <div className="mt-4 border-t pt-3">
                        <p className="text-xs text-muted-foreground">
                          Você poderá revisar e editar o checklist gerado antes de salvá-lo.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="import">
            <Card>
              <CardContent className="pt-6">
                <CSVImportSection onDataParsed={handleCsvDataParsed} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
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
            disabled={isSubmitting || (activeTab === "import" && questions.length <= 1)}
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
      
      <FloatingNavigation threshold={400} />
    </div>
  );
}
