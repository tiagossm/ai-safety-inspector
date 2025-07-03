
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChecklistEditActions } from "@/components/new-checklist/edit/ChecklistEditActions";
import { LoadingState } from "@/components/new-checklist/edit/LoadingState";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";
import { ChecklistEditorProvider } from "@/contexts/ChecklistEditorContext";
import { ChecklistHeaderExpanded } from "@/components/new-checklist/edit/ChecklistHeaderExpanded";
import { useChecklistEditorContext } from "@/hooks/new-checklist/useChecklistEditorContext";
import { ChecklistBasicInfoExpanded } from "./ChecklistBasicInfoExpanded";
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
  
  // Manual save handler
  const handleSave = async (): Promise<void> => {
    try {
      const success = await editorContext.handleSave();
      if (success) {
        navigate("/new-checklists");
      }
    } catch (error) {
      console.error("Error saving checklist:", error);
      toast.error(`Erro ao salvar checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  };

  // Start inspection handler
  const handleStartInspection = async (): Promise<void> => {
    if (!editorContext.id) {
      toast.error("É necessário salvar o checklist antes de iniciar a inspeção");
      return;
    }
    try {
      console.log(`Redirecionando para inspeção com checklistId=${editorContext.id}`);
      navigate(`/inspections/new?checklistId=${editorContext.id}`);
    } catch (error) {
      console.error("Error starting inspection:", error);
      toast.error(`Erro ao iniciar inspeção: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  };
  
  return (
    <ChecklistEditorProvider value={contextValue}>
      <div className="space-y-6">
        {/* Header section */}
        <ChecklistHeaderExpanded 
          onBack={() => navigate("/new-checklists")}
          onRefresh={() => {
            if (editorContext.id) {
              toast.info("Recarregando dados...");
              if (editorContext.refetch) {
                editorContext.refetch();
              }
            }
          }}
          onStartInspection={handleStartInspection}
          onSave={handleSave}
          isSaving={editorContext.isSubmitting}
        />
        
        {/* Form section */}
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }} className="space-y-6">
          {/* Basic information section */}
          <ChecklistBasicInfoExpanded
            title={editorContext.title}
            description={editorContext.description}
            category={editorContext.category}
            isTemplate={editorContext.isTemplate}
            status={editorContext.status}
            companyId={editorContext.companyId}
            responsibleId={editorContext.responsibleId}
            dueDate={editorContext.dueDate}
            onTitleChange={editorContext.setTitle}
            onDescriptionChange={editorContext.setDescription}
            onCategoryChange={editorContext.setCategory}
            onIsTemplateChange={editorContext.setIsTemplate}
            onStatusChange={editorContext.setStatus}
            onCompanyChange={editorContext.setCompanyId}
            onResponsibleChange={editorContext.setResponsibleId}
            onDueDateChange={editorContext.setDueDate}
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
