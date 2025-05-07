
import { Mic, FileText, Image, FileVideo, FileSpreadsheet, FileCode, Archive, Presentation } from 'lucide-react';

export function getFileType(url: string): 'image' | 'video' | 'audio' | 'file' {
  const extension = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
  
  // Images
  if (/^(jpe?g|png|gif|bmp|webp|svg|heic)$/.test(extension)) {
    return 'image';
  }
  
  // Videos
  if (/^(mp4|webm|mov|avi|wmv|flv|mkv)$/.test(extension)) {
    return 'video';
  }
  
  // Audio files
  if (/^(mp3|wav|ogg|m4a|flac|aac)$/.test(extension)) {
    return 'audio';
  }
  
  // Documents and others
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

// Function to get the icon based on file type
export function getFileIcon(fileType: string) {
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
      return Presentation;
    default:
      return FileText;
  }
}

// Function to extract the filename from a URL
export function getFilenameFromUrl(url: string): string {
  // Remove query parameters
  const cleanUrl = url.split('?')[0];
  
  // Extract the last part of the URL after the last slash
  const parts = cleanUrl.split('/');
  let fileName = parts[parts.length - 1];
  
  // Decode special characters
  try {
    fileName = decodeURIComponent(fileName);
  } catch (e) {
    console.error("Error decoding filename:", e);
  }
  
  // If the name is too long, truncate and add "..." in the middle
  if (fileName.length > 40) {
    const extension = fileName.split('.').pop() || '';
    const nameWithoutExt = fileName.substring(0, fileName.length - extension.length - 1);
    const firstPart = nameWithoutExt.substring(0, 15);
    const lastPart = nameWithoutExt.substring(nameWithoutExt.length - 15);
    
    fileName = `${firstPart}...${lastPart}.${extension}`;
  }
  
  return fileName;
}
