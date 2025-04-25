
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

const responsibleSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  position: z.string().optional(),
});

type ResponsibleFormValues = z.infer<typeof responsibleSchema>;

interface ResponsibleQuickCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (responsible: any) => void;
}

export function ResponsibleQuickCreateModal({
  open,
  onOpenChange,
  onSuccess,
}: ResponsibleQuickCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ResponsibleFormValues>({
    resolver: zodResolver(responsibleSchema),
    defaultValues: {
      name: "",
      email: "",
      position: "",
    },
  });

  const onSubmit = async (values: ResponsibleFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Check if user with this email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("email", values.email)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingUser) {
        toast.error("Já existe um responsável cadastrado com este email");
        setIsSubmitting(false);
        return;
      }

      // Insert the new responsible
      const { data: newResponsible, error } = await supabase
        .from("users")
        .insert({
          name: values.name,
          email: values.email,
          position: values.position || null,
          status: "active",
          role: "Técnico"
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Responsável cadastrado com sucesso!");
      onSuccess(newResponsible);
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error("Erro ao cadastrar responsável:", error);
      toast.error(error.message || "Erro ao cadastrar responsável");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cadastro Rápido de Responsável</DialogTitle>
          <DialogDescription>
            Preencha os dados básicos para cadastrar um novo responsável
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do responsável" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="email@exemplo.com" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl>
                    <Input placeholder="Cargo na empresa" {...field} />
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
                  "Salvar Responsável"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
