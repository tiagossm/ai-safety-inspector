
export function getFileType(url: string): 'image' | 'video' | 'audio' | 'file' {
  const extension = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
  
  // Imagens
  if (/^(jpe?g|png|gif|bmp|webp|svg|heic)$/.test(extension)) {
    return 'image';
  }
  
  // Vídeos
  if (/^(mp4|webm|mov|avi|wmv|flv|mkv)$/.test(extension)) {
    return 'video';
  }
  
  // Áudios
  if (/^(mp3|wav|ogg|m4a|flac|aac)$/.test(extension)) {
    return 'audio';
  }
  
  // Documentos e outros
  return 'file';
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Função para obter o ícone baseado no tipo de arquivo
export function getFileIcon(fileType: string) {
  // Importamos os ícones dinamicamente na função que os usa
  const { FileText, Image, FileVideo, Mic, FileSpreadsheet, FileCode, Archive, FilePresentation } = require('lucide-react');
  
  switch (fileType) {
    case 'image':
      return Image;
    case 'video':
      return FileVideo;
    case 'audio':
      return Mic;
    case 'pdf':
      return FileText;
    case 'excel':
      return FileSpreadsheet;
    case 'word':
      return FileText;
    case 'code':
      return FileCode;
    case 'zip':
      return Archive;
    case 'presentation':
      return FilePresentation;
    default:
      return FileText;
  }
}

// Função para extrair o nome do arquivo da URL
export function getFilenameFromUrl(url: string): string {
  // Remove parâmetros de query
  const cleanUrl = url.split('?')[0];
  
  // Extrai a última parte da URL após a última barra
  const parts = cleanUrl.split('/');
  let fileName = parts[parts.length - 1];
  
  // Decodifica caracteres especiais
  try {
    fileName = decodeURIComponent(fileName);
  } catch (e) {
    console.error("Erro ao decodificar nome do arquivo:", e);
  }
  
  return fileName;
}
