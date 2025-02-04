import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data - in a real app this would come from your backend
const companies = [
  {
    id: 1,
    name: "Empresa Exemplo LTDA",
    cnpj: "00.000.000/0000-00",
    riskLevel: "Alto",
    pendingInspections: 2,
  },
  {
    id: 2,
    name: "Indústria Modelo S.A.",
    cnpj: "11.111.111/1111-11",
    riskLevel: "Médio",
    pendingInspections: 0,
  },
];

export function CompaniesList() {
  return (
    <div className="space-y-4">
      {companies.map((company) => (
        <Card key={company.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                {company.name}
              </CardTitle>
              <Badge
                variant={company.pendingInspections > 0 ? "destructive" : "secondary"}
              >
                {company.pendingInspections > 0
                  ? `${company.pendingInspections} inspeções pendentes`
                  : "Em dia"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p>CNPJ: {company.cnpj}</p>
              <p>Grau de Risco: {company.riskLevel}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}