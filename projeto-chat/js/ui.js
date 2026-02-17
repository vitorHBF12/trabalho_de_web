const statusDiv = document.getElementById("status");
const loginDiv = document.getElementById("area-login");
const dadosDiv = document.getElementById("dados-usuario");

const nomeUsuario = document.getElementById("nome-usuario");
const emailUsuario = document.getElementById("email-usuario");
const imagemUsuario = document.getElementById("foto-usuario");

function testeMostrarUsuario(user){
    statusDiv.textContent = "Status: usuário autenticado";
    loginDiv.style.display = "none";
    dadosDiv.style.display = "block";

    nomeUsuario.textContent = user.displayName;
    emailUsuario.textContent = user.email;
    imagemUsuario.src = user.photoURL;
}

function testeMostrarDeslogado(){
    statusDiv.textContent = "Status: Não autenticado";
    loginDiv.style.display = "block";
    dadosDiv.style.display = "none";
}

export{testeMostrarUsuario, testeMostrarDeslogado};