
export function handleReportGenerationError(error: any, context: string): Error {
  console.error(`Erro em ${context}:`, error);
  
  if (error instanceof Error) {
    return new Error(`${context}: ${error.message}`);
  }
  
  return new Error(`${context}: Erro desconhecido`);
}
