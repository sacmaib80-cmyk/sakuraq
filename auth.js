
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

/* ── iOS sign-in ────────────────────────────────────────────────────────────
   บน iPhone/iPad ที่ "เพิ่มไปยังหน้าจอโฮม" (standalone) — signInWithPopup ใช้ไม่ได้
   เพราะ window.open ที่นั่นเด้งออกไปเป็นหน้าต่าง Safari แยก ไม่มี window.opener
   ให้ popup ส่ง credential กลับมา → ล็อกอินค้างตลอดกาล ต้องใช้ signInWithRedirect

   แต่ signInWithRedirect จะรอดจาก storage partitioning ของ Safari ได้ก็ต่อเมื่อ
   authDomain เป็น "origin เดียวกับหน้าเว็บ" (Firebase Hosting เสิร์ฟ /__/auth/handler
   ให้ทุก site ในโปรเจกต์อยู่แล้ว) — ไม่งั้น getRedirectResult จะคืน null เงียบๆ

   ⚠️ host ที่ใส่ในลิสต์นี้ได้ ต้องมี https://<host>/__/auth/handler อยู่ใน
   "Authorized redirect URIs" ของ OAuth web client ใน Google Cloud Console ด้วย
   ตอนนี้มีแค่ firebaseapp.com (ตรวจแล้ว web.app ยังตอบ redirect_uri_mismatch) */
const SELF_HOSTED_AUTH_HOSTS = [
  "sakuraq-b7f96.firebaseapp.com"
  // ,"sakuraq-b7f96.web.app"  ← ปลดคอมเมนต์บรรทัดนี้ได้ หลังเพิ่ม
  //    https://sakuraq-b7f96.web.app/__/auth/handler
  //    ใน Authorized redirect URIs ของ OAuth web client
];

/** ลิงก์ทางการของแอปบนเว็บ = host ที่ล็อกอินบน iOS ทำงานได้ */
const CANONICAL_APP_URL = "https://sakuraq-b7f96.firebaseapp.com/index.html";

function pickAuthDomain() {
  const host = (location.hostname || "").toLowerCase();
  return SELF_HOSTED_AUTH_HOSTS.includes(host) ? host : "sakuraq-b7f96.firebaseapp.com";
}

const firebaseConfig = {
  apiKey: "AIzaSyA_GnE6EKZdxem2XUHpgMuub2gPj3_PFgM",
  authDomain: pickAuthDomain(),
  projectId: "sakuraq-b7f96",
  storageBucket: "sakuraq-b7f96.firebasestorage.app",
  messagingSenderId: "1069498952404",
  appId: "1:1069498952404:web:34daf6db0244513bda6941",
  measurementId: "G-L7BZVP9WRR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" }); // บังคับแสดง account chooser ทุกครั้ง

let currentUser = null;
let googleAuthReady = false;

function isCapacitor() {
  return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
}

function isInAppBrowser() {
  if (isCapacitor()) return false;
  const ua = navigator.userAgent || "";
  return /Line|FBAN|FBAV|FB_IAB|FB4A|Instagram|TikTok|Twitter|Messenger|MicroMessenger/i.test(ua);
}

function isIOS() {
  const ua = navigator.userAgent || "";
  // iPadOS 13+ รายงานตัวเองเป็น Macintosh — แยกจาก Mac จริงด้วยจำนวนจุดสัมผัส
  return /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1);
}

function isStandalonePWA() {
  return window.navigator.standalone === true ||
    window.matchMedia?.("(display-mode: standalone)")?.matches === true ||
    window.matchMedia?.("(display-mode: fullscreen)")?.matches === true;
}

/** true = เครื่องนี้ใช้ popup ล็อกอินไม่ได้ ต้องไปทาง redirect */
function needsRedirectLogin() {
  if (isCapacitor()) return false;
  return isIOS() && isStandalonePWA();
}

/** true = authDomain เป็น origin เดียวกับหน้านี้ → signInWithRedirect ใช้ได้จริง */
function authIsSameOrigin() {
  return pickAuthDomain() === (location.hostname || "").toLowerCase();
}

/** iOS ที่ติดตั้งไว้ แต่ดันเปิดจาก host ที่ redirect login ทำงานไม่ได้ */
function iosWrongHost() {
  return needsRedirectLogin() && !authIsSameOrigin();
}

function syncAuthGate(user) {
  const gate = document.getElementById("authGate");
  if (!gate) return;

  const inApp = isInAppBrowser();
  document.body.classList.toggle("in-app-browser", inApp);

  window.sqAuthReady = true;

  if (user || inApp) {
    gate.style.setProperty("display", "none", "important");
    gate.setAttribute("aria-hidden", "true");
    return;
  }

  gate.style.setProperty("display", "flex", "important");
  gate.setAttribute("aria-hidden", "false");
  paintIosHostNotice(gate);
}

/* iOS ที่ติดตั้งจาก host ผิด: ล็อกอินยังไงก็ไม่ผ่าน — บอกตรงๆ แล้วเปลี่ยนปุ่ม
   ให้พาไป host ที่ใช้ได้ แทนที่จะปล่อยให้กดแล้วค้างเงียบๆ */
function paintIosHostNotice(gate) {
  if (!iosWrongHost()) return;

  const foot = gate.querySelector(".authFootnote");
  if (foot) {
    foot.textContent = window.t
      ? window.t("auth.iosWrongHost")
      : "เปิดจากลิงก์ทางการก่อนถึงจะล็อกอินบน iPhone ได้";
  }

  const label = gate.querySelector("#authGateLoginBtn span:not(.authGoogleIcon)");
  if (label) {
    label.textContent = window.t
      ? window.t("auth.iosOpenCanonical")
      : "เปิดลิงก์ทางการของแอป";
  }

  // ปุ่มนี้ไม่ได้พาไป Google แล้ว — เอาโลโก้ G ออกไม่ให้โกหกว่ากดแล้วจะล็อกอิน
  const gIcon = gate.querySelector("#authGateLoginBtn .authGoogleIcon");
  if (gIcon) gIcon.style.display = "none";
}

function getEls() {
  return {
    googleLoginBtn: document.getElementById("googleLoginBtn"),
    logoutBtn: document.getElementById("logoutBtn"),
    userBox: document.getElementById("userBox"),
    userPhoto: document.getElementById("userPhoto"),
    userName: document.getElementById("userName"),
    userEmail: document.getElementById("userEmail"),
    authGateLoginBtn: document.getElementById("authGateLoginBtn")
  };
}

function syncAuthToWindow() {
  window.sqAuth = {
    user: currentUser,
    uid: currentUser?.uid || null,
    email: currentUser?.email || null,
    name: currentUser?.displayName || null
  };
}

function renderSignedOut() {
  const el = getEls();
  if (el.googleLoginBtn) el.googleLoginBtn.hidden = false;
  if (el.logoutBtn) el.logoutBtn.hidden = true;
  if (el.userBox) el.userBox.hidden = true;
  if (el.userPhoto) el.userPhoto.src = "";
  if (el.userName) el.userName.textContent = "Guest";
  if (el.userEmail) el.userEmail.textContent = "";
  const sub = document.getElementById("accountSubText");
  if (sub) sub.textContent = "Continue with Google";
}

function renderSignedIn(user) {
  const el = getEls();
  if (el.googleLoginBtn) el.googleLoginBtn.hidden = true;
  if (el.logoutBtn) el.logoutBtn.hidden = false;
  if (el.userBox) el.userBox.hidden = false;
  if (el.userPhoto) el.userPhoto.src = user.photoURL || "";
  if (el.userName) el.userName.textContent = user.displayName || "No name";
  if (el.userEmail) el.userEmail.textContent = user.email || "";
  const sub = document.getElementById("accountSubText");
  if (sub) sub.textContent = user.displayName || "Logged in";
}

/* popup ตายด้วยเหตุผลเชิงสภาพแวดล้อม (ไม่ใช่ user กดปิดเอง) → ถอยไปใช้ redirect */
const POPUP_UNUSABLE = new Set([
  "auth/popup-blocked",
  "auth/operation-not-supported-in-this-environment",
  "auth/web-storage-unsupported"
]);

async function loginWithGoogle() {
  if (isInAppBrowser()) {
    alert(window.t ? window.t("auth.inAppBrowser") : "ถ้าจะล็อกอิน Google ให้เปิดใน Chrome/Safari ก่อน แต่ตอนนี้ยังใช้แบบ Guest ได้");
    return;
  }

  // iOS standalone บน host ที่ redirect ใช้ไม่ได้ → พาไป host ที่ใช้ได้ ไม่ต้องลองล็อกอินให้เสียเวลา
  if (iosWrongHost()) {
    location.href = CANONICAL_APP_URL;
    return;
  }

  try {
    await setPersistence(auth, browserLocalPersistence);

    if (isCapacitor()) {
      const GoogleAuth = window.Capacitor?.Plugins?.GoogleAuth;
      if (!GoogleAuth) throw new Error("GoogleAuth plugin not available");
      if (!googleAuthReady) {
        try {
          await GoogleAuth.initialize({
            clientId: "1069498952404-r337mi9jggc4fcf6mtfstcenp9mpie03.apps.googleusercontent.com",
            scopes: ["profile", "email"],
            grantOfflineAccess: true
          });
          googleAuthReady = true;
        } catch(initErr) {
          console.warn("GoogleAuth.initialize error (might be ok):", initErr);
        }
      }
      // เคลียร์บัญชี Google ที่ค้างก่อนเสมอ → บังคับให้หน้าจอ "เลือกบัญชี" โผล่ทุกครั้ง
      // (แก้บั๊ก: logout แล้วสลับ ID ไม่ได้ เพราะ plugin คืนบัญชีเดิมอัตโนมัติ)
      try { await GoogleAuth.signOut(); } catch (e) { /* ไม่มีบัญชีค้าง = ข้ามได้ */ }
      const googleUser = await GoogleAuth.signIn();
      const idToken = googleUser?.authentication?.idToken;
      if (!idToken) throw new Error("No idToken from Google");
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } else if (needsRedirectLogin()) {
      // หน้าจะเด้งออกไป Google แล้วกลับมาเอง — getRedirectResult() ตอนบูตเป็นคนรับผลต่อ
      await signInWithRedirect(auth, provider);
    } else {
      try {
        await signInWithPopup(auth, provider);
      } catch (popupErr) {
        if (POPUP_UNUSABLE.has(popupErr?.code) && authIsSameOrigin()) {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupErr;
      }
    }

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    if (error.code === "auth/popup-blocked") {
      alert(window.t ? window.t("auth.popupBlocked") : "Popup ถูกบล็อก กรุณาอนุญาต popup");
      return;
    }
    if (error.code === "auth/unauthorized-domain") {
      alert(window.t ? window.t("auth.unauthorizedDomain") : "Domain ไม่ได้รับอนุญาต กรุณาแจ้ง admin");
      return;
    }
    alert(window.t ? window.t("auth.loginFailed") : "Login ไม่สำเร็จ กรุณาลองใหม่");
  }
}

let _loggingOut = false;
async function logoutNow() {
  if (_loggingOut) return;          // กัน double-fire → กัน native crash จาก GoogleAuth.signOut ซ้อน
  _loggingOut = true;

  const btn = document.getElementById("logoutBtn");
  if (btn) btn.disabled = true;

  try {
    // Firebase signOut ก่อนเสมอ — สำคัญสุดและไม่ทำให้แอพ crash
    // (ทำก่อน GoogleAuth.signOut เผื่อ native call มีปัญหา อย่างน้อย session ฝั่ง Firebase ก็หลุดแล้ว)
    await signOut(auth);

    // เคลียร์ native Google session (best-effort) — ต้อง initialize ก่อน
    // ไม่งั้นเรียก signOut บน plugin ที่ยังไม่ init จะ crash ระดับ native (catch ใน JS ไม่ได้)
    if (isCapacitor()) {
      const GoogleAuth = window.Capacitor?.Plugins?.GoogleAuth;
      if (GoogleAuth) {
        try {
          if (!googleAuthReady) {
            await GoogleAuth.initialize({
              clientId: "1069498952404-r337mi9jggc4fcf6mtfstcenp9mpie03.apps.googleusercontent.com",
              scopes: ["profile", "email"],
              grantOfflineAccess: true
            });
            googleAuthReady = true;
          }
          await GoogleAuth.signOut();
        } catch (e) {
          console.warn("GoogleAuth.signOut skipped:", e);
        }
        googleAuthReady = false;
      }
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    _loggingOut = false;
    if (btn) btn.disabled = false;
  }
}

window.loginWithGoogle = loginWithGoogle;
window.logoutNow = logoutNow;

// ให้ Firestore bridge ใน index.html ใช้ค่าเดียวกันได้ (config ต่างกัน = initializeApp โยน duplicate-app)
window.sqAuthDomain = firebaseConfig.authDomain;
window.sqCanonicalAppUrl = CANONICAL_APP_URL;
window.sqNeedsRedirectLogin = needsRedirectLogin();

// รับผลของ signInWithRedirect ที่เพิ่งกลับมาจาก Google (เส้นทางของ iOS standalone)
(async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    await getRedirectResult(auth);
  } catch (err) {
    console.error("REDIRECT LOGIN ERROR:", err);
  }
})();

onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
  syncAuthToWindow();
  document.body.classList.toggle("is-guest", !user);
  document.body.classList.toggle("is-authed", !!user);
  if (user) {
    renderSignedIn(user);
  } else {
    renderSignedOut();
  }
  syncAuthGate(user);
  window.dispatchEvent(new CustomEvent("sq-auth-changed", { detail: window.sqAuth }));
  window.dispatchEvent(new Event("sq-user-changed"));
});

document.addEventListener("click", (e) => {
  if (e.target.closest("#authGateLoginBtn, #googleLoginBtn")) {
    e.preventDefault();
    loginWithGoogle();
    return;
  }
  if (e.target.closest("#logoutBtn")) {
    e.preventDefault();
    logoutNow();
  }
});
