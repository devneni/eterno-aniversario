
'use client';
import { useLanguage } from './useLanguage';

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  return (
<div className="flex gap-1 p-1 bg-gradient-to-r mt-8 from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
  <button 
    onClick={() => changeLanguage('pt')}
    className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-300 font-semibold ${
      language === 'pt' 
        ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg transform scale-105' 
        : 'bg-transparent text-white/80 hover:text-white hover:bg-white/5'
    }`}
  >
 
    <span>PT</span>
  </button>
  
  <button 
    onClick={() => changeLanguage('en')}
    className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-300 font-semibold ${
      language === 'en' 
        ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg transform scale-105' 
        : 'bg-transparent text-white/80 hover:text-white hover:bg-white/5'
    }`}
  >

    <span>EN</span>
  </button>
</div>
  );
};

export default LanguageSwitcher;