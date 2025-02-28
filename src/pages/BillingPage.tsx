
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import PlanCard from "@/components/billing/PlanCard";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  DownloadCloud,
  Calendar,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState("free");
  const { toast } = useToast();

  const handleUpgradePlan = (plan: string) => {
    // Simulação de upgrade de plano
    toast({
      title: "Plano atualizado",
      description: `Seu plano foi atualizado para ${plan.toUpperCase()}.`,
    });
    setCurrentPlan(plan);
  };

  const invoices = [
    { id: "INV-001", date: "01/11/2023", amount: "R$299,00", status: "Pago" },
    { id: "INV-002", date: "01/12/2023", amount: "R$299,00", status: "Pago" },
    { id: "INV-003", date: "01/01/2024", amount: "R$299,00", status: "Pendente" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Assinatura e Cobrança</h2>
        <p className="text-muted-foreground">
          Gerencie seu plano de assinatura e histórico de pagamentos
        </p>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Planos</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <DownloadCloud className="h-4 w-4" />
            <span>Faturas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <PlanCard 
              name="Free"
              price="0"
              features={[
                '1 Checklist', 
                '5 Inspeções/mês',
                '3 Usuários',
                '1GB Armazenamento',
                'Suporte Básico'
              ]}
              current={currentPlan === "free"}
              onUpgrade={() => handleUpgradePlan("free")}
            />
            
            <PlanCard 
              name="Pro"
              price="299"
              features={[
                'Checklists Ilimitados', 
                '500 Inspeções/mês',
                '10 Usuários',
                '10GB Armazenamento',
                'Suporte Prioritário',
                'Relatórios Avançados'
              ]}
              current={currentPlan === "pro"}
              onUpgrade={() => handleUpgradePlan("pro")}
            />
            
            <PlanCard 
              name="Enterprise"
              price="Sob Consulta"
              features={[
                'Recursos Premium',
                'Inspeções Ilimitadas',
                'Usuários Ilimitados',
                '100GB Armazenamento',
                'Suporte 24/7 Dedicado',
                'Integração com API',
                'Recursos de IA Avançados'
              ]}
              current={currentPlan === "enterprise"}
              contactSales
            />
          </div>

          {currentPlan !== "free" && (
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Assinatura</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Status</p>
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>Ativo</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Próxima cobrança</p>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                      <span>01/02/2024</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Método de pagamento</p>
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 text-muted-foreground mr-2" />
                      <span>Visa •••• 4242</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline">Atualizar forma de pagamento</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Uso atual</CardTitle>
                <CardDescription>
                  Utilização dos recursos do seu plano atual {currentPlan.toUpperCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Inspeções</p>
                    <p className="text-sm">3 de {currentPlan === "free" ? "5" : "500"}</p>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: currentPlan === "free" ? "60%" : "1%" }} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Armazenamento</p>
                    <p className="text-sm">0.2GB de {currentPlan === "free" ? "1GB" : "10GB"}</p>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: "20%" }} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Usuários</p>
                    <p className="text-sm">2 de {currentPlan === "free" ? "3" : "10"}</p>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: currentPlan === "free" ? "66%" : "20%" }} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {currentPlan === "free" && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefícios do Plano Pro</CardTitle>
                  <CardDescription>
                    Atualize para o plano Pro e tenha acesso a estes recursos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Checklists ilimitados</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Relatórios avançados com exportação</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Suporte prioritário</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Análise de tendências com IA</span>
                    </li>
                  </ul>
                  <Button className="w-full" onClick={() => handleUpgradePlan("pro")}>
                    Atualizar para Pro
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {currentPlan === "pro" && (
            <Card>
              <CardHeader>
                <CardTitle>Benefícios do Plano Enterprise</CardTitle>
                <CardDescription>
                  Contate nosso time de vendas para uma solução personalizada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🤖</span>
                      <h3 className="font-medium">Automação com IA</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Detecção automática de não conformidades usando visão computacional
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">📡</span>
                      <h3 className="font-medium">Integração IoT</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Conecte sensores industriais para monitoramento contínuo
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">👮‍♂️</span>
                      <h3 className="font-medium">Modo Auditoria</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Checklists de conformidade regulatória com assinatura digital
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🔗</span>
                      <h3 className="font-medium">API Corporativa</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Integração com ERPs e sistemas legados
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button variant="outline">
                    Falar com Vendas
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Faturas</CardTitle>
              <CardDescription>
                Visualize e baixe suas faturas anteriores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-4 border-b p-3 font-medium">
                  <div>Fatura</div>
                  <div>Data</div>
                  <div>Valor</div>
                  <div>Status</div>
                </div>
                {invoices.map((invoice) => (
                  <div 
                    key={invoice.id} 
                    className="grid grid-cols-4 items-center p-3 border-b last:border-0"
                  >
                    <div>{invoice.id}</div>
                    <div>{invoice.date}</div>
                    <div>{invoice.amount}</div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {invoice.status === "Pago" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span>{invoice.status}</span>
                      </div>
                      <Button variant="ghost" size="icon">
                        <DownloadCloud className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
