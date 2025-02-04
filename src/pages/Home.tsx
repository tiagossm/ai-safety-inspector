import { ArrowRight, CheckCircle2, BarChart3, FileText, Star, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const Home = () => (
  <div className="min-h-screen bg-white">
    {/* Hero Section */}
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight">
              <span className="text-[#00A651]">Tanta qualidade operacional</span>{" "}
              que você vai encantar seus clientes
            </h1>
            <p className="text-xl text-gray-600">
              Software e aplicativo para você planejar, executar e comprovar seus serviços de SST
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="bg-[#00A651] hover:bg-[#008c44]">
                Testar Grátis
              </Button>
              <Button variant="outline" size="lg">
                Conversar com um consultor
              </Button>
            </div>
          </div>
          <div className="relative">
            <img 
              src="/lovable-uploads/583a2a78-1536-4ba9-8874-3670a4f5314b.png" 
              alt="App Preview" 
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section className="py-16 px-4 bg-[#f8f9fa]">
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-4xl font-bold text-center mb-12 text-[#00A651]">
          Funcionalidades para você gerenciar sua operação de ponta a ponta
        </h2>

        <Carousel className="w-full">
          <CarouselContent>
            <CarouselItem className="md:basis-1/2 lg:basis-1/3">
              <FeatureCard
                icon={<CheckCircle2 className="w-8 h-8 text-[#00A651]" />}
                title="Checklist"
                description="Fácil e rápido de preencher, os checklists se adequam a diversos tipos de serviços."
              />
            </CarouselItem>
            <CarouselItem className="md:basis-1/2 lg:basis-1/3">
              <FeatureCard
                icon={<FileText className="w-8 h-8 text-[#00A651]" />}
                title="Relatórios Inteligentes"
                description="Relatórios gerados automaticamente após a finalização dos serviços no padrão da sua empresa."
              />
            </CarouselItem>
            <CarouselItem className="md:basis-1/2 lg:basis-1/3">
              <FeatureCard
                icon={<MessageCircle className="w-8 h-8 text-[#00A651]" />}
                title="Abertura de Chamados"
                description="Página personalizada para sua empresa onde seus clientes podem solicitar serviços."
              />
            </CarouselItem>
            <CarouselItem className="md:basis-1/2 lg:basis-1/3">
              <FeatureCard
                icon={<BarChart3 className="w-8 h-8 text-[#00A651]" />}
                title="Dados e Indicadores"
                description="Gráficos de fácil leitura para entender gargalos na operação e volume de trabalho."
              />
            </CarouselItem>
            <CarouselItem className="md:basis-1/2 lg:basis-1/3">
              <FeatureCard
                icon={<Star className="w-8 h-8 text-[#00A651]" />}
                title="Pesquisa de Satisfação"
                description="Disparadas automaticamente após a execução do serviço para medir a reputação do seu negócio."
              />
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>

    {/* Why Choose Us Section */}
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-4xl font-bold text-center mb-12 text-[#00A651]">
          Por que o IA SST é a escolha certa para o seu negócio?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <WhyChooseCard
            number="1"
            title="Receba solicitações de serviços em segundos"
            description="Seus clientes abrem chamados a partir do QR Code do equipamento ou local em uma página personalizada."
          />
          <WhyChooseCard
            number="2"
            title="Direcione para a equipe"
            description="Aprove as solicitações em tempo real e direcione para o técnico. Planos de manutenção são agendados automaticamente."
          />
          <WhyChooseCard
            number="3"
            title="Acompanhe em tempo real"
            description="Monitore o status dos serviços, receba notificações e mantenha seus clientes informados."
          />
        </div>
      </div>
    </section>
  </div>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <Card className="p-6 h-full hover:shadow-lg transition-shadow">
    <div className="space-y-4">
      <div className="w-12 h-12 rounded-full bg-[#00A651]/10 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-600">{description}</p>
      <Button variant="link" className="text-[#00A651] p-0 h-auto font-semibold">
        Saiba mais <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  </Card>
);

const WhyChooseCard = ({ number, title, description }: { number: string; title: string; description: string }) => (
  <div className="space-y-4">
    <div className="w-8 h-8 rounded-full border-2 border-[#00A651] flex items-center justify-center text-[#00A651] font-semibold">
      {number}
    </div>
    <h3 className="text-xl font-semibold">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Home;