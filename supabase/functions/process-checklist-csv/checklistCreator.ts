
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

export interface ChecklistFormData {
  title?: string;
  description?: string;
  is_template?: boolean;
  status_checklist?: string;
  category?: string;
  responsible_id?: string | null;
  user_id?: string | null;
  company_id?: string | null;
  due_date?: string | null;
}

export async function createChecklist(
  supabaseClient: ReturnType<typeof createClient>,
  formData: ChecklistFormData,
  fileName: string
): Promise<{ id: string; error?: any }> {
  // Get user information if user_id is available
  let companyId = formData.company_id;
  if (formData.user_id && !companyId) {
    try {
      console.log("Attempting to find company_id for user:", formData.user_id);
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('company_id')
        .eq('id', formData.user_id)
        .single();
        
      if (!userError && userData?.company_id) {
        companyId = userData.company_id;
        console.log("Found company_id from user:", companyId);
      }
    } catch (error) {
      console.error("Error fetching user's company_id:", error);
    }
  }

  console.log("Creating new checklist with data:", {
    title: formData.title || fileName.replace(/\.[^/.]+$/, ""),
    description: formData.description || `Importado de ${fileName}`,
    is_template: formData.is_template || false,
    status_checklist: 'ativo',
    category: formData.category || 'general',
    responsible_id: formData.responsible_id || null,
    user_id: formData.user_id || null,
    company_id: companyId || null,
    due_date: formData.due_date || null
  });
  
  const { data: checklist, error } = await supabaseClient
    .from('checklists')
    .insert({
      title: formData.title || fileName.replace(/\.[^/.]+$/, ""),
      description: formData.description || `Importado de ${fileName}`,
      is_template: formData.is_template || false,
      status_checklist: 'ativo',
      category: formData.category || 'general',
      responsible_id: formData.responsible_id || null,
      user_id: formData.user_id || null,
      company_id: companyId || null,
      due_date: formData.due_date || null
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating checklist:', error);
    throw error;
  }

  console.log("Created checklist with ID:", checklist.id);
  return { id: checklist.id };
}
