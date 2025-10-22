import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { calculateRelationshipTime } from "./calculateRelationshipTime";
import { getPageBySlug } from "../firebase/firebaseService";
import { getImagesFromStorage } from "./imageStorage";

interface LovePageData {
  id?: string;
  coupleName: string;
  coupleMessage: string;
  youtubeLink: string;
  startDate: string;
  startTime: string;
  email: string;
  selectedPlan: string;
  imagesUrl?: string[] | string | null; // Mantido para compatibilidade
  imageFileNames?: string[]; // Nova propriedade para nomes dos arquivos
  customSlug?: string;
  textColor?: string;
  backgroundColor?: string;
  createdAt: {
    toDate?: () => Date;
  };
}

const SharedLovePage: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [pageData, setPageData] = useState<LovePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [manualCarousel, setManualCarousel] = useState(false);
  const [relationshipTime, setRelationshipTime] = useState<string>("");

  const processImageUrls = (
    urls: string[] | string | null | undefined,
    fileNames?: string[]
  ): string[] => {
    console.log("🔄 Processando imagens...");
    console.log("🔄 URLs recebidas:", urls);
    console.log("🔄 Nomes dos arquivos:", fileNames);

    // Se temos nomes de arquivos, usar cache
    if (fileNames && fileNames.length > 0) {
      console.log("📸 Usando sistema de cache com nomes de arquivos");
      const cachedImages = getImagesFromStorage();
      console.log("📸 Imagens em cache:", cachedImages.length);

      // Retornar as imagens do cache (assumindo que estão na mesma ordem)
      const validImages = cachedImages.filter(
        (img) => img && img.trim() !== ""
      );
      console.log("✅ Imagens válidas do cache:", validImages.length);
      return validImages;
    }

    // Fallback para o sistema antigo de URLs
    console.log("🔄 Usando sistema antigo de URLs");
    if (!urls) {
      console.log("❌ URLs é null/undefined");
      return [];
    }

    if (typeof urls === "string") {
      console.log("📝 URLs é string:", urls);
      return urls.trim() !== "" ? [urls] : [];
    }

    if (Array.isArray(urls)) {
      console.log("📋 URLs é array com", urls.length, "itens");
      console.log("📋 Conteúdo do array:", urls);

      const filtered = urls.filter((url) => {
        const isValid =
          url &&
          typeof url === "string" &&
          url.trim() !== "" &&
          (url.startsWith("http://") || url.startsWith("https://"));

        console.log("🔍 URL:", url, "é válida?", isValid);
        return isValid;
      });

      console.log("✅ URLs filtradas:", filtered);
      return filtered;
    }

    console.log("❌ URLs não é string nem array");
    return [];
  };

  const updateRelationshipTime = useCallback(() => {
    if (pageData) {
      const time = calculateRelationshipTime(
        pageData.startDate,
        pageData.startTime
      );
      setRelationshipTime(time);
    }
  }, [pageData]);

  useEffect(() => {
    const loadPageData = async () => {
      if (!pageId) {
        setError("ID da página não encontrado");
        setLoading(false);
        return;
      }

      try {
        console.log(" Buscando página:", pageId);

        let pageData = null;

        console.log(" Buscando por slug personalizado...");
        pageData = await getPageBySlug(pageId);

        if (!pageData) {
          console.log(" Buscando como ID normal...");
          const docRef = doc(db, "paginas", pageId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            pageData = { id: docSnap.id, ...docSnap.data() } as LovePageData;
          }
        }

        if (pageData) {
          const data = pageData as LovePageData;
          console.log(" Dados recebidos do Firestore:", data);
          console.log(" URLs de imagem recebidas:", data.imagesUrl);
          console.log(" Nomes dos arquivos:", data.imageFileNames);
          console.log(" Tipo das URLs:", typeof data.imagesUrl);
          console.log(" É array?", Array.isArray(data.imagesUrl));

          setPageData(data);

          const processedUrls = processImageUrls(
            data.imagesUrl,
            data.imageFileNames
          );
          console.log(" URLs processadas:", processedUrls);
          console.log(
            " Quantidade de URLs processadas:",
            processedUrls.length
          );
          setImageUrls(processedUrls);

          updateRelationshipTime();
        } else {
          console.log(" Página não encontrada no Firestore");
          setError("Página não encontrada");
        }
      } catch (err) {
        console.error(" Erro ao carregar página:", err);
        setError("Erro ao carregar a página");
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [pageId, updateRelationshipTime]);

  useEffect(() => {
    if (!pageData) return;

    const interval = setInterval(
      updateRelationshipTime,
      pageData.startTime ? 1000 : 60000
    );
    return () => clearInterval(interval);
  }, [pageData, updateRelationshipTime]);

  // Carrossel automático - só executa quando imageUrls muda
  useEffect(() => {
    console.log("🔄 Configurando carrossel de imagens...");
    console.log("📸 Total de imagens:", imageUrls.length);
    console.log("📸 URLs das imagens:", imageUrls);

    if (imageUrls.length <= 1) {
      console.log("⚠️ Menos de 2 imagens, carrossel desabilitado");
      return;
    }

    console.log("✅ Iniciando carrossel automático (3 segundos)");

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        const nextIndex = prev === imageUrls.length - 1 ? 0 : prev + 1;
        console.log(` Mudando imagem: ${prev} -> ${nextIndex}`);
        console.log(` Nova URL:`, imageUrls[nextIndex]);
        return nextIndex;
      });
    }, 7000);

    return () => {
      console.log(" Parando carrossel");
      clearInterval(interval);
    };
  }, [imageUrls]);

  useEffect(() => {
    if (imageUrls.length > 0) {
      console.log(
        ` Exibindo imagem ${currentImageIndex + 1}/${imageUrls.length}`
      );
    }
  }, [currentImageIndex, imageUrls.length]);

  useEffect(() => {
    if (imageUrls.length > 1) {
      console.log("🎠 Ativando carrossel automático");
      setManualCarousel(true);
    } else {
      setManualCarousel(false);
    }
  }, [imageUrls.length]);


  useEffect(() => {
    if (manualCarousel && imageUrls.length > 1) {
      console.log("🎠 Iniciando carrossel manual");
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => {
          const nextIndex = prev === imageUrls.length - 1 ? 0 : prev + 1;
          console.log(`🎠 Carrossel manual: ${prev} -> ${nextIndex}`);
          return nextIndex;
        });
      }, 7000);

      return () => {
        console.log("🛑 Parando carrossel manual");
        clearInterval(interval);
      };
    }
  }, [manualCarousel, imageUrls.length]);

  const nextImage = () => {
    if (imageUrls.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === imageUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (imageUrls.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? imageUrls.length - 1 : prev - 1
      );
    }
  };

  const convertYoutubeLink = (link: string): string => {
    if (!link) return "";
    try {
      const url = new URL(link);
      let videoId = "";

      if (url.hostname.includes("youtube.com")) {
        videoId = url.searchParams.get("v") || "";
      } else if (url.hostname === "youtu.be") {
        videoId = url.pathname.substring(1);
      }

      return videoId
        ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1&loop=1&playlist=${videoId}`
        : "";
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center">
        <div className="text-white text-center z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Carregando página de amor...</p>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center">
        <div className="text-white text-center z-10">
          <p className="text-xl mb-4">{error || "Página não encontrada"}</p>
          <Link
            to="/"
            className="bg-white text-pink-500 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition duration-200"
          >
            Criar minha página
          </Link>
        </div>
      </div>
    );
  }

  const youtubeEmbedUrl = convertYoutubeLink(pageData.youtubeLink);

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: `linear-gradient(135deg, ${
          pageData.backgroundColor || "#ec4899"
        }, ${pageData.backgroundColor || "#ef4444"})`,
      }}
    >
      <style>
        {`
          .fade-in {
            animation: fadeIn 0.8s ease-in;
          }
          @keyframes fadeIn {
            from { 
              opacity: 0; 
              transform: translateY(20px) scale(0.95); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0) scale(1); 
            }
          }
          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: scale(0.95);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>

      <div className="absolute top-4 left-4 z-50">
        <Link
          to="/"
          className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition duration-200 flex items-center gap-2"
        >
          <span>←</span>
          Criar sua página
        </Link>
      </div>

      <div
        className="text-center py-12 fade-in"
        style={{ color: pageData.textColor || "#ffffff" }}
      >
        <div className="mb-4">
          <img
            src="https://wallpapers.com/images/hd/minecraft-pixel-heart-icon-hojbu1gs09swfmph.png"
            alt="Coração"
            className="w-16 h-16 mx-auto mb-4 animate-pulse"
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
          {pageData.coupleName}
        </h1>
        <p className="text-xl md:text-2xl opacity-90 mb-2">Estão juntos há</p>
        <p className="text-2xl md:text-4xl font-bold bg-white/20 backdrop-blur-sm inline-block px-6 py-3 rounded-2xl">
          {relationshipTime}
        </p>
      </div>

      {/* Imagens logo abaixo do nome do casal */}
      {imageUrls.length > 0 ? (
        <div className="fade-in mx-4 md:mx-auto md:max-w-4xl mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
            <h2
              className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3"
              style={{ color: pageData.textColor || "#ffffff" }}
            >
              <span>Nossos Momentos</span>
              <span className="text-lg">
                ({imageUrls.length} foto{imageUrls.length !== 1 ? "s" : ""})
              </span>
            </h2>

            <div className="relative group">
              <div className="relative rounded-2xl overflow-hidden bg-black/10 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>

                <img
                  src={imageUrls[currentImageIndex]}
                  alt={`Momento ${currentImageIndex + 1}`}
                  className="w-full h-64 md:h-96 object-cover transition-all duration-1000 ease-in-out transform hover:scale-105"
                  style={{
                    animation: "fadeInScale 1s ease-in-out",
                  }}
                  onLoad={() => {
                    console.log(
                      `✅ Imagem ${
                        currentImageIndex + 1
                      } carregada com sucesso:`,
                      imageUrls[currentImageIndex]
                    );
                  }}
                  onError={(e) => {
                    console.error(
                      "❌ Erro ao carregar imagem:",
                      imageUrls[currentImageIndex]
                    );
                    e.currentTarget.src =
                      "https://via.placeholder.com/800x400/FF69B4/FFFFFF?text=Imagem+Não+Encontrada";
                  }}
                />

                {imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition duration-200 z-20 opacity-0 group-hover:opacity-100"
                    >
                      ←
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition duration-200 z-20 opacity-0 group-hover:opacity-100"
                    >
                      →
                    </button>

                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-3 z-20">
                      {imageUrls.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentImageIndex
                              ? "bg-white scale-125"
                              : "bg-white/50 hover:bg-white/70"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-between items-center mt-4 px-2">
                <p
                  className="text-sm"
                  style={{ color: pageData.textColor || "#ffffff" }}
                >
                  {currentImageIndex + 1} / {imageUrls.length}
                </p>
                {imageUrls.length > 1 && (
                  <div className="flex items-center gap-2 text-white/70 text-sm"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="fade-in mx-4 md:mx-auto md:max-w-2xl mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center">
            <p
              className="text-lg"
              style={{ color: pageData.textColor || "#ffffff" }}
            >
              {" "}
              Nenhuma imagem disponível
            </p>
            <p
              className="text-sm mt-2"
              style={{ color: pageData.textColor || "#ffffff", opacity: 0.7 }}
            >
              As imagens serão carregadas em breve...
            </p>
          </div>
        </div>
      )}

      <div className="fade-in">
        <div className="bg-white/20 backdrop-blur-sm mx-4 md:mx-auto md:max-w-2xl rounded-2xl p-6 md:p-8 mb-8 transform hover:scale-[1.02] transition duration-300">
          <p
            className="text-xl md:text-2xl text-center italic leading-relaxed"
            style={{ color: pageData.textColor || "#ffffff" }}
          >
            "{pageData.coupleMessage}"
          </p>
        </div>
      </div>

      {youtubeEmbedUrl && (
        <div className="fade-in mx-4 md:mx-auto md:max-w-4xl mb-12">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
            <h2
              className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3"
              style={{ color: pageData.textColor || "#ffffff" }}
            >
              <span>Nossa Música</span>
            </h2>

            <div className="bg-black/30 rounded-2xl p-4 md:p-6">
              <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-2xl bg-black">
                <iframe
                  src={youtubeEmbedUrl}
                  title="Nossa música especial"
                  className="w-full h-64 md:h-80 rounded-lg"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="text-center py-8 fade-in"
        style={{ color: pageData.textColor || "#ffffff", opacity: 0.8 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <img
            src="https://wallpapers.com/images/hd/minecraft-pixel-heart-icon-hojbu1gs09swfmph.png"
            alt="heart"
            className="w-4 h-4"
          />
          <p className="text-sm">
            Página criada com amor •{" "}
            {pageData.createdAt?.toDate
              ? new Date(pageData.createdAt.toDate()).toLocaleDateString(
                  "pt-BR"
                )
              : "Data não disponível"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedLovePage;
