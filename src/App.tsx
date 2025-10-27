import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import FAQSection from "./components/FAQSection";
import Phone from "./components/Phone";
import Steps from "./components/Steps";
import Footer from "./components/Footer";
import LovePageForm from "./components/LovePageForm";
import SharedLovePage from "./components/sharedLovePage";
import SuccessPageStandalone from "./components/SuccessPageStandalone";
import { LanguageProvider, useLanguage } from "./components/useLanguage";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { translations } from "./components/translations";
import RelationshipDetailsPage from "./components/RelationshipDetailsPage";

function GlobalBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#0a0a0a]">
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] opacity-60 z-0"></div>
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse z-0"></div>
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000 z-0"></div>
      <div className="fixed top-1/2 left-1/3 w-64 h-64 bg-purple-500/5 rounded-full blur-2xl animate-pulse delay-500 z-0"></div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

function HomePageContent() {
  const { language } = useLanguage();
  const t = translations[language];
  
  const [coupleName, setCoupleName] = useState<string>(getInitialCoupleName());
  const [relationshipTime, setRelationshipTime] = useState<string>("");
  const [CoupleMessage, setCoupleMessage] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [youtubeLink, setYoutubeLink] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  
  const [textColor, setTextColor] = useState<string>("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState<string>("#ec4899");

  function getInitialCoupleName(): string {
    const name = localStorage.getItem("coupleName");
    return name ?? "";
  }

  return (
    <>
      <Header />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-16 gap-8">
       
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-left bg-clip-text text-transparent bg-gradient-to-r from-[#ff6b6b] via-[#ff8e8e] to-[#ff6b6b] animate-gradient-x leading-tight">
              {language === 'pt' ? (
                <>
                  Crie momentos<br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff3333] to-[#ff8c8c]">
                    inesquecíveis
                  </span>
                </>
              ) : (
                <>
                  Create unforgettable<br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff3333] to-[#ff8c8c]">
                    moments
                  </span>
                </>
              )}
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl font-light text-gray-300 leading-relaxed max-w-2xl">
              {t.subtitle}<span className="bg-clip-text font-bold text-transparent bg-gradient-to-r from-[#ff3333] to-[#ff8c8c]">{t.spansubtitle}</span>
            </p>

            {/* Features List */}
            <div className="flex flex-wrap gap-4 mt-8">
              <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="text-sm text-gray-300">{t.personalized_design}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-300">{t.pics_and_video}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                <span className="text-sm text-gray-300">{t.easy_sharing}</span>
              </div>
            </div>
          </div>

        
          <div className="mt-12 lg:mt-16">
            <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-lg rounded-3xl border border-white/10 p-1 shadow-2xl">
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 lg:p-8">
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
                  textColor={textColor}
                  setTextColor={setTextColor}
                  backgroundColor={backgroundColor}
                  setBackgroundColor={setBackgroundColor}
                />
              </div>
            </div>
          </div>
        </div>

       
        <div className="lg:col-span-1 flex items-start justify-center lg:justify-end">
          <div className="relative lg:mt-85 lg:sticky lg:top-32">
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-pink-500/20 rounded-full blur-sm animate-bounce"></div>
            <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-red-500/20 rounded-full blur-sm animate-bounce delay-500"></div>
            
            <div className="transform lg:scale-110 xl:scale-125 origin-center transition-all duration-500 hover:scale-105">
              <Phone
                coupleName={coupleName}
                relationshipTime={relationshipTime}
                CoupleMessage={CoupleMessage}
                files={files}
                setFiles={setFiles}
                youtubeLink={youtubeLink}
                textColor={textColor}
                backgroundColor={backgroundColor}
              />
            </div>
            
          
            <div className="text-center mt-24 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-white font-semibold text-lg">
                  {language === 'pt' ? 'Preview ao vivo' : 'Live Preview'}
                </p>
              </div>
              <p className="text-gray-300 text-sm">
                {language === 'pt' ? 'Veja acima como ficará seu site' : 'See above how your site will look'}
              </p>
            </div>
          </div>
        </div>
      </div>

    
      <div className="mt-20 lg:mt-32">
        <Steps />
      </div>

    
      <div className="mt-20 lg:mt-32">
        <FAQSection />
      </div>

      <Footer />
    </>
  );
}

function NotFoundPage() {
  const { language } = useLanguage();
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center backdrop-blur-sm bg-white/5 rounded-3xl border border-white/10 p-12 mx-4 max-w-md w-full">
        <div className="text-6xl mb-4">💔</div>
        <h2 className="text-3xl font-bold text-white mb-4">
          {language === 'pt' ? 'Página não encontrada' : 'Page not found'}
        </h2>
        <p className="text-gray-300 mb-8">
          {language === 'pt' 
            ? 'A página que você está procurando não existe ou foi movida.'
            : 'The page you are looking for does not exist or has been moved.'
          }
        </p>
        <a
          href="/"
          className="inline-block bg-gradient-to-r from-[#ff6b6b] to-[#ff3333] hover:from-[#ff3333] hover:to-[#ff6b6b] text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          {language === 'pt' ? 'Voltar para o início' : 'Back to home'}
        </a>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <Router>
      <GlobalBackground>
        {/* LanguageSwitcher fixo no canto */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageSwitcher />
        </div>
        
        <Routes>
          <Route path="/" element={<HomePageContent />} />
          <Route path="/page/:pageId" element={<SharedLovePage />} />
          <Route path="/shared/:pageId" element={<SharedLovePage />} />
          <Route path="/detalhes_do_relacionamento/:docId" element={<RelationshipDetailsPage />} />
          <Route path="/success" element={<SuccessPageStandalone />} />
          <Route
            path="/success/:coupleSlug"
            element={<SuccessPageStandalone />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </GlobalBackground>
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;