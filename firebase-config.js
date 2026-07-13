// اتصال به Firebase از طریق CDN (بدون نیاز به npm/build)
// مقادیر زیر را از Firebase Console > Project Settings > General کپی کنید.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// UID حساب مدیر لیگ (از Firebase Console > Authentication > Users کپی کنید)
// هیچ‌جای رابط کاربری این مقدار یا اطلاعات مدیر نمایش داده نمی‌شود.
export const ADMIN_UID = "YOUR_ADMIN_UID";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
