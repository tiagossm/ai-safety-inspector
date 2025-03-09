
import { parse } from 'https://deno.land/std@0.181.0/encoding/csv.ts';

export interface ParseOptions {
  skipFirstRow: boolean;
  separator: string;
}

export function detectSeparator(text: string): string {
  // Detect if the file uses semicolon as separator (common in some regions)
  return text.split(';').length > text.split(',').length ? ';' : ',';
}

export function parseCSV(text: string, options?: Partial<ParseOptions>): any[][] {
  const parseOptions: ParseOptions = {
    skipFirstRow: options?.skipFirstRow ?? true,
    separator: options?.separator ?? detectSeparator(text),
  };
  
  console.log(`Parsing CSV with separator: ${parseOptions.separator}`);
  return parse(text, parseOptions);
}

export function validateCSVData(rows: any[][]): { valid: boolean; message?: string } {
  if (rows.length === 0) {
    return { valid: false, message: 'O arquivo está vazio ou não contém dados válidos' };
  }
  return { valid: true };
}
