//arquivo contém comentários para explicar aos membros alguma linhas e funções ---REMOVER DEPOIS

import {auth, provider} from "./config.js";

//import de funções movido do config.js
import {signInWithPopup, signOut} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
/*
    singInWithPopup = abre uma janela popup para autenticação OAuth (Google como definimos em config.js),
usuário loga com Google, Google retorna token, Firebase valida e por fim usuário autenticado
    singOut = apenas encerra a sessão do usuário (remove token e encerra sessão local)
*/

const loginBtn = document.getElementById("btnLogin");
const logoutBtn = document.getElementById("btnLogout");

if(loginBtn){
    loginBtn.addEventListener("click", async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.log("Erro no login:", error);
        } 
    });
}

if(logoutBtn){
    logoutBtn.addEventListener("click", async () =>{
        try {
            await signOut(auth);
        } catch (error) {
            console.log("Erro no logout:", error);
        }
    });
}