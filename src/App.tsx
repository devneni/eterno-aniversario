import { useState } from "react";
import Header from "./components/Header";
import FAQSection from "./components/FAQSection";
import Phone from "./components/Phone";
import Steps from "./components/Steps";
import Footer from "./components/Footer";
import LovePageForm from "./components/LovePageForm";

function App() {
  const [coupleName, setCoupleName] = useState<string>(getInitialCoupleName());
  const [relationshipTime, setRelationshipTime] = useState<string>("");
  const [CoupleMessage, setCoupleMessage] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);

  function getInitialCoupleName(): string {
    const name = localStorage.getItem("coupleName");
    return name ?? "";
  }

  return (
    <div
      className="
        bg-[#121212] 
        bg-[url('/background.png')]
        bg-repeat
        bg-[size:40px_40px]
        min-h-screen 
        w-full 
        relative"
    >
      <Header />
      <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto p-4">
        <div className="lg:w-3/5">
          <h1 className="text-[#ff6969] text-3xl md:text-5xl font-bold mt-6 text-left">
            Crie momentos inesquecíveis
          </h1>

          <p className="text-white mt-6 mb-8 text-left font-semibold text-base">
            Registre o tempo do seu relacionamento em um site personalizado.{" "}
            <br /> Preencha o formulário e compartilhe com seu amor através de
            um QR Code especial.
          </p>

          <div className="mt-8">
            <LovePageForm
              coupleName={coupleName}
              setCoupleName={setCoupleName}
              relationshipTime={relationshipTime}
              setRelationshipTime={setRelationshipTime}
              CoupleMessage={CoupleMessage}
              setCoupleMessage={setCoupleMessage}
              files={files}              
              setFiles={setFiles}        
            />
          </div>
        </div>

        <div className="lg:w-2/5 flex justify-center lg:justify-end mt-10 lg:mt-0">
          <Phone
            coupleName={coupleName}
            relationshipTime={relationshipTime}
            CoupleMessage={CoupleMessage}
            files={files}
            setFiles={setFiles}
          />
        </div>
      </div>

      <Steps />
      <FAQSection />
      <Footer />
    </div>
  );
}

export default App;
