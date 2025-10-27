// types/translation.ts
export interface TranslationKeys {
  header: string;
  title: string;
  subtitle: string;
  personalized_design: string;
  pics_and_video: string;
  easy_sharing: string;
  year: string;
  photos: string;
  with_music: string;
  without_music: string;
  best_seller: string;
  couple_names: string;
  start_date: string;
  hoursandminutes: string;
  email: string;
  message: string;
  youtube: string;
  music_tips: string;
  select_image: string;
  create_page: string;
  years: string;
  months: string;
  month: string;
  days: string;
  day: string;
  Loading: string;
  steptitles: string;
  stepsubtitle: string;
  firststep: string;
  descriptionfirststep: string;
  secondstep: string;
  descriptionsecondstep: string;
  thirdstep: string;
  descriptionthirdstep: string;
  fourthstep: string;
  descriptionfourthstep: string;
  fifthstep: string;
  descriptionfifthstep: string;
  Final_result: string;
  descriptionfinalresult: string;
  doubts: string;
  descriptionzap: string;
  faqtitle: string;
  faq1question: string;
  faq1answer: string;
  faq2question: string;
  faq2answer: string;
  faq3question: string;
  faq3answer: string;
  faq4question: string;
  faq4answer: string;
  faq5question: string;
  faq5answer: string;
  faq6question: string;
  faq6answer: string;
  faq7question: string;
  faq7answer: string;
  faq8question: string;
  faq8answer: string;
  faq9question: string;
  faq9answer: string;
  faq10question: string;
  faq10answer: string;
  footer: string;
  hour: string;
  hours: string;
  minute: string; 
  minutes: string;
  second: string;
  seconds: string;
  
}

export type Language = 'pt' | 'en';

export interface Translations {
  pt: TranslationKeys;
  en: TranslationKeys;
}

export interface LanguageContextType {
  t: (key: keyof TranslationKeys) => string;
  language: Language;
  changeLanguage: (lang: Language) => void;
}