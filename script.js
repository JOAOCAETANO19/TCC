// Alternar abas
function trocarAba(id){
document.querySelectorAll(".aba").forEach(sec=>{
sec.classList.remove("ativa")
})
document.getElementById(id).classList.add("ativa")
}

// Dados persistentes
let projetos = localStorage.getItem("projetos") || 0
let xp = localStorage.getItem("xp") || 0

document.getElementById("projetos").innerText = projetos
document.getElementById("xp").innerText = xp

// Concluir projeto
function concluirProjeto(){
projetos++
xp += 10

localStorage.setItem("projetos", projetos)
localStorage.setItem("xp", xp)

document.getElementById("projetos").innerText = projetos
document.getElementById("xp").innerText = xp

atualizarNivel()
}

// Sistema de nível
function atualizarNivel(){
let nivel = "Iniciante"

if(xp >= 50) nivel = "Intermediário"
if(xp >= 100) nivel = "Avançado"

document.getElementById("nivel").innerText = nivel
}

atualizarNivel()

// Carreiras
function verDetalhe(area){
let box = document.getElementById("detalheCarreira")

if(area === "web"){
box.innerHTML = `
<h3>Caminho Desenvolvedor Web</h3>
<p>1. Aprender HTML, CSS</p>
<p>2. Aprender JavaScript</p>
<p>3. Criar projetos</p>
<p>4. Aprender frameworks</p>
`
}

if(area === "dados"){
box.innerHTML = `
<h3>Caminho Analista de Dados</h3>
<p>1. Aprender Excel</p>
<p>2. Aprender SQL</p>
<p>3. Aprender Python</p>
<p>4. Criar análises reais</p>
`
}
}