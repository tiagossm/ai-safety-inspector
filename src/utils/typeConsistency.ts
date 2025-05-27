
import { ChecklistQuestion } from "@/types/newChecklist";

export function createDefaultQuestion(): ChecklistQuestion {
  return {
    id: `temp-${Date.now()}`,
    text: "",
    responseType: "sim/não",
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
    return "sim/não";
  }
  
  if (type.includes("múltipla") || type.includes("multiple") || type.includes("choice") || type.includes("select")) {
    return "seleção múltipla";
  }
  
  if (type.includes("número") || type.includes("numeric") || type.includes("number")) {
    return "numérico";
  }
  
  if (type.includes("foto") || type.includes("photo") || type.includes("imagem")) {
    return "foto";
  }
  
  if (type.includes("assinatura") || type.includes("signature")) {
    return "assinatura";
  }
  
  if (type.includes("hora") || type.includes("time")) {
    return "hora";
  }
  
  if (type.includes("data") || type.includes("date")) {
    return "data";
  }
  
  return "texto";
}

export function responseTypeToDatabase(responseType: ChecklistQuestion["responseType"]): string {
  const typeMap: Record<ChecklistQuestion["responseType"], string> = {
    "sim/não": "sim/não",
    "texto": "texto",
    "seleção múltipla": "seleção múltipla",
    "numérico": "numérico",
    "foto": "foto",
    "assinatura": "assinatura",
    "hora": "hora",
    "data": "data"
  };
  
  return typeMap[responseType] || "texto";
}

export function databaseToResponseType(dbType: string): ChecklistQuestion["responseType"] {
  const typeMap: Record<string, ChecklistQuestion["responseType"]> = {
    "sim/não": "sim/não",
    "texto": "texto",
    "seleção múltipla": "seleção múltipla",
    "numérico": "numérico",
    "foto": "foto",
    "assinatura": "assinatura",
    "hora": "hora",
    "data": "data"
  };
  
  return typeMap[dbType] || "texto";
}
