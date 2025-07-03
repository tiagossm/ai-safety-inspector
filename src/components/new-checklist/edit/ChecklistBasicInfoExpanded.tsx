
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useChecklistUsers } from "@/hooks/checklist/form/useChecklistUsers";
import { useChecklistCompanies } from "@/hooks/checklist/form/useChecklistCompanies";
import { Skeleton } from "@/components/ui/skeleton";

interface ChecklistBasicInfoExpandedProps {
  title: string;
  description: string;
  category: string;
  isTemplate: boolean;
  status: "active" | "inactive";
  companyId?: string;
  responsibleId?: string;
  dueDate?: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onIsTemplateChange: (value: boolean) => void;
  onStatusChange: (value: "active" | "inactive") => void;
  onCompanyChange: (value: string | undefined) => void;
  onResponsibleChange: (value: string | undefined) => void;
  onDueDateChange: (value: string | undefined) => void;
}

export function ChecklistBasicInfoExpanded({
  title,
  description,
  category,
  isTemplate,
  status,
  companyId,
  responsibleId,
  dueDate,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onIsTemplateChange,
  onStatusChange,
  onCompanyChange,
  onResponsibleChange,
  onDueDateChange
}: ChecklistBasicInfoExpandedProps) {
  const { users, isLoading: loadingUsers } = useChecklistUsers();
  const { companies, loadingCompanies } = useChecklistCompanies();

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <h2 className="text-xl font-semibold">Informações Básicas</h2>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Digite o título do checklist"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Digite uma descrição para o checklist"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => onCategoryChange(e.target.value)}
                placeholder="Ex: Segurança, Qualidade, etc."
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              {loadingCompanies ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Select
                  value={companyId || "none"}
                  onValueChange={(value) => onCompanyChange(value === "none" ? undefined : value)}
                >
                  <SelectTrigger id="company">
                    <SelectValue placeholder="Selecione uma empresa (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma empresa</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={String(company.id)}>
                        {company.fantasy_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible">Responsável</Label>
              {loadingUsers ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Select
                  value={responsibleId || "none"}
                  onValueChange={(value) => onResponsibleChange(value === "none" ? undefined : value)}
                >
                  <SelectTrigger id="responsible">
                    <SelectValue placeholder="Selecione um responsável (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum responsável</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email || 'Usuário sem nome'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-date">Data de vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="due-date"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? (
                      format(new Date(dueDate), "PPP", { locale: ptBR })
                    ) : (
                      "Escolha uma data (opcional)"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate ? new Date(dueDate) : undefined}
                    onSelect={(date) => 
                      onDueDateChange(date ? date.toISOString() : undefined)
                    }
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="template"
                  checked={isTemplate}
                  onCheckedChange={onIsTemplateChange}
                />
                <Label htmlFor="template">Template</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="status">Status:</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => onStatusChange(e.target.value as "active" | "inactive")}
                  className="border rounded p-1 text-sm"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
