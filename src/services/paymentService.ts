
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

// API configuration
const API_URL = 'https://contratoagoraback.onrender.com';
const MERCADO_PAGO_TOKEN = 'APP_USR-957794627794363-082308-6665c8bdcf1ceeeb07e1c6a3430fb855-198355928';

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
      street_number: string; // Changed from number to string to match usage
      neighborhood?: string;
      city?: string;
      federal_unit?: string;
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
      const response = await axios.post(`${API_URL}/server/pix`, paymentData);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao processar pagamento');
      }
      
      return response.data;
    } catch (error) {
      console.error('Payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no pagamento'
      };
    }
  },
  
  // Verify payment status
  verifyPayment: async (paymentId: string): Promise<{ status: string; approved: boolean }> => {
    try {
      const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${MERCADO_PAGO_TOKEN}`
        }
      });
      
      return {
        status: response.data.status,
        approved: response.data.status === 'approved'
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      throw new Error('Falha ao verificar o status do pagamento');
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
        },
        address: {
          street_name: "Rua Exemplo",
          street_number: "123", // Changed from 123 to "123"
          zip_code: "12345678"
        }
      }
    };
    
    return paymentService.createPixPayment(paymentData);
  }
};

export default paymentService;
