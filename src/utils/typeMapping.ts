import { ResponseType } from "@/types/checklist";

/**
 * Mapeia tipos de resposta entre o frontend e o banco de dados
 * Função centralizada para garantir consistência
 */
export function mapResponseType(
  type: string,
  direction: "toDb" | "toFrontend"
): ResponseType {
  // Mapeamento de tipos do frontend para o banco de dados
  const frontendToDb: Record<string, ResponseType> = {
    "sim/não": "sim/não",
    "yes_no": "sim/não",
    "boolean": "sim/não",
    "texto": "texto",
    "text": "texto",
    "numérico": "numérico",
    "numeric": "numérico",
    "number": "numérico",
    "seleção múltipla": "seleção múltipla",
    "multiple_choice": "seleção múltipla",
    "foto": "foto",
    "photo": "foto",
    "assinatura": "assinatura",
    "signature": "assinatura",
    "data": "data",
    "date": "data",
    "hora": "hora",
    "time": "hora",
  };

  // Mapeamento de tipos do banco de dados para o frontend
  const dbToFrontend: Record<string, ResponseType> = {
    "sim/não": "sim/não",
    "texto": "texto",
    "numérico": "numérico",
    "seleção múltipla": "seleção múltipla",
    "foto": "foto",
    "assinatura": "assinatura",
    "data": "data",
    "hora": "hora",
  };

  // Normaliza o tipo para minúsculas para evitar problemas de case
  const normalizedType = type?.toLowerCase() || "";

  if (direction === "toDb") {
    // Busca o tipo no mapeamento ou retorna um valor padrão
    const mappedType = frontendToDb[normalizedType];
    if (!mappedType) {
      console.warn(
        `[typeMapping] Tipo de resposta desconhecido: "${type}". Usando "texto" como padrão.`
      );
      return "texto";
    }
    return mappedType;
  } else {
    // Busca o tipo no mapeamento ou retorna um valor padrão
    const mappedType = dbToFrontend[normalizedType];
    if (!mappedType) {
      console.warn(
        `[typeMapping] Tipo de resposta desconhecido: "${type}". Usando "texto" como padrão.`
      );
      return "texto";
    }
    return mappedType;
  }
}

/**
 * Função para normalizar tipos de resposta para o padrão interno
 * Mantida para compatibilidade com código existente
 */
export function normalizeResponseType(responseType: string): ResponseType {
  return mapResponseType(responseType, "toDb");
}

/**
 * Função para mapear tipos de resposta do frontend para o banco de dados
 * Mantida para compatibilidade com código existente
 */
export function frontendToDatabaseResponseType(frontendType: string): ResponseType {
  return mapResponseType(frontendType, "toDb");
}

/**
 * Função para mapear tipos de resposta do banco de dados para o frontend
 * Mantida para compatibilidade com código existente
 */
export function databaseToFrontendResponseType(dbType: string): ResponseType {
  return mapResponseType(dbType, "toFrontend");
}

