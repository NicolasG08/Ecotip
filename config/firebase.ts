import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
// @ts-ignore - getReactNativePersistence exists in the React Native bundle
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDcOJZAVnYMQfXGTg2Hh5Iv_4Gsdq5ZmXc",
    authDomain: "ecotip-17eed.firebaseapp.com",
    projectId: "ecotip-17eed",
    storageBucket: "ecotip-17eed.firebasestorage.app",
    messagingSenderId: "723789085904",
    appId: "1:723789085904:web:4e4e32d2fda73b3079b2d5",
    measurementId: "G-MY23WPG2XW"
};

// Inicializar la app de Firebase solo si no ha sido inicializada antes
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializar Auth con persistencia en AsyncStorage
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Inicializar Firestore (sin caché persistente - no soportado en React Native)
const db = getFirestore(app);

// Inicializar Storage
const storage = getStorage(app);

export { app, auth, db, storage };

