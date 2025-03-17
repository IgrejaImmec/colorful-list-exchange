
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import paymentService, { PaymentResponse, subscriptionOptions, SubscriptionOption } from "@/services/paymentService";

// Form validation schema
const subscriptionFormSchema = z.object({
  plan: z.string().min(1, { message: "Selecione um plano" }),
  name: z.string().min(2, { message: "Nome precisa ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Insira um email válido" }),
  document: z.string().min(11, { message: "CPF precisa ter 11 números" })
});

type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;

interface SubscriptionPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const SubscriptionPaymentDialog: React.FC<SubscriptionPaymentDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [step, setStep] = useState<'form' | 'payment' | 'success' | 'error'>('form');
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionOption | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      plan: '',
      name: '',
      email: '',
      document: ''
    }
  });
  
  const handleProceedToPayment = async (values: SubscriptionFormValues) => {
    setLoading(true);
    
    try {
      const plan = subscriptionOptions.find(option => option.id === values.plan);
      
      if (!plan) {
        throw new Error("Plano inválido");
      }
      
      setSelectedPlan(plan);
      
      // Create subscription payment
      const response = await paymentService.createSubscription(
        plan,
        {
          name: values.name,
          email: values.email,
          document: values.document
        }
      );
      
      if (response.success) {
        setPaymentData(response);
        setStep('payment');
      } else {
        toast({
          title: "Erro ao criar assinatura",
          description: response.error || "Ocorreu um erro ao tentar processar a assinatura",
          variant: "destructive"
        });
        setStep('error');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Erro na assinatura",
        description: "Não foi possível processar sua assinatura",
        variant: "destructive"
      });
      setStep('error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFinalize = async () => {
    setLoading(true);
    
    try {
      // In a real implementation, we would verify the payment status with the backend
      // For now, we'll simulate a successful payment
      setStep('success');
      
      // Trigger success callback
      onSuccess();
      
      // Close modal after 2 seconds on success
      setTimeout(() => {
        onOpenChange(false);
        setStep('form');
        form.reset();
      }, 2000);
    } catch (error) {
      console.error('Error finalizing subscription:', error);
      setStep('error');
    } finally {
      setLoading(false);
    }
  };
  
  const resetModal = () => {
    setStep('form');
    setPaymentData(null);
    setSelectedPlan(null);
    form.reset();
  };
  
  const onModalClose = (open: boolean) => {
    if (!open && !loading) {
      resetModal();
    }
    onOpenChange(open);
  };
  
  return (
    <Dialog open={open} onOpenChange={onModalClose}>
      <DialogContent className="sm:max-w-[425px] animate-scale-in">
        {step === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle>Escolha seu plano</DialogTitle>
              <DialogDescription>
                Escolha um plano para usar nossa plataforma
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleProceedToPayment)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="plan"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Plano</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {subscriptionOptions.map((option) => (
                            <FormItem key={option.id} className="flex items-center space-x-3 space-y-0 border p-4 rounded-md">
                              <FormControl>
                                <RadioGroupItem value={option.id} />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer flex-1">
                                <div className="font-medium">{option.name} - R$ {option.amount.toFixed(2)}</div>
                                <div className="text-sm text-muted-foreground">{option.description}</div>
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seu nome</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nome completo" 
                          {...field} 
                          className="input-primary"
                        />
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
                      <FormLabel>Seu email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="seu@email.com" 
                          {...field} 
                          className="input-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="000.000.000-00" 
                          {...field} 
                          className="input-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                    Prosseguir para pagamento
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
        
        {step === 'payment' && paymentData && (
          <>
            <DialogHeader>
              <DialogTitle>Pagamento via PIX</DialogTitle>
              <DialogDescription>
                Escaneie o QR Code ou copie o código para efetuar o pagamento
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center justify-center py-4">
              {paymentData.point_of_interaction?.transaction_data?.qr_code_base64 && (
                <img 
                  src={`data:image/png;base64,${paymentData.point_of_interaction.transaction_data.qr_code_base64}`}
                  alt="QR Code para pagamento"
                  className="w-48 h-48 mb-4"
                />
              )}
              
              <div className="text-center mt-4 mb-6">
                <p className="text-sm font-medium mb-1">
                  {selectedPlan?.name} - R$ {selectedPlan?.amount.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  Após efetuar o pagamento, clique em "Finalizar"
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={resetModal} 
                disabled={loading}
              >
                Voltar
              </Button>
              <Button 
                onClick={handleFinalize} 
                disabled={loading}
              >
                {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                Finalizar
              </Button>
            </DialogFooter>
          </>
        )}
        
        {step === 'success' && (
          <div className="py-6 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <DialogTitle className="mb-2">Assinatura confirmada!</DialogTitle>
            <DialogDescription>
              Sua assinatura foi ativada com sucesso.
            </DialogDescription>
          </div>
        )}
        
        {step === 'error' && (
          <div className="py-6 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <DialogTitle className="mb-2">Ocorreu um erro</DialogTitle>
            <DialogDescription className="mb-4">
              Não foi possível completar sua assinatura. Por favor, tente novamente.
            </DialogDescription>
            <Button onClick={resetModal}>Tentar novamente</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionPaymentDialog;
