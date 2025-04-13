
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Save, PlayCircle, FileUp } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { useChecklistEdit } from "@/hooks/new-checklist/useChecklistEdit";
import { ChecklistEditHeader } from "@/components/new-checklist/edit/ChecklistEditHeader";
import { ChecklistBasicInfo } from "@/components/new-checklist/edit/ChecklistBasicInfo";
import { ChecklistQuestions } from "@/components/new-checklist/edit/ChecklistQuestions";
import { ChecklistEditActions } from "@/components/new-checklist/edit/ChecklistEditActions";
import { LoadingState } from "@/components/new-checklist/edit/LoadingState";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";
import { handleError } from "@/utils/errorHandling";

export default function NewChecklistEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: checklist, isLoading, error, refetch } = useChecklistById(id || "");
  const [enableAllMedia, setEnableAllMedia] = useState(false);
  
  const {
    title,
    description,
    category,
    isTemplate,
    status,
    questions,
    groups,
    viewMode,
    deletedQuestionIds,
    questionsByGroup,
    nonEmptyGroups,
    isSubmitting,
    setTitle,
    setDescription,
    setCategory,
    setIsTemplate,
    setStatus,
    setQuestions,
    setGroups,
    setViewMode,
    handleAddGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    handleDragEnd,
    handleSubmit
  } = useChecklistEdit(checklist, id);

  // Função para aplicar opções de mídia para todas as perguntas
  const toggleAllMediaOptions = (enabled: boolean) => {
    setEnableAllMedia(enabled);
    
    // Aplicar a configuração a todas as perguntas
    const updatedQuestions = questions.map(question => ({
      ...question,
      allowsPhoto: enabled,
      allowsVideo: enabled,
      allowsAudio: enabled,
      allowsFiles: enabled
    }));
    
    setQuestions(updatedQuestions);
    toast.success(enabled 
      ? "Opções de mídia ativadas para todas as perguntas" 
      : "Opções de mídia desativadas para todas as perguntas"
    );
  };

  const handleStartInspection = async () => {
    try {
      // Primeiro salvar o checklist
      const success = await handleSubmit();
      
      if (success && id) {
        toast.success("Navegando para nova inspeção...");
        // Redirecionar para a página de criação de inspeção com o checklist selecionado
        navigate(`/inspections/new?checklist=${id}`);
      } else {
        toast.error("É preciso salvar o checklist antes de iniciar uma inspeção");
      }
    } catch (error) {
      handleError(error, "Erro ao preparar inspeção");
    }
  };
  
  const handleSave = async () => {
    try {
      const success = await handleSubmit();
      if (success) {
        toast.success("Checklist salvo com sucesso!");
        navigate("/new-checklists");
      }
    } catch (error) {
      handleError(error, "Erro ao salvar o checklist");
    }
  };
  
  // Inicializar formulário com dados do checklist quando ele for carregado
  useEffect(() => {
    if (checklist) {
      console.log("Dados do checklist carregados para edição:", checklist);
    }
  }, [checklist]);
  
  // Lidar com erros
  useEffect(() => {
    if (error) {
      handleError(error, "Erro ao carregar checklist");
      navigate("/new-checklists");
    }
  }, [error, navigate]);
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  return (
    <div className="space-y-6">
      <ChecklistEditHeader 
        onBack={() => navigate("/new-checklists")}
        onRefresh={() => {
          if (id) {
            toast.info("Recarregando dados do checklist...");
            refetch();
          }
        }}
      />
      
      {/* Botões de ação no topo */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Switch
            id="all-media-options"
            checked={enableAllMedia}
            onCheckedChange={toggleAllMediaOptions}
          />
          <label htmlFor="all-media-options" className="text-sm font-medium">
            Ativar todas as opções de mídia
          </label>
        </div>
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center"
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Salvar Checklist</>
            )}
          </Button>
          
          <Button 
            onClick={handleStartInspection}
            disabled={isSubmitting}
            className="flex items-center"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlayCircle className="mr-2 h-4 w-4" />
            )}
            Iniciar Inspeção
          </Button>
        </div>
      </div>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }} className="space-y-6">
        <ChecklistBasicInfo
          title={title}
          description={description}
          category={category}
          isTemplate={isTemplate}
          status={status}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onCategoryChange={setCategory}
          onIsTemplateChange={setIsTemplate}
          onStatusChange={setStatus}
        />
        
        <ChecklistQuestions
          questions={questions}
          groups={groups}
          nonEmptyGroups={nonEmptyGroups}
          questionsByGroup={questionsByGroup}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddGroup={handleAddGroup}
          onUpdateGroup={handleUpdateGroup}
          onDeleteGroup={handleDeleteGroup}
          onAddQuestion={handleAddQuestion}
          onUpdateQuestion={handleUpdateQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onDragEnd={handleDragEnd}
          enableAllMedia={enableAllMedia}
          isSubmitting={isSubmitting}
        />
        
        <ChecklistEditActions
          isSubmitting={isSubmitting}
          onCancel={() => navigate("/new-checklists")}
          onStartInspection={handleStartInspection}
          onSave={handleSave}
        />
      </form>
      
      <FloatingNavigation threshold={400} />
    </div>
  );
}
