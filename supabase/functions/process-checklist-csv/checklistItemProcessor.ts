
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

export interface ChecklistItemData {
  checklist_id: string;
  pergunta: string;
  tipo_resposta: string;
  obrigatorio: boolean;
  opcoes: string[] | null;
  ordem: number;
  permite_audio: boolean;
  permite_video: boolean;
  permite_foto: boolean;
}

/**
 * Normaliza o tipo de resposta para garantir consistência no banco de dados.
 */
export function normalizeResponseType(type: string): string {
  const typeStr = (type || '').toString().toLowerCase().trim();
  
  if (typeStr.includes('text_area') || typeStr.includes('textarea')) {
    return 'text_area';
  } else if (typeStr.includes('text')) {
    return 'text';
  } else if (typeStr.includes('yes_no') || typeStr.includes('sim') || typeStr.includes('não') || typeStr.includes('nao')) {
    return 'yes_no';
  } else if (typeStr.includes('file') || typeStr.includes('upload')) {
    return 'file_upload';
  } else if (typeStr.includes('checklist_item')) {
    return 'checklist_item_select';
  } else if (typeStr.includes('parts')) {
    return 'parts_select';
  } else if (typeStr.includes('service')) {
    return 'services_select';
  } else if (typeStr.includes('date')) {
    return 'date';
  } else if (typeStr.includes('mult') || typeStr.includes('escolha')) {
    return 'seleção múltipla';
  } else if (typeStr.includes('num')) {
    return 'numérico';
  } else if (typeStr.includes('foto') || typeStr.includes('imagem')) {
    return 'foto';
  } else if (typeStr.includes('assin')) {
    return 'assinatura';
  } else if (typeStr.includes('audio') || typeStr.includes('gravação')) {
    return 'audio_recording';
  } else if (typeStr.includes('video') || typeStr.includes('vídeo')) {
    return 'video';
  }
  
  // Caso padrão
  return 'text';
}

/**
 * Converte valores booleanos em um formato padronizado.
 */
export function parseRequiredField(value: any): boolean {
  if (value === undefined) return true;
  
  const reqField = value.toString().toLowerCase().trim();
  return !(reqField === 'não' || reqField === 'nao' || reqField === 'false' || reqField === '0' || reqField === 'n');
}

/**
 * Analisa opções de resposta em perguntas de seleção múltipla.
 */
export function parseOptions(rowData: any, responseType: string): string[] | null {
  if (!rowData || (responseType !== 'seleção múltipla' && !responseType.includes('select'))) return null;
  
  try {
    if (typeof rowData === 'string') {
      return rowData.split(/[,;|]/).map(opt => opt.trim()).filter(opt => opt);
    } else {
      return [String(rowData)];
    }
  } catch (e) {
    console.error(`Erro ao processar opções de resposta:`, e);
    return [];
  }
}

/**
 * Converte campos booleanos para indicar suporte a multimídia.
 */
export function parseMultimediaField(value: any): boolean {
  if (value === undefined) return false;
  
  const field = value.toString().toLowerCase().trim();
  return field === 'sim' || field === 'yes' || field === 'true' || field === '1' || field === 's' || field === 'y';
}

/**
 * Processa uma linha do CSV e insere como item de checklist no Supabase.
 */
export async function processChecklistItem(
  supabaseClient: ReturnType<typeof createClient>,
  checklistId: string,
  rowData: any[],
  index: number
): Promise<void> {
  try {
    // Verifica se há pergunta antes de processar a linha
    const pergunta = rowData[0]?.toString().trim() || '';

    if (!pergunta) {
      console.log(`⚠️ Ignorando linha ${index + 1}: pergunta vazia.`);
      return;
    }

    // Mapeia os dados de entrada para os campos esperados
    const tipoResposta = normalizeResponseType(rowData[1]);
    const obrigatorio = parseRequiredField(rowData[2]);
    const ordem = rowData[3] ? parseInt(rowData[3], 10) : index + 1;
    const opcoes = parseOptions(rowData[4], tipoResposta);

    const permiteAudio = parseMultimediaField(rowData[5]);
    const permiteVideo = parseMultimediaField(rowData[6]);
    const permiteFoto = parseMultimediaField(rowData[7]);

    // Item de checklist a ser inserido
    const checklistItem = {
      checklist_id: checklistId,
      pergunta,
      tipo_resposta: tipoResposta,
      obrigatorio,
      opcoes,
      ordem,
      permite_audio: permiteAudio,
      permite_video: permiteVideo,
      permite_foto: permiteFoto
    };

    console.log(`📌 Processando item do checklist (linha ${index + 1}):`, checklistItem);

    // Realiza a inserção no Supabase
    const { data, error } = await supabaseClient
      .from('checklist_itens')
      .insert(checklistItem);

    if (error) {
      console.error(`❌ Erro ao inserir item na linha ${index + 1}:`, error);
      
      // Retry with a different approach if the previous one failed
      const { error: retryError } = await supabaseClient
        .from('checklist_itens')
        .insert([checklistItem]);
      
      if (retryError) {
        console.error(`❌ Falha na segunda tentativa de inserção na linha ${index + 1}:`, retryError);
        throw retryError;
      } else {
        console.log(`✅ Segunda tentativa bem-sucedida para linha ${index + 1}`);
      }
    } else {
      console.log(`✅ Sucesso ao processar linha ${index + 1}`);
    }
  } catch (error) {
    console.error(`🚨 Erro inesperado ao processar linha ${index + 1}:`, error);
  }
}
