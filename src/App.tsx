import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import FAQSection from "./components/FAQSection";
import Phone from "./components/Phone";
import Steps from "./components/Steps";
import Footer from "./components/Footer";
import LovePageForm from "./components/LovePageForm";
import SharedLovePage from './components/sharedLovePage';

function HomePage() {
  const [coupleName, setCoupleName] = useState<string>(getInitialCoupleName());
  const [relationshipTime, setRelationshipTime] = useState<string>("");
  const [CoupleMessage, setCoupleMessage] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [youtubeLink, setYoutubeLink] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [email, setEmail] = useState<string>(""); 
  const [startDate, setStartDate] = useState<string>("");

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
            <h1 className="text-5xl md:text-7xl font-extrabold mt-6 text-left bg-clip-text text-transparent bg-gradient-to-r from-[#ff8c8c] to-[#ff3333]">
              Crie momentos inesquecíveis
            </h1>

          <p className="mt-6 mb-8 text-left text-lg md:text-xl font-light text-gray-300">
            Registre o tempo do seu relacionamento em um site personalizado.
            <br />
            Preencha o formulário e compartilhe com seu amor através de um{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff8c8c] to-[#ff3333] font-medium drop-shadow-sm">
              QR Code especial
            </span>
            .
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
              youtubeLink={youtubeLink}
              setYoutubeLink={setYoutubeLink}
              startTime={startTime} 
              setStartTime={setStartTime}
              email={email} 
              setEmail={setEmail} 
              startDate={startDate} 
              setStartDate={setStartDate} 
            />
          </div>
        </div>

        <div className="lg:w-2/5 flex justify-center lg:justify-end mt-22 ">
          <Phone
            coupleName={coupleName}
            relationshipTime={relationshipTime}
            CoupleMessage={CoupleMessage}
            files={files}
            setFiles={setFiles}
            youtubeLink={youtubeLink}
          />
        </div>
      </div>

      <Steps />
      <FAQSection />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/page/:pageId" element={<SharedLovePage />} />
        <Route path="/shared/:pageId" element={<SharedLovePage />} />
        
        <Route path="*" element={
          <div className="min-h-screen bg-[#121212] flex items-center justify-center">
            <div className="text-white text-center">
              <h1 className="text-4xl font-bold mb-4">💔</h1>
              <p className="text-xl">Página não encontrada</p>
              <a 
                href="/" 
                className="mt-4 inline-block bg-[#ff6969] hover:bg-[#ff5c5c] text-white px-6 py-2 rounded-lg transition duration-200"
              >
                Voltar para o início
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;