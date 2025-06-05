
import { 
  convertToFrontendType, 
  frontendToDatabaseResponseType,
  RESPONSE_TYPE_MAP 
} from "@/types/responseTypes";

// Re-exportar as funções principais para manter compatibilidade
export { 
  convertToFrontendType, 
  frontendToDatabaseResponseType,
  RESPONSE_TYPE_MAP 
};

// Função adicional para compatibilidade com código existente
export function convertToDatabaseType(frontendType: string): string {
  return frontendToDatabaseResponseType(frontendType as any);
}
