
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUploader from './ImageUploader';
import { useToast } from "@/components/ui/use-toast";

const listFormSchema = z.object({
  title: z.string().min(2, {
    message: "O título deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  image: z.string().optional(),
});

type ListFormValues = z.infer<typeof listFormSchema>;

interface ListFormProps {
  defaultValues?: {
    title: string;
    description: string;
    image?: string;
  };
  onSubmit: (values: ListFormValues) => void;
  isProcessing?: boolean;
  submitButtonText?: string;
}

const ListForm: React.FC<ListFormProps> = ({
  defaultValues = {
    title: '',
    description: '',
    image: '',
  },
  onSubmit,
  isProcessing = false,
  submitButtonText = "Salvar"
}) => {
  const { toast } = useToast();
  
  const form = useForm<ListFormValues>({
    resolver: zodResolver(listFormSchema),
    defaultValues
  });

  const handleSubmit = (values: ListFormValues) => {
    try {
      onSubmit(values);
    } catch (error) {
      console.error('Form error:', error);
      toast({
        title: "Erro ao processar formulário",
        description: "Ocorreu um erro ao enviar o formulário. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da Lista</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Lista de Casamento"
                  className="input-primary" 
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
                <Textarea
                  placeholder="Descreva sua lista..."
                  className="input-primary min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagem da Lista (opcional)</FormLabel>
              <FormControl>
                <ImageUploader
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full btn-primary" disabled={isProcessing}>
          {isProcessing ? 'Processando...' : submitButtonText}
        </Button>
      </form>
    </Form>
  );
};

export default ListForm;
