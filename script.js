let STATE = {
  name: "João Cleberson",
  nivel: 5,
  xp: 1450,
  area: "web",
  projetosCompletos: 6
};

const projetos = [
  { id: 1, nome: "Portfólio Pessoal Moderno", area: "web", dificuldade: "Médio", xp: 80, motivo: "Base sólida para seu portfólio" },
  { id: 2, nome: "Dashboard de Vendas com Gráficos", area: "web", dificuldade: "Avançado", xp: 150, motivo: "Excelente para mostrar em entrevistas" },
  { id: 3, nome: "Sistema de Login Completo", area: "web", dificuldade: "Avançado", xp: 180, motivo: "Habilidade muito valorizada no mercado" },
  { id: 4, nome: "Clone do Netflix (Front-end)", area: "web", dificuldade: "Avançado", xp: 200, motivo: "Projeto impressionante para portfólio" }
];

function gerarRecomendacao() {
  const random = Math.floor(Math.random() * projetos.length);
  const rec = projetos[random];

  const container = document.getElementById('ia-container');
  container.innerHTML = `
    <h2>🎯 Recomendação da IA</h2>
    <h3>${rec.nome}</h3>
    <p><strong>Motivo:</strong> ${rec.motivo}</p>
    <p><strong>Dificuldade:</strong> ${rec.dificuldade} | <strong>XP:</strong> +${rec.xp}</p>
    <button class="btn-primary" onclick="iniciarProjeto(${rec.id})">Iniciar este Projeto</button>
  `;
}

function iniciarProjeto(id) {
  alert(`✅ Projeto ${id} iniciado!\n\nNa apresentação do TCC, você pode demonstrar o checklist aqui.`);
  STATE.projetosCompletos++;
  STATE.xp += 100;
  atualizarUI();
}

function atualizarUI() {
  document.getElementById('user-name').textContent = STATE.name;
  document.getElementById('user-level').textContent = `Nível ${STATE.nivel} • Desenvolvedor Jr`;
  document.getElementById('xp-total').textContent = STATE.xp;
  document.getElementById('projetos-concluidos').textContent = STATE.projetosCompletos;
}

window.onload = () => {
  atualizarUI();
  gerarRecomendacao(); // Recomendação inicial

  // Navegação
  document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');

      const page = link.getAttribute('data-page');
      if (page === 'ia') gerarRecomendacao();
    });
  });
};