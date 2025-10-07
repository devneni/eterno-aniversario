import Header from "./components/Header";
import FAQSection from "./components/FAQSection";
import Phone from "./components/Phone";
import Etapas from "./components/Steps";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <div
        className="    
   bg-[#121212] 
    min-h-screen 
    w-full 
    relative"
      >
        <Header />
        <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto p-4">
          <div className="lg:w-3/5">
            <h1 className="text-[#ff6969] text-3xl md:text-5xl font-bold mt-4 text-left">
              Crie momentos inesquecíveis
            </h1>

            <p className="text-white mb-8 text-left font-bold text-base">
              Registre o tempo do seu relacionamento em um site personalizado.{" "}
              <br /> Preencha o formulário e compartilhe com seu amor através de
              um QR Code especial.
            </p>

            <div className="flex flex-wrap justify-start items-stretch gap-4 mb-8">
              <div className="w-full sm:w-[calc(33.33%-16px)]"></div>
            </div>
          </div>

          <div className="lg:w-2/5 flex justify-center lg:justify-end mt-10 lg:mt-0">
            <Phone couplename={""} email={""} />
          </div>
        </div>
        <Etapas />
        <FAQSection />
        <Footer />
      </div>
    </>
  );
}
export default App;
