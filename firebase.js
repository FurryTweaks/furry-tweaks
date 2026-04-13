
  const firebaseConfig = {
    apiKey: "AIzaSyB3upec-8eK9T5u05lFUFACBz3SReTyH58",
    authDomain: "furry-tweaks.firebaseapp.com",
    projectId: "furry-tweaks",
    storageBucket: "furry-tweaks.firebasestorage.app",
    messagingSenderId: "427628729593",
    appId: "1:427628729593:web:027541e94c8edd28957e28",
    measurementId: "G-SM5XTP685P"
  };

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();