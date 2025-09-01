// src/services/firebase.js

// firebase init
import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  query,
  getDocs,
  collection,
  where,
  addDoc,
} from "firebase/firestore";

// env config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FB_API_KEY,
  authDomain: process.env.REACT_APP_AUTHDOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID, // ok if undefined
};

// single app instance
const app = initializeApp(firebaseConfig);

// sdk handles persistence (local) by default
const auth = getAuth(app);
const db = getFirestore(app);

// auth helpers
const googleProvider = new GoogleAuthProvider();

async function signInWithGoogle() {
  const res = await signInWithPopup(auth, googleProvider);
  const user = res.user;

  // upsert basic user doc
  const q = query(collection(db, "users"), where("uid", "==", user.uid));
  const docs = await getDocs(q);
  if (docs.empty) {
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      name: user.displayName || "",
      authProvider: "google",
      email: user.email || "",
    });
  }
}

async function logout() {
  await signOut(auth);
}

export { auth, db, signInWithGoogle, logout };
