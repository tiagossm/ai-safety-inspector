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
  return RESPONSE_TYPE_MAP.database[dbType as keyof typeof RESPONSE_TYPE_MAP.database] || "texto";
}

/**
 * Função para normalizar tipos de resposta vindos da IA para garantir compatibilidade com o banco.
 * Aceita múltiplas variações e devolve o termo aceito pelo banco (evita erros de constraint).
 */
export function normalizeAIResponseType(aiType: string): StandardResponseType {
  const normalizedType = aiType.toLowerCase().trim();

  const typeMapping: Record<string, StandardResponseType> = {
    // Sim/Não
    'yes_no': 'sim/não',
    'sim/não': 'sim/não',
    'sim/nao': 'sim/não',
    'boolean': 'sim/não',

    // Texto curto
    'text': 'texto',
    'texto': 'texto',
    'string': 'texto',
    'paragraph': 'texto',
    'parágrafo': 'texto',
    'paragrafo': 'texto',
    'texto longo': 'texto',

    // Numérico
    'numeric': 'numérico',
    'numérico': 'numérico',
    'numero': 'numérico',
    'number': 'numérico',

    // Seleção múltipla
    'multiple_choice': 'seleção múltipla',
    'seleção múltipla': 'seleção múltipla',
    'selecao multipla': 'seleção múltipla',
    'múltipla escolha': 'seleção múltipla',
    'multipla escolha': 'seleção múltipla',
    'choice': 'seleção múltipla',
    'checkboxes': 'seleção múltipla', // Ajuste: checkbox entra como seleção múltipla
    'caixas de seleção': 'seleção múltipla',
    'caixas de selecao': 'seleção múltipla',
    'checkbox': 'seleção múltipla',
    'dropdown': 'seleção múltipla',
    'lista suspensa': 'seleção múltipla',
    'select': 'seleção múltipla',

    // Foto/imagem
    'photo': 'foto',
    'foto': 'foto',
    'image': 'foto',
    'imagem': 'foto',

    // Assinatura
    'signature': 'assinatura',
    'assinatura': 'assinatura',
    'sign': 'assinatura',

    // Data e hora
    'date': 'date',
    'data': 'date',

    'time': 'time',
    'hora': 'time',
    'horario': 'time',
    'horário': 'time',

    // Obs: O banco não aceita "datetime", então mapeia para "date"
    'datetime': 'date',
    'data e hora': 'date',
    'data_hora': 'date'
  };

  // Default para "texto" se não reconhecer (segurança máxima)
  return typeMapping[normalizedType] || 'texto';
}
