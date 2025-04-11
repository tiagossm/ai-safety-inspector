
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileStack, FileCheck, AlertCircle, Bookmark } from "lucide-react";

interface ChecklistBasicInfoProps {
  title: string;
  description: string;
  category: string;
  isTemplate: boolean;
  status: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onCategoryChange: (category: string) => void;
  onIsTemplateChange: (isTemplate: boolean) => void;
  onStatusChange: (status: string) => void;
}

export function ChecklistBasicInfo({
  title,
  description,
  category,
  isTemplate,
  status,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onIsTemplateChange,
  onStatusChange
}: ChecklistBasicInfoProps) {
  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-base">Título</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Digite um título para o checklist"
          />
          {!title && (
            <p className="text-xs text-destructive flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>O título é obrigatório</span>
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description" className="text-base">Descrição</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Digite uma descrição para o checklist"
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category" className="text-base">Categoria</Label>
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="segurança">Segurança</SelectItem>
              <SelectItem value="qualidade">Qualidade</SelectItem>
              <SelectItem value="processos">Processos</SelectItem>
              <SelectItem value="meio_ambiente">Meio Ambiente</SelectItem>
              <SelectItem value="manutenção">Manutenção</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-primary" />
            <Label htmlFor="isTemplate" className="text-sm font-medium">
              Este é um modelo (template)
            </Label>
          </div>
          <Switch
            id="isTemplate"
            checked={isTemplate}
            onCheckedChange={onIsTemplateChange}
          />
        </div>
        
        <div className="flex items-center justify-between border-t pt-4">
          <div>
            <Label htmlFor="status" className="text-sm font-medium">Status</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Define se o checklist está ativo ou inativo
            </p>
          </div>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger id="status" className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
