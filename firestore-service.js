import {
  collection, doc, addDoc, updateDoc, deleteDoc, setDoc,
  getDoc, getDocs, query, where, orderBy, onSnapshot, runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";
import { db, storage } from "./firebase-config.js";

// ---------- آپلود تصویر ----------
export async function uploadImage(file, path) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteImage(path) {
  try { await deleteObject(ref(storage, path)); } catch (e) { /* فایل وجود نداشت */ }
}

// ---------- تیم‌ها ----------
export function listenTeams(cb) {
  const q = query(collection(db, "teams"), orderBy("name"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function getTeam(id) {
  const snap = await getDoc(doc(db, "teams", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createTeam(data) {
  return addDoc(collection(db, "teams"), { ...data, createdAt: Date.now() });
}
export async function updateTeam(id, data) {
  return updateDoc(doc(db, "teams", id), data);
}
export async function deleteTeam(id) {
  return deleteDoc(doc(db, "teams", id));
}

// ---------- بازیکنان ----------
export function listenPlayers(cb, teamId) {
  const base = collection(db, "players");
  const q = teamId ? query(base, where("teamId", "==", teamId)) : query(base, orderBy("name"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function getPlayer(id) {
  const snap = await getDoc(doc(db, "players", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

const emptyStats = { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 };

export async function createPlayer(data) {
  return addDoc(collection(db, "players"), { ...data, stats: emptyStats, createdAt: Date.now() });
}
export async function updatePlayer(id, data) {
  return updateDoc(doc(db, "players", id), data);
}
export async function deletePlayer(id) {
  return deleteDoc(doc(db, "players", id));
}

// ---------- اتصال حساب بازیکن ----------
// چون Firebase از سمت کلاینت اجازه‌ی ساخت حساب برای شخص دیگر را نمی‌دهد،
// مدیر ابتدا در Firebase Console یک حساب Email/Password برای بازیکن می‌سازد
// و سپس UID آن را اینجا به پروفایل بازیکن متصل می‌کند.
export async function linkPlayerAccount(authUid, playerId) {
  await setDoc(doc(db, "playerLinks", authUid), { playerId });
  await updateDoc(doc(db, "players", playerId), { authUid });
}
export async function unlinkPlayerAccount(authUid, playerId) {
  await deleteDoc(doc(db, "playerLinks", authUid));
  await updateDoc(doc(db, "players", playerId), { authUid: null });
}
export async function getPlayerLink(authUid) {
  const snap = await getDoc(doc(db, "playerLinks", authUid));
  return snap.exists() ? snap.data() : null;
}

// ---------- مسابقات ----------
export function listenMatches(cb) {
  const q = query(collection(db, "matches"), orderBy("date", "desc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function getMatch(id) {
  const snap = await getDoc(doc(db, "matches", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createMatch(data) {
  return addDoc(collection(db, "matches"), {
    ...data, status: "scheduled", goals: [], cards: [], lineup: [], createdAt: Date.now()
  });
}
export async function updateMatchSchedule(id, data) {
  return updateDoc(doc(db, "matches", id), data);
}
export async function deleteMatch(id) {
  return deleteDoc(doc(db, "matches", id));
}

/**
 * ثبت/ویرایش نتیجه‌ی مسابقه به همراه گلزنان، پاس‌گل، کارت‌ها، ترکیب تیم و بهترین بازیکن.
 * آمار بازیکنان (گل، پاس گل، کارت، تعداد بازی) در یک تراکنش به‌روزرسانی می‌شود.
 * جدول لیگ نیازی به ذخیره‌سازی جداگانه ندارد؛ همیشه زنده از روی matches محاسبه می‌شود.
 */
export async function submitMatchResult(matchId, result) {
  await runTransaction(db, async (tx) => {
    const matchRef = doc(db, "matches", matchId);
    const matchSnap = await tx.get(matchRef);
    if (!matchSnap.exists()) throw new Error("مسابقه یافت نشد");
    const prevMatch = matchSnap.data();
    const wasFinished = prevMatch.status === "finished";

    const involved = new Set();
    (prevMatch.goals || []).forEach((g) => { involved.add(g.playerId); if (g.assistPlayerId) involved.add(g.assistPlayerId); });
    (prevMatch.cards || []).forEach((c) => involved.add(c.playerId));
    (prevMatch.lineup || []).forEach((pid) => involved.add(pid));
    (result.goals || []).forEach((g) => { involved.add(g.playerId); if (g.assistPlayerId) involved.add(g.assistPlayerId); });
    (result.cards || []).forEach((c) => involved.add(c.playerId));
    (result.lineup || []).forEach((pid) => involved.add(pid));

    const playerRefs = new Map();
    involved.forEach((pid) => playerRefs.set(pid, doc(db, "players", pid)));
    const playerData = new Map();
    for (const [pid, r] of playerRefs) {
      const s = await tx.get(r);
      if (s.exists()) playerData.set(pid, s.data());
    }

    if (wasFinished) {
      (prevMatch.goals || []).forEach((g) => {
        const p = playerData.get(g.playerId);
        if (p) p.stats.goals = Math.max(0, (p.stats.goals || 0) - 1);
        if (g.assistPlayerId) {
          const a = playerData.get(g.assistPlayerId);
          if (a) a.stats.assists = Math.max(0, (a.stats.assists || 0) - 1);
        }
      });
      (prevMatch.cards || []).forEach((c) => {
        const p = playerData.get(c.playerId);
        if (p) {
          if (c.type === "yellow") p.stats.yellowCards = Math.max(0, (p.stats.yellowCards || 0) - 1);
          else p.stats.redCards = Math.max(0, (p.stats.redCards || 0) - 1);
        }
      });
      (prevMatch.lineup || []).forEach((pid) => {
        const p = playerData.get(pid);
        if (p) p.stats.matches = Math.max(0, (p.stats.matches || 0) - 1);
      });
    }

    (result.goals || []).forEach((g) => {
      const p = playerData.get(g.playerId);
      if (p) p.stats.goals = (p.stats.goals || 0) + 1;
      if (g.assistPlayerId) {
        const a = playerData.get(g.assistPlayerId);
        if (a) a.stats.assists = (a.stats.assists || 0) + 1;
      }
    });
    (result.cards || []).forEach((c) => {
      const p = playerData.get(c.playerId);
      if (p) {
        if (c.type === "yellow") p.stats.yellowCards = (p.stats.yellowCards || 0) + 1;
        else p.stats.redCards = (p.stats.redCards || 0) + 1;
      }
    });
    (result.lineup || []).forEach((pid) => {
      const p = playerData.get(pid);
      if (p) p.stats.matches = (p.stats.matches || 0) + 1;
    });

    for (const [pid, r] of playerRefs) {
      const data = playerData.get(pid);
      if (data) tx.update(r, { stats: data.stats });
    }

    tx.update(matchRef, {
      status: "finished",
      homeScore: result.homeScore,
      awayScore: result.awayScore,
      goals: result.goals || [],
      cards: result.cards || [],
      lineup: result.lineup || [],
      manOfTheMatchId: result.manOfTheMatchId || null,
      manOfTheMatchName: result.manOfTheMatchName || null
    });
  });
}

// ---------- اخبار ----------
export function listenNews(cb) {
  const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}
export async function createNews(data) {
  return addDoc(collection(db, "news"), { ...data, createdAt: Date.now() });
}
export async function deleteNews(id) {
  return deleteDoc(doc(db, "news", id));
}
