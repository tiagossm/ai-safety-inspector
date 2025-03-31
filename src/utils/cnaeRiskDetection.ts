
/**
 * Detects risk level (grau de risco) from CNAE
 * Following NR4 standard for risk classification
 */
export async function detectRiskFromCNAE(cnae: string, supabase: any): Promise<number> {
  if (!cnae || typeof cnae !== 'string') {
    console.warn('Invalid CNAE provided:', cnae);
    return 1; // Default to the lowest risk level
  }
  
  try {
    // Format the CNAE consistently
    // Extract and format as XXXX-X (first 5 digits with hyphen)
    const formattedCNAE = formatCNAE(cnae);
    const firstFourDigits = formattedCNAE.substring(0, 4);
    const withoutHyphen = formattedCNAE.replace('-', '');
    
    console.log('Searching risk level for CNAE:', formattedCNAE);
    
    // Try multiple search methods in sequence
    // 1. Try exact match with formatted CNAE (XXXX-X)
    let { data: exactMatch, error: exactError } = await supabase
      .from('nr4_riscos')
      .select('grau_risco')
      .eq('cnae', formattedCNAE)
      .maybeSingle();
    
    if (exactMatch) {
      console.log('Found exact match for', formattedCNAE, ':', exactMatch.grau_risco);
      return parseInt(exactMatch.grau_risco) || 1;
    }
    
    // 2. Try without hyphen (XXXXX)
    let { data: noHyphenMatch, error: noHyphenError } = await supabase
      .from('nr4_riscos')
      .select('grau_risco')
      .eq('cnae', withoutHyphen)
      .maybeSingle();
    
    if (noHyphenMatch) {
      console.log('Found no-hyphen match for', withoutHyphen, ':', noHyphenMatch.grau_risco);
      return parseInt(noHyphenMatch.grau_risco) || 1;
    }
    
    // 3. Try with first 4 digits
    let { data: fourDigitMatch, error: fourDigitError } = await supabase
      .from('nr4_riscos')
      .select('grau_risco')
      .eq('cnae', firstFourDigits)
      .maybeSingle();
    
    if (fourDigitMatch) {
      console.log('Found 4-digit match for', firstFourDigits, ':', fourDigitMatch.grau_risco);
      return parseInt(fourDigitMatch.grau_risco) || 1;
    }
    
    // 4. Try with LIKE query
    let { data: likeMatch, error: likeError } = await supabase
      .from('nr4_riscos')
      .select('grau_risco')
      .like('cnae', `${firstFourDigits}%`)
      .maybeSingle();
    
    if (likeMatch) {
      console.log('Found LIKE match for', firstFourDigits, '%:', likeMatch.grau_risco);
      return parseInt(likeMatch.grau_risco) || 1;
    }
    
    // No match found, default to lowest risk
    console.log('No risk level match found for CNAE:', cnae);
    return 1;
  } catch (error) {
    console.error('Error detecting risk from CNAE:', error);
    return 1; // Default to lowest risk on error
  }
}

/**
 * Formats CNAE to standard XXXX-X format
 */
function formatCNAE(cnae: string): string {
  // Remove non-numeric characters
  const digitsOnly = cnae.replace(/\D/g, '');
  
  // Get first 5 digits
  const firstFiveDigits = digitsOnly.substring(0, 5);
  
  // Format as XXXX-X
  if (firstFiveDigits.length >= 5) {
    return `${firstFiveDigits.substring(0, 4)}-${firstFiveDigits.substring(4, 5)}`;
  }
  
  // Return what we have if too short
  return firstFiveDigits;
}
