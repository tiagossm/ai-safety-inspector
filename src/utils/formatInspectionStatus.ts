
interface StatusInfo {
  label: string;
  color: string;
  icon?: string;
}

export function formatInspectionStatus(status: string): StatusInfo {
  switch (status.toLowerCase()) {
    case 'completed':
      return { label: 'Concluído', color: 'green' };
    case 'in_progress':
      return { label: 'Em Progresso', color: 'blue' };
    case 'pending':
      return { label: 'Pendente', color: 'amber' };
    default:
      return { label: 'Desconhecido', color: 'gray' };
  }
}
