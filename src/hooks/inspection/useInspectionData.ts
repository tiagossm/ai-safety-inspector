
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InspectionDetails } from "@/types/newChecklist";
import { toast } from "sonner";
import { initializeInspectionsSchema } from "@/utils/initializeDatabase";

export function useInspectionData(id: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [inspection, setInspection] = useState<InspectionDetails | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [groups, setGroups] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [responsible, setResponsible] = useState<any>(null);
  
  useEffect(() => {
    if (id) {
      initializeInspectionsSchema().then(() => {
        fetchInspectionData();
      });
    }
  }, [id]);
  
  const fetchInspectionData = async () => {
    setLoading(true);
    try {
      const { data: inspectionData, error: inspectionError } = await supabase
        .from("inspections")
        .select("*, checklists(*)")
        .eq("id", id)
        .single();
      
      if (inspectionError) throw inspectionError;
      if (!inspectionData) throw new Error("Inspection not found");
      
      let checklistTitle = "Untitled Inspection";
      let checklistDescription: string | undefined = undefined;
      let totalQuestions = 0;
      
      if (inspectionData.checklist) {
        try {
          const checklistData = typeof inspectionData.checklist === 'string' 
            ? JSON.parse(inspectionData.checklist) 
            : inspectionData.checklist;
          
          if (checklistData && typeof checklistData === 'object' && !Array.isArray(checklistData)) {
            checklistTitle = checklistData.title || "Untitled Inspection";
            checklistDescription = checklistData.description;
            totalQuestions = typeof checklistData.total_questions === 'number' 
              ? checklistData.total_questions 
              : 0;
          }
        } catch (e) {
          console.error("Error parsing checklist JSON:", e);
        }
      }
      
      if (inspectionData.checklists) {
        if (!checklistTitle && inspectionData.checklists.title) {
          checklistTitle = inspectionData.checklists.title;
        }
        
        if (!checklistDescription && inspectionData.checklists.description) {
          checklistDescription = inspectionData.checklists.description;
        }
      }
      
      let status: "pending" | "in_progress" | "completed" = "pending";
      if (inspectionData.status === "Em Andamento") {
        status = "in_progress";
      } else if (inspectionData.status === "Concluído") {
        status = "completed";
      }
      
      const inspectionDetails: InspectionDetails = {
        id: inspectionData.id,
        title: checklistTitle,
        description: checklistDescription,
        checklistId: inspectionData.checklist_id,
        companyId: inspectionData.company_id,
        locationName: inspectionData.location || "",
        responsibleId: inspectionData.responsible_id,
        scheduledDate: inspectionData.scheduled_date,
        priority: (inspectionData.priority || "medium") as "low" | "medium" | "high",
        status: status,
        createdAt: inspectionData.created_at,
        updatedAt: inspectionData.created_at, // Use created_at as fallback since updated_at may not exist
        checklist: {
          title: checklistTitle,
          description: checklistDescription,
          total_questions: totalQuestions
        },
        approval_notes: inspectionData.approval_notes,
        approval_status: inspectionData.approval_status,
        approved_by: inspectionData.approved_by,
        audio_url: inspectionData.audio_url,
        photos: inspectionData.photos || [],
        report_url: inspectionData.report_url,
        unit_id: inspectionData.unit_id,
        metadata: typeof inspectionData.metadata === 'object' ? inspectionData.metadata : {},
        cnae: inspectionData.cnae,
        inspection_type: inspectionData.inspection_type,
        sync_status: inspectionData.sync_status
      };
      
      setInspection(inspectionDetails);
      
      if (inspectionData.company_id) {
        const { data: companyData } = await supabase
          .from("companies")
          .select("id, name, city")
          .eq("id", inspectionData.company_id)
          .single();
        
        setCompany(companyData);
      }
      
      if (inspectionData.responsible_id) {
        const { data: userData } = await supabase
          .from("users")
          .select("id, name, email")
          .eq("id", inspectionData.responsible_id)
          .single();
        
        setResponsible(userData);
      }
      
      const { data: questionsData, error: questionsError } = await supabase
        .from("checklist_itens")
        .select(`
          id,
          pergunta,
          tipo_resposta,
          obrigatorio,
          opcoes,
          hint,
          weight,
          parent_item_id,
          condition_value,
          permite_foto,
          permite_video,
          permite_audio,
          ordem,
          sub_checklist_id
        `)
        .eq("checklist_id", inspectionData.checklist_id)
        .order("ordem", { ascending: true });
      
      if (questionsError) throw questionsError;
      
      const groupsMap = new Map();
      const processedQuestions = questionsData.map((q: any) => {
        let groupId = null;
        let groupTitle = null;
        
        if (q.hint) {
          try {
            if (q.hint.includes('groupId')) {
              const groupInfo = JSON.parse(q.hint);
              groupId = groupInfo.groupId;
              groupTitle = groupInfo.groupTitle;
              
              if (groupId && groupTitle && !groupsMap.has(groupId)) {
                groupsMap.set(groupId, {
                  id: groupId,
                  title: groupTitle,
                  order: groupsMap.size
                });
              }
            }
          } catch (e) {
            console.warn("Error parsing group info:", e);
          }
        }
        
        return {
          id: q.id,
          text: q.pergunta,
          responseType: q.tipo_resposta,
          isRequired: q.obrigatorio,
          options: Array.isArray(q.opcoes) ? q.opcoes.map((opt: any) => String(opt)) : [],
          hint: q.hint,
          weight: q.weight || 1,
          groupId,
          parentQuestionId: q.parent_item_id,
          conditionValue: q.condition_value,
          allowsPhoto: q.permite_foto,
          allowsVideo: q.permite_video,
          allowsAudio: q.permite_audio,
          order: q.ordem,
          hasSubChecklist: !!q.sub_checklist_id,
          subChecklistId: q.sub_checklist_id
        };
      });
      
      setQuestions(processedQuestions);
      
      const groupsArray = Array.from(groupsMap.values());
      setGroups(groupsArray);
      
      const { data: responsesData, error: responsesError } = await supabase
        .from("inspection_responses")
        .select("*")
        .eq("inspection_id", id);
      
      if (!responsesError && responsesData) {
        const responsesMap: Record<string, any> = {};
        responsesData.forEach((response: any) => {
          responsesMap[response.question_id] = {
            value: response.answer,
            comment: response.notes,
            actionPlan: response.action_plan,
            attachments: response.media_urls || []
          };
        });
        setResponses(responsesMap);
      }
    } catch (error) {
      console.error("Error fetching inspection data:", error);
      toast.error("Failed to load inspection data");
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId: string, data: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ...data
      }
    }));
  };

  const handleSaveInspection = async () => {
    try {
      const responseEntries = Object.entries(responses).map(([questionId, data]) => ({
        inspection_id: id,
        question_id: questionId,
        answer: data.value || "",
        notes: data.comment,
        action_plan: data.actionPlan,
        media_urls: data.attachments
      }));
      
      const requiredQuestions = questions.filter(q => q.isRequired);
      const unansweredRequired = requiredQuestions.filter(q => 
        !responses[q.id] || responses[q.id].value === undefined || responses[q.id].value === null || responses[q.id].value === ""
      );
      
      if (unansweredRequired.length > 0) {
        toast.warning(`There are ${unansweredRequired.length} required questions without answers.`);
      }
      
      const { error: deleteError } = await supabase
        .from("inspection_responses")
        .delete()
        .eq("inspection_id", id);
      
      if (deleteError) throw deleteError;
      
      if (responseEntries.length > 0) {
        const { error: insertError } = await supabase
          .from("inspection_responses")
          .insert(responseEntries);
        
        if (insertError) throw insertError;
      }
      
      const totalRequired = requiredQuestions.length;
      const answeredRequired = requiredQuestions.filter(q => 
        responses[q.id] && responses[q.id].value !== undefined && responses[q.id].value !== null && responses[q.id].value !== ""
      ).length;
      
      let dbStatus = "Pendente";
      let newStatus: "pending" | "in_progress" | "completed" = "pending";
      
      if (answeredRequired === totalRequired) {
        dbStatus = "Concluído";
        newStatus = "completed";
      } else if (answeredRequired > 0) {
        dbStatus = "Em Andamento";
        newStatus = "in_progress";
      }
      
      const { error: updateError } = await supabase
        .from("inspections")
        .update({ 
          status: dbStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
      
      if (updateError) throw updateError;
      
      toast.success("Inspection saved successfully");
      
      setInspection(prev => prev ? {
        ...prev,
        status: newStatus,
        updatedAt: new Date().toISOString()
      } : null);

      return true;
    } catch (error) {
      console.error("Error saving inspection:", error);
      toast.error("Failed to save inspection");
      return false;
    }
  };

  const getFilteredQuestions = (currentGroupId: string | null) => {
    if (!currentGroupId) {
      return questions.filter(q => !q.groupId);
    }
    
    return questions.filter(q => q.groupId === currentGroupId);
  };

  const getCompletionStats = () => {
    const total = questions.length;
    const answered = Object.keys(responses).length;
    const percentage = total ? Math.round((answered / total) * 100) : 0;
    
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
    handleResponseChange,
    handleSaveInspection,
    getFilteredQuestions,
    getCompletionStats
  };
}
