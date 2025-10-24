import React, { useState, useRef, useEffect, useCallback } from "react";
import PlanCard from "./PlanCard";
import { plansData, type Plan } from "./plansData";
import { createLovePage } from "../firebase/firebaseService";
import { calculateRelationshipTime } from "./calculateRelationshipTime";
import PaymentModal from "../payments/PaymentModal";
import SuccessPage from "./SucessPage";
import { convertFilesToDataUrls, saveImagesToStorage } from "./imageStorage";

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
  textColor: string;
  setTextColor: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
}


const MUSIC_LINKS: Record<string, string> = {
  "Ed Sheeran - Perfect": "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
  "James Arthur - Say You Won't Let Go": "https://www.youtube.com/watch?v=0yW7w8F2TVA",
  "Luisa Sonza, Vitão - Flores": "hhttps://www.youtube.com/watch?v=1EnrK8TzVDQ&list=RD1EnrK8TzVDQ&start_radio=1",
  "Christina Perri - A Thousand Years": "https://www.youtube.com/watch?v=rtOvBOTyX00",
  "Tiago Iorc - Amei Te Ver": "https://www.youtube.com/watch?v=W62-ZG9tPpI&list=RDW62-ZG9tPpI&start_radio=1",
  "John Legend - All of Me": "https://www.youtube.com/watch?v=450p7goxZqg",
  "Jorge & Mateus - Pra Sempre Com Voce": "https://www.youtube.com/watch?v=VWRkQARH-9o&list=RDVWRkQARH-9o&start_radio=1",
  "Marisa Monte - Amor I Love You": "https://www.youtube.com/watch?v=2CPHbEIC6EM&list=RD2CPHbEIC6EM&start_radio=1"
};

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
  textColor,
  setTextColor,
  backgroundColor,
  setBackgroundColor,
}) => {
  const initialPlanId: Plan["id"] =
    plansData.find((p) => p.preferred)?.id || plansData[0].id;

  const [selectedPlanId, setSelectedPlanId] =
    useState<Plan["id"]>(initialPlanId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedPlan = plansData.find((plan) => plan.id === selectedPlanId);

  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [createdPageUrl, setCreatedPageUrl] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedMusicTip, setSelectedMusicTip] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [postCreationMessage, setPostCreationMessage] = useState<{
    text: string;
    type: string;
  }>({ text: "", type: "" });

  useEffect(() => {
    const savedName = localStorage.getItem("coupleName");
    const savedMessage = localStorage.getItem("CoupleMessage");
    const savedLink = localStorage.getItem("youtubeLink");
    const savedDate = localStorage.getItem("startDate");
    const savedTime = localStorage.getItem("startTime");
    const savedEmail = localStorage.getItem("email");
    const savedTextColor = localStorage.getItem("textColor");
    const savedBackgroundColor = localStorage.getItem("backgroundColor");

    if (savedName) setCoupleName(savedName);
    if (savedMessage) setCoupleMessage(savedMessage);
    if (savedLink) setYoutubeLink(savedLink);
    if (savedDate) setStartDate(savedDate);
    if (savedTime) setStartTime(savedTime);
    if (savedEmail) setEmail(savedEmail);
    if (savedTextColor) setTextColor(savedTextColor);
    if (savedBackgroundColor) setBackgroundColor(savedBackgroundColor);
  }, [
    setCoupleName,
    setCoupleMessage,
    setYoutubeLink,
    setStartDate,
    setStartTime,
    setEmail,
    setTextColor, 
    setBackgroundColor, 
  ]);

  // Função para lidar com o clique nas dicas de música
  const handleMusicTipClick = (musicName: string) => {
    const link = MUSIC_LINKS[musicName];
    if (link) {
      setYoutubeLink(link);
      setSelectedMusicTip(musicName);
    }
  };

  // Função para limpar a seleção de música
  const clearMusicSelection = () => {
    setYoutubeLink('');
    setSelectedMusicTip(null);
  };

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
    localStorage.setItem("textColor", textColor);
    localStorage.setItem("backgroundColor", backgroundColor);
  }, [coupleName, CoupleMessage, youtubeLink, startDate, startTime, email,textColor, backgroundColor]);

  useEffect(() => {
  if (files.length > 0) {
    const urls = files.map(file => URL.createObjectURL(file));
    setImageUrls(urls);
    
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  } else {
    setImageUrls([]);
  }
}, [files]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files).slice(
        0,
        selectedPlan?.photos || 5
      );
      console.log("📸 Arquivos selecionados:", filesArray.length);
      setFiles(filesArray);

      // Salvar imagens em cache imediatamente
      try {
        const dataUrls = await convertFilesToDataUrls(filesArray);
        saveImagesToStorage(dataUrls);
        console.log(" Imagens salvas em cache");
      } catch (error) {
        console.error(" Erro ao salvar imagens em cache:", error);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleEditInfo = () => {
    setShowSuccessPage(false);
    alert("Funcionalidade de edição em desenvolvimento!");
  };

  const handleConfirmPaymentAndCreation = (
    method: PaymentMethod,
    total: number
  ) => {
    console.log(" handleConfirmPaymentAndCreation chamado:", { method, total });

    setIsModalOpen(false);
    setPostCreationMessage({ text: "", type: "" });

    if (method === "pix") {
      console.log("✅Modo PIX detectado - iniciando criação da página...");
      setIsLoading(true);
      setPostCreationMessage({
        text: "Pagamento confirmado! Criando sua página...",
        type: "success",
      });

      setTimeout(() => {
        console.log(" Chamando createOnDataBase...");
        createOnDataBase();
      }, 500);

      return;
    }

    if (method === "credit_card") {
      console.log("💳 Modo Cartão de Crédito detectado");
      setIsLoading(true);
      createOnDataBase();
    }
  };

  const createOnDataBase = useCallback(async () => {
    console.log("📦 createOnDataBase INICIADO");
    console.log("📸 Arquivos para upload:", files.length);
    console.log(
      "📸 Detalhes dos arquivos:",
      files.map((f) => ({ name: f.name, size: f.size, type: f.type }))
    );

    try {
      const { pageId, customSlug } = await createLovePage(
        coupleName,
        CoupleMessage,
        youtubeLink,
        startDate,
        startTime,
        email,
        selectedPlan?.title || "",
        files,
        textColor,
        backgroundColor
      );

      console.log(" createLovePage executado com sucesso!");
      console.log(" Page ID:", pageId);
      console.log(" Custom Slug:", customSlug);

      const customPageUrl = `${window.location.origin}/shared/${customSlug}`;

      console.log(" URL Personalizada:", customPageUrl);

      setCreatedPageUrl(customPageUrl);

     
      const successPageUrl = `${
        window.location.origin
      }/success?pageUrl=${encodeURIComponent(
        customPageUrl
      )}&coupleName=${encodeURIComponent(coupleName)}`;
      window.open(successPageUrl, "_blank");

      setShowSuccessPage(false);

      setPostCreationMessage({
        text: " Página criada com sucesso!",
        type: "success",
      });
      

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
    files,
  ]);

  if (!selectedPlan) return null;

  const inputClass =
    "w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition duration-200";

  return (
    <div className=" min-h-screen p-8 text-white font-sans">
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

       
        <div className="space-y-4 bg-gray-800 border-gray-700 border rounded-lg hover:border-[#ff6969] ">
          <h3 className="text-lg font-semibold text-white text-center pt-4">
            Personalize as Cores
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 m-2">
            <div className="space-y-2 mb-4">
              <label className="text-sm text-gray-300 " >Cor do Texto</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-12 h-12 rounded-lg  border-gray-600 cursor-pointer hover:border-[#ff6969] border-4"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 px-1 py-2 bg-gray-800 border-4 border-gray-600 hover:border-[#ff6969] rounded-lg text-white"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <label className="text-sm text-gray-300">Cor de Fundo</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border-4 border-gray-600 hover:border-[#ff6969] cursor-pointer"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 px-1 py-2 bg-gray-800 border-4 border-gray-600 rounded-lg hover:border-[#ff6969] text-white"
                  placeholder="#ec4899"
                />
              </div>
            </div>
          </div>
        </div>

        <textarea
          placeholder="Declare seu amor com uma mensagem especial."
          rows={3}
          className={inputClass} 
          value={CoupleMessage}
          onChange={(e) => setCoupleMessage(e.target.value)}
        />

        {selectedPlan.music && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <input
                type="text"
                placeholder="Link do Youtube (opcional)"
                className={inputClass}
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
              />
              {youtubeLink && (
                <button
                  type="button"
                  onClick={clearMusicSelection}
                  className="ml-2 text-sm text-gray-400 hover:text-white transition duration-200"
                  title="Limpar seleção"
                >
                  ×
                </button>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Dicas de músicas</p>
                {selectedMusicTip && (
                  <button
                    type="button"
                    onClick={clearMusicSelection}
                    className="text-xs text-gray-400 hover:text-white transition duration-200"
                  >
                    Limpar seleção
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedPlan.musicTips?.map((tip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`px-3 py-1 text-sm rounded-full transition duration-200 ${
                      selectedMusicTip === tip 
                        ? 'bg-[#ff6969] text-white' 
                        : 'bg-gray-700 hover:bg-[#ff6969]'
                    }`}
                    onClick={() => handleMusicTipClick(tip)}
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
                return files.length === 1
                  ? "1 imagem selecionada"
                  : `${files.length} imagens selecionadas`;
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
    userData={{
      email: email,
      coupleName: coupleName,
      planTitle: selectedPlan.title,
      photosCount: selectedPlan.photos
    }}
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