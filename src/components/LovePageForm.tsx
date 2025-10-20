import React, { useState, useRef, useEffect, useCallback } from "react";
import PlanCard from "./PlanCard";

// IMPORTS REAIS - Estes arquivos devem existir no seu projeto
import { plansData, type Plan } from "./plansData";
import {
  convertFilesToDataUrls,
  saveImagesToStorage,
  getImagesFromStorage,
} from "./imageStorage";
import { createLovePage } from "../firebase/firebaseService";
import { calculateRelationshipTime } from "./calculateRelationshipTime";
import PaymentModal from "../payments/PaymentModal";
// FIM DOS IMPORTS REAIS

// Definição de tipo necessária para a lógica da modal
type PaymentMethod = "pix" | "credit_card";

// Estruturas de dados simuladas (MOCKS) FORAM REMOVIDAS.

interface LovePageFormProps {
  coupleName: string;
  relationshipTime: string;
  setRelationshipTime: (time: string) => void;
  setCoupleName: (name: string) => void;
  CoupleMessage: string;
  setCoupleMessage: (message: string) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  youtubeLink: string;
  setYoutubeLink: (link: string) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  email: string;
  setEmail: (email: string) => void;
}

const LovePageForm: React.FC<LovePageFormProps> = ({
  coupleName,
  setCoupleName,
  setRelationshipTime,
  CoupleMessage,
  setCoupleMessage,
  files,
  setFiles,
  youtubeLink,
  setYoutubeLink,
  startTime,
  setStartTime,
  startDate,
  setStartDate,
  email,
  setEmail,
}) => {
  // A tipagem do initialPlanId e useState<Plan["id"]> está correta
  const initialPlanId: Plan["id"] =
    plansData.find((p) => p.preferred)?.id || plansData[0].id;
  
  const [selectedPlanId, setSelectedPlanId] =
    useState<Plan["id"]>(initialPlanId); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedPlan = plansData.find((plan) => plan.id === selectedPlanId);
  const [savedImages, setSavedImages] = useState<string[]>([]);

  // NOVOS ESTADOS PARA O FLUXO DE PAGAMENTO E FEEDBACK
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [postCreationMessage, setPostCreationMessage] = useState<{
    text: string;
    type: string;
  }>({ text: "", type: "" });
  const [paymentData, setPaymentData] = useState<{
    qrCode: string;
    qrCodeBase64: string;
    pixKey: string;
    amount: number;
    status: string;
    paymentId?: string;
  } | null>(null);

  // Carregar dados do localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("coupleName");
    const savedMessage = localStorage.getItem("CoupleMessage");
    const savedLink = localStorage.getItem("youtubeLink");
    const savedDate = localStorage.getItem("startDate");
    const savedTime = localStorage.getItem("startTime");
    const savedEmail = localStorage.getItem("email");
    const storedImages = getImagesFromStorage(); // Usa a função importada

    if (savedName) setCoupleName(savedName);
    if (savedMessage) setCoupleMessage(savedMessage);
    if (savedLink) setYoutubeLink(savedLink);
    if (savedDate) setStartDate(savedDate);
    if (savedTime) setStartTime(savedTime);
    if (savedEmail) setEmail(savedEmail);
    setSavedImages(storedImages);
  }, [
    setCoupleName,
    setCoupleMessage,
    setYoutubeLink,
    setStartDate,
    setStartTime,
    setEmail,
  ]);

  const handleChangeName = (name: string) => {
    setCoupleName(name);
    localStorage.setItem("coupleName", name);
  };

  const updateRelationshipTime = useCallback(() => {
    const time = calculateRelationshipTime(startDate, startTime || undefined); // Usa a função importada
    setRelationshipTime(time);
  }, [startDate, startTime, setRelationshipTime]);

  useEffect(() => {
    updateRelationshipTime();
    const interval = setInterval(
      updateRelationshipTime,
      startTime ? 1000 : 60000
    );
    return () => clearInterval(interval);
  }, [updateRelationshipTime, startTime]);

  useEffect(() => {
    localStorage.setItem("coupleName", coupleName);
    localStorage.setItem("CoupleMessage", CoupleMessage);
    localStorage.setItem("youtubeLink", youtubeLink);
    localStorage.setItem("startDate", startDate);
    localStorage.setItem("startTime", startTime);
    localStorage.setItem("email", email);
  }, [coupleName, CoupleMessage, youtubeLink, startDate, startTime, email]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files).slice(
        0,
        selectedPlan?.photos || 5
      );
      setFiles(filesArray);

      try {
        const dataUrls = await convertFilesToDataUrls(filesArray); // Usa a função importada
        saveImagesToStorage(dataUrls); // Usa a função importada
        setSavedImages(dataUrls);
      } catch (error) {
        console.error("Erro ao salvar imagens:", error);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * FUNÇÃO PRINCIPAL: Chamada para Cartão de Crédito ou apenas para fechar o modal.
   * O argumento não utilizado foi renomeado para _total.
   */
  const handleConfirmPaymentAndCreation = (
    method: PaymentMethod,
    _total: number 
  ) => {
    setIsModalOpen(false); // Fecha o modal
    setPostCreationMessage({ text: "", type: "" }); // Limpa mensagens anteriores

    if (method === 'credit_card') {
        // Lógica para Cartão de Crédito aqui (chamaria a API de Cartão)
        setIsLoading(true);
        // Simular o processo de CC para seguir com a criação. 
        createOnDataBase(); 
    }
    
    // Se for PIX, o modal já gerou o QR Code, e o monitoramento em useEffect está ativo.
  };

  // Função para criptografar o valor do pagamento
  function encryptAmount(amount: number): string {
    const key = "adA6S5D1A65SDA6S5D1";
    const priceString = `${amount}|${key}`;
    const encoded = btoa(priceString); // Base64 encoding

    // Gerar string aleatória com 6 caracteres
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const randomString = Array.from(
      { length: 6 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");

    return `${encoded}${randomString}`;
  }

  // Função para criptografar strings (baseada na função Dart fornecida)
  function encryptString(value: string): string {
    const key = "adA6S5D1A65SDA6S5D1";
    const valueString = `${value}|${key}`;
    const encoded = btoa(valueString); // Base64 encoding

    // Gerar string aleatória com 6 caracteres
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const randomString = Array.from(
      { length: 6 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");

    return `${encoded}${randomString}`;
  }

  // Função para verificar status do pagamento
  async function checkPaymentStatus(paymentId: string) {
    try {
      const response = await fetch(
        `https://api.12testadores.com/api/mercadopago_v2/payment/${paymentId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const paymentData = await response.json();
      const status = (paymentData.status as string) || "";

      return {
        status,
        approved: status === "approved",
        pending: status === "pending",
        rejected: status === "rejected",
      };
    } catch (error) {
      console.error("Erro ao verificar status do pagamento:", error);
      return null;
    }
  }

  // Função para extrair dados do PIX da resposta do Mercado Pago
  function extractPixData(mercadopagoResponse: Record<string, unknown>) {
    try {
      const pointOfInteraction = mercadopagoResponse.point_of_interaction as
        | Record<string, unknown>
        | undefined;
      const transactionData = pointOfInteraction?.transaction_data as
        | Record<string, unknown>
        | undefined;

      const qrCode = (transactionData?.qr_code as string) || "";
      const qrCodeBase64 = (transactionData?.qr_code_base64 as string) || "";
      const amount = (mercadopagoResponse.transaction_amount as number) || 0;
      const status = (mercadopagoResponse.status as string) || "";

      // Usar o QR code completo como chave PIX para Copia e Cola (payload do PIX)
      const pixKey = qrCode;

      return {
        qrCode,
        qrCodeBase64,
        pixKey, 
        amount,
        status,
        paymentId: (mercadopagoResponse.id as string) || "",
      };
    } catch (error) {
      console.error("Erro ao extrair dados do PIX:", error);
      return null;
    }
  }

  async function createPayement(clientId: string) {
    try {
      const encryptedAmount = encryptAmount(selectedPlan?.priceDiscounted || 0);
      const encryptedUserId = encryptString(clientId);

      const pixPayload = {
        amount: encryptedAmount,
        description: `Site de fotos ${coupleName}`,
        email: email,
        userId: encryptedUserId,
      };
      
      const pixResponse = await fetch(
        "https://api.12testadores.com/api/mercadopago_v2/create_pix",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pixPayload),
        }
      );

      if (!pixResponse.ok) {
        throw new Error(`HTTP error! status: ${pixResponse.status}`);
      }

      const pixData = await pixResponse.json();
      console.log("PIX payment created:", pixData);

      // Extrair dados do PIX da resposta
      const extractedPixData = extractPixData(pixData);
      if (extractedPixData) {
        setPaymentData(extractedPixData);
      }

      return { success: true, clientId, paymentData: extractedPixData };
    } catch (error) {
      console.error("Erro ao criar pagamento PIX:", error);
      throw error;
    }
  }

  async function searchClientId(clientEmail: string) {
    try {
      // 1. BUSCAR CLIENTE
      let response = await fetch(
        "https://api.12testadores.com/api/mercadopago_v2/search_client_id",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: clientEmail }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let clientData = await response.json();
      console.log("Client search response:", clientData);

      // Extrair o ID do cliente da estrutura correta da resposta
      let userId = null;
      if (clientData.results && clientData.results.length > 0) {
        userId = clientData.results[0].id;
      }

      if (!userId) {
        // Se não encontrou, cria o cliente
        console.log("Cliente não encontrado, criando novo cliente...");
        response = await fetch(
          "https://api.12testadores.com/api/mercadopago_v2/create",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: clientEmail,
              first_name: coupleName.split(' ')[0] || "Nome",
              last_name: coupleName.split(' ').slice(1).join(' ') || "Sobrenome",
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        clientData = await response.json();
        console.log("Client creation response:", clientData);
        userId = clientData.id;
      }

      console.log("Final client ID:", userId);
      return userId;
    } catch (error) {
      console.error("Erro ao buscar/criar cliente:", error);
      throw error;
    }
  }

  /**
   * NOVA FUNÇÃO: Chamada pelo PaymentModal para iniciar a transação PIX.
   */
  const handleGeneratePix = async () => {
    if (!selectedPlan) {
        throw new Error("Plano não selecionado.");
    }
    
    // 1. Busca ou cria o cliente.
    const clientEmail = email;
    const clientId = await searchClientId(clientEmail);

    // 2. Cria o pagamento PIX e atualiza o estado `paymentData`
    const paymentResult = await createPayement(clientId);
    
    if (!paymentResult.paymentData) {
        throw new Error("Falha ao obter dados do PIX.");
    }
    
    setIsModalOpen(true); // Garante que a modal permaneça aberta para exibir o PIX

    // Retorna os dados que o modal precisa para exibir
    return {
        qrCodeImageUrl: `data:image/png;base64,${paymentResult.paymentData.qrCodeBase64}`,
        pixKey: paymentResult.paymentData.pixKey,
        amount: paymentResult.paymentData.amount, // Valor para exibição
    };
  };

  const createOnDataBase = useCallback(async () => {
    try {
      await createLovePage( // Usa a função importada
        coupleName,
        CoupleMessage,
        youtubeLink,
        startDate,
        startTime,
        email,
        selectedPlan?.title || "",
        files 
      );
      setPostCreationMessage({
        text: "🎉 Página criada com sucesso! Você receberá o link por e-mail.",
        type: "success",
      });
    } catch {
      setPostCreationMessage({
        text: "❌ Erro ao finalizar a criação. Tente novamente ou verifique o console.",
        type: "error",
      });
    } finally {
      setIsLoading(false); // Desativa o loading
    }
  }, [
    coupleName,
    CoupleMessage,
    youtubeLink,
    startDate,
    startTime,
    email,
    selectedPlan?.title,
    files, 
  ]);

  // Verificar status do pagamento periodicamente
  useEffect(() => {
    if (!paymentData?.paymentId || paymentData.status === "approved") {
      return;
    }

    const interval = setInterval(async () => {
      const statusResult = await checkPaymentStatus(paymentData.paymentId!);

      if (statusResult?.approved) {
        // Pagamento aprovado - criar página automaticamente
        setPaymentData((prev) =>
          prev ? { ...prev, status: "approved" } : null
        );
        setPostCreationMessage({
          text: "✅ Pagamento aprovado! Criando sua página...",
          type: "success",
        });

        // Criar página no banco de dados
        createOnDataBase();
        clearInterval(interval);
      } else if (statusResult?.rejected) {
        setPaymentData((prev) =>
          prev ? { ...prev, status: "rejected" } : null
        );
        setPostCreationMessage({
          text: "❌ Pagamento rejeitado. Tente novamente.",
          type: "error",
        });
        clearInterval(interval);
      }
    }, 15000); // caso quiser mudar tempo de request

    return () => clearInterval(interval);
  }, [paymentData?.paymentId, paymentData?.status, createOnDataBase]);

  if (!selectedPlan) return null;

  const inputClass =
    "w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition duration-200";

  return (
    <div className="bg-[#121212] min-h-screen p-8 text-white font-sans">
      <div className="flex justify-center space-x-4 mb-8">
        {plansData.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan as any} 
            isSelected={plan.id === selectedPlanId}
            onSelect={setSelectedPlanId} 
          />
        ))}
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {/* MENSAGEM DE FEEDBACK */}
        {postCreationMessage.text && (
          <div
            className={`p-3 rounded-lg font-medium text-center transition-all duration-300 ${
              postCreationMessage.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {postCreationMessage.text}
          </div>
        )}

        {/* DADOS DO PIX (Exibido se já tiver sido gerado no PaymentModal e o usuário voltar) */}
        {paymentData && !isModalOpen && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-center text-white mb-4">
              💳 Pagamento PIX
            </h3>

            <div className="text-center">
              <p className="text-gray-300 mb-2">
                Valor: R$ {paymentData.amount.toFixed(2)}
              </p>
              <p
                className={`mb-4 font-medium ${
                  paymentData.status === "approved"
                    ? "text-green-400"
                    : paymentData.status === "rejected"
                    ? "text-red-400"
                    : "text-yellow-400"
                }`}
              >
                Status:{" "}
                {paymentData.status === "approved"
                  ? "✅ Aprovado (Criando página...)"
                  : paymentData.status === "rejected"
                  ? "❌ Rejeitado"
                  : "⏳ Aguardando Pagamento"}
              </p>
            </div>
          </div>
        )}

        <input
          type="text"
          placeholder="Nome do casal"
          className={inputClass}
          value={coupleName}
          onChange={(e) => handleChangeName(e.target.value)}
        />

        <div className="flex space-x-4">
          <input
            type="date"
            className={inputClass}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="time"
            className={`${inputClass} w-1/2`}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <input
          type="email"
          placeholder="Seu e-mail"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <textarea
          placeholder="Declare seu amor com uma mensagem especial."
          rows={3}
          className={inputClass}
          value={CoupleMessage}
          onChange={(e) => setCoupleMessage(e.target.value)}
        />

        {selectedPlan.music && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Link do Youtube (opcional)"
              className={inputClass}
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
            />

            <div>
              <p className="mb-2 text-sm text-gray-400">Dicas de músicas</p>
              <div className="flex flex-wrap gap-2">
                {selectedPlan.musicTips?.map((tip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="px-3 py-1 bg-gray-700 text-sm rounded-full hover:bg-[#ff6969] transition duration-200"
                  >
                    {tip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button
          type="button"
          onClick={handleButtonClick}
          className="w-full py-4 mt-6 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg transition duration-200 flex items-center justify-center space-x-2"
        >
          {files.length > 0 || savedImages.length > 0
            ? `${files.length || savedImages.length} imagem${
                (files.length || savedImages.length) > 1 ? "s" : ""
              } selecionada${
                (files.length || savedImages.length) > 1 ? "s" : ""
              }`
            : `Selecione até ${selectedPlan.photos} imagens`}
        </button>

        {/* BOTÃO "Crie Sua Página Agora!" (ABRE O MODAL) */}
        <button
          type="button"
          className="w-full py-4 bg-[#ff6969] hover:bg-[#ff5c5c] text-white font-bold rounded-lg transition duration-200 text-xl disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          onClick={() => setIsModalOpen(true)} // <-- Abre o modal
          disabled={isLoading} 
        >
          {isLoading && (
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          <span>{isLoading ? "Processando..." : "Crie Sua Página Agora!"}</span>
        </button>
      </div>

      {/* RENDERIZAÇÃO CONDICIONAL DO MODAL DE PAGAMENTO */}
      {isModalOpen && selectedPlan && (
        <PaymentModal
          initialPlanValue={selectedPlan.priceDiscounted}
          onCancel={() => setIsModalOpen(false)}
          onConfirm={handleConfirmPaymentAndCreation} 
          onGeneratePix={handleGeneratePix} 
        />
      )}
    </div>
  );
};

export default LovePageForm;