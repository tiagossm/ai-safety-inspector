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
    const loadChecklistData = async () => {
      if (isEditorMode) {
        const storedData = sessionStorage.getItem("checklistEditorData");

        if (!storedData) {
          setError("Nenhum dado de checklist encontrado em armazenamento temporário");
          setLoading(false);
          return;
        }

        try {
          const parsedData = JSON.parse(storedData);
          const { checklistData, questions = [], groups = [] } = parsedData;

          if (!checklistData) {
            setError("Dados do checklist inválidos: faltando dados principais");
            setLoading(false);
            return;
          }

          const questionGroups = groups.length > 0
            ? groups.map(group => ({
                ...group,
                questions: (group.questions || []).map((q: any) => ({
                  ...q,
                  text: q.text || "",
                  type: q.type || "sim/não",
                  required: q.required !== undefined ? q.required : true,
                  allowPhoto: q.allowPhoto || false,
                  allowVideo: q.allowVideo || false,
                  allowAudio: q.allowAudio || false,
                  options: Array.isArray(q.options) ? q.options : (q.type === "múltipla escolha" ? ["Opção 1", "Opção 2"] : []),
                  hint: q.hint || "",
                  weight: q.weight || 1,
                  parentId: q.parentId || null,
                  conditionValue: q.conditionValue || null,
                  groupId: group.id
                }))
              }))
            : [{
                id: `group-default-${Date.now()}`,
                title: "Geral",
                questions: questions.map((q: any) => ({
                  ...q,
                  groupId: `group-default-${Date.now()}`
                }))
              }];

          setEditorData({ ...parsedData, groups: questionGroups });
          setLoading(false);
        } catch (err: any) {
          setError(`Erro ao carregar dados do checklist: ${err.message || "Erro desconhecido"}`);
          setLoading(false);
        }
      } else {
        if (checklistQuery.isLoading) {
          setLoading(true);
          return;
        }

        if (checklistQuery.error) {
          setError(`Erro ao carregar checklist: ${checklistQuery.error}`);
          setLoading(false);
          return;
        }

        if (checklistQuery.data) {
          const checklist = checklistQuery.data;
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
                id: `group-default-${Date.now()}`,
                title: "Geral",
                questions: checklist.questions.map(q => ({
                  ...q,
                  type: q.responseType,
                  required: q.isRequired,
                  allowPhoto: q.allowsPhoto,
                  allowVideo: q.allowsVideo,
                  allowAudio: q.allowsAudio,
                  parentId: q.parentQuestionId,
                  groupId: `group-default-${Date.now()}`
                }))
              }];

          setEditorData({
            checklistData: checklist,
            questions: checklist.questions,
            groups,
            mode: "edit"
          });
          setLoading(false);
        }
      }
    };

    loadChecklistData();
  }, [id, isEditorMode, checklistQuery]);

  const handleSave = (checklistId: string) => {
    sessionStorage.removeItem("checklistEditorData");
    if (isEditorMode) {
      navigate(`/checklists/${checklistId}/edit`);
    } else {
      toast.success("Checklist atualizado com sucesso!");
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem("checklistEditorData");
    navigate("/checklists");
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

