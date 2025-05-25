
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChecklistBasicInfoProps {
  title: string;
  description: string;
  category: string;
  isTemplate: boolean;
  status: "active" | "inactive";
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onCategoryChange: (category: string) => void;
  onIsTemplateChange: (isTemplate: boolean) => void;
  onStatusChange: (status: "active" | "inactive") => void;
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
      <CardHeader>
        <CardTitle>Informações Básicas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="checklist-title">Título do Checklist</Label>
          <Input
            id="checklist-title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Digite o título do checklist"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="checklist-description">Descrição</Label>
          <Textarea
            id="checklist-description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Digite uma descrição para o checklist"
            className="min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="checklist-category">Categoria</Label>
            <Input
              id="checklist-category"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              placeholder="Ex: Segurança, Qualidade, Manutenção"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checklist-status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => onStatusChange(value as "active" | "inactive")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is-template"
            checked={isTemplate}
            onCheckedChange={onIsTemplateChange}
          />
          <Label htmlFor="is-template">
            Este checklist é um template
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
