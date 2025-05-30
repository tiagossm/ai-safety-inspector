import { ResponseType } from "@/types/checklist";

/**
 * Mapeia tipos de resposta entre o frontend e o banco de dados
 * Função centralizada para garantir consistência
 */

export function mapResponseType(
  type: string,
  direction: "toDb" | "toFrontend"
): ResponseType {
  // Mapeamento frontend (interno) para banco de dados
  const frontendToDb: Record<string, string> = {
    yes_no: "sim/não",
    multiple_choice: "seleção múltipla",
    numeric: "numérico",
    text: "texto",
    time: "hora",
    date: "data",
    photo: "foto",
    signature: "assinatura",
  };

  // Mapeamento banco de dados para frontend (interno)
  const dbToFrontend: Record<string, ResponseType> = {
    "sim/não": "yes_no",
    "seleção múltipla": "multiple_choice",
    "numérico": "numeric",
    "texto": "text",
    "hora": "time",
    "data": "date",
    "foto": "photo",
    "assinatura": "signature",
  };

  const normalizedType = type?.toLowerCase() || "";

  if (direction === "toDb") {
    const mappedType = frontendToDb[normalizedType];
    if (!mappedType) {
      console.warn(
        `[typeMapping] Tipo de resposta desconhecido: "${type}". Usando "texto" como padrão.`
      );
      return "texto" as ResponseType;
    }
    return mappedType as ResponseType;
  } else {
    const mappedType = dbToFrontend[normalizedType];
    if (!mappedType) {
      console.warn(
        `[typeMapping] Tipo de resposta desconhecido: "${type}". Usando "text" como padrão.`
      );
      return "text";
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

