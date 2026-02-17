//arquivo contém comentários para explicar aos membros alguma linhas e funções ---REMOVER DEPOIS

import {auth, provider} from "./config.js";
import {testeMostrarUsuario, testeMostrarDeslogado} from "./ui.js";

//import de funções movido do config.js
import {onAuthStateChanged, signInWithPopup, signOut} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
/*
    onAuthStateChanged = observa as mudanças no estado de autenticação, (coração do controle de sessão) 
dispara quando: usuário faz login, usário faz logout, página recarrega e sessão ainda existe, ...
    singInWithPopup = abre uma janela popup para autenticação OAuth (Google como definimos em config.js),
usuário loga com Google, Google retorna token, Firebase valida e por fim usuário autenticado
    singOut = apenas encerra a sessão do usuário (remove token e encerra sessão local)
*/

const loginBtn = document.getElementById("btnLogin");
const logoutBtn = document.getElementById("btnLogout");

loginBtn.addEventListener("click", async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.log("Erro no login:", error);
    } 
});

logoutBtn.addEventListener("click", async () =>{
    await signOut(auth);
});

onAuthStateChanged(auth, (user) => {
    if(user){
        testeMostrarUsuario(user);
        console.log("Usuário logado: ", user);
    }else{
        testeMostrarDeslogado();
        console.log("Nenhum usuário autenticado");
    }
});