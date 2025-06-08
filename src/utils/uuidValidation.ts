
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export const isValidUUID = (value: string): boolean => {
  return uuidValidate(value);
};

export const sanitizeUUID = (value: string | undefined | null): string | null => {
  if (!value || value === 'default' || value === '') {
    return null;
  }
  
  if (isValidUUID(value)) {
    return value;
  }
  
  return null;
};

export const generateUUID = (): string => {
  return uuidv4();
};

export const validateChecklistPayload = (payload: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Verificar campos UUID comuns
  const uuidFields = ['id', 'group_id', 'checklist_id', 'parent_item_id', 'sub_checklist_id'];
  
  const checkUUIDField = (obj: any, field: string, path: string = '') => {
    if (obj && typeof obj === 'object' && field in obj) {
      const value = obj[field];
      if (value === 'default') {
        errors.push(`Campo UUID ${path}${field} não pode ser "default"`);
      } else if (value && typeof value === 'string' && !isValidUUID(value)) {
        errors.push(`Campo UUID ${path}${field} contém valor inválido: "${value}"`);
      }
    }
  };

  // Verificar payload raiz
  uuidFields.forEach(field => checkUUIDField(payload, field));
  
  // Verificar perguntas se existirem
  if (payload.questions && Array.isArray(payload.questions)) {
    payload.questions.forEach((question: any, index: number) => {
      uuidFields.forEach(field => checkUUIDField(question, field, `questions[${index}].`));
    });
  }
  
  // Verificar grupos se existirem
  if (payload.groups && Array.isArray(payload.groups)) {
    payload.groups.forEach((group: any, index: number) => {
      uuidFields.forEach(field => checkUUIDField(group, field, `groups[${index}].`));
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
