import { database } from "./config.js";
import { mostrarAreaDeMensagens, renderizarMensagem } from "./ui.js";

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

export async function enviarMensagem({user, message_text, receiver_id, receiver_name, color = null}) {
    if(!user){
        alert("Você precisa estar logado para enviar mensagens");
        return;
    }

    if(!message_text || message_text.trim() === ''){
        alert("Mensagem não pode estar vazia!");
        return;
    }

    if (message_text.length > 500) {
        alert("Mensagem deve ter no máximo 500 caracteres");
        return;
    }

    const novaRef = push(mensagensRef);

    const novaMensagem = {
        message_id: novaRef.key,
        timestamp: formatarTimeStamp(),
        sender_id: user.uid,
        sender_name: user.displayName,
        sender_image: user.photoURL || "",
        receiver_id: receiver_id ?? "",
        receiver_name: receiver_name ?? "",
        visibility: receiver_id ? false : true,
        message_text: message_text,
        color: color ?? gerarCorAleatoria()
    }

    try {
        await set(novaRef, novaMensagem);
        console.log("Mensagem enviada com sucesso!");
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
    }
}

export function escutarMensagensPublicas(){
    const queryMensagensPublicas = query(
        mensagensRef, 
        limitToLast(50)
    );
    testarConexao();
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
    testarConexao();
    onChildAdded(queryTodasMensagens, snapshot => {
        const msg = snapshot.val();

        if(!msg)
            return;

        if(!msg.visibility && (msg.sender_id === meuUID || msg.receiver_id === meuUID)){
            renderizarMensagem(snapshot.key, msg);
        }
    });
}

async function testarConexao() {
    try {
        const snapshot = await get(mensagensRef);

        if(snapshot.exists()){
            console.log("Tem mensagens:", snapshot.val());
        } else {
            console.log("Banco vazio.");
        }

    } catch (error) {
        console.error("Erro ao ler banco:", error);
    }
}

export function carregarChat(user){
    mostrarAreaDeMensagens();

    escutarMensagensPublicas();
    escutarMensagensPrivadas(user.uid);

    const btn = document.getElementById("send-button");
    const input = document.getElementById("input-messages");

    btn.addEventListener("click", () => {
        const texto = input.value;
        enviarMensagem({ user, message_text: texto, color: '#007bff' });
        input.value = "";
    });
}