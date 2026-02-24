//arquivo contém comentários para explicar aos membros alguma linhas e funções ---REMOVER DEPOIS

import {auth, provider, database} from "./config.js";

//import de funções movido do config.js
import {signInWithPopup, signOut} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import {onAuthStateChanged} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { ref, onDisconnect, update, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

import { carregarChat } from "./messages.js";
import { limparUsuario, mostrarUsuario } from "./ui.js";
import { state } from "./state.js";
import { ativarPresence, escutarMudancasDeStatus, escutarUsuarios, pararPresence } from "./presence.js";


/*
    singInWithPopup = abre uma janela popup para autenticação OAuth (Google como definimos em config.js),
usuário loga com Google, Google retorna token, Firebase valida e por fim usuário autenticado
    singOut = apenas encerra a sessão do usuário (remove token e encerra sessão local)
*/

const loginBtn = document.getElementById("btnGoogle");
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
            const user = auth.currentUser;
            if (!user) return;

            const usuarioRef = ref(database, `presence/${user.uid}`);

            await onDisconnect(usuarioRef).cancel();

            await update(usuarioRef, {
                status: "offline",
                lastChanged: serverTimestamp(),
                lastSeen: serverTimestamp()
            });

            pararPresence();

            await signOut(auth);
        } catch (error) {
            console.log("Erro no logout:", error);
        }
    });
}


onAuthStateChanged(auth, (user) => {
    if(user){
        state.user = user;

        mostrarUsuario(user);
        ativarPresence(user);
        carregarChat(user);
        escutarUsuarios();
        escutarMudancasDeStatus(user);
    }else{
        limparUsuario();
    }
});