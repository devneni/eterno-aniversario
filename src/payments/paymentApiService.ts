// services/paymentApiService.ts

const API_BASE_URL = 'https://api.12testadores.com/api/mercadopago_v2';

export interface ClientData {
  id: string;
}

export interface PixPaymentData {
  amount: string;
  description: string;
  email: string;
  userId: string;
}

export interface PixResponse {
  id: number;
  status: string;
  point_of_interaction: {
    transaction_data: {
      qr_code: string;
      qr_code_base64: string;
    };
  };
  transaction_amount: number;
}

export interface PaymentStatusResponse {
  status: 'pending' | 'approved' | 'rejected';
}

export class PaymentApiService {
  private static clientCache = new Map<string, { id: string; timestamp: number }>();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  private static async fetchWithRetry(
    url: string, 
    options: RequestInit, 
    retries = 2, // Reduzido para evitar 429
    delay = 2000 // Aumentado o delay inicial
  ): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`🔄 Tentativa ${i + 1}/${retries} para: ${url}`);
        
        const response = await fetch(url, options);
        
        if (response.status === 429) {
          // Too Many Requests - espera mais tempo
          const waitTime = delay * Math.pow(2, i);
          console.log(`⏳ Rate limit atingido. Tentando novamente em ${waitTime}ms`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response;
      } catch (error) {
        console.error(`❌ Erro na tentativa ${i + 1}:`, error);
        if (i === retries - 1) throw error;
        const waitTime = delay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    throw new Error('Todas as tentativas falharam');
  }

  // 1. Buscar cliente por email
  static async searchClient(email: string): Promise<ClientData | null> {
    // Verifica cache primeiro
    const cached = this.clientCache.get(email);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log("📦 Retornando cliente do cache:", email);
      return { id: cached.id };
    }

    console.log("🔍 Buscando cliente na API:", email);
    
    try {
      const response = await this.fetchWithRetry(
        `${API_BASE_URL}/search_client_id`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );
      
      const data = await response.json();
      
      // Salva no cache
      if (data?.id) {
        this.clientCache.set(email, { id: data.id, timestamp: Date.now() });
      }
      
      console.log("📋 Resposta busca cliente:", data);
      return data;
    } catch (error) {
      console.error("❌ Erro ao buscar cliente:", error);
      return null;
    }
  }

  // 2. Criar novo cliente
  static async createClient(email: string, firstName: string, lastName: string): Promise<ClientData> {
    console.log("👤 Criando cliente:", { email, firstName, lastName });
    
    const response = await this.fetchWithRetry(
      `${API_BASE_URL}/create`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          first_name: firstName, 
          last_name: lastName 
        }),
      }
    );
    
    const data = await response.json();
    console.log("✅ Cliente criado:", data);
    
    // Atualiza cache
    if (data?.id) {
      this.clientCache.set(email, { id: data.id, timestamp: Date.now() });
    }
    
    return data;
  }

  // 3. Criar pagamento PIX
  static async createPixPayment(paymentData: PixPaymentData): Promise<PixResponse> {
    console.log("💰 Criando PIX:", paymentData);
    
    const response = await this.fetchWithRetry(
      `${API_BASE_URL}/create_pix`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      }
    );
    
    const data = await response.json();
    console.log("✅ PIX criado:", data);
    return data;
  }

  // 4. Consultar status do pagamento
  static async checkPaymentStatus(paymentId: number): Promise<PaymentStatusResponse> {
    console.log("📊 Consultando status do pagamento:", paymentId);
    
    const response = await this.fetchWithRetry(
      `${API_BASE_URL}/payment/${paymentId}`,
      { method: 'GET' }
    );
    
    const data = await response.json();
    console.log("📋 Status do pagamento:", data);
    return data;
  }
}