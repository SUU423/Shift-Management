import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js";
import { getFirestore, doc, setDoc, collection, getDocs, getDoc, deleteDoc, addDoc, query, where } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth,signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
const firebaseConfig = {
    apiKey: "AIzaSyAV25OpQyxzDjgbrsNzgjPJAK4h2LH6y5g",
    authDomain: "shift-management-41b1e.firebaseapp.com",
    projectId: "shift-management-41b1e",
    storageBucket: "shift-management-41b1e.firebasestorage.app",
    messagingSenderId: "772728832982",
    appId: "1:772728832982:web:5b27e8232f00718ef11a77",
    measurementId: "G-TJ605H6Y0Y"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);


export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, doc, setDoc, collection, getDocs, getDoc, deleteDoc, addDoc, query, where};

