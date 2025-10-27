import { FaWhatsappSquare } from "react-icons/fa";
import { AiFillTikTok } from "react-icons/ai";
import { ImMail } from "react-icons/im";
import { useLanguage } from './useLanguage'; 
import { translations } from './translations';

function Footer() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="mb-8">
      <footer className="font-semibold text-center text-[10px] text-white">
        {t.footer}
      </footer>
      <div className="flex justify-center mt-2 space-x-4">
        <a href="https://www.tiktok.com/@eternoaniversario" target="_blank" rel="noopener noreferrer">
          <AiFillTikTok className="w-[80px] h-[40px] text-white hover:scale-150 transition-transform duration-200" />
        </a>
        <a
          href="https://api.whatsapp.com/send/?phone=554788617240&text&type=phone_number&app_absent=0"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaWhatsappSquare className="w-[80px] h-[40px] text-white hover:scale-150 transition-transform duration-200" />
        </a>
        <a href="mailto:eternoaniversario@gmail.com" target="_blank" rel="noopener noreferrer">
          <ImMail className="w-[80px] h-[40px] text-white hover:scale-150 transition-transform duration-200" />
        </a>
      </div>
    </div>
  );
}

export default Footer;