
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, FirebaseOptions } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDED7CZC4peXrScHDMC3DcnGg0Q3Ip873U",
  authDomain: "cardify-241a4.firebaseapp.com",
  projectId: "cardify-241a4",
  storageBucket: "cardify-241a4.appspot.com",
  messagingSenderId: "1005200195624",
  appId: "1:1005200195624:web:5a062fdf3db0516914b51d",
  measurementId: "G-LWPF6PGFT9"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage, doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs, writeBatch };

