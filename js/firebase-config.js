import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA1L1I9t9IZLBy2ltaQb-9KyfvbRY1bqAY",
  authDomain: "ldk-smp-citra-bangsa.firebaseapp.com",
  projectId: "ldk-smp-citra-bangsa",
  storageBucket: "ldk-smp-citra-bangsa.firebasestorage.app",
  messagingSenderId: "1094898868154",
  appId: "1:1094898868154:web:cbdf04f71a8c7304ff4783"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);