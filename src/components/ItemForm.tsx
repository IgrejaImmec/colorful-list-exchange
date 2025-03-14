
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const itemFormSchema = z.object({
  name: z.string().min(2, {
    message: "O nome do item deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

interface ItemFormProps {
  onSubmit: (values: ItemFormValues) => void;
  isProcessing?: boolean;
}

const ItemForm: React.FC<ItemFormProps> = ({
  onSubmit,
  isProcessing = false,
}) => {
  const { toast } = useToast();
  
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: '',
      description: '',
    }
  });

  const handleSubmit = (values: ItemFormValues) => {
    try {
      onSubmit(values);
      form.reset();
    } catch (error) {
      console.error('Form error:', error);
      toast({
        title: "Erro ao adicionar item",
        description: "Ocorreu um erro ao adicionar o item. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Item</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Liquidificador"
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
              <FormLabel>Descrição do Item</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes adicionais, marca, modelo, cor..."
                  className="input-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full btn-primary gap-2" disabled={isProcessing}>
          <Plus size={16} />
          <span>Adicionar Item</span>
        </Button>
      </form>
    </Form>
  );
};

export default ItemForm;
