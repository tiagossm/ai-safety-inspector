
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
  
  if (type.includes("sim") || type.includes("não") || type.includes("yes") || type.includes("no") || type === "boolean" || type === "yes_no") {
    return "sim/não";
  }
  
  if (type.includes("múltipla") || type.includes("multiple") || type.includes("choice") || type.includes("select") || type === "multiple_choice") {
    return "seleção múltipla";
  }
  
  if (type.includes("número") || type.includes("numeric") || type.includes("number") || type === "numeric") {
    return "numérico";
  }
  
  if (type.includes("foto") || type.includes("photo") || type.includes("imagem") || type === "photo") {
    return "foto";
  }
  
  if (type.includes("assinatura") || type.includes("signature") || type === "signature") {
    return "assinatura";
  }
  
  if (type.includes("hora") || type.includes("time") || type === "time") {
    return "hora";
  }
  
  if (type.includes("data") || type.includes("date") || type === "date") {
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
