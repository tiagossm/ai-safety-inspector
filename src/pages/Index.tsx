
import DashboardLayout from "@/components/DashboardLayout";
import { CompanyForm } from "@/components/CompanyForm";
import { CompaniesList } from "@/components/CompaniesList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Cadastrar Nova Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <CompanyForm />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Empresas Cadastradas</h2>
            <Button variant="outline">Nova Inspeção</Button>
          </div>
          <CompaniesList />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
