import { FaWhatsappSquare } from "react-icons/fa";
import { AiFillTikTok } from "react-icons/ai";
import { ImMail } from "react-icons/im";

function Footer() {
  return (
    <div className=" mb-8 ">
      <footer className="font-semibold text-center text-[10px] text-white">
        Eterno Aniversário © - Todos os direitos reservados desenvolvido por
        neni
      </footer>
      <div className="flex justify-center mt-2 space-x-4">
        <a href="https://www.tiktok.com/@eternoaniversario" target="_blank">
          <AiFillTikTok className="w-[80px] h-[40px] text-white hover:scale-150" />
        </a>
        <a
          href="https://api.whatsapp.com/send/?phone=554788617240&text&type=phone_number&app_absent=0"
          target="_blank"
        >
          <FaWhatsappSquare className="w-[80px] h-[40px] text-white hover:scale-150" />
        </a>
        <a href="mailto: eternoaniversario@gmail.com" target="_blank ">
          <ImMail className="w-[80px] h-[40px] text-white hover:scale-150" />
        </a>
      </div>
    </div>
  );
}

export default Footer;
