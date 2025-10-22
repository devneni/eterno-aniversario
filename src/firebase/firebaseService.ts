import { collection, addDoc, setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { calculateRelationshipTime } from "../components/calculateRelationshipTime";
import {
  getImagesFromStorage,
  convertFilesToDataUrls,
  saveImagesToStorage,
} from "../components/imageStorage";

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

export const createLovePage = async (
  coupleName: string,
  coupleMessage: string,
  youtubeLink: string,
  startDate: string,
  startTime: string,
  email: string,
  selectedPlanTitle: string,
  files: File[]
): Promise<{ pageId: string; customSlug: string }> => {
  console.log("🔥 createLovePage INICIADO");
  console.log("📸 Arquivos recebidos:", files.length);
  console.log(
    "📸 Detalhes dos arquivos:",
    files.map((f) => ({ name: f.name, size: f.size, type: f.type }))
  );

  // Salvar nomes dos arquivos em cache
  const fileNames = files.map((file, index) => {
    const uniqueName = `${Date.now()}_${index}_${file.name}`;
    return uniqueName;
  });

  console.log("📸 Nomes dos arquivos para cache:", fileNames);

  // Salvar arquivos em cache (localStorage)
  try {
    const dataUrls = await convertFilesToDataUrls(files);
    saveImagesToStorage(dataUrls);
    console.log("✅ Imagens salvas em cache");
  } catch (error) {
    console.error("❌ Erro ao salvar imagens em cache:", error);
  }

  // Salvar lista de nomes dos arquivos
  localStorage.setItem("imageFileNames", JSON.stringify(fileNames));
  console.log("📝 Lista de nomes salva:", fileNames);

  const customSlug = generateCustomSlug(coupleName);
  console.log(" Custom Slug gerado:", customSlug);

  const pageData = {
    coupleName,
    coupleMessage,
    youtubeLink,
    startDate,
    startTime,
    relationshipTime: calculateRelationshipTime(startDate, startTime),
    email,
    selectedPlan: selectedPlanTitle,
    imageFileNames: fileNames, // Salvar nomes dos arquivos em vez de URLs
    customSlug: customSlug,
    createdAt: new Date(),
  };

  console.log("💾 Dados da página a serem salvos:", pageData);
  console.log("📸 Nomes dos arquivos que serão salvos:", fileNames);

  const docRef = await addDoc(collection(db, "paginas"), pageData);

  const pageId = docRef.id;
  console.log("Página criada com ID:", pageId);

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
        console.log("📸 URLs de imagem na página:", pageData.imagesUrl);
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
