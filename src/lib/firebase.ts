import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCsEeFUCswCFthXzyq5CRdA0Lt1YAz01ZY",
  authDomain: "masqr-3ce51.firebaseapp.com",
  projectId: "masqr-3ce51",
  storageBucket: "masqr-3ce51.firebasestorage.app",
  messagingSenderId: "1032432483289",
  appId: "1:1032432483289:web:884d4653f0647048bdf7c8",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
