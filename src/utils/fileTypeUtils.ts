
// Função para determinar o tipo específico de arquivo baseado na extensão
export function determineSpecificFileType(extension: string): string {
  // Normalizar a extensão para minúsculas e remover possível ponto inicial
  const normalizedExt = extension.toLowerCase().replace(/^\./, '');
  
  // Arquivos de documento
  if (/pdf/.test(normalizedExt)) {
    return 'pdf';
  } else if (/(xlsx|xls|csv|numbers)/.test(normalizedExt)) {
    return 'excel';
  } else if (/(docx|doc|odt|rtf|txt)/.test(normalizedExt)) {
    return 'word';
  } else if (/(ppt|pptx|key|odp)/.test(normalizedExt)) {
    return 'presentation';
  } 
  
  // Arquivos de imagem
  else if (/(jpg|jpeg|png|gif|bmp|webp|tiff|tif)/.test(normalizedExt)) {
    return 'image';
  } 
  
  // Arquivos de áudio
  else if (/(mp3|wav|ogg|aac|flac|m4a)/.test(normalizedExt)) {
    return 'audio';
  } 
  
  // Arquivos de vídeo
  else if (/(mp4|avi|mov|wmv|flv|mkv|webm)/.test(normalizedExt)) {
    return 'video';
  } 
  
  // Arquivos de código
  else if (/(js|ts|py|java|html|css|php|rb|go|c|cpp|cs|swift|kotlin)/.test(normalizedExt)) {
    return 'code';
  } 
  
  // Arquivos compactados
  else if (/(zip|rar|tar|gz|7z|bz2)/.test(normalizedExt)) {
    return 'zip';
  }
  
  // Outros tipos específicos
  else if (/(json|xml|yaml|yml)/.test(normalizedExt)) {
    return 'data';
  } else if (/(svg|ai|eps|psd|sketch)/.test(normalizedExt)) {
    return 'design';
  }
  
  // Tipo genérico se não for identificado
  return 'generic';
}
