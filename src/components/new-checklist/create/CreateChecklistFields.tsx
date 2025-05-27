
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CompanySelector } from "@/components/inspection/CompanySelector";

interface CreateChecklistFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  companyId: string;
  setCompanyId: (value: string) => void;
  isTemplate: boolean;
  setIsTemplate: (value: boolean) => void;
}

export function CreateChecklistFields({
  title,
  setTitle,
  category,
  setCategory,
  description,
  setDescription,
  companyId,
  setCompanyId,
  isTemplate,
  setIsTemplate
}: CreateChecklistFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Básicas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do checklist"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category">
              Categoria <span className="text-red-500">*</span>
            </Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: NR-35, Inspeção de Equipamentos"
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">
            Descrição <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o propósito deste checklist"
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company">
              Empresa <span className="text-red-500">*</span>
            </Label>
            <CompanySelector
              value={companyId}
              onSelect={setCompanyId}
            />
          </div>
          
          <div className="flex items-center space-x-2 mt-6">
            <Switch
              id="is-template"
              checked={isTemplate}
              onCheckedChange={setIsTemplate}
            />
            <Label htmlFor="is-template">Salvar como template</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
