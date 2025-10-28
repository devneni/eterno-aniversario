import { setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { calculateRelationshipTime } from "../components/calculateRelationshipTime";
import { uploadImagesToFirebase } from "./uploadImagesToFirebase";

function generateCustomSlug(coupleName: string): string {
  // Normalize and keep letters, numbers and spaces
  const normalized = coupleName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const parts = normalized.split(" ").filter(Boolean);
  const first = (parts[0] || "love").replace(/[^a-z0-9]/g, "");
  const last = (parts[parts.length - 1] || first).replace(/[^a-z0-9]/g, "");

  const left = first || "love";
  const right = last || left;

  // 6 lowercase alphanumeric random chars
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let rand = "";
  for (let i = 0; i < 6; i++) rand += chars[Math.floor(Math.random() * chars.length)];

  // Format: first__last_rand6
  return `${left}__${right}_${rand}`;
}

export const createLovePage = async (
  coupleName: string,
  coupleMessage: string,
  youtubeLink: string,
  startDate: string,
  startTime: string,
  email: string,
  selectedPlanTitle: string,
  files: File[],
  textColor: string = "#ffffff",
  backgroundColor: string = "#ec4899"
): Promise<{ pageId: string; customSlug: string }> => {
  console.log("🔥 createLovePage INICIADO");
  console.log("📸 Arquivos recebidos:", files.length);

  // Gerar o ID/slug personalizado para ser o ID do documento
  const customSlug = generateCustomSlug(coupleName);
  console.log("🔗 Custom Slug gerado:", customSlug);

  const initialPageData = {
    coupleName,
    coupleMessage,
    youtubeLink,
    startDate,
    startTime,
    relationshipTime: calculateRelationshipTime(startDate, startTime),
    email,
    selectedPlan: selectedPlanTitle,
    customSlug: customSlug,
    textColor,
    backgroundColor,
    createdAt: new Date(),
    imagesUrl: [], // Inicialmente vazio
    imageFileNames: [], // Inicialmente vazio
  };

  // Criar documento no Firestore usando o customSlug como ID
  const pageId = customSlug;
  await setDoc(doc(db, "BIRTHDAY_LOVE", pageId), initialPageData);
  console.log("📄 Página criada com ID (slug):", pageId);

  // Disparar uploads de forma assíncrona (não bloquear retorno)
  ;(async () => {
    if (files.length === 0) {
      console.log("ℹ️ Sem imagens para upload, mantendo documento inicial");
      return;
    }
    try {
      console.log("🚀 Iniciando upload das imagens (assíncrono)...");
      const imageUrls = await uploadImagesToFirebase(files, pageId);
      console.log("✅ Uploads concluídos:", imageUrls.length);

      const updatedPageData = {
        ...initialPageData,
        imagesUrl: imageUrls,
        imageFileNames: files.map((_file, index) => `image_${index}_${Date.now()}`)
      };
      await setDoc(doc(db, "BIRTHDAY_LOVE", pageId), updatedPageData);
      console.log("✅ Página atualizada com URLs das imagens (async)");
    } catch (error) {
      console.error("❌ Erro no upload/atualização assíncrona:", error);
    }
  })();

  // (Opcional) manter mapeamento para compat, mas não é necessário quando ID = slug
  try {
    const slugMapping = {
      pageId: pageId,
      coupleName: coupleName,
      createdAt: new Date(),
    };
    await setDoc(doc(db, "slug_mappings", pageId), slugMapping);
  } catch {}
  
  return { pageId, customSlug };
};

export const getPageBySlug = async (slug: string) => {
  try {
    console.log("🔍 Buscando página por slug:", slug);

    // Primeiro: tentar ler diretamente o documento pelo ID = slug
    const directDoc = await getDoc(doc(db, "BIRTHDAY_LOVE", slug));
    if (directDoc.exists()) {
      const pageData = { id: directDoc.id, ...directDoc.data() } as any;
      console.log("✅ Página encontrada diretamente por ID:", slug);
      return pageData;
    }

    // Fallback: tentar achar mapeamento antigo
    const mappingDoc = await getDoc(doc(db, "slug_mappings", slug));
    if (mappingDoc.exists()) {
      const mappingData = mappingDoc.data();
      const pageId = (mappingData as any).pageId;
      console.log("✅ Mapeamento encontrado:", slug, "->", pageId);
      const pageDoc = await getDoc(doc(db, "BIRTHDAY_LOVE", pageId));
      if (pageDoc.exists()) {
        const pageData = { id: pageDoc.id, ...pageDoc.data() } as any;
        console.log("✅ Página encontrada via mapping:", pageId);
        return pageData;
      }
    }
    console.log("❌ Slug/ID não encontrado:", slug);
    return null;
  } catch (error) {
    console.error("❌ Erro ao buscar página por slug:", error);
    return null;
  }
};