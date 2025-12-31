"use client";

import { initializeApp, getApps } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

function getFirebaseConfig() {
  const cfg = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const allPresent = Object.values(cfg).every((v) => !!v);
  if (!allPresent) {
    throw new Error("Firebase Storage is not configured yet");
  }
  return cfg as Required<typeof cfg>;
}

export function getFirebaseApp() {
  const config = getFirebaseConfig();
  const existing = getApps();
  return existing.length ? existing[0] : initializeApp(config);
}

export async function uploadImage(file: File) {
  const app = getFirebaseApp();
  const storage = getStorage(app);
  const objectRef = ref(storage, `products/${Date.now()}-${file.name}`);
  await uploadBytes(objectRef, file);
  const url = await getDownloadURL(objectRef);
  return url;
}
