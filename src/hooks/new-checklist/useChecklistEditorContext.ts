
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { useChecklistById } from "./useChecklistById";
import { useChecklistQuestions } from "./useChecklistQuestions";
import { useChecklistSubmit } from "./useChecklistSubmit";

export function useChecklistEditorContext() {
  const { id } = useParams<{ id?: string }>();
  const { checklist, loading, error, refetch } = useChecklistById(id || "");
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isTemplate, setIsTemplate] = useState(false);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [viewMode, setViewMode] = useState<"flat" | "grouped">("flat");
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);

  // Load data when checklist is available
  useEffect(() => {
    if (checklist) {
      setTitle(checklist.title);
      setDescription(checklist.description);
      setCategory(checklist.category);
      setIsTemplate(checklist.isTemplate);
      setStatus(checklist.status === "inactive" ? "inactive" : "active");
      setQuestions(checklist.questions || []);
      setGroups(checklist.groups || []);
    }
  }, [checklist]);

  const questionsByGroup = new Map<string, ChecklistQuestion[]>();
  const nonEmptyGroups = groups.filter(group => {
    const groupQuestions = questions.filter(q => q.groupId === group.id);
    questionsByGroup.set(group.id, groupQuestions);
    return groupQuestions.length > 0;
  });

  const handleAddGroup = () => {
    const newGroup: ChecklistGroup = {
      id: `group-${Date.now()}`,
      title: `Grupo ${groups.length + 1}`,
      order: groups.length
    };
    setGroups(prev => [...prev, newGroup]);
  };

  const handleUpdateGroup = (updatedGroup: ChecklistGroup) => {
    setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
    // Move questions from deleted group to default
    setQuestions(prev => 
      prev.map(q => q.groupId === groupId ? { ...q, groupId: "default" } : q)
    );
  };

  const handleDragEnd = (result: any) => {
    // Implement drag and drop logic here
    console.log("Drag end:", result);
  };

  const questionsHook = useChecklistQuestions(
    questions,
    setQuestions,
    groups,
    deletedQuestionIds,
    setDeletedQuestionIds
  );

  const { isSubmitting, handleSubmit } = useChecklistSubmit(
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

  // Enhanced save handler
  const handleSave = async (): Promise<boolean> => {
    return handleSubmit();
  };

  return {
    id,
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
    isLoading: loading,
    enableAllMedia: questionsHook.enableAllMedia,
    setTitle,
    setDescription,
    setCategory,
    setIsTemplate,
    setStatus,
    setViewMode,
    handleAddGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleAddQuestion: questionsHook.handleAddQuestion,
    handleUpdateQuestion: questionsHook.handleUpdateQuestion,
    handleDeleteQuestion: questionsHook.handleDeleteQuestion,
    handleDragEnd,
    handleSubmit,
    handleSave,
    toggleAllMediaOptions: questionsHook.toggleAllMediaOptions,
    refetch
  };
}
