import { Mic, FileText, Image, FileVideo, FileSpreadsheet, FileCode, Archive, FilePresentation } from 'lucide-react';

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
  // Icons are now imported at the top of the file
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
  
  // Se o nome for muito longo, trunca e adiciona "..." no meio
  if (fileName.length > 40) {
    const extension = fileName.split('.').pop() || '';
    const nameWithoutExt = fileName.substring(0, fileName.length - extension.length - 1);
    const firstPart = nameWithoutExt.substring(0, 15);
    const lastPart = nameWithoutExt.substring(nameWithoutExt.length - 15);
    
    fileName = `${firstPart}...${lastPart}.${extension}`;
  }
  
  return fileName;
}
