import { Brain, ClipboardCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Home = () => (
  <div className="min-h-screen bg-background">
    {/* Hero Section */}
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl text-center">
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
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<ClipboardCheck className="h-8 w-8 text-primary" />}
            title="Checklist Dinâmico"
            description="Checklists adaptáveis que se ajustam às normas e requisitos específicos de cada tipo de inspeção."
          />
          <FeatureCard
            icon={<Brain className="h-8 w-8 text-primary" />}
            title="Análise de Imagens por IA"
            description="Detecção automática de riscos e não conformidades através de inteligência artificial."
          />
          <FeatureCard
            icon={<FileText className="h-8 w-8 text-primary" />}
            title="Conformidade Legal"
            description="Relatórios e documentação em conformidade com as normas regulamentadoras."
          />
        </div>
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