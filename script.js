function mostrarLogin(){
document.getElementById("login").style.display="flex"
}

function mostrarCadastro(){
document.getElementById("cadastro").style.display="flex"
}

function login(){
alert("Login realizado!")
document.getElementById("login").style.display="none"
}

function cadastrar(){
alert("Conta criada com sucesso!")
document.getElementById("cadastro").style.display="none"
}

let projetos = 0

const botoes = document.querySelectorAll(".card button")

botoes.forEach(botao=>{
botao.addEventListener("click",()=>{
projetos++
document.getElementById("projetosConcluidos").innerText = projetos
})
})
