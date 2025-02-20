import { Brain, ClipboardCheck, FileText, Building2, AlertTriangle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/components/AuthProvider";

const Home = () => {
  const { user } = useAuth();

  if (user) {
    return <DashboardView />;
  }

  return <LandingView />;
};

const DashboardView = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
    
    {/* Metrics Cards */}
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <MetricCard
        icon={<ClipboardCheck className="h-8 w-8 text-yellow-500" />}
        title="Inspeções Pendentes"
        value="3"
      />
      <MetricCard
        icon={<AlertTriangle className="h-8 w-8 text-red-500" />}
        title="Não Conformidades Críticas"
        value="5"
      />
      <MetricCard
        icon={<Calendar className="h-8 w-8 text-blue-500" />}
        title="Dias para Próxima Inspeção"
        value="15"
      />
    </div>

    {/* Quick Access Cards */}
    <div className="grid md:grid-cols-3 gap-6">
      <QuickAccessCard
        icon={<Building2 className="h-8 w-8 text-primary" />}
        title="Cadastrar Empresa"
        description="Adicione uma nova empresa ao sistema"
        link="/companies"
      />
      <QuickAccessCard
        icon={<ClipboardCheck className="h-8 w-8 text-primary" />}
        title="Nova Inspeção"
        description="Inicie uma nova inspeção de segurança"
        link="/inspecoes/nova"
      />
      <QuickAccessCard
        icon={<FileText className="h-8 w-8 text-primary" />}
        title="Histórico de Relatórios"
        description="Visualize relatórios anteriores"
        link="/inspecoes"
      />
    </div>
  </div>
);

const LandingView = () => (
  <div className="min-h-screen bg-background hero-background">
    {/* Hero Section */}
    <section className="py-16 px-4 relative z-10">
      <div className="container mx-auto max-w-6xl text-center">
        <div className="flex justify-center mb-8">
          <Logo size="large" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary font-montserrat leading-tight mb-6">
          Inspeções de Segurança Automatizadas com IA
        </h1>
        <p className="text-xl text-muted-foreground font-opensans mb-8">
          Transforme sua gestão de segurança do trabalho com inteligência artificial
        </p>
        <Button asChild size="lg">
          <Link to="/auth">Teste Grátis</Link>
        </Button>
      </div>
    </section>

    {/* Features Section */}
    <section className="py-16 px-4 bg-muted/30 relative z-10">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-12">
          Como gerar relatórios automáticos em 3 passos
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Building2 className="h-8 w-8 text-primary" />}
            title="1. Cadastre sua Empresa"
            description="Adicione informações básicas sobre sua empresa e unidades."
          />
          <FeatureCard
            icon={<ClipboardCheck className="h-8 w-8 text-primary" />}
            title="2. Realize a Inspeção"
            description="Use nosso checklist inteligente para guiar sua inspeção."
          />
          <FeatureCard
            icon={<FileText className="h-8 w-8 text-primary" />}
            title="3. Gere o Relatório"
            description="Obtenha relatórios detalhados automaticamente após a inspeção."
          />
        </div>
      </div>
    </section>
  </div>
);

const MetricCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      {icon}
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">{value}</p>
    </CardContent>
  </Card>
);

const QuickAccessCard = ({ 
  icon, 
  title, 
  description, 
  link 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  link: string;
}) => (
  <Card className="hover:shadow-lg transition-shadow">
    <Link to={link}>
      <CardHeader>
        <div className="flex items-center gap-4">
          {icon}
          <CardTitle className="font-montserrat">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground font-opensans">{description}</p>
      </CardContent>
    </Link>
  </Card>
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
