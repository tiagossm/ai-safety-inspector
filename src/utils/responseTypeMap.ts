
// Este arquivo mapeia os tipos de resposta entre o frontend e o banco de dados
import { RESPONSE_TYPE_MAP, StandardResponseType } from "@/types/responseTypes";

export function frontendToDatabaseResponseType(frontendType: StandardResponseType): string {
  return RESPONSE_TYPE_MAP.frontend[frontendType] || "texto";
}

export function databaseToFrontendResponseType(dbType: string): StandardResponseType {
  return RESPONSE_TYPE_MAP.database[dbType as keyof typeof RESPONSE_TYPE_MAP.database] || "text";
}

// Função para normalizar tipos de resposta vindos da IA
export function normalizeAIResponseType(aiType: string): StandardResponseType {
  const normalizedType = aiType.toLowerCase().trim();
  
  const typeMapping: Record<string, StandardResponseType> = {
    'yes_no': 'yes_no',
    'sim/não': 'yes_no',
    'sim/nao': 'yes_no',
    'boolean': 'yes_no',
    
    'text': 'text',
    'texto': 'text',
    'string': 'text',
    
    'paragraph': 'paragraph',
    'parágrafo': 'paragraph',
    'paragrafo': 'paragraph',
    'texto longo': 'paragraph',
    
    'numeric': 'numeric',
    'numérico': 'numeric',
    'numero': 'numeric',
    'number': 'numeric',
    
    'multiple_choice': 'multiple_choice',
    'seleção múltipla': 'multiple_choice',
    'selecao multipla': 'multiple_choice',
    'múltipla escolha': 'multiple_choice',
    'multipla escolha': 'multiple_choice',
    'choice': 'multiple_choice',
    
    'checkboxes': 'checkboxes',
    'caixas de seleção': 'checkboxes',
    'caixas de selecao': 'checkboxes',
    'checkbox': 'checkboxes',
    
    'dropdown': 'dropdown',
    'lista suspensa': 'dropdown',
    'select': 'dropdown',
    
    'photo': 'photo',
    'foto': 'photo',
    'image': 'photo',
    'imagem': 'photo',
    
    'signature': 'signature',
    'assinatura': 'signature',
    'sign': 'signature',
    
    'date': 'date',
    'data': 'date',
    
    'time': 'time',
    'hora': 'time',
    'horario': 'time',
    'horário': 'time',
    
    'datetime': 'datetime',
    'data e hora': 'datetime',
    'data_hora': 'datetime'
  };
  
  return typeMapping[normalizedType] || 'text';
}
