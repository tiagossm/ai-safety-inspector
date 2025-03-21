
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

export interface ChecklistFormData {
  title: string;
  description?: string;
  is_template?: boolean;
  status?: string;
  status_checklist?: string;
  category?: string;
  responsible_id?: string | null;
  company_id?: string | null;
  user_id?: string;
  due_date?: string | null;
}

// Função para criar um novo checklist no banco de dados
export async function createChecklist(
  supabase: SupabaseClient,
  checklistData: ChecklistFormData,
  sourceFileName: string
): Promise<{ id: string }> {
  // Garantir que os campos obrigatórios estejam presentes
  if (!checklistData.title) {
    throw new Error('Título do checklist é obrigatório');
  }
  
  // Preparar o título se nenhum foi fornecido explicitamente
  if (!checklistData.title) {
    const baseFileName = sourceFileName.split('.')[0];
    checklistData.title = `Importado de: ${baseFileName}`;
  }
  
  // Garantir que temos um status correto
  const status = checklistData.status || 'active';
  const status_checklist = status === 'active' ? 'ativo' : 'inativo';
  
  // Preparar os dados para inserção
  const insertData = {
    title: checklistData.title,
    description: checklistData.description || `Checklist importado de ${sourceFileName}`,
    is_template: checklistData.is_template || false,
    status: status,
    status_checklist: status_checklist,
    category: checklistData.category || 'general',
    responsible_id: checklistData.responsible_id === 'none' ? null : checklistData.responsible_id,
    company_id: checklistData.company_id === 'none' ? null : checklistData.company_id,
    user_id: checklistData.user_id,
    due_date: checklistData.due_date
  };
  
  console.log('Inserting checklist with data:', insertData);
  
  // Inserir no banco de dados
  const { data, error } = await supabase
    .from('checklists')
    .insert(insertData)
    .select('id')
    .single();
  
  if (error) {
    console.error('Error creating checklist:', error);
    throw new Error(`Erro ao criar checklist: ${error.message}`);
  }
  
  if (!data || !data.id) {
    throw new Error('Falha ao criar checklist - nenhum ID retornado');
  }
  
  console.log('Checklist created successfully with ID:', data.id);
  
  return { id: data.id };
}
