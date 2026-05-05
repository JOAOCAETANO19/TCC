// ESTADO
let user = localStorage.getItem("u")
let xp = parseInt(localStorage.getItem("xp")) || 0

let projetos = JSON.parse(localStorage.getItem("proj")) || {
web: [false,false,false],
dados: [false,false,false]
}

// LOGIN
function login(){
let nome = document.getElementById("nome").value
localStorage.setItem("u", nome)
init()
}

function init(){
document.getElementById("login").classList.add("hidden")
document.getElementById("app").classList.remove("hidden")
document.getElementById("boas").innerText = "Olá " + localStorage.getItem("u")
update()
}

if(user) init()

// ABAS
function aba(id){
document.querySelectorAll(".aba").forEach(a=>a.classList.remove("ativa"))
document.getElementById(id).classList.add("ativa")
}

// PROJETOS
function abrirProjeto(tipo){

let etapas = {
web:["HTML","CSS","JS"],
dados:["Coletar","Analisar","Visualizar"]
}

let html = "<h2>Projeto</h2>"

etapas[tipo].forEach((e,i)=>{
html += `<p onclick="toggle('${tipo}',${i})">
${projetos[tipo][i]?"✅":"⬜"} ${e}
</p>`
})

html += `<br><a href="https://youtube.com" target="_blank">Ver aula</a>`

document.getElementById("conteudo").innerHTML = html
document.getElementById("modal").style.display = "flex"
}

function toggle(tipo,i){
projetos[tipo][i] = !projetos[tipo][i]
xp += 5
save()
abrirProjeto(tipo)
update()
}

// DASHBOARD
function update(){
document.getElementById("xp").innerText = xp

let n = "Iniciante"
if(xp>50)n="Intermediário"
if(xp>100)n="Avançado"

document.getElementById("nivel").innerText = n
document.getElementById("bar").style.width = (xp/100)*100 + "%"
}

// SALVAR
function save(){
localStorage.setItem("xp", xp)
localStorage.setItem("proj", JSON.stringify(projetos))
}