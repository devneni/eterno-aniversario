import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import PlanCard from "./PlanCard";
import { plansData, type Plan } from "./plansData";
import { createLovePage } from "../firebase/firebaseService";
import { calculateRelationshipTime } from "./calculateRelationshipTime";
import PaymentModal from "../payments/PaymentModal";
import SuccessPage from "./SucessPage";
import { convertFilesToDataUrls, saveImagesToStorage } from "./imageStorage";
import { useLanguage } from './useLanguage'; 
import { translations } from './translations'; 
import { compressFilesUsingCanvas } from "./imageCompression";

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
  "Luisa Sonza, Vitão - Flores": "https://www.youtube.com/watch?v=1EnrK8TzVDQ&list=RD1EnrK8TzVDQ&start_radio=1",
  "Christina Perri - A Thousand Years": "https://www.youtube.com/watch?v=rtOvBOTyX00",
  "Tiago Iorc - Amei Te Ver": "https://www.youtube.com/watch?v=W62-ZG9tPpI&list=RDW62-ZG9tPpI&start_radio=1",
  "John Legend - All of Me": "https://www.youtube.com/watch?v=450p7goxZqg",
  "Jorge & Mateus - Pra Sempre Com Voce": "https://www.youtube.com/watch?v=VWRkQARH-9o&list=RDVWRkQARH-9o&start_radio=1",
  "Marisa Monte - Amor I Love You": "https://www.youtube.com/watch?v=2CPHbEIC6EM&list=RD2CPHbEIC6EM&start_radio=1"
};

// Função auxiliar para converter cores de fundo
const getBackgroundStyle = (backgroundColor: string): string => {
  const gradients = {
    'purple-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)',
    'blue-gradient': 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
    'red-gradient': 'linear-gradient(135deg, #ef4444 0%, #f87171 50%, #fca5a5 100%)',
    'pink-gradient': 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #f9a8d4 100%)',
    'yellow-gradient': 'linear-gradient(135deg, #eab308 0%, #facc15 50%, #fde047 100%)',
    'orange-gradient': 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fdba74 100%)',
    'green-gradient': 'linear-gradient(135deg, #22c55e 0%, #4ade80 50%, #86efac 100%)',
    'black-gradient': 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)',
    'white-gradient': 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 50%, #d1d5db 100%)',
    'gray-gradient': 'linear-gradient(135deg, #6b7280 0%, #9ca3af 50%, #d1d5db 100%)',
  };

  // Se for um gradiente pré-definido, retorna o estilo
  if (gradients[backgroundColor as keyof typeof gradients]) {
    return gradients[backgroundColor as keyof typeof gradients];
  }

  // Se for uma cor hexadecimal, cria um gradiente suave
  if (backgroundColor.startsWith('#')) {
    // Função para clarear a cor
    const lightenColor = (color: string, percent: number) => {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      return `#${(
        0x1000000 +
        (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)
      ).toString(16).slice(1)}`;
    };

    const baseColor = backgroundColor;
    const lighterColor = lightenColor(baseColor, 20);
    const evenLighterColor = lightenColor(baseColor, 40);

    return `linear-gradient(135deg, ${baseColor} 0%, ${lighterColor} 50%, ${evenLighterColor} 100%)`;
  }

  // Fallback para rosa
  return 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #f9a8d4 100%)';
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
  const { language } = useLanguage();
  const t = translations[language];

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

  // Memo para dados do modal de pagamento (evita re-renders e mantém ordem dos hooks)
  const paymentUserData = useMemo(() => (
    selectedPlan ? {
      email: email,
      coupleName: coupleName,
      planTitle: selectedPlan.title,
      photosCount: selectedPlan.photos
    } : null
  ), [email, coupleName, selectedPlan]);

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
  const time = calculateRelationshipTime(startDate, startTime || undefined, language);
  setRelationshipTime(time);
}, [startDate, startTime, setRelationshipTime, language]);

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
      console.log("📸 Detalhes dos arquivos:", filesArray.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        lastModified: f.lastModified
      })));

      setFiles(filesArray);

      try {
        const dataUrls = await convertFilesToDataUrls(filesArray);
        saveImagesToStorage(dataUrls);
        console.log("✅ Imagens salvas em cache:", dataUrls.length);
      } catch (error) {
        console.error("❌ Erro ao salvar imagens em cache:", error);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleEditInfo = () => {
    setShowSuccessPage(false);
    alert(language === 'pt' ? "Funcionalidade de edição em desenvolvimento!" : "Edit functionality in development!");
  };

  const handleConfirmPaymentAndCreation = (
    method: PaymentMethod,
    total: number
  ) => {
    console.log("💰 handleConfirmPaymentAndCreation chamado:", { method, total });

    setIsModalOpen(false);
    setPostCreationMessage({ text: "", type: "" });

    if (method === "pix") {
      console.log("✅ Modo PIX detectado - iniciando criação da página...");
      setIsLoading(true);
      setPostCreationMessage({
        text: language === 'pt' ? "Pagamento confirmado! Criando sua página..." : "Payment confirmed! Creating your page...",
        type: "success",
      });

      setTimeout(() => {
        console.log("🚀 Chamando createOnDataBase...");
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
    console.log("📸 Detalhes dos arquivos:", files.map((f) => ({ 
      name: f.name, 
      size: f.size, 
      type: f.type 
    })));

    let filesToUpload: File[] = files;
    try {
      filesToUpload = await compressFilesUsingCanvas(files, { maxWidthOrHeight: 1920, quality: 0.8 });
      console.log("🗜️ Imagens comprimidas:", filesToUpload.length);
    } catch (e) {
      console.warn("⚠️ Falha ao comprimir imagens, usando originais.");
      filesToUpload = files;
    }

    filesToUpload.forEach((file, index) => {
      console.log(`📄 Arquivo ${index + 1}:`, {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        isValid: file.size > 0 && file.type.startsWith('image/')
      });
    });

    try {
      console.log("🔄 Chamando createLovePage...");
      console.log("📋 Dados sendo enviados:", {
        coupleName,
        CoupleMessage,
        youtubeLink,
        startDate,
        startTime,
        email,
        planTitle: selectedPlan?.title || "",
        filesCount: filesToUpload.length,
        textColor,
        backgroundColor
      });
      
      const { pageId, customSlug } = await createLovePage(
        coupleName,
        CoupleMessage,
        youtubeLink,
        startDate,
        startTime,
        email,
        selectedPlan?.title || "",
        filesToUpload, 
        textColor,
        backgroundColor
      );

      console.log("✅ createLovePage executado com sucesso!");
      console.log("📄 Page ID:", pageId);
      console.log("🔗 Custom Slug:", customSlug);

      const detailsUrl = `${window.location.origin}/detalhes_do_relacionamento/${pageId}`;
      console.log("🌐 URL de detalhes:", detailsUrl);
      setCreatedPageUrl(detailsUrl);
      window.location.href = detailsUrl;

      setShowSuccessPage(false);

      setPostCreationMessage({
        text: language === 'pt' ? "✅ Página criada com sucesso!" : "✅ Page created successfully!",
        type: "success",
      });
      

      localStorage.removeItem("coupleName");
      localStorage.removeItem("CoupleMessage");
      localStorage.removeItem("youtubeLink");
      localStorage.removeItem("startDate");
      localStorage.removeItem("startTime");
      localStorage.removeItem("email");
    } catch (error: any) {
      console.error("❌ ERRO em createOnDataBase:", error);
      console.error("❌ Stack trace:", error.stack);
      
      setPostCreationMessage({
        text: `❌ ${language === 'pt' ? 'Erro:' : 'Error:'} ${error.message || (language === 'pt' ? "Erro ao criar página" : "Error creating page")}`,
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
    textColor,
    backgroundColor,
    language
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
          placeholder={t.couple_names}
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
            placeholder={t.hoursandminutes}
          />
        </div>

        <input
          type="email"
          placeholder={t.email}
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

       
        <div className="space-y-4 bg-gray-800 border-gray-700 border rounded-lg hover:border-[#ff6969] p-4">
          <h3 className="text-lg font-semibold text-white text-center">
            {language === 'pt' ? 'Personalize as Cores' : 'Customize Colors'}
          </h3>

          {/* Cor do Texto - Opções Pré-definidas */}
          <div className="space-y-3">
            <label className="text-sm text-gray-300">
              {language === 'pt' ? 'Cor do Texto' : 'Text Color'}
            </label>
            <div className="flex flex-wrap gap-3">
              {/* Opção Branco */}
              <button
                type="button"
                onClick={() => setTextColor('#ffffff')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                  textColor === '#ffffff' 
                    ? 'border-white bg-white/20' 
                    : 'border-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-white border border-gray-300"></div>
                <span className="text-white text-sm">
                  {language === 'pt' ? 'Branco' : 'White'}
                </span>
              </button>

              {/* Opção Preto */}
              <button
                type="button"
                onClick={() => setTextColor('#000000')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                  textColor === '#000000' 
                    ? 'border-white bg-white/20' 
                    : 'border-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-black border border-gray-300"></div>
                <span className="text-white text-sm">
                  {language === 'pt' ? 'Preto' : 'Black'}
                </span>
              </button>

              
            </div>
          </div>

          {/* Cor de Fundo - Gradientes Pré-definidos */}
          <div className="space-y-3">
           
            
         
<div className="space-y-3">
  <label className="text-sm text-gray-300">
    {language === 'pt' ? 'Cor de Fundo' : 'Background Color'}
  </label>
  
  <div className="flex items-center gap-3 mb-3">
    <button
      type="button"
      onClick={() => setBackgroundColor('pink-gradient')}
      className={`w-12 h-12 rounded-lg border-2 transition-all relative overflow-hidden ${
        backgroundColor === 'pink-gradient' 
          ? 'border-white ring-2 ring-white' 
          : 'border-gray-600 hover:border-gray-400'
      }`}
    
    >
      <div className="absolute inset-0 bg-gradient-to-br from-pink-600 to-pink-400"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-xs font-bold"></span>
      </div>
    </button>
    
    
    <button
      type="button"
      onClick={() => {
        const element = document.getElementById('color-palette');
        if (element) {
          element.classList.toggle('hidden');
        }
      }}
      className="text-white text-sm font bold bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg transition duration-200"
    >
      {language === 'pt' ? '→ Mais cores' : '→ More colors'}
    </button>
  </div>

  {/* Paleta de cores expansível */}
  <div id="color-palette" className="grid grid-cols-6 gap-2 hidden">
    {/* Roxo */}
    <button
      type="button"
      onClick={() => setBackgroundColor('purple-gradient')}
      className={`w-10 h-10 rounded-lg border-2 transition-all relative overflow-hidden ${
        backgroundColor === 'purple-gradient' 
          ? 'border-white ring-2 ring-white' 
          : 'border-gray-600 hover:border-gray-400'
      }`}
      title="Roxo"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-400"></div>
    </button>

    {/* Azul */}
    <button
      type="button"
      onClick={() => setBackgroundColor('blue-gradient')}
      className={`w-10 h-10 rounded-lg border-2 transition-all relative overflow-hidden ${
        backgroundColor === 'blue-gradient' 
          ? 'border-white ring-2 ring-white' 
          : 'border-gray-600 hover:border-gray-400'
      }`}
      title="Azul"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-400"></div>
    </button>

    {/* Vermelho */}
    <button
      type="button"
      onClick={() => setBackgroundColor('red-gradient')}
      className={`w-10 h-10 rounded-lg border-2 transition-all relative overflow-hidden ${
        backgroundColor === 'red-gradient' 
          ? 'border-white ring-2 ring-white' 
          : 'border-gray-600 hover:border-gray-400'
      }`}
      title="Vermelho"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-400"></div>
    </button>

    {/* Rosa */}
    <button
      type="button"
      onClick={() => setBackgroundColor('pink-gradient')}
      className={`w-10 h-10 rounded-lg border-2 transition-all relative overflow-hidden ${
        backgroundColor === 'pink-gradient' 
          ? 'border-white ring-2 ring-white' 
          : 'border-gray-600 hover:border-gray-400'
      }`}
      title="Rosa"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-pink-600 to-pink-400"></div>
    </button>

    {/* Amarelo */}
    <button
      type="button"
      onClick={() => setBackgroundColor('yellow-gradient')}
      className={`w-10 h-10 rounded-lg border-2 transition-all relative overflow-hidden ${
        backgroundColor === 'yellow-gradient' 
          ? 'border-white ring-2 ring-white' 
          : 'border-gray-600 hover:border-gray-400'
      }`}
      title="Amarelo"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 to-yellow-400"></div>
    </button>

    {/* Laranja */}
    <button
      type="button"
      onClick={() => setBackgroundColor('orange-gradient')}
      className={`w-10 h-10 rounded-lg border-2 transition-all relative overflow-hidden ${
        backgroundColor === 'orange-gradient' 
          ? 'border-white ring-2 ring-white' 
          : 'border-gray-600 hover:border-gray-400'
      }`}
      title="Laranja"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-orange-400"></div>
    </button>

    {/* Verde */}
    <button
      type="button"
      onClick={() => setBackgroundColor('green-gradient')}
      className={`w-10 h-10 rounded-lg border-2 transition-all relative overflow-hidden ${
        backgroundColor === 'green-gradient' 
          ? 'border-white ring-2 ring-white' 
          : 'border-gray-600 hover:border-gray-400'
      }`}
      title="Verde"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-400"></div>
    </button>

    {/* Preto */}
    <button
      type="button"
      onClick={() => setBackgroundColor('black-gradient')}
      className={`w-10 h-10 rounded-lg border-2 transition-all relative overflow-hidden ${
        backgroundColor === 'black-gradient' 
          ? 'border-white ring-2 ring-white' 
          : 'border-gray-600 hover:border-gray-400'
      }`}
      title="Preto"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700"></div>
    </button>

    {/* Branco */}
    <button
      type="button"
      onClick={() => setBackgroundColor('white-gradient')}
      className={`w-10 h-10 rounded-lg border-2 transition-all relative overflow-hidden ${
        backgroundColor === 'white-gradient' 
          ? 'border-white ring-2 ring-white' 
          : 'border-gray-600 hover:border-gray-400'
      }`}
      title="Branco"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300"></div>
    </button>

    {/* Cinza */}
    <button
      type="button"
      onClick={() => setBackgroundColor('gray-gradient')}
      className={`w-10 h-10 rounded-lg border-2 transition-all relative overflow-hidden ${
        backgroundColor === 'gray-gradient' 
          ? 'border-white ring-2 ring-white' 
          : 'border-gray-600 hover:border-gray-400'
      }`}
      title="Cinza"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-500 to-gray-300"></div>
    </button>
  </div>
</div>

            
          </div>

          
        </div>

        <textarea
          placeholder={t.message}
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
                placeholder={t.youtube}
                className={inputClass}
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
              />
              {youtubeLink && (
                <button
                  type="button"
                  onClick={clearMusicSelection}
                  className="ml-2 text-sm text-gray-400 hover:text-white transition duration-200"
                  title={language === 'pt' ? 'Limpar seleção' : 'Clear selection'}
                >
                  ×
                </button>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">{t.music_tips}</p>
                {selectedMusicTip && (
                  <button
                    type="button"
                    onClick={clearMusicSelection}
                    className="text-xs text-gray-400 hover:text-white transition duration-200"
                  >
                    {language === 'pt' ? 'Limpar seleção' : 'Clear selection'}
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
          ? language === 'pt' ? "1 imagem selecionada" : "1 image selected"
          : language === 'pt' ? `${files.length} imagens selecionadas` : `${files.length} images selected`;
      })()
    : `${t.select_image} ${selectedPlan.photos} ${language === 'pt' ? 'imagens' : 'images'}`}
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
          <span>{isLoading ? t.Loading : t.create_page}</span>
        </button>
      </div>

      {isModalOpen && selectedPlan && paymentUserData && (
        <PaymentModal
          initialPlanValue={selectedPlan.priceDiscounted}
          onCancel={() => setIsModalOpen(false)}
          onConfirm={handleConfirmPaymentAndCreation}
          userData={paymentUserData}
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