
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
import { FileStack, Template, FileCheck, AlertCircle } from "lucide-react";

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
  const categories = [
    "Segurança do Trabalho",
    "Meio Ambiente",
    "Qualidade",
    "Saúde Ocupacional",
    "Conformidade",
    "Manutenção",
    "Outro"
  ];

  const statusOptions = [
    { value: "active", label: "Ativo" },
    { value: "inactive", label: "Inativo" },
    { value: "draft", label: "Rascunho" }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-1.5">
              <FileCheck className="h-4 w-4" />
              <span>Título</span>
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Digite o título do checklist"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
            />
            {!title && (
              <div className="flex items-center text-xs text-red-500 mt-1 gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>O título é obrigatório</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Digite uma descrição para este checklist"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={category}
                onValueChange={onCategoryChange}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={onStatusChange}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center p-3 rounded-lg border bg-muted/40">
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <Template className={`h-4 w-4 ${isTemplate ? "text-blue-500" : "text-gray-400"}`} />
                <Label htmlFor="is-template" className="font-medium">
                  Modelo Reutilizável
                </Label>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {isTemplate 
                  ? "Este checklist será salvo como um modelo e poderá ser reutilizado em múltiplas inspeções"
                  : "Este checklist será usado como um documento único, não como template"}
              </p>
            </div>
            <Switch
              id="is-template"
              checked={isTemplate}
              onCheckedChange={onIsTemplateChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
