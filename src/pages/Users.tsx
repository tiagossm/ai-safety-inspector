
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";

interface UserAssignment {
  id: string;
  user_id: string;
  company_id: string;
  status: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  };
  companies: {
    fantasy_name: string | null;
    cnpj: string;
  };
}

export default function Users() {
  const { toast } = useToast();
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email');
      
      if (error) throw error;
      return profiles;
    }
  });

  const { data: assignments, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['user_assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_assignments')
        .select(`
          id,
          user_id,
          company_id,
          status,
          profiles (
            full_name,
            email
          ),
          companies (
            fantasy_name,
            cnpj
          )
        `);
      
      if (error) throw error;
      return data as UserAssignment[];
    }
  });

  const handleAssignCompany = async (userId: string, companyId: string) => {
    try {
      const { error } = await supabase
        .from('user_assignments')
        .insert([
          { user_id: userId, company_id: companyId }
        ]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Empresa atribuída com sucesso",
      });

      setIsAssignmentDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoadingUsers || isLoadingAssignments) {
    return (
      <DashboardLayout>
        <div>Carregando...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Usuários e Atribuições</CardTitle>
              <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Atribuir Empresa</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Atribuir Empresa ao Usuário</DialogTitle>
                  </DialogHeader>
                  {/* Form content will be added in the next iteration */}
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Empresas Atribuídas</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.full_name || 'Sem nome'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {assignments
                        ?.filter(a => a.user_id === user.id)
                        .map(a => a.companies.fantasy_name)
                        .join(', ') || 'Nenhuma empresa atribuída'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setIsAssignmentDialogOpen(true);
                        }}
                      >
                        Gerenciar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
