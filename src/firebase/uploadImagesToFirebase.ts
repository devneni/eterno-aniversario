import { storage } from "../firebase/firebaseConfig"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadImagesToFirebase = async (files: File[], folderName: string): Promise<string[]> => {
  const uploadPromises = files.map(async (file) => {
    const imageRef = ref(storage, `BIRTHDAY_LOVE/${folderName}/${file.name}`);
    await uploadBytes(imageRef, file);
    const url = await getDownloadURL(imageRef);
    return url;
  });

  return Promise.all(uploadPromises);
};