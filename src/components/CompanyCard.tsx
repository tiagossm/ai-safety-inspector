import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { CompanyEditDialog } from "@/components/CompanyEditDialog";
import { Company, CompanyMetadata, Contact } from "@/types/company";
import { generateCSV } from "@/utils/companyUtils";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Zap, Download, MoreVertical, Trash2, ChevronDown, ChevronUp, Pencil, Building, Settings, DoorOpen, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

// Novo componente para a tabela de unidades
const UnitsTable = ({ units }: { units: Array<{ id: string; code: string; name: string; created_at: string }> }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="text-left border-b border-gray-600">
          <th className="pb-2">Código</th>
          <th className="pb-2">Unidade</th>
          <th className="pb-2">Data Cadastro</th>
        </tr>
      </thead>
      <tbody>
        {units.map((unit) => (
          <tr key={unit.id} className="border-b border-gray-600">
            <td className="py-3">{unit.code}</td>
            <td className="py-3">{unit.name}</td>
            <td className="py-3">{new Date(unit.created_at).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export function CompanyCard({ company, onDelete, onEdit, onStartInspection, onViewLegalNorms }: CompanyCardProps) {
  // ... (mantenha os estados existentes)

  // Função formatadora de CNPJ
  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 bg-gray-800 text-white max-w-3xl mx-auto rounded-lg p-6">
      {/* Menu Lateral Simulado */}
      <div className="flex gap-4 mb-6 border-b border-gray-600 pb-4">
        <Button variant="ghost" className="text-white">
          <Building className="h-5 w-5 mr-2" /> Unidades
        </Button>
        <Button variant="ghost" className="text-white">
          <ClipboardList className="h-5 w-5 mr-2" /> Inspeções
        </Button>
        <Button variant="ghost" className="text-white">
          <Settings className="h-5 w-5 mr-2" /> Configurações
        </Button>
        <Button variant="ghost" className="text-white">
          <DoorOpen className="h-5 w-5 mr-2" /> Sair
        </Button>
      </div>

      {/* Barra de Ações */}
      <div className="flex gap-4 mb-6">
        <Button className="bg-green-600 hover:bg-green-700">
          <Pencil className="h-4 w-4 mr-2" /> Adicionar Empresa
        </Button>
        <Button variant="outline" className="border-gray-600 text-white">
          <Download className="h-4 w-4 mr-2" /> Importar CSV
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar empresa..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Seção de Detalhes */}
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">{company.fantasy_name || "Nome não informado"}</h2>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${getStatusColor(company.status || '')}`} />
              <span className="text-sm font-medium">{company.status?.toUpperCase() || "STATUS INDEFINIDO"}</span>
            </div>
          </div>
          {/* Menu de Opções (mantido original) */}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Detalhes Formatados */}
        <div className="grid grid-cols-2 gap-4 bg-gray-700 p-4 rounded-lg">
          <div>
            <label className="text-sm text-gray-400">CNPJ</label>
            <p className="font-mono">{formatCNPJ(company.cnpj)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400">Data de Cadastro</label>
            <p>{new Date(company.created_at).toLocaleDateString()}</p>
          </div>
          {/* Adicione outros campos seguindo o mesmo padrão */}
        </div>

        {/* Tabela de Unidades */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Unidades Vinculadas</h3>
          <UnitsTable units={metadata?.units || []} />
          <Button 
            variant="outline" 
            className="w-full text-white border-gray-600 hover:bg-gray-700"
            onClick={() => console.log('Adicionar unidade')}
          >
            + Adicionar Nova Unidade
          </Button>
        </div>

        {/* Mantenha o restante do código original */}
      </CardContent>
    </Card>
  );
}