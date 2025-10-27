
'use client';
import { useLanguage } from './useLanguage';

function Header() {
  const { t } = useLanguage();

  return (
    <header className="w-full z-50 top-0 bg-black/10 bg-fixed grid place-items-center fixed mb-4">
      <div className="flex items-center">
        <img src="./ico.png" alt="Ícone" className="h-10 mr-3" />
        <h1 className="text-white text-1xl font-bold">
          {t('header')} 
        </h1>
      </div>
    </header>
  );
}

export default Header;