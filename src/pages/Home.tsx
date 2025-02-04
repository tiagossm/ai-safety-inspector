import { Brain, Shield, Zap, Target, Users } from "lucide-react";

const Home = () => (
  <section className="space-y-12 py-8">
    <div className="text-center space-y-4">
      <h1 className="text-4xl font-bold text-primary font-montserrat">
        Bem-vindo ao IA SST Inspections
      </h1>
      <p className="text-xl text-gray-600 font-opensans max-w-2xl mx-auto">
        Empodere sua gestão de segurança do trabalho com inteligência artificial
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <ValueCard
        icon={<Brain className="h-8 w-8 text-primary" />}
        title="Inovação"
        description="Exploramos constantemente novas tecnologias para melhorar a segurança"
      />
      <ValueCard
        icon={<Shield className="h-8 w-8 text-secondary" />}
        title="Segurança"
        description="Garantimos ambientes de trabalho mais seguros"
      />
      <ValueCard
        icon={<Zap className="h-8 w-8 text-primary" />}
        title="Agilidade"
        description="Reduzimos o tempo de resposta em análises de riscos"
      />
      <ValueCard
        icon={<Target className="h-8 w-8 text-secondary" />}
        title="Precisão"
        description="Oferecemos recomendações baseadas em normas"
      />
    </div>

    <div className="bg-gray-50 py-8 rounded-lg">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8 font-montserrat text-gray-800">
          Para quem é o IA SST?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AudienceCard
            icon={<Users className="h-6 w-6" />}
            title="Técnicos e Engenheiros"
            description="Otimize seu trabalho com IA"
          />
          <AudienceCard
            icon={<Users className="h-6 w-6" />}
            title="Empresários"
            description="Gestão de SST simplificada"
          />
          <AudienceCard
            icon={<Users className="h-6 w-6" />}
            title="Estudantes"
            description="Aprenda com tecnologia"
          />
          <AudienceCard
            icon={<Users className="h-6 w-6" />}
            title="Consultorias"
            description="Escale seu negócio"
          />
        </div>
      </div>
    </div>
  </section>
);

const ValueCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
    <div className="flex flex-col items-center text-center space-y-3">
      {icon}
      <h3 className="font-montserrat font-semibold text-lg">{title}</h3>
      <p className="font-opensans text-gray-600">{description}</p>
    </div>
  </div>
);

const AudienceCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex flex-col items-center text-center space-y-2">
    <div className="p-3 bg-primary/10 rounded-full">
      {icon}
    </div>
    <h3 className="font-montserrat font-semibold">{title}</h3>
    <p className="font-opensans text-sm text-gray-600">{description}</p>
  </div>
);

export default Home;