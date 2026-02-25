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

/*Cancelar mensagem privada - não utilizado*/
function cancelarMensagemPrivada() {

    clearPrivateMessage();

    const input = document.getElementById("input-messages");
    const banner = document.querySelector(".private-banner");

    if (input) input.value = "";
    if (banner) banner.style.display = "none";
}

export function ativarModoPrivado(uid, nome) {

    const input = document.getElementById("input-messages");

    const prefixo = `|PM:${uid}:${nome}| `;

    if (!input.value.startsWith(prefixo)) {
        input.value = prefixo;
    }

    input.focus();
}



export async function enviarMensagem({ user, message_text, color = null }) {

    const novaRef = push(mensagensRef);

    let receiver_id = "";
    let receiver_name = "";
    let visibility = true;
    let textoFinal = message_text;

    const regexPrivado = /^\|PM:(.+?):(.+?)\|\s*/;

    const match = message_text.match(regexPrivado);

    if (match) {
        receiver_id = match[1];
        receiver_name = match[2];
        visibility = false;

        // remove o prefixo antes de salvar
        textoFinal = message_text.replace(regexPrivado, "");
    }

    const novaMensagem = {
        message_id: novaRef.key,
        timestamp: formatarTimeStamp(),
        sender_id: user.uid,
        sender_name: user.displayName,
        sender_image: user.photoURL || "",
        receiver_id,
        receiver_name,
        visibility,
        message_text: textoFinal,
        color: color ?? gerarCorAleatoria()
    };

    await set(novaRef, novaMensagem);
}

export function escutarMensagensPublicas() {

    const queryMensagensPublicas = query(
        mensagensRef,
        limitToLast(50)
    );

    onChildAdded(queryMensagensPublicas, snapshot => {

        const msg = snapshot.val();
        if (!msg) return;

        if (msg.visibility === true) {
            renderizarMensagem(snapshot.key, msg);
        }
    });
}

export function escutarMensagensPrivadas(meuUID) {

    const queryMensagens = query(
        mensagensRef,
        limitToLast(50) 
    );

    onChildAdded(queryMensagens, snapshot => {

        const msg = snapshot.val();
        if (!msg) return;

        const ehPrivada = msg.visibility === false;
        const souRemetente = msg.sender_id === meuUID;
        const souDestinatario = msg.receiver_id === meuUID;

        if (ehPrivada && (souRemetente || souDestinatario)) {
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

        const regexPrivado = /^\|PM:(.+?):(.+?)\|\s*/;
        const banner = document.querySelector(".private-banner");

        if (!banner) return;

        const match = input.value.match(regexPrivado);

        if (match) {
            const nome = match[2];

            banner.style.display = "flex";
            banner.innerHTML = `Mensagem privada para ${nome}`;
        } else {
            banner.style.display = "none";
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