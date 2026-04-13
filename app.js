/* ================= FIREBASE ================= */
const firebaseConfig = {
  apiKey: "AIzaSyB3upec-8eK9T5u05lFUFACBz3SReTyH58",
  authDomain: "furry-tweaks.firebaseapp.com",
  projectId: "furry-tweaks",
  storageBucket: "furry-tweaks.firebasestorage.app",
  messagingSenderId: "427628729593",
  appId: "1:427628729593:web:96ca9f7eb0e003c9957e28",
  measurementId: "G-1P6N7STLRK"
};

/* SAFE INIT */
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const statsRef = db.collection("stats").doc("global");

/* ================= PERSIST LOGIN ================= */
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

/* ================= DOWNLOAD COUNTER ================= */
statsRef.onSnapshot((doc) => {
  const el = document.getElementById("downloads");
  if (el && doc.exists) el.innerText = doc.data().downloads;
});

function downloadTweaker() {
  statsRef.get().then((doc) => {
    if (doc.exists) {
      statsRef.update({ downloads: doc.data().downloads + 1 });
    } else {
      statsRef.set({ downloads: 1 });
    }
  });
}

/* ================= HOME ================= */
function goHome() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =================================================
   🔥 AUTH UI (GLOBAL FIX FOR ALL PAGES)
================================================= */

function refreshAuthUI(user = auth.currentUser) {

  const loginBtn = document.getElementById("loginBtn");
  const wrapper = document.getElementById("userWrapper");
  const avatar = document.getElementById("userAvatar");

  if (!loginBtn || !wrapper || !avatar) return;

  if (user) {
    loginBtn.style.display = "none";
    wrapper.style.display = "flex";
    avatar.src = user.photoURL || "/assets/images/default-avatar.png";
  } else {
    loginBtn.style.display = "inline-block";
    wrapper.style.display = "none";
  }
}

window.refreshAuthUI = refreshAuthUI;

/* Firebase auth listener */
auth.onAuthStateChanged((user) => {
  refreshAuthUI(user);
});

/* =================================================
   🔥 USER MODAL (PROFILE POPUP)
================================================= */

window.openUserMenu = function (e) {
  const modal = document.getElementById("userModal");
  const avatar = document.getElementById("userAvatar");
  const modalAvatar = document.getElementById("modalAvatar");

  if (modal) modal.style.display = "flex";
  if (avatar && modalAvatar) modalAvatar.src = avatar.src;

  createRipple(e);
};

window.closeUserMenu = function () {
  const modal = document.getElementById("userModal");
  if (modal) modal.style.display = "none";
};

document.addEventListener("click", (e) => {
  const modal = document.getElementById("userModal");
  const box = document.querySelector(".user-box");
  const avatar = document.getElementById("userAvatar");

  if (!modal || !box || !avatar) return;

  if (modal.style.display === "flex") {
    if (!box.contains(e.target) && e.target !== avatar) {
      modal.style.display = "none";
    }
  }
});

/* ================= RIPPLE ================= */
function createRipple(e) {
  if (!e) return;

  const ripple = document.createElement("span");
  ripple.className = "ripple";
  document.body.appendChild(ripple);

  ripple.style.left = e.clientX + "px";
  ripple.style.top = e.clientY + "px";

  setTimeout(() => ripple.remove(), 600);
}

/* =================================================
   🔥 LOGOUT SYSTEM
================================================= */

window.logout = function () {
  const modal = document.getElementById("logoutModal");
  if (modal) modal.style.display = "flex";
};

window.closeLogoutModal = function () {
  const modal = document.getElementById("logoutModal");
  if (modal) modal.style.display = "none";
};

window.confirmLogout = function () {
  auth.signOut().then(() => window.location.reload());
};

/* =================================================
   🔥 PERFORMANCE SYSTEM (UNCHANGED)
================================================= */

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

let state = {
  cpuB: 176, cpuUB: 23, ramB: 2.4, netB: 5, fpsB: 230,
  cpuA: 120, cpuUA: 87, ramA: 32, netA: 19.1, fpsA: 240
};

let target = {
  cpuB: 238, cpuUB: 87, ramB: 28, netB: 8, fpsB: 170,
  cpuA: 50, cpuUA: 23, ramA: 7, netA: 20, fpsA: 275
};

setInterval(() => {
  target.cpuB = 176 + Math.random() * 60;
  target.cpuUB = 23 + Math.random() * 60;
  target.ramB = 2.4 + Math.random() * 25;
  target.netB = 5 + Math.random() * 3;
  target.fpsB = 170 + Math.random() * 80;

  target.cpuA = 120 - Math.random() * 60;
  target.cpuUA = 87 - Math.random() * 40;
  target.ramA = 32 - Math.random() * 25;
  target.netA = 19.1 + Math.random() * 1;
  target.fpsA = 235 + Math.random() * 50;
}, 2500);

function animate() {
  state.cpuB = lerp(state.cpuB, target.cpuB, 0.05);
  state.cpuUB = lerp(state.cpuUB, target.cpuUB, 0.05);
  state.ramB = lerp(state.ramB, target.ramB, 0.05);
  state.netB = lerp(state.netB, target.netB, 0.05);
  state.fpsB = lerp(state.fpsB, target.fpsB, 0.05);

  state.cpuA = lerp(state.cpuA, target.cpuA, 0.05);
  state.cpuUA = lerp(state.cpuUA, target.cpuUA, 0.05);
  state.ramA = lerp(state.ramA, target.ramA, 0.05);
  state.netA = lerp(state.netA, target.netA, 0.05);
  state.fpsA = lerp(state.fpsA, target.fpsA, 0.05);

  setBar("cpuB", state.cpuB, 300);
  setBar("cpuUB", state.cpuUB, 100);
  setBar("ramB", state.ramB, 32);
  setBar("netB", state.netB, 10);
  setBar("fpsB", state.fpsB, 300);

  setBar("cpuA", state.cpuA, 300);
  setBar("cpuUA", state.cpuUA, 100);
  setBar("ramA", state.ramA, 32);
  setBar("netA", state.netA, 25);
  setBar("fpsA", state.fpsA, 300);

  requestAnimationFrame(animate);
}
animate();

function setBar(id, val, max) {
  const el = document.getElementById(id);
  if (!el) return;

  let percent = (val / max) * 100;
  el.style.width = clamp(percent, 0, 100) + "%";
}

/* ================= PING ================= */

let ping = 90;
let targetPing = 90;

function animatePing() {
  const el = document.getElementById("pingValue");
  const status = document.getElementById("pingStatus");

  if (!el || !status) {
    requestAnimationFrame(animatePing);
    return;
  }

  ping += (targetPing - ping) * 0.06;

  const value = Math.round(ping);
  el.innerText = value + " ms";

  status.innerText = value > 70
    ? "High latency detected"
    : "Optimized connection";

  requestAnimationFrame(animatePing);
}

setInterval(() => {
  targetPing = Math.random() > 0.5
    ? 80 + Math.random() * 40
    : 5 + Math.random() * 12;
}, 2000);

animatePing();
window.forceAuthSync = function () {
    setTimeout(() => {
        if (window.refreshAuthUI) {
            window.refreshAuthUI(firebase.auth().currentUser);
        }
    }, 150);
};