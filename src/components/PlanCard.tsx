import React from "react";
import type { Plan } from "./plansData";

interface PlanCardProps {
  plan: Plan;
  isSelected: boolean;
  onSelect: (id: Plan["id"]) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, isSelected, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(plan.id)}
      className={`
        relative p-4 rounded-xl cursor-pointer transition-all duration-300 mx-4 
        ${
          isSelected
            ? "border-4 border-[#ff6969] bg-red-500/10 scale-120 text-[#ff6969]" 
            : "border-4 border-[#ff6969] bg-[white]"
        }
        ${plan.id === "eternal" ? "text-black " : "text-black"}
      `}
    >
      {plan.preferred && (
        <span className="absolute -top-3 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
          Escolha Preferida!
        </span>
      )}
      <div
        className={`text-center p-2 rounded-lg ${
          plan.id === "eternal" ? "bg-[white]" : "bg-[white]"
        }`}
      >
        <h3 className="text-lg font-bold">{plan.title}</h3>
        <p className="text-sm">{plan.photos} fotos</p>
        <p className="text-sm">{plan.music ? "Com música" : "Sem música"}</p>
      </div>
      <div className="text-center mt-2">
        <p className="text-xs line-through text-gray-500">
          de R$ {plan.priceOriginal.toFixed(2).replace(".", ",")}
        </p>
        <p className="text-xl font-extrabold text-red-400">
          por R$ {plan.priceDiscounted.toFixed(2).replace(".", ",")}
        </p>
      </div>
    </div>
  );
};

export default PlanCard;