
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";

const actionPlanSchema = z.object({
  what: z.string().min(5, { message: "Descreva o que será feito" }),
  why: z.string().min(5, { message: "Explique por que isso será feito" }),
  how: z.string().min(5, { message: "Descreva como será feito" }),
  who: z.string().min(3, { message: "Indique quem fará" }),
  where: z.string().min(3, { message: "Indique onde será feito" }),
  when: z.date({ required_error: "Selecione uma data" }),
  howMuch: z.string().optional(),
  priority: z.enum(["alta", "média", "baixa"]),
  status: z.enum(["pendente", "em andamento", "concluído", "cancelado"]),
});

type ActionPlanFormValues = z.infer<typeof actionPlanSchema>;

export interface ActionPlan5W2HDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId?: string;
  inspectionId?: string;
  existingPlan?: any;
  onSave: (data: any) => Promise<void>;
  iaSuggestions?: Record<string, any>;
}

export function ActionPlan5W2HDialog({
  open,
  onOpenChange,
  questionId,
  inspectionId,
  existingPlan,
  onSave,
  iaSuggestions
}: ActionPlan5W2HDialogProps) {
  const [saving, setSaving] = useState(false);
  
  const form = useForm<ActionPlanFormValues>({
    resolver: zodResolver(actionPlanSchema),
    defaultValues: {
      what: "",
      why: "",
      how: "",
      who: "",
      where: "",
      when: new Date(),
      howMuch: "",
      priority: "média",
      status: "pendente",
    }
  });
  
  useEffect(() => {
    if (existingPlan) {
      form.reset({
        what: existingPlan.what || "",
        why: existingPlan.why || "",
        how: existingPlan.how || "",
        who: existingPlan.who || "",
        where: existingPlan.where || "",
        when: existingPlan.when ? new Date(existingPlan.when) : new Date(),
        howMuch: existingPlan.howMuch || "",
        priority: existingPlan.priority || "média",
        status: existingPlan.status || "pendente",
      });
    } else if (iaSuggestions) {
      // Encontrar a primeira sugestão de plano de ação nas análises
      const suggestion = Object.values(iaSuggestions).find(
        (item) => item && typeof item === 'object' && 'actionPlanSuggestion' in item
      );
      
      if (suggestion && suggestion.actionPlanSuggestion) {
        form.setValue("what", suggestion.actionPlanSuggestion);
      }
    }
  }, [existingPlan, iaSuggestions, form]);
  
  const onSubmit = async (data: ActionPlanFormValues) => {
    setSaving(true);
    try {
      const planData = {
        ...data,
        questionId, 
        inspectionId
      };
      
      await onSave(planData);
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar plano de ação:", error);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl" aria-describedby="action-plan-description">
        <DialogHeader>
          <DialogTitle>Plano de Ação 5W2H</DialogTitle>
          <div id="action-plan-description" className="sr-only">
            Formulário para criação e edição de planos de ação usando a metodologia 5W2H
          </div>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="what"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>O quê (What)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="O que será feito?"
                        className="min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="why"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Por quê (Why)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Por que será feito?"
                        className="min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="how"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Como (How)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Como será feito?"
                        className="min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="who"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quem (Who)</FormLabel>
                      <FormControl>
                        <Input placeholder="Quem será responsável?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="where"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Onde (Where)</FormLabel>
                      <FormControl>
                        <Input placeholder="Onde será feito?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="when"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Quando (When)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione a data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="howMuch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quanto (How Much)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Quanto custará ou recursos necessários?"
                        className="min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="média">Média</SelectItem>
                          <SelectItem value="baixa">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="em andamento">Em andamento</SelectItem>
                          <SelectItem value="concluído">Concluído</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Plano de Ação"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
