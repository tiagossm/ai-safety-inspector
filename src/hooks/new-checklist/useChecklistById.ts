
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistQuestion, ChecklistGroup, ChecklistWithStats } from "@/types/newChecklist";

export const useChecklistById = (checklistId: string) => {
  const fetchChecklist = async ({ queryKey }: { queryKey: any[] }) => {
    const id = queryKey[1];
    console.info(`Fetching checklist with ID: ${id}`);
    
    if (!id) throw new Error("Checklist ID is required");
    
    // Fetch the checklist
    const { data: checklistData, error: checklistError } = await supabase
      .from('checklists')
      .select(`
        *,
        company:company_id(id, fantasy_name),
        responsible:responsible_id(id, name)
      `)
      .eq('id', id)
      .single();
    
    if (checklistError) throw checklistError;
    
    // Fetch questions
    const { data: questionsData, error: questionsError } = await supabase
      .from('checklist_itens')
      .select('*')
      .eq('checklist_id', id)
      .order('ordem', { ascending: true });
    
    if (questionsError) throw questionsError;
    
    console.info(`Retrieved ${questionsData?.length || 0} questions for checklist ${id}`);
    
    // Map DB questions to our model
    const questions: ChecklistQuestion[] = (questionsData || []).map((q) => ({
      id: q.id,
      text: q.pergunta,
      responseType: mapResponseType(q.tipo_resposta),
      isRequired: q.obrigatorio,
      options: q.opcoes || [],
      order: q.ordem || 0,
      weight: q.weight || 1,
      allowsPhoto: q.permite_foto || false,
      allowsVideo: q.permite_video || false,
      allowsAudio: q.permite_audio || false,
      allowsFiles: false,
      groupId: "default", // Default group for flat questions
      parentId: q.parent_item_id || null,
      conditionValue: q.condition_value || null,
      displayNumber: `${q.ordem + 1}`
    }));
    
    // Fetch or create groups
    let groups: ChecklistGroup[] = [];
    
    // If there are no existing groups, create a default one
    if (groups.length === 0) {
      groups = [{
        id: "default",
        title: "Geral",
        order: 0
      }];
    }
    
    console.info("Processing questions:", questions.length);
    console.info("Processing groups:", groups.length);
    
    const totalQuestions = questions.length;
    
    // Build the checklist object with all data
    const checklist: ChecklistWithStats = {
      id: id,
      title: checklistData?.title || "",
      description: checklistData?.description || "",
      isTemplate: checklistData?.is_template || false,
      status: checklistData?.status || "active",
      category: checklistData?.category || "",
      responsible_id: checklistData?.responsible_id || "",
      company_id: checklistData?.company_id || "",
      user_id: checklistData?.user_id || "",
      created_at: checklistData?.created_at || "",
      updated_at: checklistData?.updated_at || "",
      due_date: checklistData?.due_date || "",
      isSubChecklist: checklistData?.is_sub_checklist || false,
      origin: checklistData?.origin || "manual",
      totalQuestions,
      completedQuestions: 0,
      companyName: checklistData?.company?.fantasy_name || "",
      responsibleName: checklistData?.responsible?.name || "",
      questions: questions || [],
      groups: groups || []
    };
    
    return checklist;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['checklist', checklistId],
    queryFn: fetchChecklist,
    enabled: !!checklistId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const mapResponseType = (type: string): "yes_no" | "numeric" | "text" | "multiple_choice" | "photo" | "signature" => {
    const typeMap: Record<string, any> = {
      'sim/não': 'yes_no',
      'numérico': 'numeric',
      'texto': 'text',
      'seleção múltipla': 'multiple_choice',
      'foto': 'photo',
      'assinatura': 'signature'
    };
    
    return typeMap[type] || 'yes_no';
  };

  return {
    data,
    isLoading,
    error,
    refetch
  };
};

export default useChecklistById;
