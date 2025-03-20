
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { toast } from "sonner";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { useChecklistUpdate } from "@/hooks/new-checklist/useChecklistUpdate";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { QuestionGroup } from "@/components/new-checklist/question-editor/QuestionGroup";

export default function NewChecklistEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: checklist, isLoading, error } = useChecklistById(id || "");
  const updateChecklist = useChecklistUpdate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<"flat" | "grouped">("grouped");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isTemplate, setIsTemplate] = useState(false);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);
  
  // Initialize form with checklist data when it loads
  useEffect(() => {
    if (checklist) {
      setTitle(checklist.title);
      setDescription(checklist.description || "");
      setCategory(checklist.category || "");
      setIsTemplate(checklist.isTemplate);
      setStatus(checklist.status);
      setQuestions(checklist.questions || []);
      setGroups(checklist.groups || []);
      
      // Default to grouped view if there are groups
      if (checklist.groups && checklist.groups.length > 0) {
        setViewMode("grouped");
      }
    }
  }, [checklist]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error("Erro ao carregar checklist. Verifique o ID ou tente novamente.");
      navigate("/new-checklists");
    }
  }, [error, navigate]);
  
  const handleAddGroup = () => {
    const newGroup: ChecklistGroup = {
      id: `group-${Date.now()}`,
      title: "Novo Grupo",
      order: groups.length
    };
    
    setGroups([...groups, newGroup]);
  };
  
  const handleUpdateGroup = (updatedGroup: ChecklistGroup) => {
    const index = groups.findIndex(g => g.id === updatedGroup.id);
    if (index === -1) return;
    
    const newGroups = [...groups];
    newGroups[index] = updatedGroup;
    setGroups(newGroups);
  };
  
  const handleDeleteGroup = (groupId: string) => {
    // Don't allow deleting the last group
    if (groups.length <= 1) {
      toast.warning("É necessário pelo menos um grupo.");
      return;
    }
    
    // Find the default group to move questions to
    const defaultGroup = groups[0].id !== groupId ? groups[0] : groups[1];
    
    // Move questions from deleted group to default group
    const updatedQuestions = questions.map(q => 
      q.groupId === groupId ? { ...q, groupId: defaultGroup.id } : q
    );
    
    setQuestions(updatedQuestions);
    setGroups(groups.filter(g => g.id !== groupId));
  };
  
  const handleAddQuestion = (groupId: string) => {
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
      groupId
    };
    
    setQuestions([...questions, newQuestion]);
  };
  
  const handleUpdateQuestion = (updatedQuestion: ChecklistQuestion) => {
    const index = questions.findIndex(q => q.id === updatedQuestion.id);
    if (index === -1) return;
    
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };
  
  const handleDeleteQuestion = (questionId: string) => {
    // Don't allow deleting if it's the only question
    if (questions.length <= 1) {
      toast.warning("O checklist deve ter pelo menos uma pergunta.");
      return;
    }
    
    // If question exists in database (not a new one), add to deleted list
    if (!questionId.startsWith("new-")) {
      setDeletedQuestionIds([...deletedQuestionIds, questionId]);
    }
    
    // Remove from current questions
    setQuestions(questions.filter(q => q.id !== questionId));
  };
  
  const handleDragEnd = (result: any) => {
    const { destination, source, type } = result;
    
    // If dropped outside a droppable area or same position
    if (!destination || (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )) {
      return;
    }
    
    // Reordering groups
    if (type === "GROUP") {
      const reorderedGroups = [...groups];
      const [removed] = reorderedGroups.splice(source.index, 1);
      reorderedGroups.splice(destination.index, 0, removed);
      
      // Update order property
      const groupsWithUpdatedOrder = reorderedGroups.map((group, index) => ({
        ...group,
        order: index
      }));
      
      setGroups(groupsWithUpdatedOrder);
      return;
    }
    
    // Reordering questions within same group
    if (source.droppableId === destination.droppableId) {
      const groupQuestions = questions.filter(q => q.groupId === source.droppableId);
      const otherQuestions = questions.filter(q => q.groupId !== source.droppableId);
      
      const reorderedGroupQuestions = [...groupQuestions];
      const [removed] = reorderedGroupQuestions.splice(source.index, 1);
      reorderedGroupQuestions.splice(destination.index, 0, removed);
      
      // Update order property
      const updatedGroupQuestions = reorderedGroupQuestions.map((question, index) => ({
        ...question,
        order: index
      }));
      
      setQuestions([...otherQuestions, ...updatedGroupQuestions]);
    } 
    // Moving question between groups
    else {
      const sourceGroupQuestions = questions.filter(q => q.groupId === source.droppableId);
      const destGroupQuestions = questions.filter(q => q.groupId === destination.droppableId);
      const otherQuestions = questions.filter(
        q => q.groupId !== source.droppableId && q.groupId !== destination.droppableId
      );
      
      // Remove from source group
      const questionToMove = sourceGroupQuestions[source.index];
      const updatedSourceQuestions = [...sourceGroupQuestions];
      updatedSourceQuestions.splice(source.index, 1);
      
      // Add to destination group
      const updatedDestQuestions = [...destGroupQuestions];
      updatedDestQuestions.splice(destination.index, 0, {
        ...questionToMove,
        groupId: destination.droppableId
      });
      
      // Update order property for both groups
      const finalSourceQuestions = updatedSourceQuestions.map((q, idx) => ({ ...q, order: idx }));
      const finalDestQuestions = updatedDestQuestions.map((q, idx) => ({ ...q, order: idx }));
      
      setQuestions([...otherQuestions, ...finalSourceQuestions, ...finalDestQuestions]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || !id) return;
    setIsSubmitting(true);
    
    try {
      // Validate form
      if (!title.trim()) {
        toast.error("O título do checklist é obrigatório.");
        setIsSubmitting(false);
        return;
      }
      
      // Filter out empty questions
      const validQuestions = questions.filter(q => q.text.trim());
      if (validQuestions.length === 0) {
        toast.error("Adicione pelo menos uma pergunta válida.");
        setIsSubmitting(false);
        return;
      }
      
      // Prepare updated checklist data
      const updatedChecklist = {
        id,
        title,
        description,
        category,
        isTemplate,
        status
      };
      
      // Update checklist
      await updateChecklist.mutateAsync({
        checklist: updatedChecklist,
        questions: validQuestions,
        groups,
        deletedQuestionIds
      });
      
      // Navigate back to the checklist list
      navigate("/new-checklists");
    } catch (error) {
      console.error("Error updating checklist:", error);
      toast.error("Erro ao atualizar checklist. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Carregando checklist...</p>
        </div>
      </div>
    );
  }
  
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
          <h1 className="text-2xl font-bold">Editar Checklist</h1>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader className="border-b pb-3">
            <h2 className="text-xl font-semibold">Informações Básicas</h2>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Digite o título do checklist"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex: Segurança, Qualidade, etc."
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="template"
                      checked={isTemplate}
                      onCheckedChange={setIsTemplate}
                    />
                    <Label htmlFor="template">Template</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="status">Status:</Label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                      className="border rounded p-1 text-sm"
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="border-b pb-3 flex flex-row items-center justify-between">
            <h2 className="text-xl font-semibold">Perguntas</h2>
            <Tabs 
              value={viewMode} 
              onValueChange={(value) => setViewMode(value as "flat" | "grouped")}
            >
              <TabsList>
                <TabsTrigger value="flat">Lista</TabsTrigger>
                <TabsTrigger value="grouped">Agrupado</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="pt-6">
            {viewMode === "grouped" && (
              <div className="space-y-4">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="groups" type="GROUP">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {groups.map((group, index) => (
                          <Draggable 
                            key={group.id} 
                            draggableId={group.id} 
                            index={index}
                          >
                            {(draggableProvided) => (
                              <div
                                ref={draggableProvided.innerRef}
                                {...draggableProvided.draggableProps}
                              >
                                <Droppable 
                                  droppableId={group.id} 
                                  type="QUESTION"
                                >
                                  {(droppableProvided) => (
                                    <div
                                      ref={droppableProvided.innerRef}
                                      {...droppableProvided.droppableProps}
                                    >
                                      <QuestionGroup
                                        group={group}
                                        questions={questions.filter(q => q.groupId === group.id)}
                                        onGroupUpdate={handleUpdateGroup}
                                        onAddQuestion={handleAddQuestion}
                                        onUpdateQuestion={handleUpdateQuestion}
                                        onDeleteQuestion={handleDeleteQuestion}
                                        onDeleteGroup={handleDeleteGroup}
                                        dragHandleProps={draggableProvided.dragHandleProps}
                                      />
                                      {droppableProvided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddGroup}
                  className="w-full mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Grupo
                </Button>
              </div>
            )}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Salvando..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
