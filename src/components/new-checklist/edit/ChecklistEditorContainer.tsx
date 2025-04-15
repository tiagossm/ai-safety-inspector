
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
    handleAddQuestion: (groupId: string) => {
      editorContext.handleAddQuestion(groupId);
      toast.success("Nova pergunta adicionada");
    },
    handleUpdateQuestion: editorContext.handleUpdateQuestion,
    handleDeleteQuestion: editorContext.handleDeleteQuestion,
    handleDragEnd: editorContext.handleDragEnd,
    handleSubmit: editorContext.handleSubmit,
    toggleAllMediaOptions: editorContext.toggleAllMediaOptions
  };
  
  // Enhanced save handler to provide feedback
  const handleSave = async () => {
    toast.info("Salvando checklist...", { duration: 2000 });
    try {
      await editorContext.handleSave();
      toast.success("Checklist salvo com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar checklist");
    }
  };
  
  // Enhanced start inspection handler to provide feedback
  const handleStartInspection = async () => {
    if (!editorContext.id) {
      toast.error("É necessário salvar o checklist antes de iniciar a inspeção");
      return;
    }
    
    toast.info("Preparando inspeção...", { duration: 2000 });
    try {
      await editorContext.handleSave(); // Salva primeiro
      await editorContext.handleStartInspection(); // Depois inicia a inspeção
      toast.success("Redirecionando para a inspeção...");
    } catch (error) {
      toast.error("Erro ao iniciar inspeção");
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
              editorContext.refetch();
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
