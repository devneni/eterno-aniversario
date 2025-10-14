// Importa os módulos necessários
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // 👈 Import Firestore
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAjhOFJQJIRIJMtxihkmhJMPpnJdMAuoBw",
  authDomain: "eterno-aniversario-react.firebaseapp.com",
  projectId: "eterno-aniversario-react",
  storageBucket: "eterno-aniversario-react.firebasestorage.app",
  messagingSenderId: "181216533467",
  appId: "1:181216533467:web:205a280a4c10325e2265fe",
  measurementId: "G-BVH5KMGDH2",
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Analytics (opcional)
getAnalytics(app);

// 👇 Inicializa e exporta o Firestore
export const db = getFirestore(app);
