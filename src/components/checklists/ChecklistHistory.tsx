
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChecklistHistory } from "@/types/checklist";

interface ChecklistHistoryLogProps {
  history: ChecklistHistory[];
}

export function ChecklistHistoryLog({ history }: ChecklistHistoryLogProps) {
  // Get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Get action color
  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'assign':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get action label
  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create':
        return 'Criou';
      case 'update':
        return 'Atualizou';
      case 'delete':
        return 'Removeu';
      case 'assign':
        return 'Atribuiu';
      default:
        return action;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Alterações</CardTitle>
      </CardHeader>
      <CardContent>
        {history && history.length > 0 ? (
          <ol className="relative border-l border-gray-200 ml-3 space-y-2 max-h-96 overflow-y-auto p-2">
            {history.map((item) => (
              <li key={item.id} className="ml-6 mb-4">
                <span className="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-white bg-muted">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {getInitials(item.user_name)}
                    </AvatarFallback>
                  </Avatar>
                </span>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <span className="text-sm font-semibold text-gray-900">
                        {item.user_name}
                      </span>
                      <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded ${getActionColor(item.action)}`}>
                        {getActionLabel(item.action)}
                      </span>
                    </div>
                    <time className="text-xs text-gray-500">
                      {format(new Date(item.created_at), "Pp", { locale: ptBR })}
                    </time>
                  </div>
                  <p className="text-sm text-gray-500">{item.details}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum registro de alteração.</p>
            <p className="text-sm">O histórico será gerado automaticamente.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
