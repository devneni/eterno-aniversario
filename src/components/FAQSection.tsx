
'use client';
import React from "react";
import AccordionItem from "./AccordionItem";
import { useLanguage } from './useLanguage';

type FaqItem = {
  id: number;
  question: string;
  answer: string;
};

const FAQSection: React.FC = () => {
  const { t } = useLanguage();


  const faqData: FaqItem[] = [
    {
      id: 1,
      question: t('faq1question'), 
      answer: t('faq1answer'), 
    },
    {
      id: 2,
      question: t('faq2question'), 
      answer: t('faq2answer'),
    },
    {
      id: 3,
      question: t('faq3question'), 
      answer: t('faq3answer'),
    },
    {
      id: 4,
      question: t('faq4question'), 
      answer: t('faq4answer'),
    },
    {
      id: 5,
      question: t('faq5question'), 
      answer: t('faq5answer'),
    },
    {
      id: 6,
      question: t('faq6question'), 
      answer: t('faq6answer'),
    },
    {
      id: 7,
      question: t('faq7question'), 
      answer: t('faq7answer'),
    },
    {
      id: 8,
      question: t('faq8question'),
      answer: t('faq8answer'),
    },
    {
      id: 9,
      question: t('faq9question'), 
      answer: t('faq9answer'),
    },
    {
      id: 10,
      question: t('faq10question'),
      answer: t('faq10answer'),
    },
  ];

  return (
    <div className="max-w-xl mx-auto p-4">
     
      {faqData.map((item) => (
        <AccordionItem key={item.id} item={item} />
      ))}
    </div>
  );
};

export default FAQSection;