
export function formatInspectionStatus(status: string): { label: string; color: string } {
  if (!status) {
    return { label: "Desconhecido", color: "gray" };
  }
  
  switch (status.toLowerCase()) {
    case "pending":
      return { label: "Pendente", color: "amber" };
    case "in_progress":
      return { label: "Em andamento", color: "blue" };
    case "completed":
      return { label: "Concluído", color: "green" };
    case "canceled":
      return { label: "Cancelado", color: "red" };
    case "archived":
      return { label: "Arquivado", color: "gray" };
    default:
      return { label: "Desconhecido", color: "gray" };
  }
}
