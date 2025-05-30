import React from "react";
import { useNavigate } from "react-router-dom";
import { ChecklistEditActions } from "@/components/new-checklist/edit/ChecklistEditActions";
import { LoadingState } from "@/components/new-checklist/edit/LoadingState";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";
import { ChecklistEditorProvider } from "@/contexts/ChecklistEditorContext";
import { ChecklistHeader } from "@/components/new-checklist/edit/ChecklistHeader";
import { useChecklistEditorContext } from "@/hooks/new-checklist/useChecklistEditorContext";
import { ChecklistBasicInfo } from "./ChecklistBasicInfo";
import { ChecklistQuestionList } from "./ChecklistQuestionList";
import { toast } from "sonner";

export function ChecklistEditorContainer() {
  const editorContext = useChecklistEditorContext();
  const navigate = useNavigate();
  
  if (!editorContext) {
    return <LoadingState />;
  }
  
  if (editorContext.isLoading) {
    return <LoadingState />;
  }
  
  // Context value with all state and actions
  const contextValue = {
    title: editorContext.title,
    description: editorContext.description,
    category: editorContext.category,
    isTemplate: editorContext.isTemplate,
    status: editorContext.status,
    questions: editorContext.questions,
    groups: editorContext.groups,
    viewMode: editorContext.viewMode,
    questionsByGroup: editorContext.questionsByGroup,
    nonEmptyGroups: editorContext.nonEmptyGroups,
    isSubmitting: editorContext.isSubmitting,
    enableAllMedia: editorContext.enableAllMedia,
    setTitle: editorContext.setTitle,
    setDescription: editorContext.setDescription,
    setCategory: editorContext.setCategory,
    setIsTemplate: editorContext.setIsTemplate,
    setStatus: editorContext.setStatus,
    setViewMode: editorContext.setViewMode,
    handleAddGroup: editorContext.handleAddGroup,
    handleUpdateGroup: editorContext.handleUpdateGroup,
    handleDeleteGroup: editorContext.handleDeleteGroup,
    handleAddQuestion: editorContext.handleAddQuestion,
    handleUpdateQuestion: editorContext.handleUpdateQuestion,
    handleDeleteQuestion: editorContext.handleDeleteQuestion,
    handleDragEnd: editorContext.handleDragEnd,
    handleSubmit: editorContext.handleSubmit,
    toggleAllMediaOptions: editorContext.toggleAllMediaOptions,
    id: editorContext.id,
  };
  
  // Remova o auto-save ao navegar de etapa (deixe apenas o save manual)
  // Remova qualquer chamada automática de handleSave em useEffect ou navegação de etapas

  // Enhanced save handler to provide feedback and navigate after success
  const handleSave = async (): Promise<void> => {
    try {
      toast.info("Salvando checklist...", { duration: 2000 });
      if (editorContext.handleSave) {
        const success = await editorContext.handleSave();
        if (success) {
          toast.success("Checklist salvo com sucesso!", { duration: 5000 });
          navigate("/new-checklists");
        } else {
          toast.error("Erro ao salvar checklist", { duration: 5000 });
        }
      }
    } catch (error) {
      console.error("Error saving checklist:", error);
      toast.error(`Erro ao salvar checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`, { duration: 5000 });
    }
  };

  // Enhanced start inspection handler with proper error handling
  const handleStartInspection = async (): Promise<void> => {
    if (!editorContext.id) {
      toast.error("É necessário salvar o checklist antes de iniciar a inspeção", { duration: 5000 });
      return;
    }
    try {
      toast.info("Preparando inspeção...", { duration: 2000 });
      // Remova o save automático antes de iniciar inspeção
      // if (editorContext.handleSave) {
      //   const saveSuccess = await editorContext.handleSave();
      //   if (!saveSuccess) {
      //     toast.error("Não foi possível salvar o checklist antes de iniciar a inspeção", { duration: 5000 });
      //     return;
      //   }
      // }
      // Navegue diretamente para inspeção
      console.log(`Redirecionando para inspeção com checklistId=${editorContext.id}`);
      toast.success("Redirecionando para a inspeção...", { duration: 2000 });
      navigate(`/inspections/new?checklistId=${editorContext.id}`);
    } catch (error) {
      console.error("Error starting inspection:", error);
      toast.error(`Erro ao iniciar inspeção: ${error instanceof Error ? error.message : "Erro desconhecido"}`, { duration: 5000 });
    }
  };
  
  return (
    <ChecklistEditorProvider value={contextValue}>
      <div className="space-y-6">
        {/* Header section */}
        <ChecklistHeader 
          onBack={() => navigate("/new-checklists")}
          onRefresh={() => {
            if (editorContext.id) {
              toast.info("Recarregando dados...", { duration: 2000 });
              if (editorContext.refetch) {
                editorContext.refetch();
              }
            }
          }}
          onStartInspection={handleStartInspection}
          onSave={handleSave}
        />
        {/* Form section */}
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }} className="space-y-6">
          {/* Basic information section */}
          <ChecklistBasicInfo
            title={editorContext.title}
            description={editorContext.description}
            category={editorContext.category}
            isTemplate={editorContext.isTemplate}
            status={editorContext.status}
            onTitleChange={editorContext.setTitle}
            onDescriptionChange={editorContext.setDescription}
            onCategoryChange={editorContext.setCategory}
            onIsTemplateChange={editorContext.setIsTemplate}
            onStatusChange={editorContext.setStatus}
          />
          
          {/* Questions section */}
          <ChecklistQuestionList />
          
          {/* Bottom actions */}
          <ChecklistEditActions
            isSubmitting={editorContext.isSubmitting}
            onCancel={() => navigate("/new-checklists")}
            onStartInspection={handleStartInspection}
            onSave={handleSave}
          />
        </form>
        <FloatingNavigation threshold={400} />
      </div>
    </ChecklistEditorProvider>
  );
}
