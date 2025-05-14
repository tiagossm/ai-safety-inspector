
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, ClipboardCheck, FileText, PlusCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function WorkflowGuide() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-3">
        <h2 className="text-2xl font-semibold">Fluxo de Trabalho</h2>
        <p className="text-muted-foreground">
          Siga estas etapas para realizar uma inspeção completa
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {/* Step 1: Company Registration */}
        <WorkflowStep 
          number={1}
          title="Cadastro de Empresa"
          description="Cadastre uma empresa para realizar inspeções"
          icon={<Building2 className="h-5 w-5" />}
          path="/companies"
          buttonText="Ir para Empresas"
        />

        {/* Step 2: Checklist Creation */}
        <WorkflowStep 
          number={2}
          title="Criar Checklist"
          description="Prepare um checklist para guiar sua inspeção"
          icon={<ClipboardCheck className="h-5 w-5" />}
          path="/new-checklists/create"
          buttonText="Criar Checklist"
        />

        {/* Step 3: Start Inspection */}
        <WorkflowStep 
          number={3}
          title="Iniciar Inspeção"
          description="Execute a inspeção com base no checklist"
          icon={<PlusCircle className="h-5 w-5" />}
          path="/inspections/new"
          buttonText="Nova Inspeção"
        />

        {/* Step 4: Generate Report */}
        <WorkflowStep 
          number={4}
          title="Gerar Relatório"
          description="Exporte relatórios dos resultados da inspeção"
          icon={<FileText className="h-5 w-5" />}
          path="/inspections"
          buttonText="Ver Inspeções"
        />
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Fluxos Alternativos</CardTitle>
          <CardDescription>
            Outros caminhos disponíveis baseados na sua necessidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AlternativeFlow 
            title="Empresa já cadastrada?"
            description="Se a empresa já estiver cadastrada, você pode ir diretamente para a criação de checklist ou iniciar uma inspeção."
            paths={[
              { label: "Criar Checklist", path: "/new-checklists/create" },
              { label: "Iniciar Inspeção", path: "/inspections/new" }
            ]}
          />
          
          <AlternativeFlow 
            title="Checklist já criado?"
            description="Se já tiver um checklist pronto, você pode iniciar uma inspeção diretamente."
            paths={[
              { label: "Ver Checklists", path: "/new-checklists" },
              { label: "Iniciar Inspeção", path: "/inspections/new" }
            ]}
          />
          
          <AlternativeFlow 
            title="Inspeção Concluída?"
            description="Se já tiver finalizado uma inspeção, você pode gerar o relatório a qualquer momento."
            paths={[
              { label: "Ver Inspeções", path: "/inspections" }
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

type WorkflowStepProps = {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  buttonText: string;
};

function WorkflowStep({ number, title, description, icon, path, buttonText }: WorkflowStepProps) {
  return (
    <Card className="relative">
      <Badge 
        className="absolute -top-2 -left-2 h-7 w-7 rounded-full p-0 flex items-center justify-center text-sm font-semibold"
        variant="outline"
      >
        {number}
      </Badge>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={path} className="flex items-center justify-center gap-2">
            {buttonText}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

type AlternativeFlowProps = {
  title: string;
  description: string;
  paths: {
    label: string;
    path: string;
  }[];
};

function AlternativeFlow({ title, description, paths }: AlternativeFlowProps) {
  return (
    <div className="border-b pb-4 last:border-0 last:pb-0">
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <div className="flex flex-wrap gap-2">
        {paths.map((item, i) => (
          <Button key={i} variant="outline" size="sm" asChild>
            <Link to={item.path}>{item.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
