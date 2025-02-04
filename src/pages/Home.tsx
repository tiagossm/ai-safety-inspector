import { Brain, ClipboardCheck, FileText, MessageSquare, BarChart3, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Home = () => (
  <div className="min-h-screen bg-background">
    {/* Hero Section */}
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-primary font-montserrat leading-tight">
              Qualidade operacional que vai transformar sua gestão de SST
            </h1>
            <p className="text-xl text-muted-foreground font-opensans">
              Software e aplicativo para você planejar, executar e comprovar suas inspeções de segurança do trabalho
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link to="/auth">Testar Grátis</Link>
              </Button>
              <Button variant="outline" size="lg">
                Falar com Consultor
              </Button>
            </div>
          </div>
          <div className="relative">
            <img 
              src="/placeholder.svg" 
              alt="Dashboard Preview" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-12 font-montserrat">
          Por que escolher o IA SST Inspections?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<ClipboardCheck className="h-8 w-8 text-primary" />}
            title="Checklists Inteligentes"
            description="Checklists adaptáveis que se ajustam às normas e requisitos específicos de cada tipo de inspeção."
          />
          <FeatureCard
            icon={<FileText className="h-8 w-8 text-primary" />}
            title="Relatórios Automáticos"
            description="Relatórios gerados automaticamente com sua identidade visual e conformidade com as normas."
          />
          <FeatureCard
            icon={<MessageSquare className="h-8 w-8 text-primary" />}
            title="Abertura de Inspeções"
            description="Interface simplificada para solicitação e acompanhamento de inspeções de segurança."
          />
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8 text-primary" />}
            title="Dados e Indicadores"
            description="Visualize tendências, identifique riscos recorrentes e tome decisões baseadas em dados."
          />
          <FeatureCard
            icon={<Brain className="h-8 w-8 text-primary" />}
            title="IA Integrada"
            description="Análise inteligente de riscos e sugestões automáticas de medidas preventivas."
          />
          <FeatureCard
            icon={<Star className="h-8 w-8 text-primary" />}
            title="Avaliação de Conformidade"
            description="Acompanhe o nível de conformidade e evolução da segurança em sua empresa."
          />
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl text-center">
        <h2 className="text-3xl font-bold mb-6 font-montserrat">
          Comece agora mesmo
        </h2>
        <p className="text-xl text-muted-foreground mb-8 font-opensans">
          Transforme sua gestão de segurança do trabalho com inteligência artificial
        </p>
        <Button asChild size="lg">
          <Link to="/auth">Testar Gratuitamente</Link>
        </Button>
      </div>
    </section>
  </div>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
    <CardHeader>
      <div className="flex items-center gap-4">
        {icon}
        <CardTitle className="font-montserrat">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground font-opensans">{description}</p>
    </CardContent>
  </Card>
);

export default Home;