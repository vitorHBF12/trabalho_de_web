import { database } from "./config.js";
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

    onValue(conexaoRef, (snapshot) => {
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
    const resetTimer = () => {
        clearTimeout(inactivityTimer);

        update(usuarioRef, {
            status: "online",
            lastChanged: serverTimestamp()
        });

        inactivityTimer = setTimeout(() => {
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
    
    onValue(presencaRef, (snapshot) => {
        const lista = document.getElementById("friendsList");
        if(!lista) return;


        lista.innerHTML = "";

        const usuarios = snapshot.val();
        if (!usuarios) return;

        Object.entries(usuarios).forEach(([uid, user]) => {
            const li = document.createElement("li");
            li.classList.add("friend-item");
            const statusColor = 
                user.status === "online" ? "green" : 
                user.status === "away" ? "orange" : "gray";

            const nomeOriginal = user.name ? user.name.split(" ")[0] : "Usuário";
            let nome =
                nomeOriginal.charAt(0).toUpperCase() +
                nomeOriginal.slice(1).toLowerCase();

            nome += " " + user.name.split(" ")[1].charAt(0).toUpperCase() + user.name.split(" ")[1].slice(1).toLowerCase();
            li.innerHTML = `
                <div class="friend-avatar">
                <img src="${user.image}" />
                <span class="status-dot" style="background:${statusColor}"></span>
                </div>
                <span>${nome}</span>
            `;

            lista.appendChild(li);
        });
    });
}

/*export function escutarMudancasDeStatus(user){
    const presenceRef = ref(database, "presence");

    onChildChanged(presenceRef, (snapshot) =>{
        const dados = snapshot.val();
        const uid = snapshot.key;

        if (uid === user.uid) 
            return;

        const nomeOriginal = dados.name.split(" ")[0];

        const nome = nomeOriginal.charAt(0).toUpperCase() + nomeOriginal.slice(1).toLowerCase();

        if(dados.status === "online") {
            enviarMensagemSistema(`${nome} entrou no chat`);
        }

        if(dados.status === "offline") {
            enviarMensagemSistema(`${nome} saiu do chat`)
        }
    });
}*/