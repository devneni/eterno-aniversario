import { collection, addDoc, setDoc, doc, getDoc } from "firebase/firestore";
import { db, storage } from "./firebaseConfig";
import { calculateRelationshipTime } from "../components/calculateRelationshipTime";
import { ref, getDownloadURL } from "firebase/storage";

function generateCustomSlug(coupleName: string): string {
  const cleanName = coupleName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const randomString = Math.random().toString(36).substring(2, 7);
  return `${cleanName}-${randomString}`;
}

// Função para fazer upload das imagens para o Firebase Storage
const uploadImagesToFirebase = async (files: File[], pageId: string): Promise<string[]> => {
  console.log("🚀 Iniciando upload de", files.length, "imagens para Firebase Storage...");
  
  if (files.length === 0) {
    console.log("⚠️ Nenhum arquivo para upload");
    return [];
  }

  const uploadPromises = files.map(async (file, index) => {
    try {
      console.log(`📤 Upload ${index + 1}/${files.length}:`, file.name);

      // Criar nome único para o arquivo
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const uniqueName = `${pageId}_${index}_${Date.now()}.${fileExtension}`;
      const imageRef = ref(storage, `love_pages/${pageId}/${uniqueName}`);

      console.log("📁 Referência do Storage:", imageRef.fullPath);

      // Fazer upload do arquivo
  

      // Obter URL de download
      const url = await getDownloadURL(imageRef);
      console.log(`🔗 URL ${index + 1}:`, url);

      return url;
    } catch (error) {
      console.error(`❌ Erro no upload ${index + 1}:`, error);
      return null;
    }
  });

  const results = await Promise.all(uploadPromises);
  const validUrls = results.filter((url) => url !== null) as string[];

  console.log("🎉 Uploads concluídos. URLs válidas:", validUrls.length);
  return validUrls;
};

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

  // Primeiro criar o documento para obter o ID
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

  // Criar documento no Firestore
  const docRef = await addDoc(collection(db, "paginas"), initialPageData);
  const pageId = docRef.id;
  console.log("📄 Página criada com ID:", pageId);

  // Fazer upload das imagens
  let imageUrls: string[] = [];
  if (files.length > 0) {
    try {
      console.log("🚀 Iniciando upload das imagens...");
      imageUrls = await uploadImagesToFirebase(files, pageId);
      console.log("✅ Uploads concluídos:", imageUrls.length);
    } catch (error) {
      console.error("❌ Erro no upload das imagens:", error);
      imageUrls = [];
    }
  }

  // Atualizar o documento com as URLs das imagens
  const updatedPageData = {
    ...initialPageData,
    imagesUrl: imageUrls,
    imageFileNames: files.map((file, index) => `image_${index}_${Date.now()}`)
  };

  await setDoc(doc(db, "paginas", pageId), updatedPageData);
  console.log("✅ Página atualizada com URLs das imagens");

  // Salvar mapeamento do slug
  const slugMapping = {
    pageId: pageId,
    coupleName: coupleName,
    createdAt: new Date(),
  };

  await setDoc(doc(db, "slug_mappings", customSlug), slugMapping);
  console.log("🗺️ Mapeamento salvo:", customSlug, "->", pageId);

  return { pageId, customSlug };
};

export const getPageBySlug = async (slug: string) => {
  try {
    console.log("🔍 Buscando página por slug:", slug);

    const mappingDoc = await getDoc(doc(db, "slug_mappings", slug));

    if (mappingDoc.exists()) {
      const mappingData = mappingDoc.data();
      const pageId = mappingData.pageId;

      console.log("✅ Mapeamento encontrado:", slug, "->", pageId);

      const pageDoc = await getDoc(doc(db, "paginas", pageId));

      if (pageDoc.exists()) {
        const pageData = { id: pageDoc.id, ...pageDoc.data() };
        console.log("✅ Página encontrada:", pageId);
        console.log("📸 URLs de imagem:", pageData.imagesUrl);
        console.log("📸 Quantidade de URLs:", pageData.imagesUrl?.length || 0);
        return pageData;
      } else {
        console.log("❌ Página não encontrada para ID:", pageId);
        return null;
      }
    } else {
      console.log("❌ Slug não encontrado:", slug);
      return null;
    }
  } catch (error) {
    console.error("❌ Erro ao buscar página por slug:", error);
    return null;
  }
};