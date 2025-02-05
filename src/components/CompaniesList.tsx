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
        text
