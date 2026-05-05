// ======================
// ESTADO GLOBAL
// ======================
const state = {
user: localStorage.getItem("user") || null,
projetos: parseInt(localStorage.getItem("projetos")) || 0,
xp: parseInt(localStorage.getItem("xp")) || 0
}

// ======================
// INICIALIZAÇÃO
// ======================
document.addEventListener("DOMContentLoaded", () => {
if(state.user){
iniciarApp()
}
})

// ======================
// LOGIN
// ======================
function login(){
const nome = document.getElementById("user").value.trim()

if(!nome){
alert("Digite seu nome")
return
}

state.user = nome
salvar()

iniciarApp()
}

function logout(){
localStorage.clear()
location.reload()
}

function iniciarApp(){
toggleTela("loginTela", false)
toggleTela("app", true)

document.getElementById("boasVindas").innerText = `Olá, ${state.user}`

atualizarUI()
}

// ======================
// UI
// ======================
function toggleTela(id, mostrar){
document.getElementById(id).classList.toggle("hidden", !mostrar)
}

function trocarAba(id){
document.querySelectorAll(".aba").forEach(el => el.classList.remove("ativa"))
document.getElementById(id).classList.add("ativa")
}

// ======================
// PROJETOS
// ======================
function concluirProjeto(){
state.projetos++
state.xp += 20

registrarAtividade("Projeto concluído 🚀")

salvar()
atualizarUI()
}

// ======================
// CARREIRAS
// ======================
function abrirCarreira(tipo){
const conteudo = {
web: "HTML → CSS → JS → Frameworks → Projetos reais",
dados: "Excel → SQL → Python → Visualização → Projetos"
}

alert(conteudo[tipo] || "Carreira não encontrada")
}

// ======================
// MODAIS
// ======================
function abrirModal(id){
document.getElementById(id).style.display = "flex"
}

function fecharModal(){
document.querySelectorAll(".modal").forEach(m => m.style.display = "none")
}

// ======================
// METAS
// ======================
function adicionarMeta(){
const input = document.querySelector("#metas input")
const lista = document.querySelector("#metas ul")

if(!input.value) return

const li = document.createElement("li")
li.innerText = input.value

lista.appendChild(li)

input.value = ""
}

// ======================
// ATIVIDADE
// ======================
function registrarAtividade(msg){
let atividades = JSON.parse(localStorage.getItem("atividades")) || []

atividades.unshift(msg)
localStorage.setItem("atividades", JSON.stringify(atividades))
}

// ======================
// UI UPDATE
// ======================
function atualizarUI(){
document.getElementById("projetos").innerText = state.projetos
document.getElementById("xp").innerText = state.xp
document.getElementById("nivel").innerText = calcularNivel()

renderAtividades()
}

// ======================
// NÍVEL
// ======================
function calcularNivel(){
if(state.xp >= 100) return "Avançado"
if(state.xp >= 50) return "Intermediário"
return "Iniciante"
}

// ======================
// ATIVIDADES UI
// ======================
function renderAtividades(){
const container = document.getElementById("historico")

if(!container) return

container.innerHTML = ""

let atividades = JSON.parse(localStorage.getItem("atividades")) || []

atividades.forEach(a => {
let p = document.createElement("p")
p.innerText = a
container.appendChild(p)
})
}

// ======================
// STORAGE
// ======================
function salvar(){
localStorage.setItem("user", state.user)
localStorage.setItem("projetos", state.projetos)
localStorage.setItem("xp", state.xp)
}