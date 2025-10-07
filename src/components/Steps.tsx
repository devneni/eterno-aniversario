import "lucide-react";
import { ListChecks, Calendar, Image, Music, CreditCard } from "lucide-react";

const stepsData = [
  { icon: ListChecks, text: "Escolha seu plano" },
  { icon: Calendar, text: "Insira seus dados e de seu amor" },
  { icon: Image, text: "Selecione as imagens" },
  { icon: Music, text: "Escolha uma música (opcional)" },
  { icon: CreditCard, text: "Efetue o pagamento" },
];

import type { FC } from "react";
import type { LucideIcon } from "lucide-react";

type TimelineItemProps = {
  icon: LucideIcon;
  text: string;
  isLast: boolean;
  index: number;
};

const TimelineItem: FC<TimelineItemProps> = ({
  icon: Icon,
  text,
  isLast,
  index,
}) => {
  const isEven = index % 2 === 0;

  const iconBgClasses = isEven
    ? "bg-[#996fcc]"
    : "bg-white border-2 border-[#996fcc]";

  const iconColorClasses = isEven ? "text-white" : "text-[#996fcc]";

  return (
    <div className="flex mb-8">
      <div className="flex flex-col items-center mr-6">
        <div className={`p-3 rounded-full shadow-md z-10 ${iconBgClasses}`}>
          <Icon className={`w-5 h-5 ${iconColorClasses}`} />
        </div>

        {!isLast && <div className="w-1 h-full bg-[#996fcc] -mt-1 -mb-1"></div>}
      </div>

      <div className="flex items-center">
        <p className="text-gray-800 text-lg font-medium">{text}</p>
      </div>
    </div>
  );
};

function Steps() {
  return (
    <>
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-8">
        <h1 className="font-extrabold text-[#996fcc] text-4xl mb-8 text-center">
          Etapas
        </h1>

        <div className="relative pl-2">
          {stepsData.map((step, index) => (
            <TimelineItem
              key={index}
              icon={step.icon}
              text={step.text}
              isLast={index === stepsData.length - 1}
              index={index}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-sm mt-12 mb-8 text-center">
        <a
          className="inline-block text-white no-underline bg-green-500 hover:bg-green-600 active:bg-green-700 transition duration-200 rounded-full py-4 px-8 font-extrabold shadow-lg transform hover:scale-105"
          href="https://api.whatsapp.com/send/?phone=554788617240&text&type=phone_number&app_absent=0"
          target="_blank"
          rel="noopener noreferrer"
        >
          Dúvidas? me chame no WhatsApp
        </a>
      </div>

      <p className="text-center font-bold text-[#f1acb7] text-3xl mt-12">
        Perguntas Frequentes (FAQ)
      </p>
    </>
  );
}

export default Steps;
