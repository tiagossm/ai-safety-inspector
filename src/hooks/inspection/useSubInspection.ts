import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { handleInspectionError } from "@/utils/inspection/errorHandling";
import { validateCreateInspection } from "@/validation/inspectionValidation";
import { Inspection } from "@/types/inspection";

/**
 * Interface para retorno do hook
 */
interface UseSubInspectionReturn {
  isCreating: boolean;
  isLoading: boolean;
  error: any;
  subInspectionId: string | null;
  fetchSubInspection: (parentInspectionId: string) => Promise<void>;
  createSubInspection: (
    title: string,
    parentInspection: any,
    parentQuestionId: string
  ) => Promise<string | null>;
  removeSubInspection: () => Promise<boolean>;
}

/**
 * Hook para gerenciar sub-inspeções
 * @param parentQuestionId ID da pergunta pai
 * @returns Objeto com dados e funções para manipular sub-inspeções
 */
export function useSubInspection(parentQuestionId: string): UseSubInspectionReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [subInspectionId, setSubInspectionId] = useState<string | null>(null);

  /**
   * Busca a sub-inspeção associada à pergunta pai
   * @param parentInspectionId ID da inspeção pai
   */
  const fetchSubInspection = useCallback(async (parentInspectionId: string) => {
    if (!parentQuestionId || !parentInspectionId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Buscar a relação entre pergunta e sub-inspeção
      const { data, error } = await supabase
        .from("inspection_sub_relations")
        .select("sub_inspection_id")
        .eq("parent_inspection_id", parentInspectionId)
        .eq("parent_question_id", parentQuestionId)
        .single();

      if (error) throw error;

      if (data && data.sub_inspection_id) {
        setSubInspectionId(data.sub_inspection_id);
      } else {
        setSubInspectionId(null);
      }
    } catch (err) {
      console.error("Erro ao buscar sub-inspeção:", err);
      setError(err);
      setSubInspectionId(null);
    } finally {
      setIsLoading(false);
    }
  }, [parentQuestionId]);

  /**
   * Cria uma nova sub-inspeção
   * @param title Título da sub-inspeção
   * @param parentInspection Inspeção pai
   * @param parentQuestionId ID da pergunta pai
   * @returns ID da sub-inspeção criada
   */
  const createSubInspection = useCallback(async (
    title: string,
    parentInspection: any,
    parentQuestionId: string
  ): Promise<string | null> => {
    if (!parentInspection || !parentQuestionId) {
      toast.error("Dados insuficientes para criar sub-inspeção");
      return null;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Gerar ID para a nova inspeção
      const newSubInspectionId = uuidv4();

      // Preparar dados da sub-inspeção
      const subInspectionData = {
        id: newSubInspectionId,
        title: title || `Sub-inspeção de ${parentInspection.title || 'Inspeção'}`,
        checklist_id: parentInspection.checklist_id,
        company_id: parentInspection.company_id,
        responsible_id: parentInspection.responsible_id,
        responsible_ids: parentInspection.responsible_ids,
        scheduled_date: parentInspection.scheduled_date,
        location: parentInspection.location,
        status: "pending",
        priority: parentInspection.priority,
        inspection_type: parentInspection.inspection_type,
        metadata: {
          parent_inspection_id: parentInspection.id,
          parent_question_id: parentQuestionId,
          is_sub_inspection: true,
          ...((typeof parentInspection.metadata === 'object') ? parentInspection.metadata : {})
        }
      };

      // Validar dados
      const validation = validateCreateInspection(subInspectionData);
      if (!validation.valid) {
        throw new Error("Dados de sub-inspeção inválidos");
      }

      // Criar a sub-inspeção
      const { data: inspection, error: inspectionError } = await supabase
        .from("inspections")
        .insert(subInspectionData)
        .select()
        .single();

      if (inspectionError) throw inspectionError;

      // Criar relação entre pergunta pai e sub-inspeção
      const { error: relationError } = await supabase
        .from("inspection_sub_relations")
        .insert({
          parent_inspection_id: parentInspection.id,
          parent_question_id: parentQuestionId,
          sub_inspection_id: newSubInspectionId
        });

      if (relationError) throw relationError;

      // Atualizar estado
      setSubInspectionId(newSubInspectionId);
      toast.success("Sub-inspeção criada com sucesso");

      return newSubInspectionId;
    } catch (err) {
      const error = handleInspectionError(err, "createSubInspection");
      setError(error);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  /**
   * Remove a sub-inspeção
   * @returns true se removida com sucesso
   */
  const removeSubInspection = useCallback(async (): Promise<boolean> => {
    if (!subInspectionId) {
      toast.error("Nenhuma sub-inspeção para remover");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Remover relação
      const { error: relationError } = await supabase
        .from("inspection_sub_relations")
        .delete()
        .eq("sub_inspection_id", subInspectionId);

      if (relationError) throw relationError;

      // Remover inspeção
      const { error: inspectionError } = await supabase
        .from("inspections")
        .delete()
        .eq("id", subInspectionId);

      if (inspectionError) throw inspectionError;

      // Atualizar estado
      setSubInspectionId(null);
      toast.success("Sub-inspeção removida com sucesso");

      return true;
    } catch (err) {
      const error = handleInspectionError(err, "removeSubInspection");
      setError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [subInspectionId]);

  return {
    isCreating,
    isLoading,
    error,
    subInspectionId,
    fetchSubInspection,
    createSubInspection,
    removeSubInspection
  };
}

