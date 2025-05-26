
import { ChecklistQuestion } from "@/types/newChecklist";

export function createDefaultQuestion(): ChecklistQuestion {
  return {
    id: `temp-${Date.now()}`,
    text: "",
    responseType: "yes_no",
    isRequired: true,
    order: 0,
    weight: 1,
    allowsPhoto: false,
    allowsVideo: false,
    allowsAudio: false,
    allowsFiles: false,
    options: []
  };
}

export function normalizeResponseType(responseType: string): ChecklistQuestion["responseType"] {
  const type = responseType.toLowerCase();
  
  if (type.includes("sim") || type.includes("não") || type.includes("yes") || type.includes("no") || type === "boolean") {
    return "yes_no";
  }
  
  if (type.includes("múltipla") || type.includes("multiple") || type.includes("choice") || type.includes("select")) {
    return "multiple_choice";
  }
  
  if (type.includes("número") || type.includes("numeric") || type.includes("number")) {
    return "numeric";
  }
  
  if (type.includes("foto") || type.includes("photo") || type.includes("imagem")) {
    return "photo";
  }
  
  if (type.includes("assinatura") || type.includes("signature")) {
    return "signature";
  }
  
  if (type.includes("hora") || type.includes("time")) {
    return "time";
  }
  
  if (type.includes("data") || type.includes("date")) {
    return "date";
  }
  
  return "text";
}

export function responseTypeToDatabase(responseType: ChecklistQuestion["responseType"]): string {
  const typeMap: Record<ChecklistQuestion["responseType"], string> = {
    "yes_no": "sim/não",
    "text": "texto",
    "multiple_choice": "seleção múltipla",
    "numeric": "numérico",
    "photo": "foto",
    "signature": "assinatura",
    "time": "hora",
    "date": "data"
  };
  
  return typeMap[responseType] || "texto";
}

export function databaseToResponseType(dbType: string): ChecklistQuestion["responseType"] {
  const typeMap: Record<string, ChecklistQuestion["responseType"]> = {
    "sim/não": "yes_no",
    "texto": "text",
    "seleção múltipla": "multiple_choice",
    "numérico": "numeric",
    "foto": "photo",
    "assinatura": "signature",
    "hora": "time",
    "data": "date"
  };
  
  return typeMap[dbType] || "text";
}
