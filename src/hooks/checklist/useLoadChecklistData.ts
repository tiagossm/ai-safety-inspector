import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { v4 as uuidv4 } from "uuid";

export function useLoadChecklistData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorData, setEditorData] = useState<any>(null);
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
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

          const groupIdBase = uuidv4();
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
                id: groupIdBase,
                title: "Geral",
                questions: questions.map((q: any) => ({
                  ...q,
                  groupId: groupIdBase
                }))
              }];

          setEditorData({ ...parsedData, groups: questionGroups });
          setLoading(false);
        } catch (err: any) {
          setError(`Erro ao carregar dados do checklist: ${err.message || "Erro desconhecido"}`);
          setLoading(false);
        }
      } else {
        if (checklistQuery.loading) {
          setLoading(true);
          return;
        }

        if (checklistQuery.error) {
          setError(`Erro ao carregar checklist: ${checklistQuery.error instanceof Error ? checklistQuery.error.message : String(checklistQuery.error)}`);
          setLoading(false);
          return;
        }

        if (checklistQuery.checklist) {
          const checklist = checklistQuery.checklist;
          const groupIdBase = uuidv4();
          
          // Process groups and questions from the normalized checklist data
          const groups = checklistQuery.groups?.length
            ? checklistQuery.groups.map(group => ({
                ...group,
                questions: checklistQuery.questions
                  .filter(q => q.groupId === group.id)
                  .map(q => ({
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
                questions: (checklistQuery.questions || []).map(q => ({
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

          // Adicione logs para depuração
          console.log("Checklist para edição:", checklist);
          console.log("Groups para edição:", groups);

          setEditorData({
            checklistData: checklist,
            questions: checklistQuery.questions || [],
            groups,
            mode: "edit"
          });
          setLoading(false);
        }
      }
    };

    loadChecklistData();
  }, [id, isEditorMode, checklistQuery]);

  return { loading, error, editorData };
}
