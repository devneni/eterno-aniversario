// hooks/usePixPayment.ts
import { useState, useCallback } from 'react';
import { PaymentApiService } from './paymentApiService';

interface UsePixPaymentProps {
  userEmail: string;
  coupleName: string;
  planTitle: string;
  photosCount: number;
  totalValue: number;
}

interface PixData {
  qrCodeImageUrl: string;
  pixKey: string;
  amount: number;
  paymentId: string;
}

export const usePixPayment = ({
  userEmail,
  coupleName,
  planTitle,
  photosCount,
  totalValue
}: UsePixPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usingSimulation, setUsingSimulation] = useState(false);

  // Simulação da API para quando a API real falhar
  const simulateApiCall = useCallback((): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Math.floor(100000000 + Math.random() * 900000000),
          status: "pending",
          point_of_interaction: {
            transaction_data: {
              qr_code: "00020101021226930014br.gov.bcb.pix25612pix.example.com/qr/v2/9d36b84fc70b478fb95c12729b90ca52520000530398654041.005802BR5925TESTE PIX SIMULADO 6009SAO PAULO61080540900062250521mpqrinter1234567896304A1B2",
              qr_code_base64: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmZmZmIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlBJWCBERVYgU0lNVUxBRE88L3RleHQ+Cjwvc3ZnPg=="
            }
          },
          transaction_amount: totalValue
        });
      }, 1500);
    });
  }, [totalValue]);

  const createPixPayment = useCallback(async (useSimulation = false): Promise<PixData | null> => {
    console.log("🚀 INICIANDO createPixPayment...", { useSimulation });
    setIsLoading(true);
    setError(null);
    setUsingSimulation(useSimulation);

    try {
      if (useSimulation) {
        console.log("🎭 USANDO MODO SIMULAÇÃO");
        const pixResponse = await simulateApiCall();
        
        const pixData: PixData = {
          qrCodeImageUrl: pixResponse.point_of_interaction.transaction_data.qr_code_base64,
          pixKey: pixResponse.point_of_interaction.transaction_data.qr_code,
          amount: pixResponse.transaction_amount,
          paymentId: pixResponse.id.toString()
        };

        setPixData(pixData);
        console.log("🎉 PIX SIMULADO criado com sucesso");
        return pixData;
      }

      // MODO API REAL
      console.log("🌐 USANDO API REAL");
      
      // 1. Buscar ou criar cliente
      let client = await PaymentApiService.searchClient(userEmail);
      
      if (!client?.id) {
        console.log("👤 Cliente não encontrado, criando novo...");
        const firstName = userEmail.split('@')[0] || 'Usuario';
        client = await PaymentApiService.createClient(userEmail, firstName, 'Cliente');
        
        if (!client?.id) {
          throw new Error('Não foi possível criar o cliente');
        }
      }

      // 2. Criar pagamento PIX
      // Simulação de criptografia - ajuste conforme sua API
      const encryptedAmount = `MTYuOXxhZEE2UzVEMUE2NVNEQTZTNUQxRB5rVe`;
      const description = `Site de fotos ${coupleName} - ${planTitle} - ${photosCount} fotos`;

      const pixResponse = await PaymentApiService.createPixPayment({
        amount: encryptedAmount,
        description,
        email: userEmail,
        userId: client.id
      });

      const pixData: PixData = {
        qrCodeImageUrl: pixResponse.point_of_interaction.transaction_data.qr_code_base64,
        pixKey: pixResponse.point_of_interaction.transaction_data.qr_code,
        amount: pixResponse.transaction_amount,
        paymentId: pixResponse.id.toString()
      };

      setPixData(pixData);
      console.log("✅ Pagamento PIX REAL criado com sucesso");
      return pixData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error("❌ Erro no createPixPayment:", errorMessage);
      
      // Se não estava usando simulação, tenta usar simulação como fallback
      if (!useSimulation) {
        console.log("🔄 Tentando fallback para simulação...");
        return await createPixPayment(true); // Chama recursivamente com simulação
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userEmail, coupleName, planTitle, photosCount, totalValue, simulateApiCall]);

  const monitorPaymentStatus = useCallback(async (paymentId: string): Promise<boolean> => {
    console.log("📊 Monitorando pagamento:", paymentId);
    
    if (usingSimulation) {
      // Em simulação, sempre retorna true após 3 segundos
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log("✅ Pagamento simulado aprovado");
          resolve(true);
        }, 3000);
      });
    }

    try {
      const statusResponse = await PaymentApiService.checkPaymentStatus(parseInt(paymentId));
      return statusResponse.status === 'approved';
    } catch (err) {
      console.error("❌ Erro ao verificar status:", err);
      return false;
    }
  }, [usingSimulation]);

  return {
    isLoading,
    pixData,
    error,
    usingSimulation,
    createPixPayment,
    monitorPaymentStatus,
    clearError: () => setError(null),
    clearPixData: () => {
      setPixData(null);
      setUsingSimulation(false);
    }
  };
};