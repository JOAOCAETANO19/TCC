// Dados Iniciais
const TRAILS = [
    { id: 'web', title: 'Desenvolvimento Web', icon: '🌐', stages: 5 },
    { id: 'data', title: 'Ciência de Dados', icon: '📊', stages: 5 },
    { id: 'mobile', title: 'Mobile', icon: '📱', stages: 5 }
];

let currentUser = null;
let userStats = { xp: 0, level: 1, completed: 0, streak: 0 };

// Inicializar Ícones
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    renderTrails();
});

// Autenticação
function handleLogin() {
    const name = document.getElementById('login-username').value;
    const email = document.getElementById('login-email').value;

    if (name && email) {
        currentUser = { name, email };
        document.getElementById('user-greeting').innerText = `Bem-vindo, ${name}!`;
        document.getElementById('page-login').classList.remove('active');
        document.getElementById('main-nav').classList.remove('hidden');
        showPage('home');
    } else {
        alert("Preencha todos os campos!");
    }
}

function handleLogout() {
    currentUser = null;
    document.getElementById('page-login').classList.add('active');
    document.getElementById('main-nav').classList.add('hidden');
}

// Navegação
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${pageId}`).classList.add('active');
    
    // Atualiza botões da navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.getAttribute('onclick').includes(pageId)) btn.classList.add('active');
    });
}

// Renderizar Trilhas
function renderTrails() {
    const grid = document.getElementById('trails-grid');
    if(!grid) return;
    
    grid.innerHTML = TRAILS.map(trail => `
        <div class="bg-white/10 p-6 rounded-2xl border border-white/10 card-hover">
            <div class="text-4xl mb-4">${trail.icon}</div>
            <h3 class="font-bold text-xl mb-2">${trail.title}</h3>
            <p class="text-gray-400 text-sm mb-4">${trail.stages} Etapas progressivas</p>
            <button class="btn-primary w-full py-2 rounded-lg text-sm font-semibold">Iniciar Trilha</button>
        </div>
    `).join('');
}