
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnitForm } from "@/components/unit/UnitForm";

export default function AddUnit() {
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Nova Unidade</CardTitle>
        </CardHeader>
        <CardContent>
          <UnitForm />
        </CardContent>
      </Card>
    </div>
  );
}
