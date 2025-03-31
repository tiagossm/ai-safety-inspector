
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Save, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { useChecklistEdit } from "@/hooks/new-checklist/useChecklistEdit";
import { ChecklistEditHeader } from "@/components/new-checklist/edit/ChecklistEditHeader";
import { ChecklistBasicInfo } from "@/components/new-checklist/edit/ChecklistBasicInfo";
import { ChecklistQuestions } from "@/components/new-checklist/edit/ChecklistQuestions";
import { ChecklistEditActions } from "@/components/new-checklist/edit/ChecklistEditActions";
import { LoadingState } from "@/components/new-checklist/edit/LoadingState";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";

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
    handleSubmit
  } = useChecklistEdit(checklist, id);

  const handleStartInspection = async () => {
    // Primeiro salvar o checklist
    const success = await handleSubmit();
    
    if (success && id) {
      // Redirecionar para a página de criação de inspeção com o checklist selecionado
      navigate(`/inspections/new?checklist=${id}`);
    }
  };
  
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
      <div className="flex justify-end space-x-4">
        <Button 
          variant="outline" 
          onClick={() => handleSubmit()}
          disabled={isSubmitting}
          className="flex items-center"
        >
          <Save className="mr-2 h-4 w-4" />
          Salvar
        </Button>
        
        <Button 
          onClick={handleStartInspection}
          disabled={isSubmitting}
          className="flex items-center"
        >
          <PlayCircle className="mr-2 h-4 w-4" />
          Iniciar Inspeção
        </Button>
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
        />
        
        <ChecklistEditActions
          isSubmitting={isSubmitting}
          onCancel={() => navigate("/new-checklists")}
          onStartInspection={handleStartInspection}
        />
      </form>
      
      <FloatingNavigation threshold={400} />
    </div>
  );
}
