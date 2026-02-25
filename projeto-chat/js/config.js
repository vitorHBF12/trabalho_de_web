/*
* parte disponível no arquivo de descrição do trabalho
* movi onAuthStateChanged, signInWithPopup, signOut para auth.js 
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

const FirebaseConfig = {
    apiKey: "AIzaSyARxUcggEuk67uLdtbNXrf2yLAM6Nx-_DM", 
    authDomain: "chat-pw-2026.Firebaseapp.com",
    databaseURL: "https://chat-pw-2026-default-rtdb.Firebaseio.com",
    projectId: "chat-pw-2026",
    storageBucket: "chat-pw-2026.Firebasestorage.app",
    messagingSenderId: "16351330668",
    appId: "1:16351330668:web:4ff97a14054fc271fd7349"
};


const app = initializeApp(FirebaseConfig); 
const auth = getAuth(app); 
const database = getDatabase(app);
const provider = new GoogleAuthProvider(); 

export {auth, provider, database};
