
// Este arquivo mapeia os tipos de resposta entre o frontend e o banco de dados
import { RESPONSE_TYPE_MAP, StandardResponseType } from "@/types/responseTypes";

/**
 * Mapeia o tipo de resposta do front para o formato aceito pelo banco.
 */
export function frontendToDatabaseResponseType(frontendType: StandardResponseType): string {
  return RESPONSE_TYPE_MAP.frontend[frontendType] || "texto";
}

/**
 * Mapeia o tipo de resposta do banco para o formato usado no front.
 */
export function databaseToFrontendResponseType(dbType: string): StandardResponseType {
  return RESPONSE_TYPE_MAP.database[dbType as keyof typeof RESPONSE_TYPE_MAP.database] || "text";
}

/**
 * Função para normalizar tipos de resposta vindos da IA para garantir compatibilidade com o banco.
 * Aceita múltiplas variações e devolve o termo aceito pelo StandardResponseType.
 */
export function normalizeAIResponseType(aiType: string): StandardResponseType {
  const normalizedType = aiType.toLowerCase().trim();

  const typeMapping: Record<string, StandardResponseType> = {
    // Sim/Não
    'yes_no': 'yes_no',
    'sim/não': 'yes_no',
    'sim/nao': 'yes_no',
    'boolean': 'yes_no',

    // Texto curto
    'text': 'text',
    'texto': 'text',
    'string': 'text',
    'paragraph': 'paragraph',
    'parágrafo': 'paragraph',
    'paragrafo': 'paragraph',
    'texto longo': 'paragraph',

    // Numérico
    'numeric': 'numeric',
    'numérico': 'numeric',
    'numero': 'numeric',
    'number': 'numeric',

    // Seleção múltipla
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

    // Foto/imagem
    'photo': 'photo',
    'foto': 'photo',
    'image': 'photo',
    'imagem': 'photo',

    // Assinatura
    'signature': 'signature',
    'assinatura': 'signature',
    'sign': 'signature',

    // Data e hora
    'date': 'date',
    'data': 'date',

    'time': 'time',
    'hora': 'time',
    'horario': 'time',
    'horário': 'time',

    // Datetime
    'datetime': 'datetime',
    'data e hora': 'datetime',
    'data_hora': 'datetime'
  };

  // Default para "text" se não reconhecer (segurança máxima)
  return typeMapping[normalizedType] || 'text';
}
