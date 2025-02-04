import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const Plans = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Planos e Preços</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Free Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Free</CardTitle>
            <p className="text-3xl font-bold">R$ 0</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>3 inspeções por mês</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Checklist básico</span>
              </li>
            </ul>
            <Button className="w-full mt-6" asChild>
              <Link to="/auth">Começar Grátis</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-2xl">Pro</CardTitle>
            <p className="text-3xl font-bold">R$ 29,90<span className="text-sm font-normal">/mês</span></p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Inspeções ilimitadas</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Checklists avançados</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Relatórios em PDF</span>
              </li>
            </ul>
            <Button className="w-full mt-6" variant="secondary" asChild>
              <Link to="/auth">Assinar Pro</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Enterprise Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Empresarial</CardTitle>
            <p className="text-3xl font-bold">Personalizado</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Tudo do plano Pro</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Suporte dedicado</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>API personalizada</span>
              </li>
            </ul>
            <Button className="w-full mt-6" variant="outline" asChild>
              <Link to="/contact">Falar com Consultor</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Plans;