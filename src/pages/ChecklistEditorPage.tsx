
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

export default function NewChecklistEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { checklist, loading, error } = useChecklistById(id || "");
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

  // Function to apply media options to all questions
  const toggleAllMediaOptions = (enabled: boolean) => {
    setEnableAllMedia(enabled);
    
    // Apply the configuration to all questions
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
    // First save the checklist
    const success = await handleSubmit();
    
    if (success && id) {
      // Redirect to the inspection creation page with the checklist selected
      navigate(`/inspections/new?checklist=${id}`);
    }
  };
  
  const handleSave = async () => {
    const success = await handleSubmit();
    if (success) {
      navigate("/new-checklists");
    }
  };
  
  const refetch = async () => {
    // Manually refresh by reloading the page for now
    window.location.reload();
  };
  
  // Initialize form with checklist data when loaded
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
  
  // In useEffect or where the checklist data is processed
  useEffect(() => {
    if (checklist) {
      const checklistData = { ...checklist } as any;
      
      if (Array.isArray(checklistData?.questions)) {
        setQuestions(checklistData.questions);
      } else {
        setQuestions([]);
      }
      
      if (Array.isArray(checklistData?.groups)) {
        setGroups(checklistData.groups);
      } else {
        setGroups([]);
      }
    }
  }, [checklist]);
  
  if (loading) {
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
      
      {/* Action buttons at the top */}
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
            <Save className="mr-2 h-4 w-4" />
            Salvar Checklist
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
