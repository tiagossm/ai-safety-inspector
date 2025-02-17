
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Company } from "@/types/company";
import { Button } from "@/components/ui/button";
import { BuildingIcon, ChevronDown, ChevronUp, Mail, MapPin, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface CompanyUnitsProps {
  company: Company;
}

interface Unit {
  id: string;
  fantasy_name: string | null;
  cnpj: string;
  address: string | null;
  unit_type: 'matriz' | 'filial';
  technical_responsible: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

export function CompanyUnits({ company }: CompanyUnitsProps) {
  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnits();
  }, [company.id]);

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('company_id', company.id)
        .order('unit_type', { ascending: false }); // Matriz primeiro

      if (error) throw error;
      setUnits(data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const toggleUnitExpansion = (unitId: string) => {
    setExpandedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Unidades</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/companies/${company.id}/units/new`)}
        >
          <BuildingIcon className="h-4 w-4 mr-2" />
          Adicionar Unidade
        </Button>
      </div>

      {units.length > 0 ? (
        <div className="space-y-3">
          {units.map((unit) => (
            <div key={unit.id} className="border rounded-lg overflow-hidden">
              <div 
                className="p-4 bg-muted/50 flex items-center justify-between cursor-pointer"
                onClick={() => toggleUnitExpansion(unit.id)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">
                      {unit.fantasy_name || `Unidade ${unit.unit_type === 'matriz' ? 'Matriz' : 'Filial'}`}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {unit.unit_type === 'matriz' ? 'Matriz' : 'Filial'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{unit.cnpj}</p>
                </div>
                <Button variant="ghost" size="sm">
                  {expandedUnits.includes(unit.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div 
                className={cn(
                  "bg-background p-4 space-y-2 transition-all",
                  expandedUnits.includes(unit.id) ? "block" : "hidden"
                )}
              >
                {unit.address && (
                  <p className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{unit.address}</span>
                  </p>
                )}
                {unit.technical_responsible && (
                  <p className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Responsável: {unit.technical_responsible}</span>
                  </p>
                )}
                {unit.contact_name && (
                  <p className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Contato: {unit.contact_name}</span>
                  </p>
                )}
                {unit.contact_email && (
                  <p className="text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${unit.contact_email}`} className="text-blue-600 hover:underline">
                      {unit.contact_email}
                    </a>
                  </p>
                )}
                {unit.contact_phone && (
                  <p className="text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{unit.contact_phone}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhuma unidade cadastrada</p>
      )}
    </div>
  );
}
