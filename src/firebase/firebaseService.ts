import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { uploadImagesToFirebase } from "./uploadImagesToFirebase";
import { calculateRelationshipTime } from "../components/calculateRelationshipTime";

export const createLovePage = async (
  coupleName: string,
  coupleMessage: string,
  youtubeLink: string,
  startDate: string,
  startTime: string,
  email: string,
  selectedPlanTitle: string,
  files: File[]
): Promise<string> => {
 
  const folderName = `${coupleName.replace(/\s+/g, "_")}_${Date.now()}`;
  
  
  const imageUrls = await uploadImagesToFirebase(files, folderName);


  const docRef = await addDoc(collection(db, "paginas"), {
    coupleName,
    coupleMessage,
    youtubeLink,
    startDate,
    startTime,
    relationshipTime: calculateRelationshipTime(startDate, startTime),
    email,
    selectedPlan: selectedPlanTitle,
    imagesUrl: imageUrls,
    createdAt: new Date()
  });

  return docRef.id;
};
