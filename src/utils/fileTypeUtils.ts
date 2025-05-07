
export function determineSpecificFileType(extension: string): string {
  if (/pdf/.test(extension)) {
    return 'pdf';
  } else if (/(xlsx|xls|csv|numbers)/.test(extension)) {
    return 'excel';
  } else if (/(docx|doc|odt)/.test(extension)) {
    return 'word';
  } else if (/(js|ts|py|java|html|css|php|rb|go)/.test(extension)) {
    return 'code';
  } else if (/(zip|rar|tar|gz|7z)/.test(extension)) {
    return 'zip';
  } else if (/(ppt|pptx|key|odp)/.test(extension)) {
    return 'presentation';
  }
  
  return 'generic';
}
