
// Função para analisar texto CSV e converter em matriz
export function parseCSV(csvText: string, options = { skipFirstRow: false }): string[][] {
  // Divida o texto por quebras de linha
  const lines = csvText.trim().split(/\r?\n/);
  
  // Pule a primeira linha se necessário (cabeçalhos)
  const startIndex = options.skipFirstRow ? 1 : 0;
  
  // Processe cada linha, dividindo por vírgulas ou ponto-e-vírgulas
  // Isso é uma implementação simples e pode precisar ser melhorada para lidar com
  // casos complexos como valores com vírgulas ou aspas
  const rows = lines.slice(startIndex).map(line => {
    // Determine o delimitador com base na primeira linha
    const delimiter = line.includes(';') ? ';' : ',';
    
    // Divida a linha em colunas
    let columns = line.split(delimiter);
    
    // Limpe espaços em branco extras e aspas
    columns = columns.map(col => col.trim().replace(/^["']|["']$/g, ''));
    
    return columns;
  });
  
  return rows;
}

// Função para validar os dados do CSV
export function validateCSVData(rows: string[][]): { valid: boolean; message: string } {
  if (rows.length === 0) {
    return { 
      valid: false, 
      message: 'Arquivo vazio. Por favor, forneça um CSV com dados.'
    };
  }
  
  // Verifique se pelo menos algumas linhas têm conteúdo
  const nonEmptyRows = rows.filter(row => 
    row.length > 0 && row.some(cell => cell.trim() !== '')
  );
  
  if (nonEmptyRows.length === 0) {
    return { 
      valid: false, 
      message: 'Nenhum dado encontrado no arquivo. Verifique se o formato está correto.'
    };
  }
  
  // Verifique se cada linha tem um comprimento consistente
  const firstRowLength = rows[0].length;
  const inconsistentRows = rows.findIndex(row => row.length !== firstRowLength);
  
  if (inconsistentRows !== -1) {
    return { 
      valid: false, 
      message: `Formato inconsistente na linha ${inconsistentRows + 1}. Todas as linhas devem ter o mesmo número de colunas.`
    };
  }
  
  // Verifique se temos pelo menos as colunas mínimas necessárias (texto da pergunta e tipo)
  if (firstRowLength < 2) {
    return { 
      valid: false, 
      message: 'Formato inválido. O arquivo deve ter pelo menos duas colunas (texto da pergunta e tipo).'
    };
  }
  
  return { valid: true, message: 'Dados CSV válidos' };
}
