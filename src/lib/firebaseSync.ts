import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged
} from "firebase/auth";
import type { User } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig";

type FirebaseState = {
  ready: boolean;
  signedIn: boolean;
  email?: string;
  uid?: string;
};

type PushOptions = {
  force?: boolean;
};

const KEY_LAST_REMOTE_VERSION = "firebase:lastRemoteVersion";
const COLLECTION = "lifeweeks";
const DOC_ID = "state";

let appInited = false;
let state: FirebaseState = { ready: false, signedIn: false };
let unsubAuth: (() => void) | null = null;

function initApp() {
  if (!appInited) {
    if (!getApps().length) initializeApp(firebaseConfig);
    appInited = true;
  }
}

export function getFirebaseState(): FirebaseState {
  return { ...state };
}

export async function initFirebaseSync() {
  initApp();
  const auth = getAuth();
  const db = getFirestore();

  if (unsubAuth) unsubAuth();
  unsubAuth = onAuthStateChanged(auth, async (user) => {
    if (user) {
      state = { ready: true, signedIn: true, email: user.email || undefined, uid: user.uid };
      await ensureDoc(user);
    } else {
      state = { ready: true, signedIn: false };
    }
  });

  state.ready = true;
  void db;
}

export async function signInFirebase() {
  initApp();
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const res = await signInWithPopup(auth, provider);
  const user = res.user;
  state = { ready: true, signedIn: true, email: user.email || undefined, uid: user.uid };
  await ensureDoc(user);
}

export async function signOutFirebase() {
  initApp();
  const auth = getAuth();
  await fbSignOut(auth);
  state = { ready: true, signedIn: false };
}

async function ensureDoc(user: User) {
  const db = getFirestore();
  const ref = doc(db, "users", user.uid, COLLECTION, DOC_ID);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const body = { version: 0, updatedAt: Date.now(), payload: {} };
    await setDoc(ref, body, { merge: true });
    localStorage.setItem(KEY_LAST_REMOTE_VERSION, "0");
  }
}

export async function readRemote(): Promise<{ version: number; updatedAt: number; payload: any } | null> {
  initApp();
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;
  const db = getFirestore();
  const ref = doc(db, "users", user.uid, COLLECTION, DOC_ID);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as any;
}

function nowVersion() {
  return Date.now();
}

function deepMergeUnique(a: any, b: any) {
  if (Array.isArray(a) && Array.isArray(b)) {
    const seen = new Set<string>();
    const out: any[] = [];
    for (const it of [...a, ...b]) {
      const key = JSON.stringify(it);
      if (!seen.has(key)) {
        seen.add(key);
        out.push(it);
      }
    }
    return out;
  }
  if (typeof a === "object" && typeof b === "object" && a && b) {
    const out: any = { ...a };
    for (const k of Object.keys(b)) {
      if (k in out) out[k] = deepMergeUnique(out[k], (b as any)[k]);
      else out[k] = (b as any)[k];
    }
    return out;
  }
  return b ?? a;
}

export async function pullAndMerge(getLocal: () => string, applyMerged: (json: string) => void) {
  initApp();
  const remote = await readRemote();
  if (!remote) return { ok: false, reason: "no-remote" as const };

  const localStr = getLocal();
  let local: any = {};
  try {
    local = JSON.parse(localStr || "{}");
  } catch {
    local = {};
  }

  const merged = deepMergeUnique(remote.payload || {}, local || {});
  applyMerged(JSON.stringify(merged));
  localStorage.setItem(KEY_LAST_REMOTE_VERSION, String(remote.version || 0));
  return { ok: true, merged: true };
}

export async function pushSnapshot(getLocal: () => string, opts: PushOptions = {}) {
  initApp();
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return { ok: false, reason: "not-signed-in" as const };

  const db = getFirestore();
  const ref = doc(db, "users", user.uid, COLLECTION, DOC_ID);

  const current = await readRemote();
  const lastRemote = Number(localStorage.getItem(KEY_LAST_REMOTE_VERSION) || "0");
  const conflict = current && lastRemote && current.version !== lastRemote && !opts.force;
  if (conflict) return { ok: false, reason: "conflict" as const };

  const localStr = getLocal() || "{}";
  let payload: any = {};
  try {
    payload = JSON.parse(localStr);
  } catch {
    payload = {};
  }

  const body = { version: nowVersion(), updatedAt: Date.now(), payload };
  await setDoc(ref, body, { merge: false });
  localStorage.setItem(KEY_LAST_REMOTE_VERSION, String(body.version));
  return { ok: true };
}

export async function resetFromRemote(applyRemote: (json: string) => void) {
  initApp();
  const remote = await readRemote();
  if (!remote) return { ok: false, reason: "no-remote" as const };
  applyRemote(JSON.stringify(remote.payload || {}));
  localStorage.setItem(KEY_LAST_REMOTE_VERSION, String(remote.version || 0));
  return { ok: true };
}
