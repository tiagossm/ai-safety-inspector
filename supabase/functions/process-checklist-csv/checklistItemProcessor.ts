
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
  
  // Default to text if no match
  return 'text';
}

export function parseRequiredField(value: any): boolean {
  if (value === undefined) return true;
  
  const reqField = value.toString().toLowerCase().trim();
  return !(reqField === 'não' || reqField === 'nao' || reqField === 'false' || reqField === '0' || reqField === 'n');
}

export function parseOptions(rowData: any, responseType: string): string[] | null {
  if (!rowData || responseType !== 'seleção múltipla' && !responseType.includes('select')) return null;
  
  try {
    if (typeof rowData === 'string') {
      // Split by comma, semicolon, or pipe
      return rowData.split(/[,;|]/).map(opt => opt.trim()).filter(opt => opt);
    } else {
      return [String(rowData)];
    }
  } catch (e) {
    console.error(`Error parsing options:`, e);
    return [];
  }
}

export function parseMultimediaField(value: any): boolean {
  if (value === undefined) return false;
  
  const field = value.toString().toLowerCase().trim();
  return field === 'sim' || field === 'yes' || field === 'true' || field === '1' || field === 's' || field === 'y';
}

export async function processChecklistItem(
  supabaseClient: ReturnType<typeof createClient>,
  checklistId: string,
  rowData: any[],
  index: number
): Promise<void> {
  // Expected CSV format: 
  // Pergunta, Tipo de Resposta, Obrigatório, Ordem, Opções, Permite Áudio, Permite Vídeo, Permite Foto
  const pergunta = rowData[0]?.trim() || '';
  
  if (!pergunta) {
    console.log(`Skipping row ${index + 1} due to empty question`);
    return;
  }
  
  const tipoResposta = normalizeResponseType(rowData[1]);
  const obrigatorio = parseRequiredField(rowData[2]);
  const ordem = rowData[3] ? parseInt(rowData[3], 10) : index + 1;
  const opcoes = parseOptions(rowData[4], tipoResposta);
  
  // Parse multimedia support
  const permiteAudio = parseMultimediaField(rowData[5]);
  const permiteVideo = parseMultimediaField(rowData[6]);
  const permiteFoto = parseMultimediaField(rowData[7]);

  console.log(`Creating checklist item for row ${index + 1}:`, {
    checklist_id: checklistId,
    pergunta,
    tipo_resposta: tipoResposta,
    obrigatorio,
    opcoes,
    ordem,
    permite_audio: permiteAudio,
    permite_video: permiteVideo,
    permite_foto: permiteFoto
  });
  
  const { error } = await supabaseClient
    .from('checklist_itens')
    .insert({
      checklist_id: checklistId,
      pergunta,
      tipo_resposta: tipoResposta,
      obrigatorio,
      opcoes,
      ordem,
      permite_audio: permiteAudio,
      permite_video: permiteVideo,
      permite_foto: permiteFoto
    });

  if (error) {
    console.error(`Error inserting item at row ${index + 1}:`, error);
    throw error;
  }
  
  console.log(`Successfully processed row ${index + 1}`);
}
