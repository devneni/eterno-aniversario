import React, { useState, useRef, useEffect, useCallback } from "react";
import PlanCard from "./PlanCard";
import { plansData, type Plan } from "./plansData";
import { createLovePage } from "../firebase/firebaseService";
import { calculateRelationshipTime } from "./calculateRelationshipTime";
import PaymentModal from "../payments/PaymentModal";
import SuccessPage from "./SucessPage";

type PaymentMethod = "pix" | "credit_card";

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
  const initialPlanId: Plan["id"] =
    plansData.find((p) => p.preferred)?.id || plansData[0].id;
  
  const [selectedPlanId, setSelectedPlanId] = useState<Plan["id"]>(initialPlanId); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedPlan = plansData.find((plan) => plan.id === selectedPlanId);
  
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [createdPageUrl, setCreatedPageUrl] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [postCreationMessage, setPostCreationMessage] = useState<{
    text: string;
    type: string;
  }>({ text: "", type: "" });

  // Carregar dados do localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("coupleName");
    const savedMessage = localStorage.getItem("CoupleMessage");
    const savedLink = localStorage.getItem("youtubeLink");
    const savedDate = localStorage.getItem("startDate");
    const savedTime = localStorage.getItem("startTime");
    const savedEmail = localStorage.getItem("email");

    if (savedName) setCoupleName(savedName);
    if (savedMessage) setCoupleMessage(savedMessage);
    if (savedLink) setYoutubeLink(savedLink);
    if (savedDate) setStartDate(savedDate);
    if (savedTime) setStartTime(savedTime);
    if (savedEmail) setEmail(savedEmail);
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
    const time = calculateRelationshipTime(startDate, startTime || undefined);
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
      console.log('📸 Arquivos selecionados:', filesArray.length);
      setFiles(filesArray);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleEditInfo = () => {
    setShowSuccessPage(false);
    alert('Funcionalidade de edição em desenvolvimento!');
  };

  const handleConfirmPaymentAndCreation = (
    method: PaymentMethod,
    total: number 
  ) => {
    console.log("🎯 handleConfirmPaymentAndCreation chamado:", { method, total });
    
    setIsModalOpen(false);
    setPostCreationMessage({ text: "", type: "" });

    if (method === 'pix') {
      console.log("✅ Modo PIX detectado - iniciando criação da página...");
      setIsLoading(true);
      setPostCreationMessage({
        text: "✅ Pagamento confirmado! Criando sua página...",
        type: "success"
      });
      
      setTimeout(() => {
        console.log("🚀 Chamando createOnDataBase...");
        createOnDataBase(); 
      }, 500);
      
      return;
    }
    
    if (method === 'credit_card') {
      console.log("💳 Modo Cartão de Crédito detectado");
      setIsLoading(true);
      createOnDataBase(); 
    }
  };

  const createOnDataBase = useCallback(async () => {
    console.log("📦 createOnDataBase INICIADO");
    console.log("📸 Arquivos para upload:", files.length);
    
    try {
      const { pageId, customSlug } = await createLovePage(
        coupleName,
        CoupleMessage,
        youtubeLink,
        startDate,
        startTime,
        email,
        selectedPlan?.title || "",
        files // ✅ CORRIGIDO: Passando os arquivos corretamente
      );
      
      console.log(" createLovePage executado com sucesso!");
      console.log(" Page ID:", pageId);
      console.log(" Custom Slug:", customSlug);
      
      // URL PERSONALIZADA
      const customPageUrl = `${window.location.origin}/shared/${customSlug}`;
      
      console.log('🎯 URL Personalizada:', customPageUrl);
      
      setCreatedPageUrl(customPageUrl);
      setShowSuccessPage(true);
      
      setPostCreationMessage({
        text: "🎉 Página criada com sucesso!",
        type: "success",
      });
      
      // Limpar formulário após sucesso
      localStorage.removeItem("coupleName");
      localStorage.removeItem("CoupleMessage");
      localStorage.removeItem("youtubeLink");
      localStorage.removeItem("startDate");
      localStorage.removeItem("startTime");
      localStorage.removeItem("email");
      
    } catch (error: any) {
      console.error(" ERRO em createOnDataBase:", error);
      setPostCreationMessage({
        text: ` Erro: ${error.message || "Erro ao criar página"}`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    coupleName,
    CoupleMessage,
    youtubeLink,
    startDate,
    startTime,
    email,
    selectedPlan?.title,
    files, // ✅ CORRIGIDO: Dependência dos arquivos
  ]);

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
          {files.length > 0
            ? (() => {
                return files.length === 1 ? '1 imagem selecionada' : `${files.length} imagens selecionadas`;
              })()
            : `Selecione até ${selectedPlan.photos} imagens`}
        </button>

        <button
          type="button"
          className="w-full py-4 bg-[#ff6969] hover:bg-[#ff5c5c] text-white font-bold rounded-lg transition duration-200 text-xl disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          onClick={() => setIsModalOpen(true)}
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

      {isModalOpen && selectedPlan && (
        <PaymentModal
          initialPlanValue={selectedPlan.priceDiscounted}
          onCancel={() => setIsModalOpen(false)}
          onConfirm={handleConfirmPaymentAndCreation} 
          onGeneratePix={() => {}} 
        />
      )}

      {showSuccessPage && (
        <SuccessPage
          pageUrl={createdPageUrl}
          coupleName={coupleName}
          onClose={() => setShowSuccessPage(false)}
          onEdit={handleEditInfo}
        />
      )}
    </div>
  );
};

export default LovePageForm;