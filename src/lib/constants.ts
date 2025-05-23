export const TIPOS_QUESTAO = [
  { value: "sim/não", label: "Sim/Não" },
  { value: "texto", label: "Texto" },
  { value: "numérico", label: "Numérico" },
  { value: "seleção múltipla", label: "Seleção Múltipla" },
  { value: "foto", label: "Foto" },
  { value: "assinatura", label: "Assinatura" },
  { value: "hora", label: "Hora" },
  { value: "data", label: "Data" }
] as const;

export type TipoQuestao = typeof TIPOS_QUESTAO[number]["value"];
