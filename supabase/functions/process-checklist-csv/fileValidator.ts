
// Tipos de arquivos permitidos
const ALLOWED_FILE_TYPES = [
  'text/csv', 
  'application/vnd.ms-excel', 
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// Tamanho máximo do arquivo em bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Função para validar um arquivo
export function validateFile(file: File): { valid: boolean; message: string } {
  // Verificar se o arquivo existe
  if (!file) {
    return {
      valid: false,
      message: 'Nenhum arquivo fornecido.'
    };
  }
  
  // Verificar o tipo do arquivo
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      message: 'Tipo de arquivo inválido. Por favor, forneça um arquivo CSV ou Excel (.csv, .xls, .xlsx).'
    };
  }
  
  // Verificar o tamanho do arquivo
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      message: `Arquivo muito grande. O tamanho máximo permitido é ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
    };
  }
  
  return {
    valid: true,
    message: 'Arquivo válido'
  };
}
