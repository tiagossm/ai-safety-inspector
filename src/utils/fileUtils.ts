
import { 
  FileText, Image, FileVideo, FileAudio, 
  FileCode, FileArchive, FilePdf, 
  FileSpreadsheet, FileType as FileTypeIcon
} from "lucide-react";

// Get file type from URL or file extension
export function getFileType(url: string): 'image' | 'video' | 'audio' | 'pdf' | 'excel' | 'word' | 'code' | 'zip' | 'other' {
  const lowercaseUrl = url.toLowerCase();
  
  // Check for image formats
  if (lowercaseUrl.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i) || 
      lowercaseUrl.includes('image/') || 
      lowercaseUrl.includes('/images/')) {
    return 'image';
  }
  
  // Check for video formats
  if (lowercaseUrl.match(/\.(mp4|webm|mov|avi|wmv|flv|mkv)$/i) || 
      lowercaseUrl.includes('video/')) {
    return 'video';
  }
  
  // Check for audio formats
  if (lowercaseUrl.match(/\.(mp3|wav|ogg|m4a|flac|aac)$/i) || 
      lowercaseUrl.includes('audio/')) {
    return 'audio';
  }
  
  // Check for document types
  if (lowercaseUrl.match(/\.pdf$/i)) {
    return 'pdf';
  }
  
  if (lowercaseUrl.match(/\.(xlsx|xls|csv)$/i)) {
    return 'excel';
  }
  
  if (lowercaseUrl.match(/\.(docx|doc)$/i)) {
    return 'word';
  }
  
  if (lowercaseUrl.match(/\.(js|ts|jsx|tsx|html|css|json|xml|py|java|php)$/i)) {
    return 'code';
  }
  
  if (lowercaseUrl.match(/\.(zip|rar|7z|tar|gz)$/i)) {
    return 'zip';
  }
  
  return 'other';
}

// Get appropriate icon component for a file type
export function getFileIcon(fileType: string): typeof FileTypeIcon {
  switch (fileType) {
    case 'image':
      return Image;
    case 'video':
      return FileVideo;
    case 'audio':
      return FileAudio;
    case 'pdf':
      return FilePdf;
    case 'excel':
      return FileSpreadsheet;
    case 'word':
      return FileText;
    case 'code':
      return FileCode;
    case 'zip':
      return FileArchive;
    default:
      return FileText;
  }
}
