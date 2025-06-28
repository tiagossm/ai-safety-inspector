
import { 
  convertToFrontendType, 
  frontendToDatabaseResponseType,
  RESPONSE_TYPE_MAP,
  normalizeToStandardType
} from "@/types/responseTypes";

// Re-exportar as funções principais para manter compatibilidade
export { 
  convertToFrontendType, 
  frontendToDatabaseResponseType,
  RESPONSE_TYPE_MAP,
  normalizeToStandardType
};

// Função adicional para compatibilidade com código existente
export function convertToDatabaseType(frontendType: string): string {
  const normalized = normalizeToStandardType(frontendType);
  return frontendToDatabaseResponseType(normalized);
}
