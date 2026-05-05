// CONFIGURAÇÃO DOS DADOS
const TRAILS = [
    { id: 'web', title: 'Desenvolvimento Web', icon: '🌐', color: 'emerald', steps: ['HTML Básico','CSS Styling','JavaScript','Responsividade','Projeto Final'] },
    { id: 'data', title: 'Ciência de Dados', icon: '📊', color: 'cyan', steps: ['Python Básico','Pandas','Visualização','Machine Learning','Projeto Final'] },
    { id: 'mobile', title: 'Mobile', icon: '📱', color: 'purple', steps: ['React Native Intro','Componentes','Navegação','APIs','Projeto Final'] }
];

const PROJECTS = [
    { id: 'p1', title: 'Landing Page', trail: 'web', xp: 50, steps: ['Estrutura HTML','Estilização CSS','Responsividade','Deploy'] },
    { id: 'p3', title: 'App de Tarefas', trail: 'web', xp: 60, steps: ['Layout','JavaScript','LocalStorage','Finalização'] }
];

let currentUser = null;

// INICIALIZAÇÃO DOS ÍCONES LUCIDE
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
});

// FUNÇÕES DE AUTENTICAÇÃO
function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const email = document.getElementById('login-email').value.trim();
    
    if (!username || !email) {
        alert('Por favor, preencha todos os campos');
        return;
    }
    
    currentUser = { username, email };
    document.getElementById('user-greeting').textContent = `Bem-vindo, ${username}!`;
    
    document.getElementById('page-login').classList.remove('active');
    document.getElementById('main-nav').classList.remove('hidden');
    showPage('home');
}

function handleLogout() {
    currentUser = null;
    document.getElementById('page-login').classList.add('active');
    document.getElementById('main-nav').classList.add('hidden');
    showPage('login');
}

// NAVEGAÇÃO ENTRE PÁGINAS
function showPage(id) {
    if (!currentUser && id !== 'login') return;
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById('page-' + id);
    if(targetPage) targetPage.classList.add('active');
    
    // Atualiza botões da Nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
        const isTarget = btn.getAttribute('onclick').includes(`'${id}'`);
        btn.classList.toggle('active', isTarget);
    });
}

// Renderização Simples (Exemplo para Trails)
function renderTrails() {
    const grid = document.getElementById('trails-grid');
    if(!grid) return;
    grid.innerHTML = TRAILS.map(t => `
        <div class="bg-white/5 p-6 rounded-xl border border-white/10 card-hover">
            <span class="text-4xl">${t.icon}</span>
            <h3 class="text-xl font-bold mt-4">${t.title}</h3>
            <p class="text-gray-400 text-sm">${t.steps.length} etapas</p>
        </div>
    `).join('');
}

// Chamar renderizações ao carregar
renderTrails();