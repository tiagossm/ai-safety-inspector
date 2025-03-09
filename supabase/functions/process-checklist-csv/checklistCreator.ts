
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
  console.log("Creating new checklist with data:", {
    title: formData.title || fileName.replace(/\.[^/.]+$/, ""),
    description: formData.description || `Importado de ${fileName}`,
    is_template: formData.is_template || false,
    status_checklist: 'ativo',
    category: formData.category || 'general',
    responsible_id: formData.responsible_id || null,
    user_id: formData.user_id || null,
    company_id: formData.company_id || null,
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
      company_id: formData.company_id || null,
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
