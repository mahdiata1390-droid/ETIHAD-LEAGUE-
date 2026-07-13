import {
  onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { auth, db, ADMIN_UID } from "./firebase-config.js";

// وضعیت سراسری ورود کاربر
export const authState = {
  user: null,
  role: null, // "admin" | "player" | null
  playerId: null,
  loading: true,
  listeners: []
};

export function onAuthChange(cb) {
  authState.listeners.push(cb);
  return () => {
    authState.listeners = authState.listeners.filter((l) => l !== cb);
  };
}

function notify() {
  authState.listeners.forEach((cb) => cb(authState));
}

onAuthStateChanged(auth, async (user) => {
  authState.user = user;

  if (!user) {
    authState.role = null;
    authState.playerId = null;
    authState.loading = false;
    notify();
    return;
  }

  if (ADMIN_UID && user.uid === ADMIN_UID) {
    authState.role = "admin";
    authState.playerId = null;
    authState.loading = false;
    notify();
    return;
  }

  try {
    const snap = await getDoc(doc(db, "playerLinks", user.uid));
    if (snap.exists()) {
      authState.role = "player";
      authState.playerId = snap.data().playerId;
    } else {
      authState.role = null;
      authState.playerId = null;
    }
  } catch {
    authState.role = null;
    authState.playerId = null;
  }
  authState.loading = false;
  notify();
});

export async function login(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  await signOut(auth);
}
