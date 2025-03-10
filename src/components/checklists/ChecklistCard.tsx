
import { CalendarIcon, CheckSquare, MoreHorizontal, Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checklist } from "@/types/checklist";

interface ChecklistCardProps {
  checklist: Checklist;
  onOpen: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}

export function ChecklistCard({ checklist, onOpen, onDelete }: ChecklistCardProps) {
  // Determina a cor do badge com base na categoria
  const getCategoryColor = (category: string) => {
    switch(category) {
      case "safety": return "bg-red-100 text-red-800 hover:bg-red-200";
      case "quality": return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "maintenance": return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "environment": return "bg-green-100 text-green-800 hover:bg-green-200";
      case "operational": return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // Traduz o nome da categoria
  const translateCategory = (category: string) => {
    switch(category) {
      case "safety": return "Segurança";
      case "quality": return "Qualidade";
      case "maintenance": return "Manutenção";
      case "environment": return "Meio Ambiente";
      case "operational": return "Operacional";
      case "general": return "Geral";
      default: return category;
    }
  };

  return (
    <Card 
      className="h-full flex flex-col hover:shadow-md transition-shadow"
      onClick={() => onOpen(checklist.id)}
    >
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
          <Badge 
            className={`${getCategoryColor(checklist.category)} mb-2`}
          >
            {translateCategory(checklist.category)}
          </Badge>
          <h3 className="font-semibold text-xl">{checklist.title}</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onOpen(checklist.id);
            }}>
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onDelete(checklist.id, checklist.title);
            }} className="text-destructive">
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        {checklist.description && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {checklist.description}
          </p>
        )}
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <CheckSquare className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>
              {checklist.items || 0} item{(checklist.items || 0) !== 1 ? 's' : ''}
            </span>
          </div>
          {checklist.due_date && (
            <div className="flex items-center text-sm">
              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>
                {new Date(checklist.due_date).toLocaleDateString()}
              </span>
            </div>
          )}
          {checklist.company_name && (
            <div className="flex items-center text-sm">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>
                {checklist.company_name}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-1">
              <AvatarImage src="" />
              <AvatarFallback className="text-xs">
                {checklist.responsible_name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {checklist.responsible_name || "Não atribuído"}
            </span>
          </div>
          <div>
            {checklist.status_checklist === "ativo" ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Ativo
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                Inativo
              </Badge>
            )}
            {checklist.is_template && (
              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                Template
              </Badge>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
