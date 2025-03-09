
export function validateFile(file: File | null): { valid: boolean; message?: string } {
  if (!file) {
    return { valid: false, message: 'No file uploaded' };
  }
  
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  if (!['csv', 'xls', 'xlsx'].includes(fileExtension || '')) {
    return { 
      valid: false, 
      message: 'Invalid file type. Only CSV, XLS, and XLSX files are supported.' 
    };
  }
  
  // Check file size (limit to 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      message: 'File too large. Maximum file size is 10MB.'
    };
  }
  
  return { valid: true };
}
