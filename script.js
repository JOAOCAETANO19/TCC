// ======================
// ESTADO GLOBAL AVANÇADO
// ======================
const state = {
user: localStorage.getItem("user") || null,
xp: parseInt(localStorage.getItem("xp")) || 0,

projetos: JSON.parse(localStorage.getItem("projetos")) || {
web: { progresso: 0, etapas: [false,false,false,false] },
dados: { progresso: 0, etapas: [false,false,false,false] }
},

metas: JSON.parse(localStorage.getItem("metas")) || [],
atividades: JSON.parse(localStorage.getItem("atividades")) || []
}

// ======================
// INICIALIZAÇÃO
// ======================
document.addEventListener("DOMContentLoaded", () => {
if(state.user) iniciarApp()
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
renderMetas()
renderAtividades()
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
// SISTEMA DE PROJETOS REAL
// ======================
function abrirProjeto(tipo){

const projetosInfo = {
web: {
titulo: "Projeto Web",
etapas: [
"Criar estrutura HTML",
"Estilizar com CSS",
"Adicionar JavaScript",
"Testar e melhorar"
],
link: "https://www.youtube.com/watch?v=3JluqTojuME"
},
dados: {
titulo: "Projeto Dados",
etapas: [
"Coletar dados",
"Limpar dados",
"Analisar dados",
"Criar gráficos"
],
link: "https://www.youtube.com/watch?v=r-uOLxNrNk8"
}
}

const projeto = state.projetos[tipo]
const info = projetosInfo[tipo]

let html = `<h2>${info.titulo}</h2><ul class="checklist">`

info.etapas.forEach((etapa, i)=>{
html += `
<li onclick="toggleEtapa('${tipo}',${i})">
${projeto.etapas[i] ? "✅" : "⬜"} ${etapa}
</li>`
})

html += `</ul>

<h3>🎥 Aula recomendada</h3>
<a href="${info.link}" target="_blank" class="link">Assistir aula</a>

<p>Progresso: ${projeto.progresso}%</p>
`

document.getElementById("modalContent").innerHTML = html
abrirModal("modalProjeto")
}

// MARCAR ETAPA
function toggleEtapa(tipo, index){
let projeto = state.projetos[tipo]

projeto.etapas[index] = !projeto.etapas[index]

let concluido = projeto.etapas.filter(e => e).length
projeto.progresso = Math.floor((concluido / projeto.etapas.length) * 100)

// XP ao concluir etapa
state.xp += 5

if(projeto.progresso === 100){
registrarAtividade("Projeto completo 🎉")
state.xp += 20
}

salvar()
atualizarUI()
abrirProjeto(tipo)
}

// ======================
// TRILHAS DE APRENDIZADO
// ======================
function verTrilha(tipo){

const trilhas = {
web: `
<h2>Trilha Front-end</h2>
<p>HTML → CSS → JavaScript → Frameworks</p>
<a class="link" href="https://developer.mozilla.org/pt-BR/" target="_blank">
Documentação oficial
</a>
`,
dados: `
<h2>Trilha Dados</h2>
<p>Excel → SQL → Python → Análise</p>
<a class="link" href="https://www.kaggle.com/" target="_blank">
Praticar com dados reais
</a>
`
}

document.getElementById("modalContent").innerHTML = trilhas[tipo]
abrirModal("modalProjeto")
}

// ======================
// METAS
// ======================
function adicionarMeta(){
const input = document.querySelector("#metas input")

if(!input.value) return

state.metas.push(input.value)

registrarAtividade("Nova meta criada 🎯")

input.value=""
salvar()
renderMetas()
}

function renderMetas(){
const lista = document.querySelector("#metas ul")
if(!lista) return

lista.innerHTML=""

state.metas.forEach(meta=>{
let li=document.createElement("li")
li.innerText=meta
lista.appendChild(li)
})
}

// ======================
// ATIVIDADE
// ======================
function registrarAtividade(msg){
state.atividades.unshift(msg)
salvar()
renderAtividades()
}

function renderAtividades(){
const container = document.getElementById("historico")
if(!container) return

container.innerHTML=""

state.atividades.forEach(a=>{
let p=document.createElement("p")
p.innerText=a
container.appendChild(p)
})
}

// ======================
// DASHBOARD EVOLUÇÃO
// ======================
function atualizarUI(){

document.getElementById("xp").innerText = state.xp
document.getElementById("nivel").innerText = calcularNivel()

// progresso geral
let total = 0
let count = 0

Object.values(state.projetos).forEach(p=>{
total += p.progresso
count++
})

let geral = Math.floor(total / count)

let barra = document.getElementById("barraProgresso")
if(barra) barra.style.width = geral + "%"

}

// ======================
// NÍVEL
// ======================
function calcularNivel(){
if(state.xp >= 200) return "Avançado"
if(state.xp >= 100) return "Intermediário"
return "Iniciante"
}

// ======================
// MODAIS
// ======================
function abrirModal(id){
document.getElementById(id).style.display="flex"
}

function fecharModal(){
document.querySelectorAll(".modal").forEach(m=>m.style.display="none")
}

// ======================
// STORAGE
// ======================
function salvar(){
localStorage.setItem("user", state.user)
localStorage.setItem("xp", state.xp)
localStorage.setItem("projetos", JSON.stringify(state.projetos))
localStorage.setItem("metas", JSON.stringify(state.metas))
localStorage.setItem("atividades", JSON.stringify(state.atividades))
}