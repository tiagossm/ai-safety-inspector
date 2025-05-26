
export const QUESTION_TYPES = [
  { value: "yes_no", label: "Sim/Não" },
  { value: "text", label: "Texto" },
  { value: "multiple_choice", label: "Múltipla Escolha" },
  { value: "numeric", label: "Numérico" },
  { value: "photo", label: "Foto" },
  { value: "signature", label: "Assinatura" },
  { value: "time", label: "Hora" },
  { value: "date", label: "Data" }
] as const;

export type QuestionType = typeof QUESTION_TYPES[number]["value"];

export const RESPONSE_TYPE_MAP = {
  frontend: {
    "yes_no": "Sim/Não",
    "text": "Texto",
    "multiple_choice": "Múltipla Escolha",
    "numeric": "Numérico",
    "photo": "Foto", 
    "signature": "Assinatura",
    "time": "Hora",
    "date": "Data"
  },
  database: {
    "yes_no": "sim/não",
    "text": "texto",
    "multiple_choice": "seleção múltipla",
    "numeric": "numérico",
    "photo": "foto",
    "signature": "assinatura", 
    "time": "hora",
    "date": "data"
  }
} as const;

export const MEDIA_PERMISSIONS = [
  { key: "allowsPhoto", label: "Imagem", icon: "Image" },
  { key: "allowsVideo", label: "Vídeo", icon: "Video" },
  { key: "allowsAudio", label: "Áudio", icon: "Mic" },
  { key: "allowsFiles", label: "Anexo", icon: "FileText" }
] as const;
