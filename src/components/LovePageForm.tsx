import React, { useState } from "react";
import PlanCard from "./PlanCard";
import { plansData, type Plan } from "./plansData";

const LovePageForm: React.FC = () => {
  const initialPlanId: Plan["id"] =
    plansData.find((p) => p.preferred)?.id || plansData[0].id;
  const [selectedPlanId, setSelectedPlanId] =
    useState<Plan["id"]>(initialPlanId);

  const selectedPlan = plansData.find((plan) => plan.id === selectedPlanId);

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
          id="teste"
          type="text"
          placeholder="Nome do casal"
          className={inputClass}
        />

        <div className="flex space-x-4">
          <input
            type="date"
            placeholder="Início do relacionamento"
            className={`${inputClass} w-1/2`}
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
        ></textarea>

        {selectedPlan.music && (
          <div className="space-y-4">
            <input
              type="text"
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

        <button className="w-full py-4 mt-6 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg transition duration-200 flex items-center justify-center space-x-2">
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
          <span>Selecione até {selectedPlan.photos} imagens</span>
        </button>
        <button className="w-full py-4 bg-[#ff6969] hover:bg-[#ff6969] text-white font-bold rounded-lg transition duration-200 text-xl">
          Crie Sua Página Agora!
        </button>
      </div>
    </div>
  );
};

export default LovePageForm;
