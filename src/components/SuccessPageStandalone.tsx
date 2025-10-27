import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import QRCode from "qrcode";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import {
  getImagesFromStorage,
  convertFilesToDataUrls,
  saveImagesToStorage,
} from "./imageStorage";
import { useLanguage } from './useLanguage';
import { translations } from './translations';

interface LovePageData {
  id?: string;
  coupleName: string;
  coupleMessage: string;
  youtubeLink: string;
  startDate: string;
  startTime: string;
  email: string;
  selectedPlan: string;
  imagesUrl?: string[] | string | null;
  imageFileNames?: string[];
  customSlug?: string;
  textColor?: string;
  backgroundColor?: string;
  createdAt: {
    toDate?: () => Date;
  };
}

interface PageDataFromFirestore {
  id?: string;
  coupleName?: string;
  coupleMessage?: string;
  youtubeLink?: string;
  startDate?: string;
  startTime?: string;
  email?: string;
  selectedPlan?: string;
  imagesUrl?: string[] | string | null;
  imageFileNames?: string[];
  customSlug?: string;
  textColor?: string;
  backgroundColor?: string;
  createdAt?: {
    toDate?: () => Date;
  };
}

const SuccessPageStandalone: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];
  
  const [searchParams] = useSearchParams();
  const [pageUrl, setPageUrl] = useState("");
  const [coupleName, setCoupleName] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [uniqueSuccessUrl, setUniqueSuccessUrl] = useState("");
  const [pageData, setPageData] = useState<LovePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    coupleName: "",
    coupleMessage: "",
    youtubeLink: "",
    startDate: "",
    startTime: "",
    textColor: "#ffffff",
    backgroundColor: "#ec4899",
  });
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [maxImages, setMaxImages] = useState(5);

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
        setPageData(data as LovePageData);
        const pageData = data as PageDataFromFirestore;
        setFormData({
          coupleName: pageData.coupleName || "",
          coupleMessage: pageData.coupleMessage || "",
          youtubeLink: pageData.youtubeLink || "",
          startDate: pageData.startDate || "",
          startTime: pageData.startTime || "",
          textColor: pageData.textColor || "#ffffff",
          backgroundColor: pageData.backgroundColor || "#ec4899",
        });

        const cachedImages = getImagesFromStorage();
        setCurrentImages(cachedImages);

        const planLimits: { [key: string]: number } = {
          Básico: 3,
          Premium: 5,
          Deluxe: 10,
        };
        setMaxImages(planLimits[(data as LovePageData).selectedPlan] || 5);
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

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const totalImages = currentImages.length + files.length;

      if (totalImages > maxImages) {
        alert(
          language === 'pt' 
            ? `Você pode adicionar no máximo ${maxImages} imagens. Plano atual permite ${maxImages} fotos.`
            : `You can add up to ${maxImages} images. Current plan allows ${maxImages} photos.`
        );
        return;
      }

      try {
        const dataUrls = await convertFilesToDataUrls(files);
        const existingImages = getImagesFromStorage();
        const updatedImages = [...existingImages, ...dataUrls];
        saveImagesToStorage(updatedImages);
        setCurrentImages(updatedImages);
      } catch (error) {
        console.error("Erro ao processar imagens:", error);
      }
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = currentImages.filter((_, i) => i !== index);
    saveImagesToStorage(updatedImages);
    setCurrentImages(updatedImages);
  };

  const handleSave = async () => {
    if (!pageData?.id) return;

    try {
      const docRef = doc(db, "paginas", pageData.id);
      await updateDoc(docRef, {
        coupleName: formData.coupleName,
        coupleMessage: formData.coupleMessage,
        youtubeLink: formData.youtubeLink,
        startDate: formData.startDate,
        startTime: formData.startTime,
        textColor: formData.textColor,
        backgroundColor: formData.backgroundColor,
        imageFileNames: currentImages.map(
          (_, index) => `image_${Date.now()}_${index}`
        ),
        updatedAt: new Date(),
      });

      alert(language === 'pt' ? "Alterações salvas com sucesso!" : "Changes saved successfully!");
      setEditing(false);
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      alert(language === 'pt' ? "Erro ao salvar alterações" : "Error saving changes");
    }
  };

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

                {/* Edit Link */}
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

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => window.open(pageUrl, "_blank")}
                  className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  {language === 'pt' ? "Ver Página" : "View Page"}
                </button>
                <button
                  onClick={() => setEditing(!editing)}
                  className={`group font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 ${
                    editing 
                      ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                      : "bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white"
                  }`}
                >
                  {editing 
                    ? (language === 'pt' ? "Cancelar Edição" : "Cancel Edit")
                    : (language === 'pt' ? "Editar Página" : "Edit Page")
                  }
                </button>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {editing && (
            <div className="bg-white/15 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 mb-6">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-3">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                    {language === 'pt' ? "Editar Página" : "Edit Page"}
                  </span>
                </h3>
                <p className="text-white/70">
                  {language === 'pt' ? "Faça alterações na sua página de amor" : "Make changes to your love page"}
                </p>
              </div>

              <div className="space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-white font-semibold mb-3 block text-lg">
                      {t.couple_names}
                    </label>
                    <input
                      type="text"
                      value={formData.coupleName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          coupleName: e.target.value,
                        }))
                      }
                      className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                      placeholder={language === 'pt' ? "Digite o nome do casal" : "Enter couple names"}
                    />
                  </div>

                  <div>
                    <label className="text-white font-semibold mb-3 block text-lg">
                      {t.message}
                    </label>
                    <textarea
                      value={formData.coupleMessage}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          coupleMessage: e.target.value,
                        }))
                      }
                      className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300 resize-none"
                      rows={3}
                      placeholder={language === 'pt' ? "Escreva uma mensagem especial..." : "Write a special message..."}
                    />
                  </div>
                </div>

                {/* YouTube Link */}
                <div>
                  <label className="text-white font-semibold mb-3 block text-lg">
                    {t.youtube}
                  </label>
                  <input
                    type="text"
                    value={formData.youtubeLink}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        youtubeLink: e.target.value,
                      }))
                    }
                    className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-white font-semibold mb-3 block text-lg">
                      {t.start_date}
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="text-white font-semibold mb-3 block text-lg">
                      {t.hoursandminutes}
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                      className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Color Customization */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h4 className="text-2xl font-bold text-white mb-6 text-center">
                    {language === 'pt' ? "Personalizar Cores" : "Customize Colors"}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-white font-semibold text-lg">
                        {language === 'pt' ? "Cor do Texto" : "Text Color"}
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="color"
                          value={formData.textColor}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              textColor: e.target.value,
                            }))
                          }
                          className="w-16 h-16 rounded-2xl border-2 border-white/30 cursor-pointer shadow-lg"
                        />
                        <input
                          type="text"
                          value={formData.textColor}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              textColor: e.target.value,
                            }))
                          }
                          className="flex-1 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-white font-semibold text-lg">
                        {language === 'pt' ? "Cor de Fundo" : "Background Color"}
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="color"
                          value={formData.backgroundColor}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              backgroundColor: e.target.value,
                            }))
                          }
                          className="w-16 h-16 rounded-2xl border-2 border-white/30 cursor-pointer shadow-lg"
                        />
                        <input
                          type="text"
                          value={formData.backgroundColor}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              backgroundColor: e.target.value,
                            }))
                          }
                          className="flex-1 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                          placeholder="#ec4899"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="mt-6 p-6 rounded-2xl border-2 border-white/20 shadow-lg" style={{ backgroundColor: formData.backgroundColor }}>
                    <p className="text-center font-bold text-xl" style={{ color: formData.textColor }}>
                      {formData.coupleName || (language === 'pt' ? "Preview do Nome do Casal" : "Couple Name Preview")}
                    </p>
                  </div>
                </div>

                {/* Image Management */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-2xl font-bold text-white">
                      {language === 'pt' ? "Gerenciar Imagens" : "Manage Images"}
                    </h4>
                    <span className="bg-white/20 px-4 py-2 rounded-full text-white font-semibold">
                      {currentImages.length}/{maxImages}
                    </span>
                  </div>

                  {/* Current Images */}
                  {currentImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {currentImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Imagem ${index + 1}`}
                            className="w-full h-24 object-cover rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-all duration-200 shadow-lg"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Images */}
                  {currentImages.length < maxImages && (
                    <div className="border-2 border-dashed border-white/30 rounded-2xl p-8 text-center hover:border-white/50 transition-all duration-300">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer block"
                      >
                        <p className="text-white font-semibold mb-2">
                          {language === 'pt' ? "Clique para adicionar imagens" : "Click to add images"}
                        </p>
                        <p className="text-white/70 text-sm">
                          {language === 'pt' 
                            ? `Você pode adicionar até ${maxImages - currentImages.length} imagens`
                            : `You can add up to ${maxImages - currentImages.length} images`
                          }
                        </p>
                      </label>
                    </div>
                  )}
                </div>

                {/* Save/Cancel Buttons */}
                <div className="flex flex-col md:flex-row gap-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                  >
                    {language === 'pt' ? "Salvar Alterações" : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                  >
                    {language === 'pt' ? "Cancelar" : "Cancel"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
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
  );
};

export default SuccessPageStandalone;