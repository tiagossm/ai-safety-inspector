
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

export function useCSVImport() {
  const [parsedQuestions, setParsedQuestions] = useState<CSVQuestion[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processCSVData = useCallback((data: CSVQuestion[]) => {
    // Filtrar linhas vazias
    const validData = data.filter(row => {
      const values = Object.values(row);
      return values.some(value => value !== "" && value !== undefined && value !== null);
    });

    if (validData.length === 0) {
      toast.error("Nenhum dado válido encontrado no CSV");
      return;
    }

    // Validar se pelo menos temos colunas de pergunta
    const hasValidQuestions = validData.some(row => 
      row.pergunta || row.question || 
      Object.values(row).some(val => val && val.toString().trim().length > 0)
    );

    if (!hasValidQuestions) {
      toast.error("Não foi possível encontrar perguntas válidas no CSV");
      return;
    }

    setParsedQuestions(validData);
    toast.success(`${validData.length} perguntas importadas com sucesso`);
  }, []);

  const handleFileImport = useCallback((file: File) => {
    if (!file) return;

    setIsProcessing(true);
    
    Papa.parse(file, {
      header: true,
      complete: (results) => {
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

    Papa.parse(csvText, {
      header: true,
      complete: (results) => {
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
  }, []);

  const transformQuestionsForSubmit = useCallback(() => {
    return parsedQuestions.map((q, index) => ({
      pergunta: q.pergunta || q.question || `Pergunta ${index + 1}`,
      tipo_resposta: q.tipo_resposta || q.type || 'sim/não',
      obrigatorio: q.obrigatorio === 'sim' || q.obrigatorio === 'true' || q.required === 'true' || true,
      opcoes: q.opcoes || q.options ? (q.opcoes || q.options)?.split('|').map(opt => opt.trim()) : null,
      ordem: index + 1
    }));
  }, [parsedQuestions]);

  return {
    parsedQuestions,
    isProcessing,
    handleFileImport,
    handleTextImport,
    clearImportedData,
    transformQuestionsForSubmit,
    hasImportedQuestions: parsedQuestions.length > 0
  };
}
