import React from "react";
import AccordionItem from "./AccordionItem";

type FaqItem = {
  id: number;
  question: string;
  answer: string;
};

const faqData: FaqItem[] = [
  {
    id: 1,
    question: "O que é a Eterno Aniversário?",
    answer:
      "Eterno Aniversário é uma plataforma que permite criar páginas personalizadas de aniversário para qualquer pessoa. Você pode adicionar fotos, uma mensagem especial e um contador que mostra há quanto tempo falta para a data do aniversário.",
  },
  {
    id: 2,
    question: "Como eu crio uma página personaliza no Eterno Aniversário?",
    answer:
      "Para criar uma página personalizada, preencha o formulário com o nome da pessoa, a data de nascimento, uma mensagem de parabéns, fotos e o link de um vídeo do Youtube. Depois, clique no botão 'Criar' e finalize o pagamento.",
  },
  {
    id: 3,
    question: "Oque está incluso na minha página personalizada",
    answer:
      "Sua página personalizada incluirá um contador mostrando quanto tempo falta para o aniversário da pessoa, uma apresentação de slides com fotos e uma mensagem especial de parabéns. Além disso, haverá confetes caindo a cada troca de foto.",
  },
  {
    id: 4,
    question: "Como recebo minha página personalizada após o pagamento?",
    answer:
      "Após a conclusão do pagamento, você receberá um QR code para compartilhar com o aniversariante e um link via e-mail para acessar a página.",
  },
  {
    id: 5,
    question: "A página personalizada tem validade?",
    answer:
      "No preço básico e intermediário sim, 1 ano. No plano avançado, a página personalizada estará disponível para a pessoa pelo resto da vida",
  },
  {
    id: 6,
    question: "Posso editar minha página personalizada depois de criada?",
    answer:
      "Sim. Assim que você receber o link para a sua página, ele incluirá uma seção de edição que você pode usar para fazer alterações",
  },
  {
    id: 7,
    question:
      "Qual é o custo para criar uma página personalizada no Eterno Aniversário?",
    answer:
      "No momento, o custo para criar uma página na Eterno Aniversário é de apenas R$12,90 no preço básico, R$18,90 no preço intermediário e R$29,90 no plano máximo",
  },
  {
    id: 8,
    question: "Quanto tempo demora pra receber o QR code no e-mail?",
    answer:
      "Pagamentos com pix ficam prontos na hora. Pagamentos por pix também!",
  },
  {
    id: 9,
    question: "Quais formas de pagamento são aceitas?",
    answer:
      "Aceitamos pagamentos via  Pix, proporcionando conveniência e segurança para você.",
  },
  {
    id: 10,
    question: "Como posso entrar em contato com o suporte ao cliente?",
    answer:
      "Você pode entrar em contato com nosso suporte ao cliente através do e-mail eternoaniversario@gmail.com ou pelo WhatsApp (47) 98861-7240.",
  },
];

const FAQSection: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto p-4">
      {faqData.map((item) => (
        <AccordionItem key={item.id} item={item} />
      ))}
    </div>
  );
};

export default FAQSection;
