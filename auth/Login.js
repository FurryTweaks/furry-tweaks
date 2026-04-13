
/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyB3upec-8eK9T5u05lFUFACBz3SReTyH58",
  authDomain: "furry-tweaks.firebaseapp.com",
  projectId: "furry-tweaks",
  storageBucket: "furry-tweaks.firebasestorage.app",
  messagingSenderId: "427628729593",
  appId: "1:427628729593:web:96ca9f7eb0e003c9957e28",
  measurementId: "G-1P6N7STLRK"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

/* ================= TOAST SYSTEM ================= */
function showToast(message, type = "error") {

    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.innerText = message;
    toast.className = "";
    toast.classList.add("show", type);

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

/* ================= PASSWORD TOGGLE ================= */
function togglePassword() {
    const pass = document.getElementById("password");
    if (!pass) return;

    pass.type = pass.type === "password" ? "text" : "password";
}

/* ================= GO TO HOME ================= */
function goHome() {
    window.location.href = "../index.html";
}

/* ================= LOGIN ================= */
function login() {

    const email = document.getElementById("email")?.value;
    const password = document.getElementById("password")?.value;

    if (!email || !password) {
        showToast("Please fill all fields");
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
    .then(() => {

        showToast("Login Successful", "success");

        setTimeout(() => {
            goHome();
        }, 1000);

    })
    .catch((error) => {

        switch (error.code) {

            case "auth/user-not-found":
                showToast("User not found");
                break;

            case "auth/wrong-password":
                showToast("Wrong password");
                break;

            case "auth/invalid-email":
                showToast("Invalid email");
                break;

            case "auth/too-many-requests":
                showToast("Too many attempts, try later");
                break;

            default:
                showToast("Login failed");
        }
    });
}

/* ================= GOOGLE LOGIN ================= */
function googleLogin() {

    const provider = new firebase.auth.GoogleAuthProvider();

    auth.signInWithPopup(provider)
    .then(() => {

        showToast("Google Login Success", "success");

        setTimeout(() => {
            goHome();
        }, 1000);

    })
    .catch(() => {
        showToast("Google login failed");
    });
}

/* ================= FORGOT PASSWORD ================= */
function forgotPassword() {

    const email = document.getElementById("email")?.value;

    if (!email) {
        showToast("Enter your email first");
        return;
    }

    auth.sendPasswordResetEmail(email)
    .then(() => {
        showToast("Reset email sent", "success");
    })
    .catch(() => {
        showToast("Failed to send reset email");
    });
}

/* ================= AUTO LOGIN CHECK ================= */
auth.onAuthStateChanged((user) => {

    if (user) {
        console.log("User logged in:", user.email);
    }

});