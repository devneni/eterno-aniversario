import React, { useState } from "react";
export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

interface AccordionItemProps {
  item: FaqItem;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`
        mb-4 rounded-[20px] shadow-lg overflow-hidden transition-all duration-300
        ${isOpen ? "bg-gray-50" : "bg-white"} 
      `}
    >
      <button
        className="w-full flex justify-between items-center p-4 text-left font-bold text-gray-800 focus:outline-none hover:bg-[#ff6969] hover:text-white "
        onClick={toggleOpen}
      >
        <span>{item.question}</span>

        <span
          className={`
            text-xl transition-transform duration-300 transform 
            ${isOpen ? "rotate-180 text-blue-600" : "rotate-0 text-gray-500"}
          `}
        >
          &#x2304;
        </span>
      </button>

      <div
        className={`
          transition-all duration-500 ease-in-out 
          ${isOpen ? "max-h-96 opacity-100 p-4 pt-0" : "max-h-0 opacity-0 p-0"}
        `}
      >
        <p className="text-gray-600 font-semibold border-t pt-4">
          {item.answer}
        </p>
      </div>
    </div>
  );
};

export default AccordionItem;
