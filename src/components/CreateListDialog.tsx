
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const listFormSchema = z.object({
  title: z.string().min(2, {
    message: "O título deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
});

type CreateListFormValues = z.infer<typeof listFormSchema>;

interface CreateListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, description: string) => Promise<void>;
  isProcessing: boolean;
}

const CreateListDialog: React.FC<CreateListDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isProcessing
}) => {
  const form = useForm<CreateListFormValues>({
    resolver: zodResolver(listFormSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const handleSubmit = async (values: CreateListFormValues) => {
    await onSubmit(values.title, values.description || '');
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Criar Nova Lista</DialogTitle>
              <DialogDescription>
                Dê um nome e descrição para sua nova lista de presentes.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Lista de Casamento"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Uma breve descrição da sua lista"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? 'Criando...' : 'Criar Lista'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateListDialog;
