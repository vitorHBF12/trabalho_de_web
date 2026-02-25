import { database } from "./config.js";
import { mostrarAreaDeMensagens, renderizarMensagem } from "./ui.js";
import { privateMessageState, setPrivateMessage, clearPrivateMessage } from "./state.js";

import { 
    ref,
    push,
    set,
    get,
    onChildAdded,
    query,
    orderByChild,
    equalTo,
    limitToLast
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

const mensagensRef = ref(database, "messages");

const colors = [
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpink",
    "gold"
]

function formatarTimeStamp(){
    const agora = new Date();

    const dia = String(agora.getDate()).padStart(2, 0);
    const mes = String(agora.getMonth() + 1).padStart(2, 0);
    const ano = agora.getFullYear();

    const hora = String(agora.getHours()).padStart(2, 0);
    const minuto = String(agora.getMinutes()).padStart(2, 0);
    const segundo = String(agora.getSeconds()).padStart(2, 0);

    return `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`;
}

const gerarCorAleatoria = () => {
    const randomIndex = Math.floor(Math.random() * colors.length)
    return colors[randomIndex]
}

/*Cancelar mensagem privada */
function cancelarMensagemPrivada() {

    clearPrivateMessage();

    const input = document.getElementById("input-messages");
    const banner = document.querySelector(".private-banner");

    if (input) input.value = "";
    if (banner) banner.style.display = "none";
}

/*função completa */

export function ativarModoPrivado(uid, nome) {

    setPrivateMessage(uid, nome)

    const banner = document.querySelector(".private-banner");
    const input = document.querySelector(".chat__input");

    if (banner) {
        banner.style.display = "flex";
        banner.innerHTML = `
            Enviando mensagem privada para ${nome}
            <button id="cancelPrivate">✖</button>
        `;

        document.getElementById("cancelPrivate")
            .addEventListener("click", cancelarMensagemPrivada);
    }

    input.value = `|Mensagem Privada Para ${nome}| `;
    input.focus();
}



export async function enviarMensagem({ user, message_text, color = null }) {

    const novaRef = push(mensagensRef);

    const novaMensagem = {
        message_id: novaRef.key,
        timestamp: formatarTimeStamp(),
        sender_id: user.uid,
        sender_name: user.displayName,
        sender_image: user.photoURL || "",
        receiver_id: privateMessageState.ativo 
            ? privateMessageState.receiver_id 
            : "",
        receiver_name: privateMessageState.ativo 
            ? privateMessageState.receiver_name 
            : "",
        visibility: privateMessageState.ativo ? false : true,
        message_text: message_text,
        color: color ?? gerarCorAleatoria()
    };

    await set(novaRef, novaMensagem);

    if (privateMessageState.ativo) {
        cancelarMensagemPrivada();
    }
}

export function escutarMensagensPublicas(){
    const queryMensagensPublicas = query(
        mensagensRef, 
        limitToLast(50)
    );
    onChildAdded(queryMensagensPublicas, snapshot =>{
        const msg = snapshot.val();

        if(!msg)
            return;

        if(msg.visibility === true){
            renderizarMensagem(snapshot.key, msg);
        }
    });
}

export function escutarMensagensPrivadas(meuUID){
    const queryTodasMensagens = query(
        mensagensRef,         
        limitToLast(50)
    );
    onChildAdded(queryTodasMensagens, snapshot => {
        const msg = snapshot.val();

        if(!msg)
            return;

        if(!msg.visibility && (msg.sender_id === meuUID || msg.receiver_id === meuUID)){
            renderizarMensagem(snapshot.key, msg);
        }
    });
}

export function carregarChat(user){

    mostrarAreaDeMensagens();

    escutarMensagensPublicas();
    escutarMensagensPrivadas(user.uid);

    const btn = document.getElementById("send-button");
    const input = document.getElementById("input-messages");

    input.addEventListener("input", () => {

        if (!privateMessageState.ativo) return;

        const prefixo = `|Mensagem Privada Para ${privateMessageState.receiver_name}| `;

        if (!input.value.startsWith(prefixo)) {
            cancelarMensagemPrivada();
        }
    });

    btn.addEventListener("click", () => {

        const texto = input.value.trim();

        if (!texto) return;

        enviarMensagem({
            user,
            message_text: texto,
            color: "#007bff"
        });

        input.value = "";
    });
}