
export const frontendToDatabaseResponseType = (type: string): string => {
  switch (type) {
    case "yes_no": return "sim/não";
    case "text": return "texto";
    case "numeric": return "numérico";
    case "photo": return "foto";
    case "signature": return "assinatura";
    case "multiple_choice": return "seleção múltipla";
    case "date": return "data";
    case "time": return "hora";
    default: return type;
  }
};

export const databaseToFrontendResponseType = (type: string): string => {
  switch (type) {
    case "sim/não": return "yes_no";
    case "texto": return "text";
    case "numérico": return "numeric";
    case "foto": return "photo";
    case "assinatura": return "signature";
    case "seleção múltipla": return "multiple_choice";
    case "data": return "date";
    case "hora": return "time";
    default: return type;
  }
};
