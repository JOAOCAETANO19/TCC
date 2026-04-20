// Login
function login(){
let nome = document.getElementById("user").value
if(nome){
localStorage.setItem("user", nome)
iniciar()
}
}

function iniciar(){
document.getElementById("loginTela").classList.add("hidden")
document.getElementById("app").classList.remove("hidden")

let nome = localStorage.getItem("user")
document.getElementById("boasVindas").innerText = "Olá, " + nome

carregar()
}

// Abas
function trocarAba(id){
document.querySelectorAll(".aba").forEach(a=>a.classList.remove("ativa"))
document.getElementById(id).classList.add("ativa")
}

// Dados
let projetos = localStorage.getItem("p") || 0
let xp = localStorage.getItem("xp") || 0

function carregar(){
document.getElementById("projetos").innerText = projetos
document.getElementById("xp").innerText = xp
nivel()
}

function concluirProjeto(){
projetos++
xp += 10
localStorage.setItem("p", projetos)
localStorage.setItem("xp", xp)
carregar()
}

function nivel(){
let n="Iniciante"
if(xp>=50)n="Intermediário"
if(xp>=100)n="Avançado"
document.getElementById("nivel").innerText=n
}

// Carreira
function carreira(tipo){
let box=document.getElementById("info")
if(tipo=="web"){
box.innerHTML="HTML → CSS → JS → Projetos"
}
if(tipo=="dados"){
box.innerHTML="Excel → SQL → Python → Projetos"
}
}

// Comunidade
function postar(){
let texto=document.querySelector("textarea").value
let post=document.createElement("p")
post.innerText=texto
document.getElementById("posts").appendChild(post)
}

// Ajuda
function ajuda(tipo){
let box=document.getElementById("ajudaBox")
if(tipo=="como"){
box.innerHTML="Use projetos para evoluir."
}
if(tipo=="carreira"){
box.innerHTML="Explore áreas e pratique."
}
}

// Auto login
if(localStorage.getItem("user")){
iniciar()
}