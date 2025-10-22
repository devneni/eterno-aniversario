import { storage } from "../firebase/firebaseConfig"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadImagesToFirebase = async (files: File[], folderName: string): Promise<string[]> => {
  console.log('🔥 Iniciando upload de', files.length, 'imagens...');
  
  const uploadPromises = files.map(async (file, index) => {
    try {
      console.log(`📤 Upload ${index + 1}/${files.length}:`, file.name);
      
      // ✅ CORRIGIDO: Nome único para evitar conflitos
      const uniqueName = `${Date.now()}_${index}_${file.name}`;
      const imageRef = ref(storage, `BIRTHDAY_LOVE/${folderName}/${uniqueName}`);
      
      console.log('📁 Referência:', imageRef.fullPath);
      
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      
      console.log(`✅ Upload ${index + 1} concluído:`, url);
      return url;
    } catch (error) {
      console.error(`❌ Erro no upload ${index + 1}:`, error);
      return null;
    }
  });

  const results = await Promise.all(uploadPromises);

  const validUrls = results.filter(url => url !== null) as string[];
  
  console.log('🎉 Uploads concluídos. URLs válidas:', validUrls.length);
  console.log('📸 URLs:', validUrls);
  
  return validUrls;
};