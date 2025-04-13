
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { ChecklistEditHeader } from "@/components/new-checklist/edit/ChecklistEditHeader";
import { ChecklistBasicInfo } from "@/components/new-checklist/edit/ChecklistBasicInfo";
import { ChecklistEditActions } from "@/components/new-checklist/edit/ChecklistEditActions";
import { LoadingState } from "@/components/new-checklist/edit/LoadingState";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";
import { handleError } from "@/utils/errorHandling";
import { useChecklistState } from "@/hooks/new-checklist/useChecklistState";
import { useChecklistQuestions } from "@/hooks/new-checklist/useChecklistQuestions";
import { useChecklistGroups } from "@/hooks/new-checklist/useChecklistGroups";
import { useChecklistSubmit } from "@/hooks/new-checklist/useChecklistSubmit";
import { ChecklistEditorProvider } from "@/contexts/ChecklistEditorContext";
import { ChecklistHeader } from "@/components/new-checklist/edit/ChecklistHeader";
import { ChecklistQuestionList } from "@/components/new-checklist/edit/ChecklistQuestionList";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";

export default function NewChecklistEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: checklist, isLoading, error, refetch } = useChecklistById(id || "");
  
  // Use our refactored hooks for state management
  const {
    title, setTitle,
    description, setDescription,
    category, setCategory,
    isTemplate, setIsTemplate,
    status, setStatus,
    questions, setQuestions,
    groups, setGroups,
    viewMode, setViewMode,
    deletedQuestionIds, setDeletedQuestionIds,
    isSubmitting, setIsSubmitting,
    enableAllMedia, setEnableAllMedia
  } = useChecklistState(checklist);
  
  // Questions management
  const {
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    toggleAllMediaOptions
  } = useChecklistQuestions(
    questions, 
    setQuestions, 
    groups, 
    deletedQuestionIds, 
    setDeletedQuestionIds
  );
  
  // Groups management
  const {
    handleAddGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleDragEnd
  } = useChecklistGroups(
    groups,
    setGroups,
    questions,
    setQuestions
  );
  
  // Submission logic
  const {
    handleSubmit
  } = useChecklistSubmit(
    id,
    title,
    description,
    category,
    isTemplate,
    status,
    questions,
    groups,
    deletedQuestionIds
  );
  
  // Computed properties with memoization
  const questionsByGroup = useMemo(() => {
    const result = new Map<string, ChecklistQuestion[]>();
    
    groups.forEach(group => {
      result.set(group.id, []);
    });
    
    questions.forEach(question => {
      const groupId = question.groupId || groups[0]?.id || "default";
      if (!result.has(groupId)) {
        result.set(groupId, []);
      }
      
      const groupQuestions = result.get(groupId) || [];
      groupQuestions.push(question);
      result.set(groupId, groupQuestions);
    });
    
    result.forEach((groupQuestions, groupId) => {
      result.set(
        groupId,
        groupQuestions.sort((a, b) => a.order - b.order)
      );
    });
    
    return result;
  }, [questions, groups]);
  
  const nonEmptyGroups = useMemo(() => {
    return groups
      .filter(group => {
        const groupQuestions = questionsByGroup.get(group.id) || [];
        return groupQuestions.length > 0;
      })
      .sort((a, b) => a.order - b.order);
  }, [groups, questionsByGroup]);
  
  // Action handlers
  const handleSave = useCallback(async () => {
    try {
      const success = await handleSubmit();
      if (success) {
        toast.success("Checklist salvo com sucesso!");
        navigate("/new-checklists");
      }
    } catch (error) {
      handleError(error, "Erro ao salvar o checklist");
    }
  }, [handleSubmit, navigate]);
  
  const handleStartInspection = useCallback(async () => {
    try {
      const success = await handleSubmit();
      
      if (success && id) {
        toast.success("Navegando para nova inspeção...");
        navigate(`/inspections/new?checklist=${id}`);
      } else {
        toast.error("É preciso salvar o checklist antes de iniciar uma inspeção");
      }
    } catch (error) {
      handleError(error, "Erro ao preparar inspeção");
    }
  }, [handleSubmit, id, navigate]);
  
  // Initialize form with data from the checklist when it's loaded
  useEffect(() => {
    if (checklist) {
      setTitle(checklist.title || "");
      setDescription(checklist.description || "");
      setCategory(checklist.category || "");
      setIsTemplate(checklist.isTemplate || false);
      
      // Fix #1: Ensure we're setting a properly typed status value
      const checklistStatus = checklist.status === "inactive" ? "inactive" : "active";
      setStatus(checklistStatus);
      
      if (checklist.questions && checklist.questions.length > 0) {
        if (checklist.groups && checklist.groups.length > 0) {
          setGroups(checklist.groups);
          
          const questionsWithValidGroups = checklist.questions.map((q) => ({
            ...q,
            groupId: q.groupId || checklist.groups[0].id
          }));
          
          setQuestions(questionsWithValidGroups);
        } else {
          const defaultGroup: ChecklistGroup = {
            id: "default",
            title: "Geral",
            order: 0
          };
          
          const questionsWithDefaultGroup = checklist.questions.map((q) => ({
            ...q,
            groupId: "default"
          }));
          
          setGroups([defaultGroup]);
          setQuestions(questionsWithDefaultGroup);
        }
      } else {
        const defaultGroup: ChecklistGroup = {
          id: "default",
          title: "Geral",
          order: 0
        };
        
        // Fix #2: Use a properly typed responseType value
        const defaultQuestion: ChecklistQuestion = {
          id: `new-${Date.now()}`,
          text: "",
          responseType: "yes_no", // This must be one of the allowed types
          isRequired: true,
          weight: 1,
          allowsPhoto: false,
          allowsVideo: false, 
          allowsAudio: false,
          allowsFiles: false,
          order: 0,
          groupId: "default"
        };
        
        setGroups([defaultGroup]);
        setQuestions([defaultQuestion]);
      }
    }
  }, [checklist, setTitle, setDescription, setCategory, setIsTemplate, setStatus, setQuestions, setGroups]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      handleError(error, "Erro ao carregar checklist");
      navigate("/new-checklists");
    }
  }, [error, navigate]);
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  // Context value with all state and actions
  const contextValue = {
    title,
    description,
    category,
    isTemplate,
    status,
    questions,
    groups,
    viewMode,
    questionsByGroup,
    nonEmptyGroups,
    isSubmitting,
    enableAllMedia,
    setTitle,
    setDescription,
    setCategory,
    setIsTemplate,
    setStatus,
    setViewMode,
    handleAddGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    handleDragEnd,
    handleSubmit,
    toggleAllMediaOptions
  };
  
  return (
    <ChecklistEditorProvider value={contextValue}>
      <div className="space-y-6">
        {/* Header section */}
        <ChecklistHeader 
          onBack={() => navigate("/new-checklists")}
          onRefresh={() => id && refetch()}
          onStartInspection={handleStartInspection}
          onSave={handleSave}
        />
        
        {/* Form section */}
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }} className="space-y-6">
          {/* Basic information section */}
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
          
          {/* Questions section */}
          <ChecklistQuestionList />
          
          {/* Bottom actions */}
          <ChecklistEditActions
            isSubmitting={isSubmitting}
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
