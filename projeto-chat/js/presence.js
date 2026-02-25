import { auth, database } from "./config.js";
import { 
  ref,
  set,
  update,
  onValue,
  onDisconnect,
  serverTimestamp,
  onChildChanged
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";
import { enviarMensagemSistema } from "./ui.js";
import { state } from "./state.js";
import { ativarModoPrivado } from "./messages.js";


let unsubscribeUsuarios = null;
let unsubscribeStatus = null;
let unsubscribeConexao = null;


let resetTimer = null;

//uso de IA
function gerarCorParaUsuario(uid) {

  let hash = 0;

  for (let i = 0; i < uid.length; i++) {
    hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  }

  let r = (hash >> 0) & 255;
  let g = (hash >> 8) & 255;
  let b = (hash >> 16) & 255;

  // Clareia a cor para não ficar muito escura
  r = (r + 100) % 256;
  g = (g + 100) % 256;
  b = (b + 100) % 256;

  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function ativarPresence(user){
    const usuarioRef = ref(database, `presence/${user.uid}`);
    const conexaoRef = ref(database, ".info/connected");

    unsubscribeConexao = onValue(conexaoRef, (snapshot) => {
        if(snapshot.val() === true){
            onDisconnect(usuarioRef).update({
                status: "offline",
                lastChanged: serverTimestamp(),
                lastSeen: serverTimestamp()
            });
            
            set(usuarioRef, {
                status: "online",
                name: user.displayName,
                image: user.photoURL,
                email: user.email,
                color: gerarCorParaUsuario(user.uid),
                lastChanged: serverTimestamp(),
                lastSeen: serverTimestamp(),
            });

            iniciarMonitoramentoDeInatividade(usuarioRef);
        }
    });
}

let inactivityTimer;
const INACTIVITY_LIMIT = 2 * 60 * 1000;

function iniciarMonitoramentoDeInatividade(usuarioRef){
    resetTimer = () => {
        clearTimeout(inactivityTimer);

        if(!auth.currentUser)
            return;

        update(usuarioRef, {
            status: "online",
            lastChanged: serverTimestamp()
        });

        inactivityTimer = setTimeout(() => {
            if(!auth.currentUser)
                return;
            update(usuarioRef, {
                status: "away",
                lastChanged: serverTimestamp()
            });
        }, INACTIVITY_LIMIT);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
}

export function escutarUsuarios(){
    const presencaRef = ref(database, "presence");
    
    unsubscribeUsuarios = onValue(presencaRef, (snapshot) => {
        const lista = document.getElementById("friendsList");
        if(!lista) return;


        lista.innerHTML = "";

        const usuarios = snapshot.val();
        if (!usuarios) return;

        Object.entries(usuarios).forEach(([uid, user]) => {
            if(state.user.uid === uid)
                return;

            const li = document.createElement("li");
            li.classList.add("friend-item");
            const statusColor = 
                user.status === "online" ? "green" : 
                user.status === "away" ? "orange" : "gray";

            const nomes = user.name ? user.name.split(" ") : ["Usuário"];
            const primeiroNome = nomes[0];
            let nomeFormatado = primeiroNome.charAt(0).toUpperCase() + primeiroNome.slice(1).toLowerCase();

            if (nomes[1]) {
                const segundoNome = nomes[1];
                nomeFormatado += " " + segundoNome.charAt(0).toUpperCase() + segundoNome.slice(1).toLowerCase();
            }

            li.innerHTML = `
                <div class="friend-header">
                    <div class="friend-avatar">
                        <img src="${user.image}" />
                        <span class="status-dot" style="background:${statusColor}"></span>
                    </div>
                    <span class="friend-name">${nomeFormatado}</span>
                </div>

                <div class="mensagemPrivada">
                    <button class="btnMensagemPrivada">
                        Enviar Mensagem Privada
                    </button>
                </div>
            `;

            li.querySelector(".btnMensagemPrivada")
            .addEventListener("click", () => {

                ativarModoPrivado(uid, user.name);

            });
            lista.appendChild(li);
        });
    });
}

let statusAnterior = {};
let offlineTimers = {};

export function escutarMudancasDeStatus(user){

    const presenceRef = ref(database, "presence");

    unsubscribeStatus = onChildChanged(presenceRef, (snapshot) =>{
        const dados = snapshot.val();
        const uid = snapshot.key;

        if (uid === user.uid) 
            return;

        if (!statusAnterior[uid] && dados.status === "online")
            return;

        const antigoStatus = statusAnterior[uid] || null;
        const novoStatus = dados.status;

        statusAnterior[uid] = novoStatus;

        if(novoStatus === antigoStatus)
            return;

        if (novoStatus === "away" || antigoStatus === "away") 
            return;
        
        const nomes = dados.name ? dados.name.split(" ") : ["Usuário"];
        const primeiroNome = nomes[0];
        let nomeFormatado = primeiroNome.charAt(0).toUpperCase() + primeiroNome.slice(1).toLowerCase();

        if (nomes[1]) {
            const segundoNome = nomes[1];
            nomeFormatado += " " + segundoNome.charAt(0).toUpperCase() + segundoNome.slice(1).toLowerCase();
        }

        if(dados.status === "online") {
            if(offlineTimers[uid]){
                clearTimeout(offlineTimers[uid]);
                delete offlineTimers[uid];
                return;
            }

            if (antigoStatus !== "online") {
                enviarMensagemSistema(`${nomeFormatado} entrou no chat`);
            }
        }

        if(dados.status === "offline") {
            if (antigoStatus === "online") {
                offlineTimers[uid] = setTimeout(() => {
                    enviarMensagemSistema(`${nomeFormatado} saiu do chat`);

                    delete offlineTimers[uid];
                }, 4000);
            }
        }
    });
}

export function pararPresence(){
    if(unsubscribeUsuarios) unsubscribeUsuarios();
    if(unsubscribeStatus) unsubscribeStatus();
    if(unsubscribeConexao) unsubscribeConexao();

    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }

    window.removeEventListener("mousemove", resetTimer);
    window.removeEventListener("keydown", resetTimer);
    window.removeEventListener("click", resetTimer);
}