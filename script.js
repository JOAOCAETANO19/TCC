// LOGIN
function login(){
let nome=document.getElementById("user").value
localStorage.setItem("user",nome)
iniciar()
}

function iniciar(){
document.getElementById("loginTela").classList.add("hidden")
document.getElementById("app").classList.remove("hidden")

document.getElementById("boasVindas").innerText="Olá, "+localStorage.getItem("user")

carregar()
}

// ABAS
function trocarAba(id){
document.querySelectorAll(".aba").forEach(a=>a.classList.remove("ativa"))
document.getElementById(id).classList.add("ativa")
}

// DADOS
let projetos=localStorage.getItem("p")||0
let xp=localStorage.getItem("xp")||0
let streak=localStorage.getItem("streak")||0

function carregar(){
document.getElementById("projetos").innerText=projetos
document.getElementById("xp").innerText=xp
document.getElementById("streak").innerText=streak
nivel()
progresso()
}

// PROJETO
function concluirProjeto(){
projetos++
xp+=20
streak++
salvar("Projeto concluído 🚀")
salvarDados()
}

// XP
function ganharXP(){
xp+=5
salvar("Ganhou XP ⚡")
salvarDados()
}

// SALVAR
function salvarDados(){
localStorage.setItem("p",projetos)
localStorage.setItem("xp",xp)
localStorage.setItem("streak",streak)
carregar()
}

// NÍVEL
function nivel(){
let n="Iniciante"
if(xp>=50)n="Intermediário"
if(xp>=100)n="Avançado"
document.getElementById("nivel").innerText=n
}

// PROGRESSO
function progresso(){
let porcentagem=(xp/100)*100
document.getElementById("progress").style.width=porcentagem+"%"
}

// LOG
function salvar(msg){
let log=document.getElementById("log")
let item=document.createElement("p")
item.innerText=msg
log.prepend(item)
}

// METAS
function salvarMeta(){
let input=document.getElementById("metaInput")
let li=document.createElement("li")
li.innerText=input.value
document.getElementById("listaMetas").appendChild(li)
}

// CARREIRA
function carreira(tipo){
let box=document.getElementById("info")
if(tipo=="web"){
box.innerHTML="HTML → CSS → JS → Projetos"
}
if(tipo=="dados"){
box.innerHTML="Excel → SQL → Python"
}
}

// AUTO LOGIN
if(localStorage.getItem("user")){
iniciar()
}