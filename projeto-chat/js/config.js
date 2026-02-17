/*
* parte disponível no arquivo de descrição do trabalho
* movi onAuthStateChanged, signInWithPopup, signOut para auth.js 
*/

//arquivo contém comentários para explicar aos membros alguma linhas e funções ---REMOVER DEPOIS
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getDatabase, ref, push, set, onValue, onDisconnect } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

const FirebaseConfig = {
    apiKey: "CHAVE DISPONIVEL NO ARQUIVO DE DESCRIÇÃO", 
    authDomain: "chat-pw-2026.Firebaseapp.com",
    databaseURL: "https://chat-pw-2026-default-rtdb.Firebaseio.com",
    projectId: "chat-pw-2026",
    storageBucket: "chat-pw-2026.Firebasestorage.app",
    messagingSenderId: "16351330668",
    appId: "1:16351330668:web:4ff97a14054fc271fd7349"
};


const app = initializeApp(FirebaseConfig); //inicializa a instância do firebase com base no nosso FirebaseConfig
const auth = getAuth(app); //instância do serviço de autenticação do firebase (login, logout, estado do usuário, sessão)
const database = getDatabase(app); //ainda não sei
const provider = new GoogleAuthProvider(); //cria um provedor de login com Google (OAuth).
/*O firebase precisa saber qual método de login iremos usar, como por exemplo 
GoogleAuthProvider (o que vamos usar), GithubAuthProvider, FacebookAuthProvider
será usado no auth.js*/

export {auth, provider};
