
import { formatDate } from '@/utils/format';
import { ChecklistWithStats } from '@/types/newChecklist';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChecklistCardBadges } from './ChecklistCardBadges';
import {
  Calendar,
  ArrowRight,
  Edit2,
  Trash2,
  User
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface ChecklistCardProps {
  checklist: ChecklistWithStats;
  onEdit?: (id: string) => void;
  onDelete?: (id: string, title: string) => void;
  onOpen?: (id: string) => void;
}

export const ChecklistCard = ({ checklist, onEdit, onDelete, onOpen }: ChecklistCardProps) => {
  const { 
    id, 
    title, 
    isTemplate, 
    status, 
    responsibleId, 
    responsibleName, 
    createdAt, 
    dueDate, 
    totalQuestions, 
    completedQuestions, 
    origin 
  } = checklist;

  const [responsibleNameState, setResponsibleNameState] = useState<string | undefined>(responsibleName);

  useEffect(() => {
    if (responsibleId && !responsibleName) {
      // Fetch responsible name if not provided but we have ID
      supabase
        .from('users')
        .select('name')
        .eq('id', responsibleId)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setResponsibleNameState(data.name);
          }
        });
    }
  }, [responsibleId, responsibleName]);

  // Calculate completion percentage
  const progress = totalQuestions && completedQuestions ? Math.round((completedQuestions / totalQuestions) * 100) : 0;

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 pt-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-lg">{title}</h3>
          <ChecklistCardBadges isTemplate={isTemplate} status={status} origin={origin} />
        </div>

        <div className="space-y-2 mt-2">
          {responsibleNameState && (
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{responsibleNameState}</span>
            </div>
          )}

          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{formatDate(createdAt || "")}</span>
            {dueDate && (
              <Badge variant="outline" className="ml-2 px-1.5 py-0 text-[10px]">
                Vence: {formatDate(dueDate)}
              </Badge>
            )}
          </div>
        </div>

        {totalQuestions > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Perguntas</span>
              <span>
                {completedQuestions || 0}/{totalQuestions}
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-2">
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(id)} className="flex-1">
            <Edit2 className="h-3.5 w-3.5 mr-1" />
            Editar
          </Button>
        )}

        {onDelete && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDelete(id, title)} 
            className="flex-1"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Excluir
          </Button>
        )}

        {onOpen && (
          <Button 
            variant="default" 
            size="sm"
            onClick={() => onOpen(id)} 
            className="flex-1"
          >
            <ArrowRight className="h-3.5 w-3.5 mr-1" />
            Abrir
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
