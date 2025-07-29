// Utilitários para debug durante desenvolvimento

const isDebugMode = import.meta.env.DEV;

export function debugLog(category: string, message: string, data?: any) {
  if (isDebugMode) {
    const prefix = `🔍 [${category}]`;
    if (data !== undefined) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
    }
  }
}

export function debugResponseFlow(step: string, data: any) {
  debugLog('Response Flow', step, data);
}

export function debugTypeMapping(original: string, mapped: string, context?: any) {
  debugLog('Type Mapping', `${original} → ${mapped}`, context);
}

export function debugError(category: string, error: any, context?: any) {
  if (isDebugMode) {
    console.error(`❌ [${category}]`, error, context);
  }
}