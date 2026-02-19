const nomeUsuario = document.getElementById("nome-usuario");
const emailUsuario = document.getElementById("email-usuario");
const imagemUsuario = document.getElementById("foto-usuario");

export function mostrarUsuario(user){
    nomeUsuario.textContent = user.displayName;
    emailUsuario.textContent = user.email;
    imagemUsuario.src = user.photoURL;
}

export function limparPerfil(){
    nomeUsuario.textContent = "";
    emailUsuario.textContent = "";
    imagemUsuario.src = "";
}