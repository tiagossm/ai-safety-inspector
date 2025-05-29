
export function handleReportGenerationError(error: any, context: string): Error {
  console.error(`Erro em ${context}:`, error);
  
  if (error instanceof Error) {
    return new Error(`${context}: ${error.message}`);
  }
  
  return new Error(`${context}: Erro desconhecido`);
}

// Adicionar função para tratar erros da OpenAI
export function handleOpenAIError(error: any, context: string): void {
  console.error(`Erro da OpenAI em ${context}:`, error);
  
  // Log detalhado do erro para debug
  if (error && typeof error === 'object') {
    console.error('Detalhes do erro:', {
      message: error.message,
      code: error.code,
      status: error.status,
      type: error.type
    });
  }
}
