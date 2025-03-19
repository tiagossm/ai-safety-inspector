
import React, { useEffect, useState } from "react";
import { ChecklistEditor } from "@/components/checklists/ChecklistEditor";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function ChecklistEditorPage() {
  const [loading, setLoading] = useState(true);
  const [editorData, setEditorData] = useState<any>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  useEffect(() => {
    // Special case for the editor route
    if (id === "editor") {
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
        
        setEditorData(parsedData);
      } catch (error) {
        console.error("Error parsing editor data:", error);
        toast.error("Erro ao carregar dados do checklist");
        navigate('/checklists');
      } finally {
        setLoading(false);
      }
    } else {
      // For non-editor routes, we should use a different approach
      // This would be for editing existing checklists
      // For now, redirect to checklists page if not the special "editor" route
      if (id !== "editor") {
        navigate('/checklists');
      }
    }
  }, [navigate, id]);

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
      mode={editorData.mode}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
