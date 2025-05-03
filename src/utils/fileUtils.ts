
import { 
  FileText, 
  Image, 
  FileAudio, 
  FileVideo, 
  File as FileIcon,
  FilePdf,
  FileSpreadsheet,
  FileCode,
  FileZip
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Determines the file type based on URL or filename
 */
export function getFileType(url: string): 'image' | 'audio' | 'video' | 'pdf' | 'excel' | 'word' | 'code' | 'zip' | 'other' {
  // Get file extension
  const extension = url.toLowerCase().split('.').pop() || '';
  
  // Image types
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension) || url.includes('image/')) {
    return 'image';
  }
  
  // Audio types
  if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(extension) || url.includes('audio/')) {
    return 'audio';
  }
  
  // Video types
  if (['mp4', 'webm', 'mov', 'avi', 'wmv'].includes(extension) || url.includes('video/')) {
    return 'video';
  }
  
  // Document types
  if (extension === 'pdf' || url.includes('application/pdf')) {
    return 'pdf';
  }
  
  // Spreadsheet types
  if (['xlsx', 'xls', 'csv'].includes(extension) || url.includes('spreadsheet')) {
    return 'excel';
  }
  
  // Word document types
  if (['doc', 'docx', 'rtf'].includes(extension) || url.includes('msword')) {
    return 'word';
  }
  
  // Code file types
  if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'xml', 'py', 'java', 'php', 'rb'].includes(extension)) {
    return 'code';
  }
  
  // Archive types
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
    return 'zip';
  }
  
  // Default
  return 'other';
}

/**
 * Returns the appropriate icon for a file type
 */
export function getFileIcon(type: ReturnType<typeof getFileType>): LucideIcon {
  switch (type) {
    case 'image':
      return Image;
    case 'audio':
      return FileAudio;
    case 'video':
      return FileVideo;
    case 'pdf':
      return FilePdf;
    case 'excel':
      return FileSpreadsheet;
    case 'word':
      return FileText;
    case 'code':
      return FileCode;
    case 'zip':
      return FileZip;
    default:
      return FileIcon;
  }
}
