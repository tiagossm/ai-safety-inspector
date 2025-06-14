
import { useEffect } from "react";
import { ChecklistWithStats, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { generateUUID, isValidUUID } from "@/utils/uuidValidation";

interface UseChecklistInitializationProps {
  checklist: ChecklistWithStats | null;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setCategory: (category: string) => void;
  setIsTemplate: (isTemplate: boolean) => void;
  setStatus: (status: "active" | "inactive") => void;
  setQuestions: (questions: ChecklistQuestion[]) => void;
  setGroups: (groups: ChecklistGroup[]) => void;
}

export function useChecklistInitialization({
  checklist,
  setTitle,
  setDescription,
  setCategory,
  setIsTemplate,
  setStatus,
  setQuestions,
  setGroups
}: UseChecklistInitializationProps) {
  useEffect(() => {
    if (checklist) {
      setTitle(checklist.title || "");
      setDescription(checklist.description || "");
      setCategory(checklist.category || "");
      setIsTemplate(checklist.isTemplate || false);
      
      const checklistStatus = checklist.status === "inactive" ? "inactive" : "active";
      setStatus(checklistStatus);
      
      if (checklist.questions && checklist.questions.length > 0) {
        let groupsToSet = (checklist.groups && checklist.groups.length > 0)
          ? checklist.groups.filter(g => g.id && isValidUUID(g.id))
          : [];
        
        let mainGroupId: string;

        if (groupsToSet.length === 0) {
          mainGroupId = generateUUID();
          groupsToSet.push({ id: mainGroupId, title: "Geral", order: 0 });
        } else {
          mainGroupId = groupsToSet.sort((a, b) => a.order - b.order)[0].id;
        }

        const questionsToSet = checklist.questions.map(q => ({
          ...q,
          groupId: (q.groupId && isValidUUID(q.groupId)) ? q.groupId : mainGroupId
        }));
        
        setQuestions(questionsToSet);
        setGroups(groupsToSet);
      } else {
        const newGroupId = generateUUID();
        const defaultGroup: ChecklistGroup = {
          id: newGroupId,
          title: "Geral",
          order: 0
        };
        
        const newQuestionId = `new-${Date.now()}`;
        const defaultQuestion: ChecklistQuestion = {
          id: newQuestionId,
          text: "",
          responseType: "yes_no",
          isRequired: true,
          weight: 1,
          allowsPhoto: false,
          allowsVideo: false, 
          allowsAudio: false,
          allowsFiles: false,
          order: 0,
          groupId: newGroupId,
          options: [],
          level: 0,
          path: newQuestionId,
          isConditional: false
        };
        
        setGroups([defaultGroup]);
        setQuestions([defaultQuestion]);
      }
    }
  }, [checklist, setTitle, setDescription, setCategory, setIsTemplate, setStatus, setQuestions, setGroups]);
}
