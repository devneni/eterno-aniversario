import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import QRCode from "qrcode";
import { useLanguage } from './useLanguage';
import { translations } from './translations';

 

const SuccessPageStandalone: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];
  
  const [searchParams] = useSearchParams();
  const { pageId } = useParams();

  const [pageUrl, setPageUrl] = useState("");
  const [coupleName, setCoupleName] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [uniqueSuccessUrl, setUniqueSuccessUrl] = useState("");
  const [loading, setLoading] = useState(true);
  
  const effectiveId = React.useMemo(() => {
    if (pageId) return pageId;
    try {
      if (pageUrl && pageUrl.includes('/para_sempre/')) {
        const parts = pageUrl.split('/');
        return parts[parts.length - 1] || "";
      }
    } catch {}
    return "";
  }, [pageId, pageUrl]);

  const generateUniqueSuccessUrl = useCallback(() => {
    if (pageUrl && coupleName) {
      const coupleSlug = coupleName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 20);

      const uniqueUrl = `${
        window.location.origin
      }/success/${coupleSlug}?pageUrl=${encodeURIComponent(
        pageUrl
      )}&coupleName=${encodeURIComponent(coupleName)}`;
      setUniqueSuccessUrl(uniqueUrl);
    }
  }, [pageUrl, coupleName]);

  const generateQRCode = useCallback(async () => {
    try {
      const qrCodeUrl = await QRCode.toDataURL(pageUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeDataUrl(qrCodeUrl);
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
    }
  }, [pageUrl]);

  const loadPageData = useCallback(async () => {
    try {
      const urlParts = pageUrl.split("/");
      const slug = urlParts[urlParts.length - 1];

      const { getPageBySlug } = await import("../firebase/firebaseService");
      const data = await getPageBySlug(slug);

      if (data) {
        
      } else {
        alert(language === 'pt' ? "Página não encontrada" : "Page not found");
      }
    } catch (error) {
      console.error("Erro ao carregar dados da página:", error);
      alert(language === 'pt' ? "Erro ao carregar dados da página" : "Error loading page data");
    } finally {
      setLoading(false);
    }
  }, [pageUrl, language]);

  useEffect(() => {
    const url = searchParams.get("pageUrl");
    const name = searchParams.get("coupleName");

    if (url) {
      const decodedUrl = decodeURIComponent(url);
      setPageUrl(decodedUrl);
    }
    if (name) {
      const decodedName = decodeURIComponent(name);
      setCoupleName(decodedName);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadById = async () => {
      if (!pageId) return;
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const { db } = await import("../firebase/firebaseConfig");
        const snap = await getDoc(doc(db, "BIRTHDAY_LOVE", pageId));
        if (snap.exists()) {
          const data: any = snap.data();
          setCoupleName(data?.coupleName || "");
          const slug = data?.customSlug || pageId;
          const builtUrl = `${window.location.origin}/para_sempre/${slug}`;
          setPageUrl(builtUrl);
        }
      } catch (e) {
        console.error("Erro ao carregar por ID:", e);
      }
    };
    if (!searchParams.get("pageUrl")) {
      loadById();
    }
  }, [pageId, searchParams]);

  useEffect(() => {
    if (pageUrl) {
      generateQRCode();
      loadPageData();
      generateUniqueSuccessUrl();
    }
  }, [
    pageUrl,
    coupleName,
    generateQRCode,
    generateUniqueSuccessUrl,
    loadPageData,
  ]);

  

  const handleShareQRCode = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement("a");
      link.download = `qr-code-${coupleName}.png`;
      link.href = qrCodeDataUrl;
      link.click();
    }
  };

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      alert(language === 'pt' ? "Link copiado para a área de transferência!" : "Link copied to clipboard!");
    } catch (error) {
      console.error("Erro ao copiar link:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-400 to-purple-600 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-8 left-8 w-72 h-72 bg-pink-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-8 right-8 w-72 h-72 bg-red-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="text-white text-center z-10 backdrop-blur-sm bg-white/10 rounded-3xl p-12 border border-white/20">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-white/30 border-t-white mx-auto mb-6"></div>
          <p className="text-2xl font-bold mb-2">{t.Loading}</p>
          <p className="text-white/80">
            {language === 'pt' ? "Preparando sua página de sucesso" : "Preparing your success page"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-400 to-purple-600 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Main Success Card */}
          <div className="bg-white/15 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden mb-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-white/20 to-white/10 p-8 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <span className="text-4xl text-white">✓</span>
                </div>
                <div className="absolute inset-0 animate-ping bg-green-400 rounded-full opacity-30"></div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-white mb-3 drop-shadow-2xl">
                {language === 'pt' ? "Página Criada com Sucesso!" : "Page Created Successfully!"}
              </h1>
              <p className="text-xl text-white/90">
                {language === 'pt' ? "Página de" : "Page of"}{" "}
                <span className="font-bold  bg-gradient-to-r from-pink-200 to-red-200 bg-clip-text text-transparent">
                  {coupleName}
                </span>
              </p>
            </div>

            <div className="p-8">
              {/* QR Code Section */}
              {qrCodeDataUrl && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 text-center border border-white/10">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-3">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                      {language === 'pt' ? "QR Code para Compartilhar" : "QR Code to Share"}
                    </span>
                  </h3>
                  
                  <div className="relative inline-block">
                    <img 
                      src={qrCodeDataUrl} 
                      alt="QR Code" 
                      className="mx-auto mb-6 rounded-2xl shadow-2xl border-4 border-white/20" 
                    />
                    <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl blur-lg opacity-20"></div>
                  </div>
                  
                  <button
                    onClick={handleShareQRCode}
                    className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
                  >
                    {language === 'pt' ? "Baixar QR Code" : "Download QR Code"}
                  </button>
                </div>
              )}

              {/* Links Section */}
              <div className="space-y-6 mb-8">
                {/* Page Link */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    
                    <h4 className="text-white font-bold text-lg">
                      {language === 'pt' ? "Seu link personalizado" : "Your personalized link"}
                    </h4>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <code className="flex-1 bg-black/30 backdrop-blur-sm text-pink-200 text-sm font-mono p-4 rounded-xl border border-white/10 break-all">
                      {pageUrl}
                    </code>
                    <button
                      onClick={handleShareLink}
                      className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                    >
                      {language === 'pt' ? "Copiar Link" : "Copy Link"}
                    </button>
                  </div>
                </div>

              
                {uniqueSuccessUrl && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        ✏️
                      </div>
                      <h4 className="text-white font-bold text-lg">
                        {language === 'pt' ? "Link de edição" : "Edit link"}
                      </h4>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <code className="flex-1 bg-black/30 backdrop-blur-sm text-green-200 text-sm font-mono p-4 rounded-xl border border-white/10 break-all">
                        {uniqueSuccessUrl}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(uniqueSuccessUrl);
                          alert(language === 'pt' ? "Link de edição copiado!" : "Edit link copied!");
                        }}
                        className="group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                      >
                        {language === 'pt' ? "Copiar Link" : "Copy Link"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => {
                    if (!pageUrl) return;
                    window.open(pageUrl, "_blank");
                  }}
                  className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  {language === 'pt' ? "Ver Página" : "View Page"}
                </button>
                <button
                  onClick={() => {
                    const id = effectiveId || (pageUrl.split('/').pop() || '');
                    if (!id) return alert(language === 'pt' ? 'ID não encontrado' : 'ID not found');
                    window.location.href = `/editar_relacionamento?id=${id}`;
                  }}
                  className="group font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white"
                >
                  {language === 'pt' ? "Editar Página" : "Edit Page"}
                </button>
              </div>

              
              <div className="text-center text-white/70 text-sm backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
                <p className="font-semibold mb-2">
                  {language === 'pt' 
                    ? "Este link é permanente e pode ser compartilhado!"
                    : "This link is permanent and can be shared!"
                  }
                </p>
                <p>
                  {language === 'pt' 
                    ? "Use o QR Code para compartilhar facilmente com amigos e familiares"
                    : "Use the QR Code to easily share with friends and family"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPageStandalone;