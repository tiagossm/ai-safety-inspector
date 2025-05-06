
import { 
  FileText, Image, FileVideo, FileAudio, 
  FileCode, FileArchive, File as FilePdf, 
  FileSpreadsheet, FileType as FileTypeIcon,
  FileImage, FileBox,
} from "lucide-react";

export type FileType = 'image' | 'video' | 'audio' | 'pdf' | 'excel' | 'word' | 'code' | 'zip' | 'presentation' | 'json' | 'other';

// Get file type from URL or file extension
export function getFileType(url: string): FileType {
  const lowercaseUrl = url.toLowerCase();
  
  // Check for image formats
  if (lowercaseUrl.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg|avif|heif|heic)$/i) || 
      lowercaseUrl.includes('image/') || 
      lowercaseUrl.includes('/images/')) {
    return 'image';
  }
  
  // Check for video formats
  if (lowercaseUrl.match(/\.(mp4|webm|mov|avi|wmv|flv|mkv|m4v|3gp)$/i) || 
      lowercaseUrl.includes('video/')) {
    return 'video';
  }
  
  // Check for audio formats
  if (lowercaseUrl.match(/\.(mp3|wav|ogg|m4a|flac|aac|opus)$/i) || 
      lowercaseUrl.includes('audio/')) {
    return 'audio';
  }
  
  // Check for document types
  if (lowercaseUrl.match(/\.pdf$/i)) {
    return 'pdf';
  }
  
  if (lowercaseUrl.match(/\.(xlsx|xls|csv|numbers)$/i)) {
    return 'excel';
  }
  
  if (lowercaseUrl.match(/\.(docx|doc|odt|rtf|txt|pages)$/i)) {
    return 'word';
  }
  
  if (lowercaseUrl.match(/\.(js|ts|jsx|tsx|html|css|json|xml|py|java|php|c|cpp|go|rb)$/i)) {
    return 'code';
  }
  
  if (lowercaseUrl.match(/\.(zip|rar|7z|tar|gz|bz2|tgz)$/i)) {
    return 'zip';
  }
  
  if (lowercaseUrl.match(/\.(ppt|pptx|key|odp)$/i)) {
    return 'presentation';
  }
  
  if (lowercaseUrl.match(/\.(json)$/i)) {
    return 'json';
  }
  
  return 'other';
}

// Get appropriate icon component for a file type
export function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'image':
      return FileImage;
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
    case 'presentation':
      return FileText; // Using FileText instead of FilePpt which doesn't exist in Lucide
    case 'json':
      return FileBox; // Using FileBox instead of FileJson
    default:
      return FileText;
  }
}

// Get human-readable file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Extract filename from URL
export function getFilenameFromUrl(url: string): string {
  try {
    // Try to get the filename from the URL path
    const pathname = new URL(url).pathname;
    const filename = pathname.split('/').pop() || 'file';
    
    // If the filename has a query string, remove it
    return filename.split('?')[0];
  } catch (e) {
    // If URL parsing fails, just try to get the last part of the path
    return url.split('/').pop()?.split('?')[0] || 'file';
  }
}
