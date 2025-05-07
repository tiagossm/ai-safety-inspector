
import {
  File,
  FileText,
  Image,
  Music,
  Video,
  FileArchive,
  FileCode,
  FilePieChart,
} from 'lucide-react';

/**
 * Extrai o nome do arquivo a partir de uma URL
 * @param url URL do arquivo
 * @returns Nome do arquivo
 */
export function getFilenameFromUrl(url: string): string {
  try {
    // Remover parâmetros de query
    const urlWithoutQuery = url.split('?')[0];
    // Obter a última parte do caminho
    const parts = urlWithoutQuery.split('/');
    const filename = parts[parts.length - 1];
    // Decodificar o nome do arquivo
    return decodeURIComponent(filename);
  } catch (e) {
    return 'arquivo';
  }
}

/**
 * Detecta o tipo de arquivo com base na URL ou extensão
 * @param url URL ou caminho do arquivo
 * @returns Tipo de arquivo: 'image', 'audio', 'video', 'pdf', etc.
 */
export function getFileType(url: string): string {
  const filename = url.toLowerCase();

  // Imagens
  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(filename)) {
    return 'image';
  }
  
  // Áudio
  if (/\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(filename)) {
    return 'audio';
  }
  
  // Vídeo
  if (/\.(mp4|webm|mkv|avi|mov|flv)$/i.test(filename)) {
    return 'video';
  }
  
  // Documentos comuns
  if (/\.pdf$/i.test(filename)) {
    return 'pdf';
  }
  
  if (/\.(doc|docx)$/i.test(filename)) {
    return 'word';
  }
  
  if (/\.(xls|xlsx|csv)$/i.test(filename)) {
    return 'excel';
  }
  
  if (/\.(ppt|pptx)$/i.test(filename)) {
    return 'presentation';
  }
  
  // Arquivos compactados
  if (/\.(zip|rar|7z|tar|gz)$/i.test(filename)) {
    return 'zip';
  }
  
  // Arquivos de código
  if (/\.(js|ts|html|css|py|java|c|cpp|php|json|xml)$/i.test(filename)) {
    return 'code';
  }
  
  // Outros tipos
  return 'file';
}

/**
 * Retorna o tamanho de arquivo formatado (KB, MB, etc.)
 * @param bytes Tamanho em bytes
 * @returns Tamanho formatado
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Retorna o componente de ícone para um tipo de arquivo
 * @param fileType Tipo de arquivo
 * @returns Componente React de ícone
 */
export function getFileIcon(fileType: string): any {
  switch (fileType) {
    case 'image':
      return Image;
    case 'audio':
      return Music;
    case 'video':
      return Video;
    case 'pdf':
      return FileText;
    case 'word':
      return FileText;
    case 'excel':
      return FilePieChart;
    case 'presentation':
      return FilePieChart;
    case 'zip':
      return FileArchive;
    case 'code':
      return FileCode;
    default:
      return File;
  }
}
