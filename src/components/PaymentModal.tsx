import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import paymentService, { PaymentResponse } from "@/services/paymentService";
import { ListItem as ListItemType } from "@/context/ListContext";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Nome precisa ter pelo menos 2 caracteres" }),
  phone: z.string().min(8, { message: "Telefone precisa ter pelo menos 8 números" }),
  email: z.string().email({ message: "Insira um email válido" }),
  document: z.string().min(11, { message: "CPF precisa ter 11 números" })
});

type FormValues = z.infer<typeof formSchema>;

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ListItemType;
  onConfirm: (name: string, phone: string) => Promise<void>;
  accentColor?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onOpenChange,
  item,
  onConfirm,
  accentColor
}) => {
  const [step, setStep] = useState<'form' | 'payment' | 'success' | 'error'>('form');
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      document: ''
    }
  });
  
  const handleProceedToPayment = async (values: FormValues) => {
    setLoading(true);
    
    try {
      // Create payment request for this item
      const paymentRequest = {
        transaction_amount: 0.01, // Use a small test amount
        description: `Reserva do item: ${item.name}`,
        paymentMethodId: 'pix',
        payer: {
          name: values.name,
          email: values.email,
          identification: {
            type: 'CPF',
            number: values.document
          },
          address: {
            street_name: "Rua Exemplo",
            street_number: "123",
            zip_code: "12345678"
          }
        }
      };
      
      const response = await paymentService.createPixPayment(paymentRequest);
      
      if (response.success) {
        setPaymentData(response);
        if (response.result?.id) {
          setPaymentId(response.result.id);
          setPaymentStatus(response.result.status);
        }
        setStep('payment');
      } else {
        toast({
          title: "Erro ao criar pagamento",
          description: response.error || "Ocorreu um erro ao tentar processar o pagamento",
          variant: "destructive"
        });
        setStep('error');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Erro no pagamento",
        description: "Não foi possível processar seu pagamento",
        variant: "destructive"
      });
      setStep('error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyPayment = async () => {
    if (!paymentId) {
      toast({
        title: "Erro na verificação",
        description: "ID do pagamento não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    setVerifying(true);
    
    try {
      const result = await paymentService.verifyPayment(paymentId);
      setPaymentStatus(result.status);
      
      if (result.approved) {
        toast({
          title: "Pagamento aprovado!",
          description: "Seu pagamento foi confirmado com sucesso."
        });
        await handleFinalize();
      } else {
        toast({
          title: "Pagamento pendente",
          description: "Seu pagamento ainda está sendo processado. Tente verificar novamente em alguns instantes.",
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Erro na verificação",
        description: "Não foi possível verificar o status do pagamento",
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
    }
  };
  
  const handleFinalize = async () => {
    setLoading(true);
    
    try {
      // Claim the item using the provided name and phone
      await onConfirm(form.getValues('name'), form.getValues('phone'));
      setStep('success');
      
      // Close modal after 2 seconds on success
      setTimeout(() => {
        onOpenChange(false);
        setStep('form');
        form.reset();
      }, 2000);
    } catch (error) {
      console.error('Error claiming item:', error);
      toast({
        title: "Erro ao reservar item",
        description: "Ocorreu um erro ao tentar reservar o item",
        variant: "destructive"
      });
      setStep('error');
    } finally {
      setLoading(false);
    }
  };
  
  const resetModal = () => {
    setStep('form');
    setPaymentData(null);
    setPaymentId(null);
    setPaymentStatus(null);
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
              <DialogTitle>Reservar Item</DialogTitle>
              <DialogDescription>
                Preencha seus dados para reservar "{item.name}"
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleProceedToPayment)} className="space-y-4 py-4">
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seu telefone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(00) 00000-0000" 
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
                    style={{ backgroundColor: accentColor }}
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
                <p className="text-sm text-muted-foreground mb-2">
                  Após efetuar o pagamento, clique em "Verificar Pagamento"
                </p>
                {paymentId && paymentStatus && (
                  <p className="text-xs text-muted-foreground">
                    Status atual: <span className="font-medium">{paymentStatus}</span>
                  </p>
                )}
              </div>
              
              {paymentData.point_of_interaction?.transaction_data?.ticket_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mb-4"
                  onClick={() => window.open(paymentData.point_of_interaction?.transaction_data?.ticket_url, '_blank')}
                >
                  Abrir Página do PIX
                </Button>
              )}
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={resetModal} 
                disabled={loading || verifying}
                className="sm:flex-1"
              >
                Voltar
              </Button>
              <Button 
                onClick={handleVerifyPayment} 
                disabled={loading || verifying}
                className="sm:flex-1"
                variant="outline"
              >
                {verifying ? <Loader2 size={16} className="animate-spin mr-2" /> : <RefreshCw size={16} className="mr-2" />}
                Verificar Pagamento
              </Button>
              <Button 
                onClick={handleFinalize} 
                disabled={loading || verifying}
                style={{ backgroundColor: accentColor }}
                className="sm:flex-1"
              >
                {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                Finalizar Reserva
              </Button>
            </DialogFooter>
          </>
        )}
        
        {step === 'success' && (
          <div className="py-6 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <DialogTitle className="mb-2">Reserva concluída!</DialogTitle>
            <DialogDescription>
              Sua reserva foi confirmada com sucesso.
            </DialogDescription>
          </div>
        )}
        
        {step === 'error' && (
          <div className="py-6 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <DialogTitle className="mb-2">Ocorreu um erro</DialogTitle>
            <DialogDescription className="mb-4">
              Não foi possível completar sua reserva. Por favor, tente novamente.
            </DialogDescription>
            <Button onClick={resetModal}>Tentar novamente</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
