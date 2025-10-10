import React, { useState, useRef, useEffect } from "react";
import PlanCard from "./PlanCard";
import { plansData, type Plan } from "./plansData";
import { 
  convertFilesToDataUrls, 
  saveImagesToStorage, 
  getImagesFromStorage 
} from "./imageStorage";

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


const calculateRelationshipTime = (startDate: string, startTime: string): string => {
  
  if (!startDate) {
    return "";
  }

  const startDateTime = new Date(startDate);
  const today = new Date();

  
  if (startTime) {
    const [hours, minutes] = startTime.split(':').map(Number);
    startDateTime.setHours(hours, minutes, 0, 0);
  } else {
    startDateTime.setHours(0, 0, 0, 0);
  }

  if (isNaN(startDateTime.getTime())) {
    return "";
  }

  let years = today.getFullYear() - startDateTime.getFullYear();
  let months = today.getMonth() - startDateTime.getMonth();
  let days = today.getDate() - startDateTime.getDate();


  if (days < 0) {
    months--;
  
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += lastDayOfMonth;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  if (startTime) {
    let hours = today.getHours() - startDateTime.getHours();
    let minutes = today.getMinutes() - startDateTime.getMinutes();
    let seconds = today.getSeconds() - startDateTime.getSeconds();

    
    if (seconds < 0) {
      minutes--;
      seconds += 60;
    }

    if (minutes < 0) {
      hours--;
      minutes += 60;
    }


    if (hours < 0) {
      days--;
      hours += 24;
      
  
      if (days < 0) {
        months--;
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        days += lastDayOfMonth;
        
        if (months < 0) {
          years--;
          months += 12;
        }
      }
    }

   
    const parts = [];
    
    if (years > 0) parts.push(`${years} ano${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} mês${months > 1 ? 'es' : ''}`);
    if (days > 0) parts.push(`${days} dia${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds} segundo${seconds > 1 ? 's' : ''}`);

    return parts.length > 0 ? parts.join(", ") : "0 segundos";
  } else {
   
    const parts = [];
    
    if (years > 0) parts.push(`${years} ano${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} mês${months > 1 ? 'es' : ''}`);
    if (days > 0 || parts.length === 0) parts.push(`${days} dia${days > 1 ? 's' : ''}`);

    return parts.join(", ");
  }
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
  setEmail
}) => {
  const initialPlanId: Plan["id"] =
    plansData.find((p) => p.preferred)?.id || plansData[0].id;
  const [selectedPlanId, setSelectedPlanId] = useState<Plan["id"]>(initialPlanId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedPlan = plansData.find((plan) => plan.id === selectedPlanId);
  const [savedImages, setSavedImages] = useState<string[]>([]);

  
  useEffect(() => {
    const savedName = localStorage.getItem("coupleName");
    const savedMessage = localStorage.getItem("CoupleMessage");
    const savedLink = localStorage.getItem("youtubeLink");
    const savedDate = localStorage.getItem("startDate");
    const savedTime = localStorage.getItem("startTime"); 
    const savedEmail = localStorage.getItem("email");
    
    const storedImages = getImagesFromStorage();
    setSavedImages(storedImages);

    if (savedName) setCoupleName(savedName);
    if (savedMessage) setCoupleMessage(savedMessage);
    if (savedLink) setYoutubeLink(savedLink);
    if (savedDate) setStartDate(savedDate);
    if (savedTime) setStartTime(savedTime); 
    if (savedEmail) setEmail(savedEmail);
  }, [setCoupleName, setCoupleMessage, setYoutubeLink, setStartTime, setStartDate, setEmail]);

  function handleChangeName(name: string) {
    setCoupleName(name);
    localStorage.setItem("coupleName", name);
  }

  const updateRelationshipTime = () => {
    const time = calculateRelationshipTime(startDate, startTime);
    setRelationshipTime(time);
  };

  useEffect(() => {
    updateRelationshipTime();
    

    const intervalTime = startTime ? 1000 : 60000; 
    const interval = setInterval(updateRelationshipTime, intervalTime);
    
    return () => clearInterval(interval);
  }, [startDate, startTime]);

  useEffect(() => {
    localStorage.setItem("coupleName", coupleName);
    localStorage.setItem("CoupleMessage", CoupleMessage);
    localStorage.setItem("youtubeLink", youtubeLink);
    localStorage.setItem("startDate", startDate);
    localStorage.setItem("startTime", startTime);
    localStorage.setItem("email", email);
  }, [coupleName, CoupleMessage, youtubeLink, startDate, startTime, email]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && setFiles) {
      const filesArray = Array.from(event.target.files).slice(0, selectedPlan?.photos || 5);
      
      
      setFiles(filesArray);
      

      try {
        const dataUrls = await convertFilesToDataUrls(filesArray);
        saveImagesToStorage(dataUrls);
        setSavedImages(dataUrls);
      } catch (error) {
        console.error("Erro ao salvar imagens:", error);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  if (!selectedPlan) return null;

  const inputClass =
    "w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition duration-200";

  return (
    <div className="bg-[#121212] min-h-screen p-8 text-white font-sans">
      <div className="flex justify-center space-x-4 mb-8">
        {plansData.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isSelected={plan.id === selectedPlanId}
            onSelect={setSelectedPlanId}
          />
        ))}
      </div>

      <div className="max-w-xl mx-auto space-y-6">
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
            placeholder="Início do relacionamento"
            className={inputClass}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="time"
            placeholder="Hora e minuto (opcional)"
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
        ></textarea>

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
                {selectedPlan.musicTips?.map((tip, index) => (
                  <button
                    key={index}
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
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>
            {files.length > 0 || savedImages.length > 0
              ? `${files.length || savedImages.length} imagem${(files.length || savedImages.length) > 1 ? "s" : ""} selecionada${(files.length || savedImages.length) > 1 ? "s" : ""}`
              : `Selecione até ${selectedPlan.photos} imagens`}
          </span>
        </button>

        <button 
          type="button"
          className="w-full py-4 bg-[#ff6969] hover:bg-[#ff5c5c] text-white font-bold rounded-lg transition duration-200 text-xl"
        >
          Crie Sua Página Agora!
        </button>
      </div>
    </div>
  );
};

export default LovePageForm;