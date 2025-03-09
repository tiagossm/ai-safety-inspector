
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

export interface ChecklistItemData {
  checklist_id: string;
  pergunta: string;
  tipo_resposta: string;
  obrigatorio: boolean;
  opcoes: string[] | null;
  ordem: number;
}

export function normalizeResponseType(type: string): string {
  const typeStr = (type || '').toString().toLowerCase().trim();
  
  if (typeStr.includes('sim') || typeStr.includes('não') || typeStr.includes('nao')) {
    return 'sim/não';
  } else if (typeStr.includes('mult') || typeStr.includes('escolha')) {
    return 'seleção múltipla';
  } else if (typeStr.includes('num')) {
    return 'numérico';
  } else if (typeStr.includes('text')) {
    return 'texto';
  } else if (typeStr.includes('foto') || typeStr.includes('imagem')) {
    return 'foto';
  } else if (typeStr.includes('assin')) {
    return 'assinatura';
  } else if (typeStr.includes('audio') || typeStr.includes('gravação')) {
    return 'audio_recording';
  } else if (typeStr.includes('file') || typeStr.includes('arquivo')) {
    return 'file_upload';
  } else if (typeStr.includes('video') || typeStr.includes('vídeo')) {
    return 'video';
  }
  
  return 'sim/não'; // Default
}

export function parseRequiredField(value: any): boolean {
  if (value === undefined) return true;
  
  const reqField = value.toString().toLowerCase().trim();
  return !(reqField === 'não' || reqField === 'nao' || reqField === 'false' || reqField === '0' || reqField === 'n');
}

export function parseOptions(rowData: any, responseType: string): string[] | null {
  if (responseType !== 'seleção múltipla' || !rowData) return null;
  
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

export async function processChecklistItem(
  supabaseClient: ReturnType<typeof createClient>,
  checklistId: string,
  rowData: any[],
  index: number
): Promise<void> {
  // Expected CSV format: pergunta, tipo_resposta, obrigatorio, opcoes (optional)
  const pergunta = rowData[0]?.trim() || '';
  
  if (!pergunta) {
    console.log(`Skipping row ${index + 1} due to empty question`);
    return;
  }
  
  const tipoResposta = normalizeResponseType(rowData[1]);
  const obrigatorio = parseRequiredField(rowData[2]);
  const opcoes = parseOptions(rowData[3], tipoResposta);

  console.log(`Creating checklist item for row ${index + 1}:`, {
    checklist_id: checklistId,
    pergunta,
    tipo_resposta: tipoResposta,
    obrigatorio,
    opcoes,
    ordem: index + 1
  });
  
  const { error } = await supabaseClient
    .from('checklist_itens')
    .insert({
      checklist_id: checklistId,
      pergunta,
      tipo_resposta: tipoResposta,
      obrigatorio,
      opcoes,
      ordem: index + 1
    });

  if (error) {
    console.error(`Error inserting item at row ${index + 1}:`, error);
    throw error;
  }
  
  console.log(`Successfully processed row ${index + 1}`);
}
