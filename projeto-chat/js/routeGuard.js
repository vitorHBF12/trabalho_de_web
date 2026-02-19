//arquivo responsável pelo redirecionamento dependendo se o usuário está logado ou não
import { mostrarUsuario, limparPerfil } from "./ui.js";

import { auth } from "./config.js";
import {onAuthStateChanged} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";;

/* onAuthStateChanged = observa as mudanças no estado de autenticação, (coração do controle de sessão) 
dispara quando: usuário faz login, usário faz logout, página recarrega e sessão ainda existe, ... */

document.documentElement.style.visibility = "hidden";

const paginaAtual = window.location.pathname;

const estaNaPaginaLogin = paginaAtual.includes("login.html");
const estaNaPaginaPrincipal = paginaAtual.includes("index.html");

/*
Por que o uso de window.location.replace no lugar de window.location.href? 
O replace não cria histórico e não permite que o usuário clique em "voltar" pra retornar 
para a página bloqueada
*/

onAuthStateChanged(auth, (user) => {
    if(!user && estaNaPaginaPrincipal){
        window.location.replace("./login.html");
        return;
    }

    if(estaNaPaginaPrincipal){
        if(!user){
            limparPerfil();
            window.location.replace("./login.html");
            return;
        }
        
        mostrarUsuario(user);
    }

    if(user && estaNaPaginaLogin){
        window.location.replace("./index.html")
        return;
    }

    document.documentElement.style.visibility = "visible";
});