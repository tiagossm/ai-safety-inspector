
import React, { useEffect, useState } from "react";
import { ChecklistEditor } from "@/components/checklists/ChecklistEditor";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChecklistEditorPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        setError("Nenhum dado de checklist encontrado em armazenamento temporário");
        setLoading(false);
        return;
      }
      
      try {
        const parsedData = JSON.parse(storedData);
        console.log("Loaded editor data from session storage:", parsedData);
        
        if (!parsedData.checklistData) {
          console.error("Invalid editor data: missing checklistData");
          setError("Dados do checklist inválidos: faltando dados principais");
          setLoading(false);
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
          console.log(`Total questions from session storage: ${parsedData.questions.length}`);
          
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
            questionGroups = Array.from(groupMap.entries()).map(([groupId, questions], index) => ({
              id: groupId === "default" ? `group-default-${Date.now()}` : groupId,
              title: groupId === "default" ? "Geral" : `Grupo ${index + 1}`,
              questions
            }));
          } else {
            // If no groupIds, create a default group with all questions
            questionGroups = [{
              id: `group-default-${Date.now()}`,
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
                      (q.type === "múltipla escolha" ? ["Opção 1", "Opção 2"] : []),
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
        
        setLoading(false);
      } catch (error: any) {
        console.error("Error parsing editor data:", error);
        setError(`Erro ao carregar dados do checklist: ${error.message || 'Erro desconhecido'}`);
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
        setError(`Erro ao carregar checklist: ${
          typeof checklistQuery.error === 'object' && checklistQuery.error !== null 
            ? (checklistQuery.error as any).message || JSON.stringify(checklistQuery.error) 
            : String(checklistQuery.error)
        }`);
        setLoading(false);
        return;
      }
      
      if (checklistQuery.data) {
        console.log("Loaded existing checklist data:", checklistQuery.data);
        
        const checklist = checklistQuery.data;
        console.log(`Checklist has ${checklist.questions?.length || 0} questions`);
        
        // Organize questions into groups if they exist
        let groups = [];
        
        if (checklist.groups && checklist.groups.length > 0) {
          // When we have defined groups, map questions to their groups
          groups = checklist.groups.map(group => {
            // Filter questions that belong to this group
            const groupQuestions = checklist.questions.filter(q => q.groupId === group.id);
            console.log(`Group ${group.id} (${group.title}) has ${groupQuestions.length} questions`);
            
            return {
              ...group,
              questions: groupQuestions.map(q => ({
                id: q.id, // Keep original ID
                text: q.text,
                type: q.responseType,
                required: q.isRequired,
                allowPhoto: q.allowsPhoto,
                allowVideo: q.allowsVideo,
                allowAudio: q.allowsAudio,
                options: q.options,
                hint: q.hint,
                weight: q.weight,
                parentId: q.parentQuestionId,
                conditionValue: q.conditionValue,
                groupId: q.groupId
              }))
            };
          });
        } else {
          // If no groups defined, create a default group with all questions
          const defaultGroupId = `group-default-${Date.now()}`;
          groups = [{
            id: defaultGroupId,
            title: "Geral",
            questions: checklist.questions.map(q => ({
              id: q.id, // Keep original ID
              text: q.text,
              type: q.responseType,
              required: q.isRequired,
              allowPhoto: q.allowsPhoto,
              allowVideo: q.allowsVideo,
              allowAudio: q.allowsAudio,
              options: q.options,
              hint: q.hint,
              weight: q.weight,
              parentId: q.parentQuestionId,
              conditionValue: q.conditionValue,
              groupId: defaultGroupId
            }))
          }];
        }
        
        // Convert questions to the editor format (for flat view)
        const questions = checklist.questions.map(q => ({
          id: q.id, // Keep original ID
          text: q.text,
          type: q.responseType,
          required: q.isRequired,
          allowPhoto: q.allowsPhoto,
          allowVideo: q.allowsVideo,
          allowAudio: q.allowsAudio,
          options: q.options,
          hint: q.hint,
          weight: q.weight,
          parentId: q.parentQuestionId,
          conditionValue: q.conditionValue,
          groupId: q.groupId || groups[0]?.id
        }));
        
        console.log(`Prepared ${questions.length} questions for the editor`);
        console.log(`Prepared ${groups.length} groups with a total of ${groups.reduce((sum, g) => sum + g.questions.length, 0)} questions`);
        
        setEditorData({
          checklistData: checklist,
          questions,
          groups,
          mode: "edit"
        });
        setLoading(false);
      }
    }
  }, [navigate, id, checklistQuery.isLoading, checklistQuery.error, checklistQuery.data, isEditorMode]);

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
    return (
      <div className="py-20 text-center">
        <div className="animate-pulse mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <div className="w-6 h-6 rounded-full bg-primary/40"></div>
        </div>
        <p className="text-muted-foreground">Carregando editor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 max-w-3xl mx-auto px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-base font-medium">Erro ao carregar checklist</AlertTitle>
          <AlertDescription className="mt-2">
            <p>{error}</p>
            <div className="flex space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/checklists")}
                className="text-sm"
              >
                Voltar para Checklists
              </Button>
              <Button 
                variant="default" 
                onClick={() => window.location.reload()}
                className="text-sm"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!editorData) {
    return (
      <div className="py-20 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Nenhum dado encontrado</h2>
        <p className="text-muted-foreground mb-6">Não foi possível carregar os dados do checklist</p>
        <Button 
          onClick={() => navigate("/checklists")}
          className="mx-auto"
        >
          Voltar para Checklists
        </Button>
      </div>
    );
  }

  return (
    <ChecklistEditor
      initialChecklist={editorData.checklistData}
      initialQuestions={editorData.questions || []}
      initialGroups={editorData.groups || []}
      mode={editorData.mode || "create"}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
