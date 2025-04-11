
export function formatInspectionStatus(status: string) {
  switch (status) {
    case 'pending':
      return { label: 'Pendente', color: 'amber' };
    case 'in_progress':
      return { label: 'Em andamento', color: 'blue' };
    case 'completed':
      return { label: 'Concluído', color: 'green' };
    case 'canceled':
      return { label: 'Cancelado', color: 'red' };
    default:
      return { label: status || 'Desconhecido', color: 'gray' };
  }
}
