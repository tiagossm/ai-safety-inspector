import { useState, useEffect } from "react";
import { standardizeQuestion, standardizeResponse } from "@/utils/responseTypeStandardization";
import { debugLog } from "@/utils/debugUtils";

// Hook para testar e validar a padronização de tipos de resposta
export function useResponseTypeTesting() {
  const [testResults, setTestResults] = useState<any[]>([]);

  const runTests = () => {
    const testCases = [
      { pergunta: "Teste Hora", tipo_resposta: "time" },
      { pergunta: "Teste Sim/Não", tipo_resposta: "yes_no" },
      { pergunta: "Teste Texto", tipo_resposta: "text" },
      { pergunta: "Teste Data", tipo_resposta: "date" },
      { pergunta: "Teste Foto", tipo_resposta: "photo" },
      { pergunta: "Teste Assinatura", tipo_resposta: "signature" },
      { pergunta: "Teste Dropdown", tipo_resposta: "dropdown" },
      { pergunta: "Teste Múltipla Escolha", tipo_resposta: "multiple_choice" },
    ];

    const results = testCases.map(testCase => {
      const standardized = standardizeQuestion(testCase);
      const response = standardizeResponse({ value: "test" });
      
      return {
        original: testCase,
        standardized,
        response,
        mappedCorrectly: standardized.responseType === testCase.tipo_resposta
      };
    });

    setTestResults(results);
    debugLog("Response Type Tests", "Test Results", results);
    
    return results;
  };

  const validateResponse = (response: any, expectedStructure: string[]) => {
    const standardized = standardizeResponse(response);
    const hasAllFields = expectedStructure.every(field => 
      standardized.hasOwnProperty(field)
    );
    
    debugLog("Response Validation", "Structure check", {
      original: response,
      standardized,
      hasAllFields,
      missingFields: expectedStructure.filter(field => 
        !standardized.hasOwnProperty(field)
      )
    });

    return { standardized, hasAllFields };
  };

  return {
    testResults,
    runTests,
    validateResponse
  };
}