import { collection, addDoc, setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { uploadImagesToFirebase } from "./uploadImagesToFirebase";
import { calculateRelationshipTime } from "../components/calculateRelationshipTime";

// 🆕 FUNÇÃO PARA GERAR SLUG PERSONALIZADO
function generateCustomSlug(coupleName: string): string {
  const cleanName = coupleName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

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
): Promise<{pageId: string, customSlug: string}> => {
 
  const folderName = `${coupleName.replace(/\s+/g, "_")}_${Date.now()}`;
  
  const imageUrls = await uploadImagesToFirebase(files, folderName);

  // Garantir que imagesUrl seja um array válido
  const processedImageUrls = Array.isArray(imageUrls) 
    ? imageUrls.filter(url => url && typeof url === 'string' && url.trim() !== '')
    : [];

  // Gerar slug personalizado
  const customSlug = generateCustomSlug(coupleName);
  console.log(' Custom Slug gerado:', customSlug);


  const docRef = await addDoc(collection(db, "paginas"), {
    coupleName,
    coupleMessage,
    youtubeLink,
    startDate,
    startTime,
    relationshipTime: calculateRelationshipTime(startDate, startTime),
    email,
    selectedPlan: selectedPlanTitle,
    imagesUrl: processedImageUrls,
    customSlug: customSlug,
    createdAt: new Date()
  });

  const pageId = docRef.id;
  console.log('Página criada com ID:', pageId);


  const slugMapping = {
    pageId: pageId,
    coupleName: coupleName,
    createdAt: new Date()
  };
  
  await setDoc(doc(db, "slug_mappings", customSlug), slugMapping);
  console.log('🗺️ Mapeamento salvo:', customSlug, '->', pageId);

  return { pageId, customSlug };
};

// 🆕 FUNÇÃO PARA BUSCAR PÁGINA POR SLUG
export const getPageBySlug = async (slug: string) => {
  try {
    console.log('🔍 Buscando página por slug:', slug);
    
    // Primeiro, buscar o mapeamento
    const mappingDoc = await getDoc(doc(db, "slug_mappings", slug));
    
    if (mappingDoc.exists()) {
      const mappingData = mappingDoc.data();
      const pageId = mappingData.pageId;
      
      console.log('✅ Mapeamento encontrado:', slug, '->', pageId);
      
      // Agora buscar a página real
      const pageDoc = await getDoc(doc(db, "paginas", pageId));
      
      if (pageDoc.exists()) {
        console.log('✅ Página encontrada:', pageId);
        return { id: pageDoc.id, ...pageDoc.data() };
      } else {
        console.log('❌ Página não encontrada para ID:', pageId);
        return null;
      }
    } else {
      console.log('❌ Slug não encontrado:', slug);
      return null;
    }
  } catch (error) {
    console.error('💥 Erro ao buscar página por slug:', error);
    return null;
  }
};