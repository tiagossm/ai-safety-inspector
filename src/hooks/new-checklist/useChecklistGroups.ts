
import { useCallback } from "react";
import { toast } from "sonner";
import { ChecklistGroup, ChecklistQuestion } from "@/types/newChecklist";

export function useChecklistGroups(
  groups: ChecklistGroup[],
  setGroups: React.Dispatch<React.SetStateAction<ChecklistGroup[]>>,
  questions: ChecklistQuestion[],
  setQuestions: React.Dispatch<React.SetStateAction<ChecklistQuestion[]>>
) {
  const handleAddGroup = useCallback(() => {
    const newGroup: ChecklistGroup = {
      id: `group-${Date.now()}`,
      title: "Novo Grupo",
      order: groups.length
    };
    
    setGroups(prevGroups => [...prevGroups, newGroup]);
  }, [groups, setGroups]);

  const handleUpdateGroup = useCallback((updatedGroup: ChecklistGroup) => {
    const index = groups.findIndex(g => g.id === updatedGroup.id);
    if (index === -1) return;
    
    setGroups(prevGroups => {
      const newGroups = [...prevGroups];
      newGroups[index] = updatedGroup;
      return newGroups;
    });
  }, [groups, setGroups]);

  const handleDeleteGroup = useCallback((groupId: string) => {
    if (groups.length <= 1) {
      toast.warning("É necessário pelo menos um grupo.");
      return;
    }
    
    const defaultGroup = groups[0].id !== groupId ? groups[0] : groups[1];
    
    setQuestions(prevQuestions => 
      prevQuestions.map(q => q.groupId === groupId ? { ...q, groupId: defaultGroup.id } : q)
    );
    
    setGroups(prevGroups => prevGroups.filter(g => g.id !== groupId));
  }, [groups, questions, setGroups, setQuestions]);

  const handleDragEnd = useCallback((result: any) => {
    const { destination, source, type } = result;
    
    if (!destination || (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )) {
      return;
    }
    
    if (type === "GROUP") {
      setGroups(prevGroups => {
        const reorderedGroups = [...prevGroups];
        const [removed] = reorderedGroups.splice(source.index, 1);
        reorderedGroups.splice(destination.index, 0, removed);
        
        return reorderedGroups.map((group, index) => ({
          ...group,
          order: index
        }));
      });
      return;
    }
    
    if (source.droppableId === destination.droppableId) {
      setQuestions(prevQuestions => {
        const groupQuestions = prevQuestions.filter(q => q.groupId === source.droppableId);
        const otherQuestions = prevQuestions.filter(q => q.groupId !== source.droppableId);
        
        const reorderedGroupQuestions = [...groupQuestions];
        const [removed] = reorderedGroupQuestions.splice(source.index, 1);
        reorderedGroupQuestions.splice(destination.index, 0, removed);
        
        const updatedGroupQuestions = reorderedGroupQuestions.map((question, index) => ({
          ...question,
          order: index
        }));
        
        return [...otherQuestions, ...updatedGroupQuestions];
      });
    } else {
      setQuestions(prevQuestions => {
        const sourceGroupQuestions = prevQuestions.filter(q => q.groupId === source.droppableId);
        const destGroupQuestions = prevQuestions.filter(q => q.groupId === destination.droppableId);
        const otherQuestions = prevQuestions.filter(
          q => q.groupId !== source.droppableId && q.groupId !== destination.droppableId
        );
        
        const questionToMove = sourceGroupQuestions[source.index];
        const updatedSourceQuestions = [...sourceGroupQuestions];
        updatedSourceQuestions.splice(source.index, 1);
        
        const updatedDestQuestions = [...destGroupQuestions];
        updatedDestQuestions.splice(destination.index, 0, {
          ...questionToMove,
          groupId: destination.droppableId
        });
        
        const finalSourceQuestions = updatedSourceQuestions.map((q, idx) => ({ ...q, order: idx }));
        const finalDestQuestions = updatedDestQuestions.map((q, idx) => ({ ...q, order: idx }));
        
        return [...otherQuestions, ...finalSourceQuestions, ...finalDestQuestions];
      });
    }
  }, [setGroups, setQuestions]);

  return {
    handleAddGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleDragEnd
  };
}
