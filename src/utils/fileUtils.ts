
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
