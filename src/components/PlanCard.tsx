import React from "react";
import type { Plan } from "./plansData";
import { useLanguage } from './useLanguage'; 
import { translations } from './translations'; 

interface PlanCardProps {
  plan: Plan;
  isSelected: boolean;
  onSelect: (id: Plan["id"]) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, isSelected, onSelect }) => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div 
      onClick={() => onSelect(plan.id)}
      className={`
        relative p-4 rounded-xl cursor-pointer transition-all duration-300 mx-4 
        ${
          isSelected
            ? "border-4 border-[#ff6969] bg-red-500/10 scale-105 text-[#ff6969]" 
            : "border-4 border-[#ff6969] bg-[white]"
        }
        ${plan.id === "eternal" ? "text-black " : "text-black"}
      `}
    >
      {plan.preferred && (
        <span className="absolute -top-3 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
          {t.best_seller}
        </span>
      )}
      <div
        className={`text-center p-2 rounded-lg ${
          plan.id === "eternal" ? "bg-[white]" : "bg-[white]"
        }`}
      >
        <h3 className="text-lg font-bold">{plan.title}</h3>
        <p className="text-sm">
          {plan.photos} {plan.photos === 1 ? t.photos : t.photos}
        </p>
        <p className="text-sm">
          {plan.music ? t.with_music : t.without_music}
        </p>
      </div>
      <div className="text-center mt-2">
        <p className="text-xs line-through text-gray-500">
          {language === 'pt' ? 'de' : 'from'} R$ {plan.priceOriginal.toFixed(2).replace(".", ",")}
        </p>
        <p className="text-xl font-extrabold text-red-400">
          {language === 'pt' ? 'por' : 'for'} R$ {plan.priceDiscounted.toFixed(2).replace(".", ",")}
        </p>
      </div>
    </div>
  );
};

export default PlanCard;