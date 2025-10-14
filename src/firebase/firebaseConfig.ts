
import { getStorage } from "firebase/storage";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 


const firebaseConfig = {
    apiKey: "AIzaSyAjhOFJQJIRIJMtxihkmhJMPpnJdMAuoBw",
    authDomain: "eterno-aniversario-react.firebaseapp.com",
    projectId: "eterno-aniversario-react",
    storageBucket: "eterno-aniversario-react.firebasestorage.app",
    messagingSenderId: "181216533467",
    appId: "1:181216533467:web:205a280a4c10325e2265fe",
    measurementId: "G-BVH5KMGDH2",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

if (typeof window !== 'undefined' && app.name && !app.options.measurementId) {
    // getAnalytics(app); // Descomente quando estiver em produção
}

export const db = getFirestore(app);
export const storage = getStorage(app);