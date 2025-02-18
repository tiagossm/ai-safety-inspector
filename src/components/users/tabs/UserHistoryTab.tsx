
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserActivity } from "@/types/user";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ActivityIcon } from "lucide-react";

interface UserHistoryTabProps {
  activities: UserActivity[];
}

export function UserHistoryTab({ activities }: UserHistoryTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Histórico de Atividades</h3>
      <ScrollArea className="h-[500px] rounded-md border">
        <div className="space-y-4 p-4">
          {activities.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">
              Nenhuma atividade registrada
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-lg border p-4"
              >
                <ActivityIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(activity.timestamp), "PPP 'às' p", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
