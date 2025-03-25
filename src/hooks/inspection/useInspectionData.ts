
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
        // Fetch inspection details
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
            updated_at,
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
              description,
              total_questions
            )
          `)
          .eq('id', inspectionId)
          .single();
      
        if (inspectionError) throw inspectionError;
        
        console.log('Inspection data:', inspectionData);
        
        if (!inspectionData) {
          throw new Error('Inspeção não encontrada');
        }
        
        const formattedInspection: InspectionDetails = {
          id: inspectionData.id,
          title: inspectionData.checklist.title || 'Sem título',
          description: inspectionData.checklist.description,
          checklistId: inspectionData.checklist_id,
          companyId: inspectionData.company_id,
          responsibleId: inspectionData.responsible_id,
          scheduledDate: inspectionData.scheduled_date,
          status: inspectionData.status || 'pending',
          createdAt: inspectionData.created_at,
          updatedAt: inspectionData.updated_at || inspectionData.created_at,
          priority: inspectionData.priority || 'medium',
          locationName: inspectionData.location,
          checklist: inspectionData.checklist,
          // Additional fields to match database schema
          approval_notes: inspectionData.approval_notes,
          approval_status: inspectionData.approval_status,
          approved_by: inspectionData.approved_by,
          audio_url: inspectionData.audio_url,
          photos: inspectionData.photos || [],
          report_url: inspectionData.report_url,
          unit_id: inspectionData.unit_id,
          metadata: inspectionData.metadata,
          cnae: inspectionData.cnae,
          inspection_type: inspectionData.inspection_type,
          sync_status: inspectionData.sync_status
        };
        
        setInspection(formattedInspection);
        
        // Fetch checklist questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('checklist_itens')
          .select('*')
          .eq('checklist_id', inspectionData.checklist_id)
          .order('ordem', { ascending: true });
        
        if (questionsError) throw questionsError;
        
        console.log('Questions data:', questionsData);
        
        // Group info from the question hint field
        const groupMap = new Map();
        const formattedQuestions = questionsData.map((q: any) => {
          let groupId: string | undefined;
          let groupTitle: string | undefined;
          
          // Check if hint contains group info
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
              console.error('Error parsing group info from hint:', e);
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
        
        // Fetch responses for this inspection
        const { data: responsesData, error: responsesError } = await supabase
          .from('inspection_responses')
          .select('*')
          .eq('inspection_id', inspectionId);
        
        if (responsesError) throw responsesError;
        
        console.log('Responses data:', responsesData);
        
        // Format responses into a map of question_id -> response data
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
        
        // Fetch company info if companyId exists
        if (inspectionData.company_id) {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('id, name, cnpj')
            .eq('id', inspectionData.company_id)
            .single();
          
          if (!companyError && companyData) {
            setCompany(companyData);
          }
        }
        
        // Fetch responsible user info if responsibleId exists
        if (inspectionData.responsible_id) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('id', inspectionData.responsible_id)
            .single();
          
          if (!userError && userData) {
            setResponsible(userData);
          }
        }
      } catch (error) {
        console.error('Error fetching inspection data:', error);
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
      
      // For each response, upsert into the database
      for (const responseData of responsesToSave) {
        const { error } = await supabase
          .from('inspection_responses')
          .upsert(responseData, {
            onConflict: 'inspection_id,question_id'
          });
        
        if (error) {
          console.error('Error saving response:', error);
          throw error;
        }
      }
      
      // Update the inspection status to in_progress if any responses
      if (responsesToSave.length > 0 && inspection.status === 'pending') {
        const { error: updateError } = await supabase
          .from('inspections')
          .update({ status: 'in_progress' })
          .eq('id', inspectionId);
        
        if (updateError) {
          console.error('Error updating inspection status:', updateError);
        }
      }
      
      toast.success('Respostas salvas com sucesso!');
    } catch (error) {
      console.error('Error saving inspection:', error);
      toast.error('Erro ao salvar respostas');
    } finally {
      setSaving(false);
    }
  };
  
  const getFilteredQuestions = (groupId: string | null) => {
    if (!groupId) {
      // Return questions without a group
      return questions.filter(q => !q.groupId);
    }
    
    // Return questions for this group
    return questions.filter(q => q.groupId === groupId);
  };
  
  const getCompletionStats = () => {
    const total = questions.length;
    const answered = Object.values(responses).filter(r => r.value !== undefined && r.value !== null && r.value !== '').length;
    const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;
    
    return {
      total,
      answered,
      percentage
    };
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
    getFilteredQuestions,
    getCompletionStats
  };
};
