import { 
  Inspection, 
  InspectionDetails, 
  InspectionResponse,
  InspectionMetadata,
  GeoCoordinates
} from "@/types/inspection";
import { 
  mapInspectionStatus, 
  mapInspectionPriority, 
  mapInspectionType 
} from "./typeMapping";

/**
 * Normaliza o tipo de resposta
 * @param responseType Tipo de resposta a ser normalizado
 * @param direction Direção da normalização (para DB ou para frontend)
 * @returns Tipo de resposta normalizado
 */
export function normalizeResponseType(
  responseType: string | undefined,
  direction: "toDb" | "toFrontend" = "toFrontend"
): string {
  if (!responseType) return "text";

  const normalizedType = responseType.toLowerCase();

  // Mapeamento de tipos de resposta do banco de dados para o frontend
  const dbToFrontend: Record<string, string> = {
    "yes/no": "yes/no",
    "sim/não": "yes/no",
    "sim/nao": "yes/no",
    "multiple_choice": "multiple_choice",
    "seleção múltipla": "multiple_choice",
    "selecao multipla": "multiple_choice",
    "text": "text",
    "texto": "text",
    "number": "number",
    "numérico": "number",
    "numerico": "number",
    "photo": "photo",
    "foto": "photo",
    "signature": "signature",
    "assinatura": "signature",
    "time": "time",
    "hora": "time",
    "date": "date",
    "data": "date"
  };

  // Mapeamento de tipos de resposta do frontend para o banco de dados
  const frontendToDb: Record<string, string> = {
    "yes/no": "yes/no",
    "multiple_choice": "multiple_choice",
    "text": "text",
    "number": "number",
    "photo": "photo",
    "signature": "signature",
    "time": "time",
    "date": "date"
  };

  if (direction === "toFrontend") {
    return dbToFrontend[normalizedType] || "text";
  } else {
    return frontendToDb[normalizedType] || "text";
  }
}

/**
 * Normaliza uma pergunta de inspeção
 * @param question Pergunta a ser normalizada
 * @returns Pergunta normalizada
 */
export function normalizeQuestion(question: any): any {
  if (!question) return null;

  return {
    id: question.id,
    text: question.pergunta || "",
    responseType: normalizeResponseType(question.tipo_resposta),
    isRequired: question.obrigatorio || false,
    order: question.ordem || 0,
    options: Array.isArray(question.opcoes) ? question.opcoes.map(opt => String(opt)) : [],
    allowsPhoto: question.permite_foto || false,
    allowsVideo: question.permite_video || false,
    allowsAudio: question.permite_audio || false,
    allowsFiles: question.permite_files || false,
    weight: question.weight || 1,
    hint: question.hint || "",
    groupId: question.group_id,
    condition: question.condition,
    conditionValue: question.condition_value,
    parentQuestionId: question.parent_item_id,
    hasSubChecklist: question.has_subchecklist || false,
    subChecklistId: question.sub_checklist_id
  };
}

/**
 * Normaliza metadados de inspeção
 * @param metadata Metadados a serem normalizados
 * @returns Metadados normalizados
 */
export function normalizeMetadata(metadata: any): InspectionMetadata {
  if (!metadata) return {};

  // Se for string, tenta fazer parse
  if (typeof metadata === 'string') {
    try {
      const parsed = JSON.parse(metadata);
      return typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      console.error("Erro ao fazer parse de metadata:", e);
      return {};
    }
  }

  // Se já for objeto, retorna diretamente
  if (typeof metadata === 'object') {
    return metadata;
  }

  return {};
}

/**
 * Normaliza coordenadas geográficas
 * @param coordinates Coordenadas a serem normalizadas
 * @returns Coordenadas normalizadas
 */
export function normalizeCoordinates(coordinates: any): GeoCoordinates | null {
  if (!coordinates) return null;

  // Se for string, tenta fazer parse
  if (typeof coordinates === 'string') {
    try {
      const parsed = JSON.parse(coordinates);
      if (typeof parsed === 'object' && 'latitude' in parsed && 'longitude' in parsed) {
        return {
          latitude: Number(parsed.latitude),
          longitude: Number(parsed.longitude),
          accuracy: parsed.accuracy ? Number(parsed.accuracy) : undefined
        };
      }
      return null;
    } catch (e) {
      console.error("Erro ao fazer parse de coordinates:", e);
      return null;
    }
  }

  // Se já for objeto, valida e retorna
  if (typeof coordinates === 'object' && coordinates !== null) {
    if ('latitude' in coordinates && 'longitude' in coordinates) {
      return {
        latitude: Number(coordinates.latitude),
        longitude: Number(coordinates.longitude),
        accuracy: coordinates.accuracy ? Number(coordinates.accuracy) : undefined
      };
    }
  }

  return null;
}

/**
 * Normaliza uma inspeção do banco de dados para o frontend
 * @param inspection Inspeção a ser normalizada
 * @returns Inspeção normalizada
 */
export function normalizeInspection(inspection: any): Inspection {
  if (!inspection) return {} as Inspection;

  // Normalizar metadados
  const normalizedMetadata = normalizeMetadata(inspection.metadata);

  return {
    id: inspection.id,
    title: inspection.title || "",
    description: inspection.description || "",
    checklist_id: inspection.checklist_id,
    company_id: inspection.company_id,
    responsible_id: inspection.responsible_id,
    responsible_ids: inspection.responsible_ids || (inspection.responsible_id ? [inspection.responsible_id] : []),
    scheduled_date: inspection.scheduled_date,
    location: inspection.location || "",
    status: mapInspectionStatus(inspection.status, "toFrontend"),
    priority: mapInspectionPriority(inspection.priority, "toFrontend"),
    inspection_type: mapInspectionType(inspection.inspection_type, "toFrontend"),
    metadata: normalizedMetadata,
    created_at: inspection.created_at,
    updated_at: inspection.updated_at,
    created_by: inspection.created_by,
    updated_by: inspection.updated_by,
    sync_status: inspection.sync_status,
    
    // Relações
    checklist: inspection.checklists ? {
      id: inspection.checklists.id,
      title: inspection.checklists.title,
      description: inspection.checklists.description
    } : undefined,
    
    company: inspection.companies ? {
      id: inspection.companies.id,
      fantasy_name: inspection.companies.fantasy_name,
      cnpj: inspection.companies.cnpj
    } : undefined,
    
    responsible: inspection.users ? {
      id: inspection.users.id,
      name: inspection.users.name,
      email: inspection.users.email
    } : undefined
  };
}

/**
 * Normaliza uma inspeção para exibição na UI
 * @param inspection Inspeção a ser normalizada
 * @param questions Perguntas da inspeção
 * @param responses Respostas da inspeção
 * @returns Detalhes da inspeção normalizados
 */
export function normalizeInspectionDetails(
  inspection: any,
  questions: any[] = [],
  responses: Record<string, any> = {}
): InspectionDetails {
  if (!inspection) return {} as InspectionDetails;

  // Calcular progresso
  const totalQuestions = questions.length;
  const answeredQuestions = Object.keys(responses).length;
  const progress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  // Normalizar metadados
  const normalizedMetadata = normalizeMetadata(inspection.metadata);

  return {
    id: inspection.id,
    title: inspection.title || (inspection.checklist?.title || "Sem título"),
    description: inspection.description || inspection.checklist?.description,
    checklistId: inspection.checklist_id,
    checklistTitle: inspection.checklist?.title,
    companyId: inspection.company_id,
    companyName: inspection.company?.fantasy_name,
    responsibleId: inspection.responsible_id,
    responsibleName: inspection.responsible?.name,
    scheduledDate: inspection.scheduled_date,
    location: inspection.location,
    status: mapInspectionStatus(inspection.status, "toFrontend"),
    priority: mapInspectionPriority(inspection.priority, "toFrontend"),
    inspectionType: mapInspectionType(inspection.inspection_type, "toFrontend"),
    createdAt: inspection.created_at,
    updatedAt: inspection.updated_at,
    progress,
    totalQuestions,
    completedQuestions: answeredQuestions,
    metadata: normalizedMetadata,
    
    // Relações
    company: inspection.company ? {
      id: inspection.company.id,
      fantasy_name: inspection.company.fantasy_name
    } : undefined,
    
    responsible: inspection.responsible ? {
      id: inspection.responsible.id,
      name: inspection.responsible.name
    } : undefined,
    
    checklist: inspection.checklist ? {
      id: inspection.checklist.id,
      title: inspection.checklist.title
    } : undefined
  };
}

/**
 * Normaliza uma resposta de inspeção
 * @param response Resposta a ser normalizada
 * @returns Resposta normalizada
 */
export function normalizeResponse(response: any): InspectionResponse {
  if (!response) return {} as InspectionResponse;

  return {
    id: response.id,
    inspection_id: response.inspection_id,
    inspection_item_id: response.inspection_item_id,
    question_id: response.question_id,
    response: response.response,
    media_urls: response.media_urls || [],
    created_at: response.created_at,
    updated_at: response.updated_at,
    created_by: response.created_by,
    updated_by: response.updated_by
  };
}

