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
