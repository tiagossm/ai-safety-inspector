import { Brain, ClipboardCheck, FileText, Building2, AlertTriangle, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/components/AuthProvider";
import { WorkflowGuide } from "@/components/workflow/WorkflowGuide";
import { useInspections } from "@/hooks/useInspections";
import { useCompanies } from "@/hooks/useCompanies";
import { useChecklists } from "@/hooks/useChecklists";

const Home = () => {
  const { user } = useAuth();

  if (user) {
    return <DashboardView />;
  }

  return <LandingView />;
};

const DashboardView = () => {
  const { inspections = [], loading: inspectionsLoading } = useInspections();
  const { companies = [], loading: companiesLoading } = useCompanies();
  const { checklists = [], isLoading: checklistsLoading } = useChecklists();
  
  // Filter data for metrics
  const pendingInspections = inspections.filter(i => i.status === 'Pendente').length;
  const criticalIssues = inspections.filter(i => i.priority === 'high').length;
  
  // Calculate days to next inspection
  const getNextInspectionDays = () => {
    const plannedInspections = inspections
      .filter(i => i.scheduledDate)
      .sort((a, b) => {
        const dateA = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0;
        const dateB = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0;
        return dateA - dateB;
      });
      
    if (plannedInspections.length && plannedInspections[0].scheduledDate) {
      const nextDate = new Date(plannedInspections[0].scheduledDate);
      const today = new Date();
      const diffTime = nextDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    
    return "-";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link to="/inspections/new" className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nova Inspeção
          </Link>
        </Button>
      </div>
      
      {/* Workflow Guide */}
      <div className="mb-8">
        <WorkflowGuide />
      </div>
      
      {/* Metrics Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          icon={<ClipboardCheck className="h-8 w-8 text-yellow-500" />}
          title="Inspeções Pendentes"
          value={inspectionsLoading ? "..." : pendingInspections.toString()}
        />
        <MetricCard
          icon={<AlertTriangle className="h-8 w-8 text-red-500" />}
          title="Não Conformidades Críticas"
          value={inspectionsLoading ? "..." : criticalIssues.toString()}
        />
        <MetricCard
          icon={<Calendar className="h-8 w-8 text-blue-500" />}
          title="Dias para Próxima Inspeção"
          value={inspectionsLoading ? "..." : getNextInspectionDays().toString()}
        />
      </div>

      {/* Quick Access Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-full md:col-span-1 hover:shadow-lg transition-shadow">
          <Link to="/companies">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Building2 className="h-8 w-8 text-primary" />
                <CardTitle className="font-montserrat">Cadastrar Empresa</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-opensans">
                Adicione uma nova empresa ao sistema
              </p>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="col-span-full md:col-span-1 hover:shadow-lg transition-shadow">
          <Link to="/inspections/new">
            <CardHeader>
              <div className="flex items-center gap-4">
                <ClipboardCheck className="h-8 w-8 text-primary" />
                <CardTitle className="font-montserrat">Nova Inspeção</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-opensans">
                Inicie uma nova inspeção de segurança
              </p>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="col-span-full md:col-span-1 hover:shadow-lg transition-shadow">
          <Link to="/inspections">
            <CardHeader>
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-primary" />
                <CardTitle className="font-montserrat">Histórico de Relatórios</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-opensans">
                Visualize relatórios anteriores
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
};

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
