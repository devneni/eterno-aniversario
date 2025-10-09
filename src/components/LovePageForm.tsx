import React, { useState, useRef, useEffect } from "react";
import PlanCard from "./PlanCard";
import { plansData, type Plan } from "./plansData";

interface LovePageFormProps {
  coupleName: string;
  relationshipTime: string;
  setRelationshipTime: (time: string) => void;
  setCoupleName: (name: string) => void;
  CoupleMessage: string;
  setCoupleMessage: (message: string) => void;
}

const LovePageForm: React.FC<LovePageFormProps> = ({
  coupleName,
  setCoupleName,
  relationshipTime,
  setRelationshipTime,
  CoupleMessage,
  setCoupleMessage,
}) => {
  const initialPlanId: Plan["id"] =
    plansData.find((p) => p.preferred)?.id || plansData[0].id;
  const [selectedPlanId, setSelectedPlanId] =
    useState<Plan["id"]>(initialPlanId);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedPlan = plansData.find((plan) => plan.id === selectedPlanId);
  const calculateRelationshipTime = () => {
    if (!startDate) {
      setRelationshipTime("");
      return;
    }

    const start = new Date(startDate);
    const today = new Date();

    let years = today.getFullYear() - start.getFullYear();
    let months = today.getMonth() - start.getMonth();
    let days = today.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} ano${years > 1 ? "s" : ""}`);
    if (months > 0) parts.push(`${months} mês${months > 1 ? "es" : ""}`);
    if (days > 0 || parts.length === 0)
      parts.push(`${days} dia${days > 1 ? "s" : ""}`);

    const result = parts.join(", ");
    setRelationshipTime(result);
  };

  useEffect(() => {
    calculateRelationshipTime();
  }, [startDate]);

  if (!selectedPlan) return null;

  const inputClass =
    "w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition duration-200";

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const filesArray = Array.from(files).slice(0, selectedPlan.photos);
      setSelectedFiles(filesArray);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

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
          id="teste"
          type="text"
          placeholder="Nome do casal"
          className={inputClass}
          value={coupleName}
          onChange={(e) => setCoupleName(e.target.value)}
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
          />
        </div>

        <input type="email" placeholder="Seu e-mail" className={inputClass} />

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
              type="link"
              placeholder="Link do Youtube (opcional)"
              className={inputClass}
            />

            <div>
              <p className="mb-2 text-sm text-gray-400">Dicas de músicas</p>
              <div className="flex flex-wrap gap-2">
                {selectedPlan.musicTips?.map((tip, index) => (
                  <button
                    key={index}
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
            {selectedFiles.length > 0
              ? `${selectedFiles.length} imagens selecionadas`
              : `Selecione até ${selectedPlan.photos} imagens`}
          </span>
        </button>

        {selectedFiles.length > 0 && (
          <p className="text-sm text-gray-400">
            Imagens prontas para envio:{" "}
            {selectedFiles.map((f) => f.name).join(", ")}
          </p>
        )}

        <button className="w-full py-4 bg-[#ff6969] hover:bg-[#ff6969] text-white font-bold rounded-lg transition duration-200 text-xl">
          Crie Sua Página Agora!
        </button>
      </div>
    </div>
  );
};

export default LovePageForm;
