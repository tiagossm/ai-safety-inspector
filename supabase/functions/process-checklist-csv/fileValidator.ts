
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
  
  return { valid: true };
}
