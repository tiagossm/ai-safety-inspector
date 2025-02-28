
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

interface PlanCardProps {
  name: string;
  price: string;
  features: string[];
  current: boolean;
  contactSales?: boolean;
  onUpgrade?: () => void;
}

export default function PlanCard({
  name,
  price,
  features,
  current,
  contactSales = false,
  onUpgrade
}: PlanCardProps) {
  return (
    <Card className={current ? "border-primary" : "border-card"}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{name}</CardTitle>
          {current && <Badge>Plano Atual</Badge>}
        </div>
        <div className="flex items-baseline mt-2">
          {price === "Sob Consulta" ? (
            <span className="text-2xl font-bold">{price}</span>
          ) : (
            <>
              <span className="text-3xl font-bold">R${price}</span>
              {price !== "0" && <span className="text-muted-foreground ml-1">/mês</span>}
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {current ? (
          <Button variant="outline" className="w-full" disabled>
            Plano Atual
          </Button>
        ) : contactSales ? (
          <Button variant="outline" className="w-full">
            Fale com Vendas
          </Button>
        ) : (
          <Button className="w-full" onClick={onUpgrade}>
            Atualizar Plano
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
