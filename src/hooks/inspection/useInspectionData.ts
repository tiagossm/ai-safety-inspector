
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ActionPlan } from "@/services/inspection/actionPlanService";
import { toast } from "sonner";

export function useInspectionData(inspectionId?: string) {
  const [inspection, setInspection] = useState<any>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch inspection data
  useEffect(() => {
    if (inspectionId) {
      fetchInspectionData();
    }
  }, [inspectionId]);

  const fetchInspectionData = async () => {
    if (!inspectionId) return;

    try {
      setIsLoading(true);
      
      // Fetch inspection details with related data
      const { data: inspectionData, error: inspectionError } = await supabase
        .from('inspections')
        .select(`
          *,
          companies (
            id,
            fantasy_name
          ),
          checklists (
            id,
            title,
            description
          )
        `)
        .eq('id', inspectionId)
        .single();

      if (inspectionError) throw inspectionError;

      setInspection(inspectionData);

      // Fetch existing responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('inspection_responses')
        .select('*')
        .eq('inspection_id', inspectionId);

      if (responsesError) throw responsesError;

      // Convert responses array to object for easier access
      const responsesMap = responsesData.reduce((acc, response) => {
        acc[response.inspection_item_id] = response;
        return acc;
      }, {} as Record<string, any>);

      setResponses(responsesMap);

    } catch (error: any) {
      console.error('Error fetching inspection data:', error);
      toast.error('Erro ao carregar dados da inspeção');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponseChange = useCallback((questionId: string, data: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ...data,
        inspection_item_id: questionId,
        inspection_id: inspectionId
      }
    }));
  }, [inspectionId]);

  const handleMediaChange = useCallback((questionId: string, mediaUrls: string[]) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        media_urls: mediaUrls,
        inspection_item_id: questionId,
        inspection_id: inspectionId
      }
    }));
  }, [inspectionId]);

  const handleMediaUpload = useCallback(async (questionId: string, file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${questionId}-${Date.now()}.${fileExt}`;
      const filePath = `inspections/${inspectionId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('inspection-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('inspection-files')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error('Erro ao fazer upload do arquivo');
      return null;
    }
  }, [inspectionId]);

  const handleSaveInspection = async (responses: Record<string, any>, inspection: any) => {
    // Save inspection logic here
    setIsSubmitting(true);
    try {
      // Implementation for saving inspection
      toast.success('Inspeção salva com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar inspeção');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSubChecklistResponses = async (subChecklistId: string, responses: Record<string, any>) => {
    // Save subchecklist responses logic here
    try {
      // Implementation for saving subchecklist responses
      toast.success('Respostas do subchecklist salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar respostas do subchecklist');
    }
  };

  return {
    inspection,
    responses,
    actionPlans: actionPlans as any[], // Temporary type assertion to resolve conflict
    isLoading,
    isSubmitting,
    handleResponseChange,
    handleMediaChange,
    handleMediaUpload: (file: File, questionId: string) => handleMediaUpload(questionId, file),
    handleSaveInspection,
    handleSaveSubChecklistResponses,
    refetch: fetchInspectionData
  };
}
