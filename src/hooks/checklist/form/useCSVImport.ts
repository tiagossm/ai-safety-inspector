
import { useState, useCallback } from "react";
import { toast } from "sonner";
import Papa from "papaparse";

export interface CSVQuestion {
  pergunta?: string;
  question?: string;
  tipo_resposta?: string;
  type?: string;
  obrigatorio?: string;
  required?: string;
  opcoes?: string;
  options?: string;
}

export interface ProcessedQuestion {
  pergunta: string;
  tipo_resposta: string;
  obrigatorio: boolean;
  opcoes: string[] | null;
  ordem: number;
}

export function useCSVImport() {
  const [parsedQuestions, setParsedQuestions] = useState<CSVQuestion[]>([]);
  const [processedQuestions, setProcessedQuestions] = useState<ProcessedQuestion[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validResponseTypes = ['sim/não', 'texto', 'seleção múltipla', 'numérico', 'foto', 'assinatura', 'time', 'date'];

  const validateCSVData = useCallback((data: CSVQuestion[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (data.length === 0) {
      errors.push("Nenhum dado encontrado no arquivo");
      return { valid: false, errors };
    }

    const firstRow = data[0];
    
    const hasQuestionColumn = firstRow.hasOwnProperty('pergunta') || firstRow.hasOwnProperty('question');
    const hasTypeColumn = firstRow.hasOwnProperty('tipo_resposta') || firstRow.hasOwnProperty('type');
    const hasRequiredColumn = firstRow.hasOwnProperty('obrigatorio') || firstRow.hasOwnProperty('required');

    if (!hasQuestionColumn) {
      errors.push("Coluna 'pergunta' ou 'question' é obrigatória");
    }
    if (!hasTypeColumn) {
      errors.push("Coluna 'tipo_resposta' ou 'type' é obrigatória");
    }
    if (!hasRequiredColumn) {
      errors.push("Coluna 'obrigatorio' ou 'required' é obrigatória");
    }

    data.forEach((row, index) => {
      const rowNumber = index + 1;
      const pergunta = row.pergunta || row.question;
      const tipo = row.tipo_resposta || row.type;
      const obrigatorio = row.obrigatorio || row.required;

      if (!pergunta || pergunta.trim() === '') {
        errors.push(`Linha ${rowNumber}: Pergunta não pode estar vazia`);
      }

      if (!tipo || !validResponseTypes.includes(tipo)) {
        errors.push(`Linha ${rowNumber}: Tipo de resposta inválido "${tipo}". Use: ${validResponseTypes.join(', ')}`);
      }

      if (obrigatorio && !['true', 'false', 'sim', 'não'].includes(String(obrigatorio).toLowerCase())) {
        errors.push(`Linha ${rowNumber}: Campo obrigatório deve ser "true", "false", "sim" ou "não"`);
      }

      if (tipo === 'seleção múltipla') {
        const opcoes = row.opcoes || row.options;
        if (!opcoes || opcoes.trim() === '') {
          errors.push(`Linha ${rowNumber}: Seleção múltipla deve ter opções definidas`);
        } else if (!opcoes.includes('|')) {
          errors.push(`Linha ${rowNumber}: Opções de seleção múltipla devem ser separadas por "|"`);
        }
      }
    });

    return { valid: errors.length === 0, errors };
  }, [validResponseTypes]);

  const processCSVData = useCallback((data: CSVQuestion[]) => {
    console.log("Iniciando processamento de dados CSV:", data);
    
    const validData = data.filter(row => {
      const values = Object.values(row);
      return values.some(value => value !== "" && value !== undefined && value !== null);
    });

    if (validData.length === 0) {
      toast.error("Nenhum dado válido encontrado no CSV");
      return;
    }

    const validation = validateCSVData(validData);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      validation.errors.forEach(error => {
        toast.error(error);
      });
      return;
    }

    const processed: ProcessedQuestion[] = validData.map((row, index) => {
      const pergunta = (row.pergunta || row.question || `Pergunta ${index + 1}`).trim();
      const tipo_resposta = (row.tipo_resposta || row.type || 'texto').trim();
      const obrigatorioValue = (row.obrigatorio || row.required || 'true').toLowerCase();
      const obrigatorio = obrigatorioValue === 'true' || obrigatorioValue === 'sim';
      
      let opcoes: string[] | null = null;
      if (tipo_resposta === 'seleção múltipla') {
        const opcoesString = row.opcoes || row.options;
        if (opcoesString) {
          opcoes = opcoesString.split('|').map(opt => opt.trim()).filter(opt => opt.length > 0);
        }
      }

      return {
        pergunta,
        tipo_resposta,
        obrigatorio,
        opcoes,
        ordem: index + 1
      };
    });

    setParsedQuestions(validData);
    setProcessedQuestions(processed);
    setValidationErrors([]);
    
    console.log("Dados processados com sucesso:", processed);
    toast.success(`${processed.length} perguntas processadas com sucesso`);
  }, [validateCSVData]);

  const handleFileImport = useCallback((file: File) => {
    if (!file) return;

    setIsProcessing(true);
    setValidationErrors([]);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          console.warn("Erros de parsing CSV:", results.errors);
          results.errors.forEach(error => {
            if (error.type === 'Quotes') {
              toast.warning(`Aviso linha ${error.row}: Problema com aspas - ${error.message}`);
            }
          });
        }
        
        processCSVData(results.data as CSVQuestion[]);
        setIsProcessing(false);
      },
      error: (error) => {
        console.error("Erro ao processar arquivo CSV:", error);
        toast.error(`Erro ao processar arquivo: ${error.message}`);
        setIsProcessing(false);
      }
    });
  }, [processCSVData]);

  const handleTextImport = useCallback((csvText: string) => {
    if (!csvText.trim()) {
      toast.error("Texto CSV está vazio");
      return;
    }

    setIsProcessing(true);
    setValidationErrors([]);

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          console.warn("Erros de parsing CSV:", results.errors);
          results.errors.forEach(error => {
            if (error.type === 'Quotes') {
              toast.warning(`Aviso linha ${error.row}: Problema com aspas`);
            }
          });
        }
        
        processCSVData(results.data as CSVQuestion[]);
        setIsProcessing(false);
      },
      error: (error) => {
        console.error("Erro ao processar texto CSV:", error);
        toast.error(`Erro ao processar texto: ${error.message}`);
        setIsProcessing(false);
      }
    });
  }, [processCSVData]);

  const clearImportedData = useCallback(() => {
    setParsedQuestions([]);
    setProcessedQuestions([]);
    setValidationErrors([]);
    toast.info("Dados limpos. Você pode importar um novo arquivo.");
  }, []);

  const transformQuestionsForSubmit = useCallback(() => {
    return processedQuestions.map((q, index) => ({
      pergunta: q.pergunta,
      tipo_resposta: q.tipo_resposta,
      obrigatorio: q.obrigatorio,
      opcoes: q.opcoes,
      ordem: index + 1
    }));
  }, [processedQuestions]);

  const getQuestionPreview = useCallback((limit: number = 5) => {
    return processedQuestions.slice(0, limit);
  }, [processedQuestions]);

  const getValidationSummary = useCallback(() => {
    return {
      totalQuestions: processedQuestions.length,
      requiredQuestions: processedQuestions.filter(q => q.obrigatorio).length,
      optionalQuestions: processedQuestions.filter(q => !q.obrigatorio).length,
      multipleChoiceQuestions: processedQuestions.filter(q => q.tipo_resposta === 'seleção múltipla').length,
      hasErrors: validationErrors.length > 0,
      errorCount: validationErrors.length
    };
  }, [processedQuestions, validationErrors]);

  return {
    parsedQuestions,
    processedQuestions,
    isProcessing,
    validationErrors,
    handleFileImport,
    handleTextImport,
    clearImportedData,
    transformQuestionsForSubmit,
    getQuestionPreview,
    getValidationSummary,
    hasImportedQuestions: processedQuestions.length > 0,
    hasValidationErrors: validationErrors.length > 0
  };
}
