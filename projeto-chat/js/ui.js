import { state } from "./state.js";

const nomeUsuario = document.getElementById("userName");
const imagemUsuario = document.getElementById("userPhoto");

const statusUsuario = document.getElementById("userStatus");

const chat = document.querySelector(".chat")

const mostrarTelaPrincipal = () => {
    document.querySelector(".login").style.display = "none";
    document.querySelector(".sidebar").style.display = "flex";
    document.querySelector(".chat").style.display = "flex";
}

export function mostrarUsuario(user){
    if(!user)
        return;

    nomeUsuario.textContent = user.displayName.split(" ")[0];
    imagemUsuario.src = user.photoURL;

    statusUsuario.textContent = "Online";
    statusUsuario.classList.remove("offline");
    statusUsuario.classList.add("online");

    mostrarTelaPrincipal();
}

const mostrarTelaLogin = () =>{
    document.querySelector(".login").style.display = "flex";
    document.querySelector(".sidebar").style.display = "none";
    document.querySelector(".chat").style.display = "none";
}

export function limparUsuario(){
    nomeUsuario.textContent = "";
    imagemUsuario.src = "";

    statusUsuario.textContent = "Offline";
    statusUsuario.classList.remove("online");
    statusUsuario.classList.add("offline");

    mostrarTelaLogin();
}

export function mostrarAreaDeMensagens(){
    const login = document.querySelector(".login");
    const sidebar = document.querySelector(".sidebar");
    const chat = document.querySelector(".chat");

    login.style.display = "none";
    chat.style.display = "flex";
    sidebar.style.display = "flex";
}

const criarEstruturaEnvio = (mensagem) => {
    const div = document.createElement("div");
    div.classList.add("message--self");
    div.innerHTML = mensagem;

    return div;
};

const criarEstruturaReceber = (mensagem, nome, color) => {
    const div = document.createElement("div");
    const span = document.createElement("span");
    div.classList.add("message--other");
    span.classList.add("message--sender");

    span.style.color = color;
    span.innerHTML = nome;

    div.appendChild(span);
    div.innerHTML += mensagem;

    return div;
};

/*Ainda não funcionando*/
export function enviarMensagemSistema(msg){
    const container = chat.querySelector(".chat__messages");

    const div = document.createElement("div");

    div.innerHTML = msg;

    container.appendChild(div);
}

export function renderizarMensagem(id, msg){
    const container = chat.querySelector(".chat__messages");

    const meuUID =  state.user.uid;

    if(document.getElementById(id))
        return;


    let div = undefined;
    if(msg.sender_id === meuUID){
        div = criarEstruturaEnvio(msg.message_text);
    }else{
        const nomeOriginal = msg.sender_name.split(" ")[0];
        const segundoNome = msg.sender_name.split(" ")[1];

        const nome = 
        nomeOriginal.charAt(0).toUpperCase() + nomeOriginal.slice(1).toLowerCase() + 
        " " + segundoNome.charAt(0).toUpperCase() + segundoNome.slice(1).toLowerCase();

        div = criarEstruturaReceber(msg.message_text, nome, msg.color);
    }
    div.id = id;
    div.classList.add("message");

    if (!msg.visibility) {
        div.classList.add("private-message");
    }

    /*if(!msg.visibility){
        if(msg.sender_id === meuUID){
            info = `Para: ${msg.receiver_name}`;
        } else {
            info = `De: ${msg.sender_name}`;
        }
    }*/
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}