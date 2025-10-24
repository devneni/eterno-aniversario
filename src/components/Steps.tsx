import "lucide-react";
import { ListChecks, Calendar, Image, Music, CreditCard, Heart } from "lucide-react";
import { FaWhatsapp} from "react-icons/fa";
import type { FC } from "react";
import type { LucideIcon } from "lucide-react";

const stepsData = [
  { icon: ListChecks, text: "Escolha seu plano", description: "Selecione o plano ideal para seu momento especial" },
  { icon: Calendar, text: "Insira seus dados", description: "Preencha as informações do casal" },
  { icon: Image, text: "Adicione as fotos", description: "Selecione suas melhores imagens" },
  { icon: Music, text: "Escolha uma música", description: "Link do YouTube (opcional)" },
  { icon: CreditCard, text: "Efetue o pagamento", description: "Pagamento seguro e rápido" },
];

type TimelineItemProps = {
  icon: LucideIcon;
  text: string;
  description: string;
  isLast: boolean;
  index: number;
};

const TimelineItem: FC<TimelineItemProps> = ({
  icon: Icon,
  text,
  description,
  isLast,
  index,
}) => {
  return (
    <div className="flex group mb-0 transform hover:scale-105 transition-all duration-300">
      <div className="flex flex-col items-center mr-6 relative">
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-[#ff6b6b] to-[#ff3333] rounded-full flex items-center justify-center text-white text-xs font-bold z-20 shadow-lg">
          {index + 1}
        </div>
        
        <div className="relative p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-2xl z-10 group-hover:from-[#ff6b6b]/20 group-hover:to-[#ff3333]/20 transition-all duration-300">
          <Icon className="w-6 h-6 text-white" />
        </div>

        {!isLast && (
          <div className="w-1 h-full bg-gradient-to-b from-[#ff6b6b] via-[#ff8e8e] to-[#ff6b6b] absolute top-12 bottom-0 opacity-60 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
        )}
      </div>

      
      <div className="flex-1 pt-1 pb-8">
        <p className="text-white text-xl font-bold mb-2 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#ff6b6b] group-hover:to-[#ff3333] transition-all duration-300">
          {text}
        </p>
        <p className="text-gray-300 text-sm font-light leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

function Steps() {
  return (
    <>
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <h1 className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#ff6b6b] via-[#ff8e8e] to-[#ff6b6b]">
              Como Funciona?
            </h1>
          </div>
          <p className="text-gray-300 text-xl font-light max-w-2xl mx-auto">
            Crie sua página especial em apenas 5 passos simples
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl"></div>
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-lg rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative">
                <div className="space-y-0">
                  {stepsData.map((step, index) => (
                    <TimelineItem
                      key={index}
                      icon={step.icon}
                      text={step.text}
                      description={step.description}
                      isLast={index === stepsData.length - 1}
                      index={index}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-6">
                <div className="text-center p-6 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl border border-white/10">
                  <Heart className="w-12 h-12 text-[#ff6b6b] mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Resultado Final</h3>
                  <p className="text-gray-300">
                    Uma linda página personalizada com suas fotos, música e contador de tempo de relacionamento
                  </p>
                </div>

               
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto mt-16 text-center">
  <div className="relative group">
   
    
    <a
      className="relative inline-flex items-center justify-center text-white bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition-all duration-300 rounded-xl py-5 px-8 font-bold shadow-2xl transform group-hover:scale-105 group-hover:shadow-3xl border border-green-300/30 backdrop-blur-sm"
      href="https://api.whatsapp.com/send/?phone=554788617240&text&type=phone_number&app_absent=0"
      target="_blank"
      rel="noopener noreferrer"
    >

      <div className="relative mr-3">
        <FaWhatsapp size={26} className="drop-shadow-lg" />
        <div className="absolute inset-0 animate-ping opacity-20">
          <FaWhatsapp size={26} />
        </div>
      </div>
      
      <span className="text-lg font-semibold drop-shadow-md">Dúvidas? Chame no WhatsApp</span>
      
     
      <svg className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </a>
  </div>
  
  <p className="text-gray-300 mt-4 text-sm font-medium flex items-center justify-center gap-2">
    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
    Online agora - Respondemos em torno de 30 minutos
  </p>
</div>
    <div className="text-center mt-16 mb-12">
  <div className="flex items-center justify-center gap-4 ">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    <h2 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#ff6b6b] via-[#ff8e8e] to-[#ff6b6b] whitespace-nowrap">
      Perguntas Frequentes (FAQ)
    </h2>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
  </div>
  
</div>
    </>
  );
}

export default Steps;