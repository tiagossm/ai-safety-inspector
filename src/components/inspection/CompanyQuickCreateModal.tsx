
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCNPJ } from "@/utils/formatters";

const companySchema = z.object({
  fantasy_name: z.string().min(2, "Nome fantasia é obrigatório"),
  cnpj: z.string().min(14, "CNPJ deve ter 14 dígitos"),
  address: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanyQuickCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (company: any) => void;
}

export function CompanyQuickCreateModal({
  open,
  onOpenChange,
  onSuccess,
}: CompanyQuickCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      fantasy_name: "",
      cnpj: "",
      address: "",
    },
  });

  const onSubmit = async (values: CompanyFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Normalize CNPJ - remove any non-numeric characters
      const normalizedCNPJ = values.cnpj.replace(/\D/g, "");
      
      // Check if company with this CNPJ already exists
      const { data: existingCompany, error: checkError } = await supabase
        .from("companies")
        .select("id")
        .eq("cnpj", normalizedCNPJ)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingCompany) {
        toast.error("Já existe uma empresa cadastrada com este CNPJ");
        setIsSubmitting(false);
        return;
      }

      // Get the current user's ID from the auth session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (!userId) {
        toast.error("Usuário não autenticado");
        setIsSubmitting(false);
        return;
      }

      // Insert the new company
      const { data: newCompany, error } = await supabase
        .from("companies")
        .insert({
          fantasy_name: values.fantasy_name,
          cnpj: normalizedCNPJ,
          address: values.address || null,
          status: "active",
          user_id: userId // Add the required user_id field
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Empresa cadastrada com sucesso!");
      onSuccess(newCompany);
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error("Erro ao cadastrar empresa:", error);
      toast.error(error.message || "Erro ao cadastrar empresa");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCNPJ = formatCNPJ(e.target.value);
    form.setValue("cnpj", formattedCNPJ);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cadastro Rápido de Empresa</DialogTitle>
          <DialogDescription>
            Preencha os dados básicos para cadastrar uma nova empresa
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fantasy_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Fantasia <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="00.000.000/0000-00" 
                      value={field.value}
                      onChange={(e) => handleCNPJChange(e)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Endereço completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Empresa"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
