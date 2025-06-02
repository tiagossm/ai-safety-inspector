
// Este arquivo mapeia os tipos de resposta entre o frontend e o banco de dados
import { RESPONSE_TYPE_MAP, StandardResponseType } from "@/types/responseTypes";

export function frontendToDatabaseResponseType(frontendType: StandardResponseType): string {
  return RESPONSE_TYPE_MAP.frontend[frontendType] || "texto";
}

export function databaseToFrontendResponseType(dbType: string): StandardResponseType {
  return RESPONSE_TYPE_MAP.database[dbType as keyof typeof RESPONSE_TYPE_MAP.database] || "text";
}
