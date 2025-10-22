import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import QRCode from "qrcode";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import {
  getImagesFromStorage,
  convertFilesToDataUrls,
  saveImagesToStorage,
} from "./imageStorage";

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
  createdAt: {
    toDate?: () => Date;
  };
}

const SuccessPageStandalone: React.FC = () => {
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
  });
  const [newImages, setNewImages] = useState<File[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [maxImages, setMaxImages] = useState(5);

  useEffect(() => {
    const url = searchParams.get("pageUrl");
    const name = searchParams.get("coupleName");

    if (url) {
      const decodedUrl = decodeURIComponent(url);
      setPageUrl(decodedUrl);
      console.log("🔗 URL da página:", decodedUrl);
    }
    if (name) {
      const decodedName = decodeURIComponent(name);
      setCoupleName(decodedName);
      console.log("👫 Nome do casal:", decodedName);
    }
  }, [searchParams]);

  useEffect(() => {
    if (pageUrl) {
      generateQRCode();
      loadPageData();
      generateUniqueSuccessUrl();
    }
  }, [pageUrl, coupleName]);

  const generateUniqueSuccessUrl = () => {
    if (pageUrl && coupleName) {
      // Criar URL única baseada no casal
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
      console.log("🔗 URL única da SuccessPage:", uniqueUrl);
    }
  };

  const generateQRCode = async () => {
    try {
      // QR Code aponta para a página compartilhada, não para a SuccessPage
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
  };

  const loadPageData = async () => {
    try {
      // Extrair slug da URL
      const urlParts = pageUrl.split("/");
      const slug = urlParts[urlParts.length - 1];

      console.log("🔍 Carregando dados da página com slug:", slug);

      // Buscar dados da página no Firestore
      const { getPageBySlug } = await import("../firebase/firebaseService");
      const data = await getPageBySlug(slug);

      if (data) {
        console.log("✅ Dados carregados:", data);
        setPageData(data);
        setFormData({
          coupleName: data.coupleName,
          coupleMessage: data.coupleMessage,
          youtubeLink: data.youtubeLink,
          startDate: data.startDate,
          startTime: data.startTime,
        });

        // Carregar imagens do cache
        const cachedImages = getImagesFromStorage();
        setCurrentImages(cachedImages);

        // Definir limite de imagens baseado no plano
        const planLimits: { [key: string]: number } = {
          Básico: 3,
          Premium: 5,
          Deluxe: 10,
        };
        setMaxImages(planLimits[data.selectedPlan] || 5);
      } else {
        console.error("❌ Página não encontrada");
        alert("Página não encontrada");
      }
    } catch (error) {
      console.error("Erro ao carregar dados da página:", error);
      alert("Erro ao carregar dados da página");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const totalImages = currentImages.length + files.length;

      if (totalImages > maxImages) {
        alert(
          `Você pode adicionar no máximo ${maxImages} imagens. Plano atual permite ${maxImages} fotos.`
        );
        return;
      }

      setNewImages(files);

      // Salvar no cache
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
        imageFileNames: currentImages.map(
          (_, index) => `image_${Date.now()}_${index}`
        ),
        updatedAt: new Date(),
      });

      alert("Alterações salvas com sucesso!");
      setEditing(false);
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      alert("Erro ao salvar alterações");
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
      alert("Link copiado para a área de transferência!");
    } catch (error) {
      console.error("Erro ao copiar link:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 to-red-500 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h1 className="font-extrabold text-white text-3xl mb-2">
              Página Criada com Sucesso!
            </h1>
            <p className="text-white text-lg">
              Página de{" "}
              <span className="font-bold text-pink-600">{coupleName}</span>
            </p>
          </div>

          {/* QR Code */}
          {qrCodeDataUrl && (
            <div className="bg-white/10 rounded-xl p-6 mb-6 text-center">
              <h3 className="text-white text-xl font-bold mb-4">
                QR Code para Compartilhar
              </h3>
              <img src={qrCodeDataUrl} alt="QR Code" className="mx-auto mb-4" />
              <button
                onClick={handleShareQRCode}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Baixar QR Code
              </button>
            </div>
          )}

          {/* Link da Página */}
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <p className="text-white font-bold text-sm mb-2">
              Seu link personalizado:
            </p>
            <div className="flex items-center justify-between">
              <code className="text-pink-600 text-sm font-mono break-all flex-1 mr-2">
                {pageUrl}
              </code>
              <button
                onClick={handleShareLink}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm"
              >
                Copiar
              </button>
            </div>
          </div>

          {/* URL Única da SuccessPage */}
          {uniqueSuccessUrl && (
            <div className="bg-white/10 rounded-lg p-4 mb-6">
              <p className="text-white font-bold text-sm mb-2">
                Link único para edição (compartilhável):
              </p>
              <div className="flex items-center justify-between">
                <code className="text-pink-600 text-sm font-mono break-all flex-1 mr-2">
                  {uniqueSuccessUrl}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(uniqueSuccessUrl);
                    alert("Link de edição copiado!");
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm"
                >
                  Copiar
                </button>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => window.open(pageUrl, "_blank")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              Abrir Página
            </button>
            <button
              onClick={() => setEditing(!editing)}
              className="bg-red-500 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              {editing ? "Cancelar Edição" : "Editar Página"}
            </button>
          </div>

          {/* Formulário de Edição */}
          {editing && (
            <div className="bg-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-white text-xl font-bold mb-4">
                Editar Página
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-1 block">
                    Nome do Casal
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
                    className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-1 block">
                    Mensagem do Casal
                  </label>
                  <textarea
                    value={formData.coupleMessage}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        coupleMessage: e.target.value,
                      }))
                    }
                    className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-lg text-white"
                    rows={3}
                  />
                </div>

                <div>
                  <label className=" text-white text-sm mb-1 block">
                    Link do YouTube
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
                    className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-lg text-white"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm mb-1 block">
                      Data de Início
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
                      className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm mb-1 block">
                      Hora de Início
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
                      className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                {/* Gerenciamento de Imagens */}
                <div>
                  <label className="text-white text-sm mb-1 block">
                    Imagens ({currentImages.length}/{maxImages})
                  </label>

                  {/* Imagens Atuais */}
                  {currentImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {currentImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Imagem ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Adicionar Novas Imagens */}
                  {currentImages.length < maxImages && (
                    <div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-lg text-white"
                      />
                      <p className="text-white text-xs mt-1">
                        Você pode adicionar até{" "}
                        {maxImages - currentImages.length} imagens
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                  >
                     Salvar Alterações
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 bg-red-500 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                  >
                     Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="text-center text-gray-300 text-sm">
            <p>Este link é permanente e pode ser compartilhado!</p>
            <p className="mt-1">Use o QR Code para compartilhar facilmente</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPageStandalone;
