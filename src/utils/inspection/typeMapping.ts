import { 
  InspectionStatus, 
  InspectionPriority, 
  InspectionType,
  InspectionStatusEnum,
  InspectionPriorityEnum,
  InspectionTypeEnum
} from "@/types/inspection";

/**
 * Mapeia status de inspeção entre o frontend e o banco de dados
 * @param status Status a ser mapeado
 * @param direction Direção do mapeamento (para DB ou para frontend)
 * @returns Status mapeado
 */
export function mapInspectionStatus(
  status: string | undefined,
  direction: "toDb" | "toFrontend"
): InspectionStatus {
  if (!status) {
    return "pending";
  }

  // Normaliza o status para minúsculas para evitar problemas de case
  const normalizedStatus = status.toLowerCase();

  // Mapeamento de status do frontend para o banco de dados
  const frontendToDb: Record<string, InspectionStatus> = {
    "pending": "pending",
    "pendente": "pending",
    "in_progress": "in_progress",
    "em andamento": "in_progress",
    "em_andamento": "in_progress",
    "completed": "completed",
    "concluído": "completed",
    "concluido": "completed",
    "archived": "archived",
    "arquivado": "archived"
  };

  // Mapeamento de status do banco de dados para o frontend
  const dbToFrontend: Record<string, InspectionStatus> = {
    "pending": "pending",
    "in_progress": "in_progress",
    "completed": "completed",
    "archived": "archived"
  };

  if (direction === "toDb") {
    const mappedStatus = frontendToDb[normalizedStatus];
    if (!mappedStatus) {
      console.warn(
        `[typeMapping] Status de inspeção desconhecido: "${status}". Usando "pending" como padrão.`
      );
      return "pending";
    }
    return mappedStatus;
  } else {
    const mappedStatus = dbToFrontend[normalizedStatus];
    if (!mappedStatus) {
      console.warn(
        `[typeMapping] Status de inspeção desconhecido: "${status}". Usando "pending" como padrão.`
      );
      return "pending";
    }
    return mappedStatus;
  }
}

/**
 * Mapeia prioridade de inspeção entre o frontend e o banco de dados
 * @param priority Prioridade a ser mapeada
 * @param direction Direção do mapeamento (para DB ou para frontend)
 * @returns Prioridade mapeada
 */
export function mapInspectionPriority(
  priority: string | undefined,
  direction: "toDb" | "toFrontend"
): InspectionPriority {
  if (!priority) {
    return "medium";
  }

  // Normaliza a prioridade para minúsculas para evitar problemas de case
  const normalizedPriority = priority.toLowerCase();

  // Mapeamento de prioridade do frontend para o banco de dados
  const frontendToDb: Record<string, InspectionPriority> = {
    "low": "low",
    "baixa": "low",
    "medium": "medium",
    "média": "medium",
    "media": "medium",
    "high": "high",
    "alta": "high"
  };

  // Mapeamento de prioridade do banco de dados para o frontend
  const dbToFrontend: Record<string, InspectionPriority> = {
    "low": "low",
    "medium": "medium",
    "high": "high"
  };

  if (direction === "toDb") {
    const mappedPriority = frontendToDb[normalizedPriority];
    if (!mappedPriority) {
      console.warn(
        `[typeMapping] Prioridade de inspeção desconhecida: "${priority}". Usando "medium" como padrão.`
      );
      return "medium";
    }
    return mappedPriority;
  } else {
    const mappedPriority = dbToFrontend[normalizedPriority];
    if (!mappedPriority) {
      console.warn(
        `[typeMapping] Prioridade de inspeção desconhecida: "${priority}". Usando "medium" como padrão.`
      );
      return "medium";
    }
    return mappedPriority;
  }
}

/**
 * Mapeia tipo de inspeção entre o frontend e o banco de dados
 * @param type Tipo a ser mapeado
 * @param direction Direção do mapeamento (para DB ou para frontend)
 * @returns Tipo mapeado
 */
export function mapInspectionType(
  type: string | undefined,
  direction: "toDb" | "toFrontend"
): InspectionType {
  if (!type) {
    return "internal";
  }

  // Normaliza o tipo para minúsculas para evitar problemas de case
  const normalizedType = type.toLowerCase();

  // Mapeamento de tipo do frontend para o banco de dados
  const frontendToDb: Record<string, InspectionType> = {
    "internal": "internal",
    "interna": "internal",
    "external": "external",
    "externa": "external",
    "audit": "audit",
    "auditoria": "audit",
    "routine": "routine",
    "rotina": "routine",
    "custom": "custom",
    "personalizada": "custom"
  };

  // Mapeamento de tipo do banco de dados para o frontend
  const dbToFrontend: Record<string, InspectionType> = {
    "internal": "internal",
    "external": "external",
    "audit": "audit",
    "routine": "routine",
    "custom": "custom"
  };

  if (direction === "toDb") {
    const mappedType = frontendToDb[normalizedType];
    if (!mappedType) {
      console.warn(
        `[typeMapping] Tipo de inspeção desconhecido: "${type}". Usando "internal" como padrão.`
      );
      return "internal";
    }
    return mappedType;
  } else {
    const mappedType = dbToFrontend[normalizedType];
    if (!mappedType) {
      console.warn(
        `[typeMapping] Tipo de inspeção desconhecido: "${type}". Usando "internal" como padrão.`
      );
      return "internal";
    }
    return mappedType;
  }
}

/**
 * Obtém o texto de exibição para um status de inspeção
 * @param status Status da inspeção
 * @returns Texto de exibição
 */
export function getStatusText(status: string | undefined): string {
  if (!status) return "Pendente";

  const statusMap: Record<string, string> = {
    "pending": "Pendente",
    "in_progress": "Em Andamento",
    "completed": "Concluído",
    "archived": "Arquivado"
  };

  return statusMap[status.toLowerCase()] || "Pendente";
}

/**
 * Obtém a variante de estilo para um status de inspeção
 * @param status Status da inspeção
 * @returns Variante de estilo
 */
export function getStatusVariant(status: string | undefined): "default" | "primary" | "success" | "warning" | "danger" {
  if (!status) return "default";

  const variantMap: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
    "pending": "warning",
    "in_progress": "primary",
    "completed": "success",
    "archived": "default"
  };

  return variantMap[status.toLowerCase()] || "default";
}

/**
 * Obtém o texto de exibição para uma prioridade de inspeção
 * @param priority Prioridade da inspeção
 * @returns Texto de exibição
 */
export function getPriorityText(priority: string | undefined): string {
  if (!priority) return "Média";

  const priorityMap: Record<string, string> = {
    "low": "Baixa",
    "medium": "Média",
    "high": "Alta"
  };

  return priorityMap[priority.toLowerCase()] || "Média";
}

/**
 * Obtém a variante de estilo para uma prioridade de inspeção
 * @param priority Prioridade da inspeção
 * @returns Variante de estilo
 */
export function getPriorityVariant(priority: string | undefined): "default" | "primary" | "success" | "warning" | "danger" {
  if (!priority) return "default";

  const variantMap: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
    "low": "success",
    "medium": "warning",
    "high": "danger"
  };

  return variantMap[priority.toLowerCase()] || "default";
}

/**
 * Obtém o texto de exibição para um tipo de inspeção
 * @param type Tipo da inspeção
 * @returns Texto de exibição
 */
export function getInspectionTypeText(type: string | undefined): string {
  if (!type) return "Interna";

  const typeMap: Record<string, string> = {
    "internal": "Interna",
    "external": "Externa",
    "audit": "Auditoria",
    "routine": "Rotina",
    "custom": "Personalizada"
  };

  return typeMap[type.toLowerCase()] || "Interna";
}

/**
 * Obtém o ícone para um tipo de inspeção
 * @param type Tipo da inspeção
 * @returns Nome do ícone
 */
export function getInspectionTypeIcon(type: string | undefined): string {
  if (!type) return "building";

  const iconMap: Record<string, string> = {
    "internal": "building",
    "external": "globe",
    "audit": "clipboard-check",
    "routine": "repeat",
    "custom": "settings"
  };

  return iconMap[type.toLowerCase()] || "building";
}

