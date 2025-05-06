
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, Ban } from "lucide-react";

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pendente</Badge>;
    case "in_progress":
      return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Em Andamento</Badge>;
    case "completed":
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Concluído</Badge>;
    case "cancelled":
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Cancelado</Badge>;
    default:
      return <Badge variant="outline">Desconhecido</Badge>;
  }
};

export const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "low":
      return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Baixa</Badge>;
    case "medium":
      return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Média</Badge>;
    case "high":
      return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">Alta</Badge>;
    case "critical":
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Crítica</Badge>;
    default:
      return <Badge variant="outline">Desconhecida</Badge>;
  }
};

export const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "critical":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "high":
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case "medium":
      return <AlertTriangle className="h-4 w-4 text-blue-500" />;
    case "low":
      return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    default:
      return null;
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "in_progress":
      return <Clock className="h-4 w-4 text-blue-500" />;
    case "cancelled":
      return <Ban className="h-4 w-4 text-red-500" />;
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return null;
  }
};
