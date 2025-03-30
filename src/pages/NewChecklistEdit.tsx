
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { useChecklistEdit } from "@/hooks/new-checklist/useChecklistEdit";
import { ChecklistEditHeader } from "@/components/new-checklist/edit/ChecklistEditHeader";
import { ChecklistBasicInfo } from "@/components/new-checklist/edit/ChecklistBasicInfo";
import { ChecklistQuestions } from "@/components/new-checklist/edit/ChecklistQuestions";
import { ChecklistEditActions } from "@/components/new-checklist/edit/ChecklistEditActions";
import { LoadingState } from "@/components/new-checklist/edit/LoadingState";

export default function NewChecklistEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: checklist, isLoading, error, refetch } = useChecklistById(id || "");
  
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
    handleSubmit,
    // New functions for sub-checklist handling
    handleEditSubChecklist,
    subChecklistBeingEdited,
    setSubChecklistBeingEdited
  } = useChecklistEdit(checklist, id);
  
  // Initialize form with checklist data when it loads
  useEffect(() => {
    if (checklist) {
      console.log("Checklist data loaded for edit:", checklist);
    }
  }, [checklist]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error("Erro ao carregar checklist. Verifique o ID ou tente novamente.");
      navigate("/new-checklists");
    }
  }, [error, navigate]);
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  // If we're editing a sub-checklist, show that UI
  if (subChecklistBeingEdited) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setSubChecklistBeingEdited(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para o Checklist Principal</span>
          </Button>
          <h2 className="text-xl font-semibold">Editar Sub-Checklist</h2>
        </div>
        
        <Card>
          <CardContent className="p-6">
            {/* Display sub-checklist editor with the sub-checklist ID */}
            <SubChecklistEditor
              parentQuestionId={subChecklistBeingEdited.questionId}
              existingSubChecklistId={subChecklistBeingEdited.subChecklistId}
              onSubChecklistCreated={() => {
                toast.success("Sub-checklist salvo com sucesso!");
                setSubChecklistBeingEdited(null);
                refetch(); // Refresh main checklist data
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
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
      
      <form onSubmit={handleSubmit} className="space-y-6">
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
          onEditSubChecklist={handleEditSubChecklist}
        />
        
        <ChecklistEditActions
          isSubmitting={isSubmitting}
          onCancel={() => navigate("/new-checklists")}
        />
      </form>
    </div>
  );
}
