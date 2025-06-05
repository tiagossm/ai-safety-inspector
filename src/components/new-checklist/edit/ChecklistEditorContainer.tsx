
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChecklistEditActions } from "@/components/new-checklist/edit/ChecklistEditActions";
import { LoadingState } from "@/components/new-checklist/edit/LoadingState";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";
import { ChecklistEditorProvider } from "@/contexts/ChecklistEditorContext";
import { ChecklistHeader } from "@/components/new-checklist/edit/ChecklistHeader";
import { useChecklistEditorContext } from "@/hooks/new-checklist/useChecklistEditorContext";
import { ChecklistBasicInfo } from "./ChecklistBasicInfo";
import { ChecklistQuestionList } from "./ChecklistQuestionList";
import { QuestionSuggestionPanel } from "@/components/new-checklist/ai/QuestionSuggestionPanel";
import { AccessibilityPanel } from "@/components/new-checklist/accessibility/AccessibilityPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wand2, Eye, FileText } from "lucide-react";
import { toast } from "sonner";

export function ChecklistEditorContainer() {
  const editorContext = useChecklistEditorContext();
  const navigate = useNavigate();
  const [accessibilityConfig, setAccessibilityConfig] = useState({});
  
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
      console.log(`Redirecionando para inspeção com checklistId=${editorContext.id}`);
      toast.success("Redirecionando para a inspeção...", { duration: 2000 });
      navigate(`/inspections/new?checklistId=${editorContext.id}`);
    } catch (error) {
      console.error("Error starting inspection:", error);
      toast.error(`Erro ao iniciar inspeção: ${error instanceof Error ? error.message : "Erro desconhecido"}`, { duration: 5000 });
    }
  };

  const handleAddAISuggestion = (suggestion: Partial<ChecklistQuestion>) => {
    const defaultGroupId = editorContext.groups.length > 0 ? editorContext.groups[0].id : "default";
    const newQuestion = {
      id: `new-${Date.now()}`,
      text: suggestion.text || "",
      responseType: suggestion.responseType || "yes_no" as const,
      isRequired: suggestion.isRequired || true,
      order: editorContext.questions.length,
      weight: suggestion.weight || 1,
      allowsPhoto: suggestion.allowsPhoto || false,
      allowsVideo: suggestion.allowsVideo || false,
      allowsAudio: suggestion.allowsAudio || false,
      allowsFiles: suggestion.allowsFiles || false,
      groupId: defaultGroupId,
      level: 0,
      path: `new-${Date.now()}`,
      isConditional: suggestion.isConditional || false,
      options: suggestion.options || [],
      hint: suggestion.hint
    };
    
    editorContext.handleUpdateQuestion(newQuestion);
  };
  
  return (
    <ChecklistEditorProvider value={contextValue}>
      <div className="space-y-6">
        {/* Header section with question counter */}
        <ChecklistHeader 
          totalQuestions={editorContext.questions.length}
          totalGroups={editorContext.nonEmptyGroups.length}
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
        
        {/* Main content with tabs */}
        <Tabs defaultValue="editor" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              IA & Sugestões
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Acessibilidade
            </TabsTrigger>
          </TabsList>

          {/* Editor Tab */}
          <TabsContent value="editor">
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
          </TabsContent>

          {/* AI Tab */}
          <TabsContent value="ai" className="space-y-6">
            <QuestionSuggestionPanel
              category={editorContext.category}
              existingQuestions={editorContext.questions}
              onAddSuggestion={handleAddAISuggestion}
              groupId={editorContext.groups.length > 0 ? editorContext.groups[0].id : "default"}
            />
          </TabsContent>

          {/* Accessibility Tab */}
          <TabsContent value="accessibility" className="space-y-6">
            <AccessibilityPanel
              onConfigChange={setAccessibilityConfig}
            />
          </TabsContent>
        </Tabs>
        
        <FloatingNavigation threshold={400} />
      </div>
    </ChecklistEditorProvider>
  );
}
