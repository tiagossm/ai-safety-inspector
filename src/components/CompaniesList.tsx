import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import CompanyItem from "./CompanyItem";

type Company = {
    id: string;
    fantasy_name: string | null;
    cnpj: string;
    risk_level: string | null;
    cnae: string | null;
    contact_email: string | null;
    contact_phone: string | null;
};

export function CompaniesList() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCompanies(data || []);
        } catch (error) {
            toast({
                title: "Erro ao carregar empresas",
                description: "Não foi possível carregar a lista de empresas.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Busca ignorando acentos e maiúsculas
    const normalizeText = (text: string) =>
        text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const filteredCompanies = companies.filter(company =>
        normalizeText(company.fantasy_name || "").includes(normalizeText(searchTerm)) ||
        company.cnpj.includes(searchTerm) ||
        company.cnae?.includes(searchTerm)
    );

    if (loading) {
        return <div className="text-center text-gray-500">Carregando empresas...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Buscar empresas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {filteredCompanies.length === 0 ? (
                <p className="text-center text-gray-400">Nenhuma empresa encontrada.</p>
            ) : (
                filteredCompanies.map(company => (
                    <CompanyItem
                        key={company.id}
                        company={company}
                        onUpdate={fetchCompanies}
                        onDelete={fetchCompanies}
                    />
                ))
            )}
        </div>
    );
}
