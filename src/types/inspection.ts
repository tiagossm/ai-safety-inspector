
export type InspectionStatus = 'Pendente' | 'Em Andamento' | 'Concluído';

export const INSPECTION_STATUSES: Record<string, InspectionStatus> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluído'
} as const;
