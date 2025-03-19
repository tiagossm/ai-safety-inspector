
import React, { useEffect, useState } from "react";
import { ChecklistEditor } from "@/components/checklists/ChecklistEditor";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useChecklistById } from "@/hooks/checklist/useChecklistById";

export default function ChecklistEditorPage() {
  const [loading, setLoading] = useState(true);
  const [editorData, setEditorData] = useState<any>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditorMode = id === "editor";
  const checklistQuery = useChecklistById(isEditorMode ? "" : id || "");

  useEffect(() => {
    // Special case for the editor route
    if (isEditorMode) {
      // Get the editor data from sessionStorage
      const storedData = sessionStorage.getItem('checklistEditorData');
      
      if (!storedData) {
        console.error("No checklist editor data found in session storage");
        toast.error("Nenhum dado de checklist encontrado");
        navigate('/checklists');
        return;
      }
      
      try {
        const parsedData = JSON.parse(storedData);
        console.log("Loaded editor data from session storage:", parsedData);
        
        if (!parsedData.checklistData) {
          console.error("Invalid editor data: missing checklistData");
          toast.error("Dados do checklist inválidos");
          navigate('/checklists');
          return;
        }
        
        // Process the data to create groups if they exist
        let questionGroups: any[] = [];
        
        // If groups came from AI, use them
        if (parsedData.groups && Array.isArray(parsedData.groups)) {
          questionGroups = parsedData.groups;
        } 
        // Otherwise, if we have questions with groupIds, organize them into groups
        else if (parsedData.questions && Array.isArray(parsedData.questions)) {
          // Check if questions have groupIds
          const hasGroupIds = parsedData.questions.some((q: any) => q.groupId);
          
          if (hasGroupIds) {
            // Group the questions by groupId
            const groupMap = new Map<string, any[]>();
            
            parsedData.questions.forEach((question: any) => {
              const groupId = question.groupId || "default";
              if (!groupMap.has(groupId)) {
                groupMap.set(groupId, []);
              }
              groupMap.get(groupId)!.push(question);
            });
            
            // Convert the map to an array of group objects
            questionGroups = Array.from(groupMap.entries()).map(([groupId, questions]) => ({
              id: groupId,
              title: groupId === "default" ? "Geral" : `Grupo ${groupId.split('-')[1] || ''}`,
              questions
            }));
          } else {
            // If no groupIds, create a default group with all questions
            questionGroups = [{
              id: "group-default",
              title: "Geral",
              questions: parsedData.questions
            }];
          }
        }
        
        // Validate and normalize questions to ensure they have all required fields
        if (questionGroups.length > 0) {
          questionGroups = questionGroups.map(group => ({
            ...group,
            questions: group.questions.map((q: any) => ({
              text: q.text || "",
              type: q.type || "sim/não",
              required: q.required !== undefined ? q.required : true,
              allowPhoto: q.allowPhoto || false,
              allowVideo: q.allowVideo || false,
              allowAudio: q.allowAudio || false,
              options: Array.isArray(q.options) ? q.options : 
                      (q.type === "múltipla escolha" ? ["Opção 1", "Opção 2"] : undefined),
              hint: q.hint || "",
              weight: q.weight || 1,
              parentId: q.parentId || null,
              conditionValue: q.conditionValue || null,
              groupId: group.id
            }))
          }));
        }
        
        // Update the editorData with groups
        setEditorData({
          ...parsedData,
          groups: questionGroups
        });
      } catch (error) {
        console.error("Error parsing editor data:", error);
        toast.error("Erro ao carregar dados do checklist");
        navigate('/checklists');
      } finally {
        setLoading(false);
      }
    } else {
      // For editing existing checklists
      if (checklistQuery.isLoading) {
        setLoading(true);
        return;
      }
      
      if (checklistQuery.error) {
        console.error("Error fetching checklist:", checklistQuery.error);
        toast.error("Erro ao carregar checklist");
        navigate('/checklists');
        return;
      }
      
      if (checklistQuery.data) {
        // TODO: Fetch checklist items and organize them into groups
        setEditorData({
          checklistData: checklistQuery.data,
          questions: [],
          groups: [],
          mode: "edit"
        });
        setLoading(false);
      }
    }
  }, [navigate, id, checklistQuery.isLoading, checklistQuery.error, checklistQuery.data]);

  const handleSave = (checklistId: string) => {
    // Clear the stored data
    console.log("Checklist saved successfully with ID:", checklistId);
    sessionStorage.removeItem('checklistEditorData');
    
    // Redirect to the checklist details
    navigate(`/checklists/${checklistId}`);
  };

  const handleCancel = () => {
    // Clear the stored data
    console.log("Checklist editing cancelled");
    sessionStorage.removeItem('checklistEditorData');
    
    // Redirect to the checklists page
    navigate('/checklists');
  };

  if (loading) {
    return <div className="py-20 text-center">Carregando editor...</div>;
  }

  if (!editorData) {
    return <div className="py-20 text-center">Nenhum dado encontrado</div>;
  }

  return (
    <ChecklistEditor
      initialChecklist={editorData.checklistData}
      initialQuestions={editorData.questions}
      initialGroups={editorData.groups}
      mode={editorData.mode}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
