import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PencilIcon, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

type Company = {
    id: string;
    fantasy_name: string | null;
    cnpj: string;
    risk_level: string | null;
    cnae: string | null;
    contact_email: string | null;
    contact_phone: string | null;
};

export default function CompanyItem({ company, onUpdate, onDelete }: { company: Company, onUpdate: () => void, onDelete: () => void }) {
    const { toast } = useToast();
    const [editingCompany, setEditingCompany] = useState(company);
    const [loading, setLoading] = useState(false);

    const handleUpdateCompany = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('companies')
                .update({
                    fantasy_name: editingCompany.fantasy_name,
                    cnae: editingCompany.cnae,
                    risk_level: editingCompany.risk_level,
                    contact_email: editingCompany.contact_email,
                    contact_phone: editingCompany.contact_phone,
                })
                .eq('id', company.id);

            if (error) throw error;

            toast({ title: "Empresa atualizada", description: "Dados atualizados com sucesso." });
            onUpdate();
        } catch {
            toast({ title: "Erro ao atualizar", description: "Não foi possível atualizar a empresa.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCompany = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.from('companies').delete().eq('id', company.id);
            if (error) throw error;

            toast({ title: "Empresa excluída", description: "A empresa foi removida com sucesso." });
            onDelete();
        } catch {
            toast({ title: "Erro ao excluir", description: "Não foi possível excluir a empresa.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="pb-2 flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{company.fantasy_name || "Nome não informado"}</CardTitle>
                <Badge variant="outline">Risco {company.risk_level || "Não avaliado"}</Badge>
            </CardHeader>
            <CardContent>
                <p>CNPJ: {company.cnpj}</p>
                <p>CNAE: {company.cnae || "Não informado"}</p>
                {company.contact_email && <p>Email: {company.contact_email}</p>}
                {company.contact_phone && <p>Telefone: {company.contact_phone}</p>}
            </CardContent>
            <div className="flex justify-between p-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                            <PencilIcon className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Empresa</DialogTitle>
                        </DialogHeader>
                        <Input value={editingCompany.fantasy_name || ""} onChange={(e) => setEditingCompany({ ...editingCompany, fantasy_name: e.target.value })} />
                        <Button onClick={handleUpdateCompany} disabled={loading}>Salvar</Button>
                    </DialogContent>
                </Dialog>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Excluir Empresa?</AlertDialogTitle></AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteCompany} disabled={loading}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Card>
    );
}
