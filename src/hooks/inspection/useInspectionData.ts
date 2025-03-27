import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { InspectionDetails } from '@/types/newChecklist';

export const useInspectionData = (inspectionId: string | undefined) => {
  const [loading, setLoading] = useState(true);
  const [inspection, setInspection] = useState<InspectionDetails | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [groups, setGroups] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [responsible, setResponsible] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!inspectionId) return;

    const fetchInspectionData = async () => {
      setLoading(true);
      try {
        const { data: inspectionData, error: inspectionError } = await supabase
          .from('inspections')
          .select(`
            id,
            checklist_id,
            status,
            company_id,
            user_id,
            responsible_id,
            scheduled_date,
            location,
            priority,
            inspection_type,
            cnae,
            metadata,
            created_at,
            approval_status,
            approved_by,
            approval_notes,
            audio_url,
            photos,
            report_url,
            unit_id,
            sync_status,
            checklist:checklists (
              title,
              description
            )
          `)
          .eq('id', inspectionId)
          .single();

        if (inspectionError) throw inspectionError;
        if (!inspectionData) throw new Error('Inspeção não encontrada');

        let parsedMetadata: Record<string, any> = {};
        if (inspectionData.metadata) {
          try {
            parsedMetadata = typeof inspectionData.metadata === 'string'
              ? JSON.parse(inspectionData.metadata)
              : inspectionData.metadata;
          } catch (e) {
            console.error('Erro ao parsear metadata:', e);
          }
        }

        const formattedInspection: InspectionDetails = {
          id: inspectionData.id,
          title: inspectionData.checklist?.title || 'Sem título',
          description: inspectionData.checklist?.description,
          checklistId: inspectionData.checklist_id,
          companyId: inspectionData.company_id,
          responsibleId: inspectionData.responsible_id,
          scheduledDate: inspectionData.scheduled_date,
          status: inspectionData.status as 'pending' | 'in_progress' | 'completed',
          createdAt: inspectionData.created_at,
          updatedAt: inspectionData.created_at,
          priority: (inspectionData.priority || 'medium') as 'low' | 'medium' | 'high',
          locationName: inspectionData.location,
          checklist: inspectionData.checklist,
          approval_notes: inspectionData.approval_notes,
          approval_status: inspectionData.approval_status,
          approved_by: inspectionData.approved_by,
          audio_url: inspectionData.audio_url,
          photos: inspectionData.photos || [],
          report_url: inspectionData.report_url,
          unit_id: inspectionData.unit_id,
          metadata: parsedMetadata,
          cnae: inspectionData.cnae,
          inspection_type: inspectionData.inspection_type,
          sync_status: inspectionData.sync_status
        };

        setInspection(formattedInspection);

        const { data: questionsData, error: questionsError } = await supabase
          .from('checklist_itens')
          .select('*')
          .eq('checklist_id', inspectionData.checklist_id)
          .order('ordem', { ascending: true });

        if (questionsError) throw questionsError;

        const groupMap = new Map();
        const formattedQuestions = questionsData.map((q: any) => {
          let groupId: string | undefined;
          let groupTitle: string | undefined;

          if (q.hint && q.hint.includes('groupId')) {
            try {
              const groupInfo = JSON.parse(q.hint);
              groupId = groupInfo.groupId;
              groupTitle = groupInfo.groupTitle;

              if (groupId && !groupMap.has(groupId)) {
                groupMap.set(groupId, {
                  id: groupId,
                  title: groupTitle || `Grupo ${groupMap.size + 1}`
                });
              }
            } catch (e) {
              console.error('Erro ao parsear hint:', e);
            }
          }

          return {
            id: q.id,
            text: q.pergunta,
            responseType: q.tipo_resposta,
            isRequired: q.obrigatorio,
            options: q.opcoes || [],
            order: q.ordem,
            groupId: groupId,
            conditionValue: q.condition_value,
            parentQuestionId: q.parent_item_id,
            allowsPhoto: q.permite_foto,
            allowsVideo: q.permite_video,
            allowsAudio: q.permite_audio,
            hint: q.hint,
            weight: q.weight || 1,
            hasSubChecklist: !!q.sub_checklist_id,
            subChecklistId: q.sub_checklist_id
          };
        });

        setQuestions(formattedQuestions);
        setGroups(Array.from(groupMap.values()));

        const { data: responsesData, error: responsesError } = await supabase
          .from('inspection_responses')
          .select('*')
          .eq('inspection_id', inspectionId);

        if (responsesError) throw responsesError;

        const responsesMap: Record<string, any> = {};
        responsesData.forEach((r: any) => {
          responsesMap[r.question_id] = {
            value: r.answer,
            comment: r.notes,
            actionPlan: r.action_plan,
            mediaUrls: r.media_urls || [],
            completedAt: r.completed_at
          };
        });

        setResponses(responsesMap);

        if (inspectionData.company_id) {
          const { data: companyData } = await supabase
            .from('companies')
            .select('id, name, cnpj')
            .eq('id', inspectionData.company_id)
            .single();

          setCompany(companyData);
        }

        if (inspectionData.responsible_id) {
          const { data: userData } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('id', inspectionData.responsible_id)
            .single();

          setResponsible(userData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados da inspeção:', error);
        toast.error('Erro ao carregar dados da inspeção');
      } finally {
        setLoading(false);
      }
    };

    fetchInspectionData();
  }, [inspectionId]);

  const handleResponseChange = (questionId: string, responseData: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ...responseData,
        completedAt: new Date().toISOString()
      }
    }));
  };

  const handleSaveInspection = async () => {
    if (!inspection || !inspectionId) return;

    setSaving(true);
    try {
      const responsesToSave = Object.entries(responses).map(([questionId, data]) => ({
        inspection_id: inspectionId,
        question_id: questionId,
        answer: data.value,
        notes: data.comment,
        action_plan: data.actionPlan,
        media_urls: data.mediaUrls || [],
        completed_at: data.completedAt
      }));

      for (const responseData of responsesToSave) {
        const { error } = await supabase
          .from('inspection_responses')
          .upsert(responseData, {
            onConflict: 'inspection_id,question_id'
          });

        if (error) throw error;
      }

      if (responsesToSave.length > 0 && inspection.status === 'pending') {
        await supabase
          .from('inspections')
          .update({ status: 'Em Andamento' }) // traduzido
          .eq('id', inspectionId);
      }

      toast.success('Respostas salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar inspeção:', error);
      toast.error('Erro ao salvar respostas');
    } finally {
      setSaving(false);
    }
  };

  const mapStatusToDB = (status: string): string => {
    const map: Record<string, string> = {
      pending: 'Pendente',
      in_progress: 'Em Andamento',
      completed: 'Concluído'
    };
    return map[status] || 'Pendente';
  };

  const completeInspection = async () => {
    if (!inspection || !inspectionId) return;

    setSaving(true);
    try {
      const totalRequired = questions.filter(q => q.isRequired).length;
      const answeredRequired = questions.filter(
        q =>
          q.isRequired &&
          responses[q.id] &&
          responses[q.id].value !== undefined &&
          responses[q.id].value !== null &&
          responses[q.id].value !== ''
      ).length;

      if (answeredRequired < totalRequired) {
        toast.warning(`Faltam ${totalRequired - answeredRequired} perguntas obrigatórias.`);
        return;
      }

      const { error } = await supabase
        .from('inspections')
        .update({
          status: mapStatusToDB('completed'),
          updated_at: new Date().toISOString()
        })
        .eq('id', inspectionId);

      if (error) throw error;

      setInspection(prev => prev ? { ...prev, status: 'completed' } : null);
      toast.success('Inspeção finalizada com sucesso!');
    } catch (err) {
      console.error('Erro na finalização:', err);
      toast.error('Erro ao finalizar inspeção');
    } finally {
      setSaving(false);
    }
  };

  const getFilteredQuestions = (groupId: string | null) => {
    return groupId
      ? questions.filter(q => q.groupId === groupId)
      : questions.filter(q => !q.groupId);
  };

  const getCompletionStats = () => {
    const total = questions.length;
    const answered = Object.values(responses).filter(r => r.value !== undefined && r.value !== null && r.value !== '').length;
    const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;
    return { total, answered, percentage };
  };

  return {
    loading,
    inspection,
    questions,
    responses,
    groups,
    company,
    responsible,
    saving,
    handleResponseChange,
    handleSaveInspection,
    completeInspection,
    getFilteredQuestions,
    getCompletionStats
  };
};
