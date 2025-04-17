
import React, { useEffect, useState } from "react";
import { ChecklistEditor } from "@/components/checklists/ChecklistEditor";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useChecklistById } from "@/hooks/checklist/useChecklistById";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewInspectionPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorData, setEditorData] = useState<any>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checklistId = searchParams.get("checklistId") || "";
  const checklistQuery = useChecklistById(checklistId);

  useEffect(() => {
    const loadChecklistData = async () => {
      if (!checklistId) {
        setError("ID do checklist não fornecido na URL. Use o formato /inspections/new?checklistId=ID");
        setLoading(false);
        return;
      }

      if (checklistQuery.isLoading) {
        setLoading(true);
        return;
      }

      if (checklistQuery.error) {
        console.error("Erro ao carregar checklist:", checklistQuery.error);
        setError(`Erro ao carregar checklist: ${checklistQuery.error}`);
        setLoading(false);
        return;
      }

      if (checklistQuery.data) {
        const checklist = checklistQuery.data;
        const groupIdBase = `group-default-${Date.now()}`;
        
        // Use o hook useChecklistById diretamente para obter os dados
        const groups = checklist.groups?.length
          ? checklist.groups.map(group => ({
              ...group,
              questions: checklist.questions.filter(q => q.groupId === group.id).map(q => ({
                ...q,
                type: q.responseType,
                required: q.isRequired,
                allowPhoto: q.allowsPhoto,
                allowVideo: q.allowsVideo,
                allowAudio: q.allowsAudio,
                parentId: q.parentQuestionId,
                groupId: q.groupId
              }))
            }))
          : [{
              id: groupIdBase,
              title: "Geral",
              questions: checklist.questions.map(q => ({
                ...q,
                type: q.responseType,
                required: q.isRequired,
                allowPhoto: q.allowsPhoto,
                allowVideo: q.allowsVideo,
                allowAudio: q.allowsAudio,
                parentId: q.parentQuestionId,
                groupId: groupIdBase
              }))
            }];

        setEditorData({
          checklistData: checklist,
          questions: checklist.questions,
          groups,
          mode: "inspection"
        });
        setLoading(false);
      } else {
        setError("Não foi possível encontrar o checklist especificado");
        setLoading(false);
      }
    };

    loadChecklistData();
  }, [checklistId, checklistQuery]);

  const handleSave = (checklistId: string) => {
    // Redirecione para a página de início da inspeção com o ID do checklist
    navigate(`/inspections/start/${checklistId}`);
  };

  const handleCancel = () => {
    navigate("/checklists");
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-pulse mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <div className="w-6 h-6 rounded-full bg-primary/40"></div>
        </div>
        <p className="text-muted-foreground">Carregando checklist...</p>
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
              <Button variant="outline" onClick={() => navigate("/checklists")} className="text-sm">
                Voltar para Checklists
              </Button>
              <Button variant="default" onClick={() => window.location.reload()} className="text-sm">
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
        <Button onClick={() => navigate("/checklists")} className="mx-auto">
          Voltar para Checklists
        </Button>
      </div>
    );
  }

  // Redirecionar diretamente para a página de início de inspeção
  if (checklistId) {
    navigate(`/inspections/start/${checklistId}`);
    return null;
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
