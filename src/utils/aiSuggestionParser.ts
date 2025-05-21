
export interface ParsedActionPlan {
  what: string;
  why: string;
  how: string;
  who: string;
  where: string;
  when: string | Date;
  howMuch: string;
  priority: 'alta' | 'média' | 'baixa';
}

/**
 * Extrai informações estruturadas 5W2H de uma sugestão de plano de ação
 */
export function parseAISuggestion(text: string): ParsedActionPlan {
  if (!text) {
    return createEmptyParsedPlan();
  }

  // Estrutura padrão para plano de ação
  const parsedPlan: ParsedActionPlan = createEmptyParsedPlan();

  // Expressões regulares para encontrar cada componente do 5W2H
  const patterns = {
    what: [
      /o que:?\s*([^?!.]*[?!.])/i,
      /o quê:?\s*([^?!.]*[?!.])/i,
      /(ação|ações) (a serem? )?(realizadas?|tomadas?|executadas?):?\s*([^?!.]*[?!.])/i,
      /^1[\s.-]*\s*([^?!.]*[?!.])/i, // Primeira linha em uma lista numerada
      /^[•\-*]\s*([^?!.]*[?!.])/i,  // Primeira linha em uma lista com marcadores
    ],
    why: [
      /por que:?\s*([^?!.]*[?!.])/i,
      /por quê:?\s*([^?!.]*[?!.])/i,
      /motivo:?\s*([^?!.]*[?!.])/i,
      /justificativa:?\s*([^?!.]*[?!.])/i,
      /devido a:?\s*([^?!.]*[?!.])/i,
    ],
    how: [
      /como:?\s*([^?!.]*[?!.])/i,
      /método:?\s*([^?!.]*[?!.])/i,
      /procedimento:?\s*([^?!.]*[?!.])/i,
      /etapas:?\s*([^?!.]*[?!.])/i,
      /passos:?\s*([^?!.]*[?!.])/i,
    ],
    who: [
      /quem:?\s*([^?!.]*[?!.])/i,
      /responsável:?\s*([^?!.]*[?!.])/i,
      /responsáveis:?\s*([^?!.]*[?!.])/i,
      /encarregado:?\s*([^?!.]*[?!.])/i,
      /equipe:?\s*([^?!.]*[?!.])/i,
    ],
    where: [
      /onde:?\s*([^?!.]*[?!.])/i,
      /local:?\s*([^?!.]*[?!.])/i,
      /localização:?\s*([^?!.]*[?!.])/i,
      /setor:?\s*([^?!.]*[?!.])/i,
      /área:?\s*([^?!.]*[?!.])/i,
    ],
    when: [
      /quando:?\s*([^?!.]*[?!.])/i,
      /prazo:?\s*([^?!.]*[?!.])/i,
      /data:?\s*([^?!.]*[?!.])/i,
      /cronograma:?\s*([^?!.]*[?!.])/i,
      /até:?\s*([^?!.]*[?!.])/i,
    ],
    howMuch: [
      /quanto:?\s*([^?!.]*[?!.])/i,
      /custo:?\s*([^?!.]*[?!.])/i,
      /recursos:?\s*([^?!.]*[?!.])/i,
      /investimento:?\s*([^?!.]*[?!.])/i,
      /orçamento:?\s*([^?!.]*[?!.])/i,
    ],
  };

  // Processar o texto para cada componente
  const lines = text.split('\n');
  
  // Se não encontrarmos estrutura explícita, a primeira linha se torna o "o quê"
  if (lines.length > 0 && !parsedPlan.what) {
    parsedPlan.what = lines[0].trim();
  }
  
  // Tentar encontrar cada componente utilizando as expressões regulares
  for (const [key, regexList] of Object.entries(patterns)) {
    for (const regex of regexList) {
      const match = text.match(regex);
      if (match && match.length > 1) {
        const value = match.length > 4 ? match[4].trim() : match[1].trim();
        if (value) {
          // @ts-ignore - key é uma string que corresponde a uma propriedade de parsedPlan
          parsedPlan[key] = value;
          break;
        }
      }
    }
  }

  // Inferir prioridade com base no texto
  if (text.match(/urgente|crítico|imediato|grave|alta/i)) {
    parsedPlan.priority = 'alta';
  } else if (text.match(/moderado|média|intermediário/i)) {
    parsedPlan.priority = 'média';
  } else if (text.match(/baixa|menor|pode aguardar/i)) {
    parsedPlan.priority = 'baixa';
  }

  // Se não conseguimos extrair o "o quê", usamos o texto completo
  if (!parsedPlan.what || parsedPlan.what.length < 5) {
    parsedPlan.what = text.substring(0, Math.min(text.length, 200));
  }

  return parsedPlan;
}

function createEmptyParsedPlan(): ParsedActionPlan {
  return {
    what: '',
    why: '',
    how: '',
    who: '',
    where: '',
    when: '',
    howMuch: '',
    priority: 'média',
  };
}

/**
 * Tenta extrair uma data a partir de uma string
 */
export function extractDateFromText(text: string): Date | null {
  if (!text) return null;

  // Tentar encontrar padrões de data comuns
  const datePatterns = [
    // DD/MM/YYYY
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/,
    // Formato por extenso
    /(\d{1,2})\s+de\s+([a-zA-ZçÇ]+)\s+de\s+(\d{2,4})/i,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        // Se for formato DD/MM/YYYY
        if (match[0].match(/[\/\-\.]/)) {
          const day = parseInt(match[1]);
          const month = parseInt(match[2]) - 1; // Mês em JS é 0-indexed
          const year = parseInt(match[3]);
          return new Date(year < 100 ? year + 2000 : year, month, day);
        } else {
          // Se for por extenso
          const day = parseInt(match[1]);
          const month = getMonthNumber(match[2].toLowerCase());
          const year = parseInt(match[3]);
          if (month >= 0) {
            return new Date(year < 100 ? year + 2000 : year, month, day);
          }
        }
      } catch (e) {
        console.error("Erro ao extrair data:", e);
      }
    }
  }

  // Verificar outras expressões temporais
  const timeExpressions = {
    'imediatamente': 0,
    'hoje': 0,
    'amanhã': 1,
    'semana que vem': 7,
    'próxima semana': 7,
    'próximo mês': 30,
    'mês que vem': 30,
  };

  for (const [expr, days] of Object.entries(timeExpressions)) {
    if (text.toLowerCase().includes(expr)) {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date;
    }
  }

  return null;
}

function getMonthNumber(monthName: string): number {
  const months: Record<string, number> = {
    'janeiro': 0, 'jan': 0,
    'fevereiro': 1, 'fev': 1,
    'março': 2, 'mar': 2,
    'abril': 3, 'abr': 3,
    'maio': 4, 'mai': 4,
    'junho': 5, 'jun': 5,
    'julho': 6, 'jul': 6,
    'agosto': 7, 'ago': 7,
    'setembro': 8, 'set': 8,
    'outubro': 9, 'out': 9,
    'novembro': 10, 'nov': 10,
    'dezembro': 11, 'dez': 11
  };

  for (const [name, index] of Object.entries(months)) {
    if (monthName.includes(name)) {
      return index;
    }
  }
  return -1;
}
