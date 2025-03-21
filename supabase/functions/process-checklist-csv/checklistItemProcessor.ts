
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

// Mapeia tipos de resposta de texto para valores da base de dados
const responseTypeMap: Record<string, string> = {
  'sim/não': 'yes_no',
  'yes/no': 'yes_no',
  'sim/nao': 'yes_no',
  'yes_no': 'yes_no',
  'múltipla escolha': 'multiple_choice',
  'multipla escolha': 'multiple_choice',
  'multiple_choice': 'multiple_choice',
  'multiple choice': 'multiple_choice',
  'texto': 'text',
  'text': 'text',
  'numérico': 'numeric',
  'numerico': 'numeric',
  'numeric': 'numeric',
  'number': 'numeric',
  'foto': 'photo',
  'photo': 'photo',
  'assinatura': 'signature',
  'signature': 'signature'
};

// Processa um item (linha) do CSV e insere no banco de dados
export async function processChecklistItem(
  supabase: SupabaseClient,
  checklistId: string,
  rowData: string[],
  rowIndex: number
): Promise<void> {
  // Verificar se temos pelo menos o texto da pergunta
  if (!rowData[0] || rowData[0].trim() === '') {
    throw new Error(`Linha ${rowIndex + 1}: Texto da pergunta é obrigatório`);
  }

  // Extrair dados da linha
  const questionText = rowData[0].trim();
  
  // Determinar o tipo de resposta (coluna 1)
  let responseType = 'yes_no'; // Padrão
  if (rowData.length > 1 && rowData[1]) {
    const rawType = rowData[1].trim().toLowerCase();
    responseType = responseTypeMap[rawType] || 'yes_no';
  }
  
  // Determinar se é obrigatório (coluna 2)
  let required = true; // Padrão é obrigatório
  if (rowData.length > 2 && rowData[2]) {
    const requiredText = rowData[2].trim().toLowerCase();
    required = !['não', 'nao', 'no', 'false', '0', 'n'].includes(requiredText);
  }
  
  // Extrair opções para perguntas de múltipla escolha (coluna 3)
  let options: string[] = [];
  if (responseType === 'multiple_choice' && rowData.length > 3 && rowData[3]) {
    // As opções podem estar separadas por vírgulas, ponto e vírgulas, ou barras verticais
    options = rowData[3].split(/[,;|]/).map(opt => opt.trim()).filter(opt => opt !== '');
    
    // Se não houver opções válidas, forneça algumas padrão
    if (options.length === 0) {
      options = ['Opção 1', 'Opção 2', 'Opção 3'];
    }
  }
  
  // Extrair peso (coluna 4)
  let weight = 1; // Peso padrão
  if (rowData.length > 4 && rowData[4]) {
    const weightValue = parseFloat(rowData[4]);
    if (!isNaN(weightValue) && weightValue > 0) {
      weight = weightValue;
    }
  }
  
  // Extrair permissões de mídia (coluna 5)
  let allowsPhoto = false;
  let allowsVideo = false;
  let allowsAudio = false;
  
  if (rowData.length > 5 && rowData[5]) {
    const mediaPermissions = rowData[5].toLowerCase();
    allowsPhoto = mediaPermissions.includes('foto') || mediaPermissions.includes('photo');
    allowsVideo = mediaPermissions.includes('vídeo') || mediaPermissions.includes('video');
    allowsAudio = mediaPermissions.includes('áudio') || mediaPermissions.includes('audio');
  }
  
  // Extrair grupo (coluna 6)
  let groupInfo = null;
  if (rowData.length > 6 && rowData[6]) {
    const groupName = rowData[6].trim();
    if (groupName) {
      groupInfo = JSON.stringify({
        groupId: `group-${rowIndex}`,
        groupTitle: groupName,
        groupIndex: 0
      });
    }
  }
  
  // Preparar dados para inserção
  const itemData = {
    checklist_id: checklistId,
    pergunta: questionText,
    tipo_resposta: responseType,
    obrigatorio: required,
    opcoes: options.length > 0 ? options : null,
    hint: groupInfo,
    weight: weight,
    parent_item_id: null, // Não suportado via importação simples
    condition_value: null, // Não suportado via importação simples
    permite_foto: allowsPhoto,
    permite_video: allowsVideo,
    permite_audio: allowsAudio,
    ordem: rowIndex
  };
  
  console.log(`Inserting checklist item ${rowIndex + 1}:`, itemData);
  
  // Inserir no banco de dados
  const { error } = await supabase
    .from('checklist_itens')
    .insert(itemData);
  
  if (error) {
    console.error(`Error inserting checklist item ${rowIndex + 1}:`, error);
    throw new Error(`Erro ao inserir item ${rowIndex + 1}: ${error.message}`);
  }
  
  console.log(`Successfully inserted checklist item ${rowIndex + 1}`);
}
