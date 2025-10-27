import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { calculateRelationshipTime } from "./calculateRelationshipTime";
import { useLanguage } from "./useLanguage";

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
  textColor?: string;
  backgroundColor?: string;
  createdAt?: { toDate?: () => Date } | any;
}

const RelationshipDetailsPage: React.FC = () => {
  const { language } = useLanguage();
  const { docId } = useParams<{ docId: string }>();

  const [pageData, setPageData] = useState<LovePageData | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [relationshipTime, setRelationshipTime] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const processImageUrls = (urls: string[] | string | null | undefined): string[] => {
    if (urls && Array.isArray(urls)) {
      return urls.filter((u) => typeof u === "string" && u.startsWith("https://"));
    }
    return [];
  };

  const updateRelationshipTime = useCallback(() => {
    if (pageData) {
      const time = calculateRelationshipTime(pageData.startDate, pageData.startTime, language);
      setRelationshipTime(time);
    }
  }, [pageData, language]);

  useEffect(() => {
    const load = async () => {
      if (!docId) {
        setError(language === "pt" ? "ID do documento não encontrado" : "Document ID not found");
        setLoading(false);
        return;
      }
      try {
        const ref = doc(db, "BIRTHDAY_LOVE", docId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as LovePageData;
          setPageData(data);
          setImageUrls(processImageUrls(data.imagesUrl));
          updateRelationshipTime();
        } else {
          setError(language === "pt" ? "Documento não encontrado" : "Document not found");
        }
      } catch (e) {
        setError(language === "pt" ? "Erro ao carregar" : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [docId, language, updateRelationshipTime]);

  useEffect(() => {
    if (!pageData) return;
    const interval = setInterval(updateRelationshipTime, pageData.startTime ? 1000 : 60000);
    return () => clearInterval(interval);
  }, [pageData, updateRelationshipTime]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center">
        <div className="text-white text-center z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">{language === "pt" ? "Carregando..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center">
        <div className="text-white text-center z-10">
          <p className="text-xl mb-4">{error || (language === "pt" ? "Página não encontrada" : "Page not found")}</p>
          <Link to="/" className="bg-white text-pink-500 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition duration-200">
            {language === "pt" ? "Criar minha página" : "Create my page"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: pageData.backgroundColor || "#ec4899" }}>
      <div className="text-center py-12" style={{ color: pageData.textColor || "#ffffff" }}>
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{pageData.coupleName}</h1>
        <p className="text-xl md:text-2xl opacity-90 mb-2">{language === 'pt' ? "Estão juntos há" : "Together for"}</p>
        <p className="text-2xl md:text-4xl font-bold bg-white/20 backdrop-blur-sm inline-block px-6 py-3 rounded-2xl">
          {relationshipTime}
        </p>
      </div>

      {imageUrls.length > 0 ? (
        <div className="mx-4 md:mx-auto md:max-w-4xl mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
            <h2 className="text-3xl font-bold text-center mb-8" style={{ color: pageData.textColor || "#ffffff" }}>
              {language === 'pt' ? "Nossos Momentos" : "Our Moments"} ({imageUrls.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imageUrls.map((src, idx) => (
                <img key={idx} src={src} alt={`img-${idx}`} className="w-full h-64 object-cover rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-4 md:mx-auto md:max-w-2xl mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center">
            <p className="text-lg" style={{ color: pageData.textColor || "#ffffff" }}>
              {language === 'pt' ? "Nenhuma imagem disponível" : "No images available"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelationshipDetailsPage;
