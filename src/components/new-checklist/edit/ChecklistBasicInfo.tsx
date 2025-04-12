
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ChecklistBasicInfoProps {
  title: string;
  description: string;
  category: string;
  isTemplate: boolean;
  status: "active" | "inactive";
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onIsTemplateChange: (value: boolean) => void;
  onStatusChange: (value: "active" | "inactive") => void;
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
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => onCategoryChange(e.target.value)}
                placeholder="Ex: Segurança, Qualidade, etc."
              />
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
