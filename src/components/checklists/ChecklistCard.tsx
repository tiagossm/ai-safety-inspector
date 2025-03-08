import { Checklist } from "@/types/checklist";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChecklistActions } from "./ChecklistActions";
import { Progress } from "@/components/ui/progress"; // Barra de progresso
import { CheckCircle, Clock, Circle, Calendar } from "lucide-react"; // Ícones de status

interface ChecklistCardProps {
  checklist: Checklist;
}

// Função para definir ícone de status
function getStatusIcon(status: string) {
  if (status === "ativo") return <CheckCircle className="text-green-500 w-4 h-4" />;
  if (status === "em andamento") return <Clock className="text-yellow-500 w-4 h-4" />;
  return <Circle className="text-red-500 w-4 h-4" />;
}

// Função para formatar data
function formatDate(dateString?: string | null) {
  if (!dateString) return "Sem data";
  return new Date(dateString).toLocaleDateString("pt-BR");
}

export function ChecklistCard({ checklist }: ChecklistCardProps) {
  const progress =
    checklist.items && checklist.items > 0
      ? ((checklist.items - (checklist.items_completed || 0)) / checklist.items) * 100
      : 0;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center space-x-2">
            {getStatusIcon(checklist.status_checklist)}
            <CardTitle className="line-clamp-1 text-base font-medium">
              {checklist.title}
            </CardTitle>
          </div>
          {checklist.is_template && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
              Template
            </Badge>
          )}
        </div>
        <ChecklistActions checklist={checklist} />
      </CardHeader>

      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2 h-10">
          {checklist.description || "Sem descrição"}
        </p>
        {/* Barra de Progresso */}
        <Progress value={progress} className="mt-2" />
      </CardContent>

      <CardFooter className="flex justify-between pt-2">
        <div className="flex flex-col space-y-1">
          <p className="text-xs text-muted-foreground">
            {checklist.items_completed}/{checklist.items} itens concluídos
          </p>
          <p className="text-xs text-muted-foreground flex items-center">
            <Calendar className="w-4 h-4 mr-1 text-gray-500" /> {formatDate(checklist.due_date)}
          </p>
        </div>
        <div className="flex -space-x-2">
          {checklist.collaborators?.map((collaborator) => (
            <Avatar key={collaborator.id} className="h-6 w-6 border-2 border-background">
              <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
              <AvatarFallback className="text-xs">{collaborator.initials}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
