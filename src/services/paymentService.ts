
import { useToast } from "@/components/ui/use-toast";

// Types for payment requests
export interface PaymentRequest {
  transaction_amount: number;
  description: string;
  paymentMethodId: string;
  payer: {
    name: string;
    email: string;
    identification: {
      type: string;
      number: string;
    };
    address?: {
      zip_code: string;
      street_name: string;
      street_number: string;
      neighborhood: string;
      city: string;
      federal_unit: string;
    }
  }
}

export interface PaymentResponse {
  success: boolean;
  status?: string;
  point_of_interaction?: {
    transaction_data?: {
      qr_code: string;
      qr_code_base64: string;
      ticket_url: string;
    }
  };
  result?: any;
  error?: string;
}

export interface SubscriptionOption {
  id: string;
  name: string;
  description: string;
  amount: number;
  period: 'week' | 'month' | 'year';
  intervalCount: number;
}

// Available subscription plans
export const subscriptionOptions: SubscriptionOption[] = [
  {
    id: 'weekly',
    name: 'Semanal',
    description: 'Acesso por 1 semana',
    amount: 30.00,
    period: 'week',
    intervalCount: 1
  },
  {
    id: 'monthly',
    name: 'Mensal',
    description: 'Acesso por 1 mês',
    amount: 90.00,
    period: 'month',
    intervalCount: 1
  }
];

// MercadoPago payment service
const paymentService = {
  // Create PIX payment
  createPixPayment: async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
    try {
      const response = await fetch('/api/payments/pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao processar pagamento');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no pagamento'
      };
    }
  },
  
  // Create a subscription payment
  createSubscription: async (subscriptionOption: SubscriptionOption, userData: {
    name: string;
    email: string;
    document: string;
  }): Promise<PaymentResponse> => {
    // For this implementation, we'll use the same PIX endpoint
    const paymentData: PaymentRequest = {
      transaction_amount: subscriptionOption.amount,
      description: `Assinatura ${subscriptionOption.name} - ${subscriptionOption.description}`,
      paymentMethodId: 'pix',
      payer: {
        name: userData.name,
        email: userData.email,
        identification: {
          type: 'CPF',
          number: userData.document
        }
      }
    };
    
    return paymentService.createPixPayment(paymentData);
  }
};

export default paymentService;
