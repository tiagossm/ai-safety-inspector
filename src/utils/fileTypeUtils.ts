
/**
 * Determina o tipo específico de arquivo com base na extensão
 */
export function determineSpecificFileType(extension: string): string {
  // Arquivos de imagem
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic'].includes(extension)) {
    return 'image';
  }
  
  // Arquivos de vídeo
  if (['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv'].includes(extension)) {
    // Se for um arquivo webm de áudio, tratamos como áudio
    if (extension === 'webm') {
      // Em alguns casos, webm pode ser áudio ou vídeo
      // Idealmente, verificaríamos o conteúdo do arquivo, mas para fins simples,
      // assumimos como vídeo (será tratado apropriadamente pela função de análise)
      return 'video';
    }
    return 'video';
  }
  
  // Arquivos de áudio
  if (['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(extension)) {
    return 'audio';
  }
  
  // Documentos
  if (extension === 'pdf') {
    return 'pdf';
  }
  
  if (['doc', 'docx'].includes(extension)) {
    return 'word';
  }
  
  if (['xls', 'xlsx', 'csv'].includes(extension)) {
    return 'excel';
  }
  
  if (['ppt', 'pptx'].includes(extension)) {
    return 'presentation';
  }
  
  // Arquivos de código
  if (['js', 'ts', 'html', 'css', 'php', 'py', 'java', 'rb', 'c', 'cpp'].includes(extension)) {
    return 'code';
  }
  
  // Arquivos compactados
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
    return 'zip';
  }
  
  // Tipo genérico para outros formatos
  return 'file';
}
