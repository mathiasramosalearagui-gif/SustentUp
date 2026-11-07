/* ==========================================================================
   SUSTENTUP - LÓGICA COMPLETA COM TRILHA DE NÍVEIS E RECOMPENSAS EXPANDIDAS
   ========================================================================== */

// Lista Oficial dos Níveis
const LEVEL_DEFINITIONS = [
  { level: 1, name: "Eco-Iniciante", minXP: 0, maxXP: 199, icon: "ph-bold ph-seedling" },
  { level: 2, name: "Eco-Guardião", minXP: 200, maxXP: 499, icon: "ph-bold ph-shield-check" },
  { level: 3, name: "Eco-Mestre", minXP: 500, maxXP: 999, icon: "ph-bold ph-tree" },
  { level: 4, name: "Eco-Líder Governamental", minXP: 1000, maxXP: 1999, icon: "ph-bold ph-crown" },
  { level: 5, name: "Eco-Lenda Sustentável", minXP: 2000, maxXP: Infinity, icon: "ph-bold ph-medal-military" }
];

const defaultState = {
  isLoggedIn: false,
  userName: "Alex Silva",
  points: 250,
  totalXP: 250,
  tasksCompleted: 5,
  co2Saved: 12.5,
  tasks: [
    { title: "Descarte de pilhas na escola", category: "Eletrônicos", points: 80, time: "Há 2 horas" },
    { title: "Muda de ipê plantada na praça", category: "Plantio", points: 150, time: "Ontem" }
  ],
  rewards: [
    { id: 1, title: "Squeeze Ecológico", cost: 150, icon: "ph-bold ph-fill-bottle" },
    { id: 2, title: "Ingresso de Cinema Gov", cost: 200, icon: "ph-bold ph-ticket" },
    { id: 3, title: "Kit Cadernos Reciclados", cost: 100, icon: "ph-bold ph-notebook" },
    { id: 4, title: "Passe Livre Ônibus (1 Dia)", cost: 300, icon: "ph-bold ph-bus" },
    { id: 5, title: "Isenção Taxa Vestibulinho", cost: 500, icon: "ph-bold ph-certificate" },
    { id: 6, title: "Kit Mudas p/ Horta Caseira", cost: 80, icon: "ph-bold ph-plant" },
    { id: 7, title: "Certificado Embaixador Verde", cost: 400, icon: "ph-bold ph-medal" },
    { id: 8, title: "Almoço Especial na Cantina", cost: 120, icon: "ph-bold ph-bowl-food" }
  ]
};

let appState = JSON.parse(localStorage.getItem('sustentup_data')) || defaultState;

if (appState.totalXP === undefined) appState.totalXP = appState.points;
if (appState.userName === undefined) appState.userName = "Alex Silva";
if (appState.rewards.length < 8) appState.rewards = defaultState.rewards; // Atualizar prêmios se já existirem salvos antigos

function saveState() {
  localStorage.setItem('sustentup_data', JSON.stringify(appState));
}

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initNavigation();
  initSimulator();
  initForm();
  initModalLevels();
  renderDashboard();
  renderRewards();
  updateUI();
  checkInitialSession();
});

// SESSÃO E AUTH
function checkInitialSession() {
  const mainNav = document.getElementById('main-nav');
  if (appState.isLoggedIn) {
    switchScreen('screen-dashboard');
    mainNav.classList.remove('hidden');
  } else {
    switchScreen('screen-auth');
    mainNav.classList.add('hidden');
  }
}

function initAuth() {
  let isSignupMode = false;

  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');
  const groupName = document.getElementById('group-name');
  const btnSubmit = document.getElementById('btn-auth-submit');
  const toggleText = document.getElementById('toggle-text');
  const btnToggle = document.getElementById('btn-toggle-auth');
  const btnDemo = document.getElementById('btn-demo-login');
  const authForm = document.getElementById('auth-form');
  const btnLogout = document.getElementById('btn-logout');

  btnToggle.addEventListener('click', () => {
    isSignupMode = !isSignupMode;
    if (isSignupMode) {
      authTitle.textContent = "Criar Nova Conta";
      authSubtitle.textContent = "Preencha seus dados estudantis para começar.";
      groupName.classList.remove('hidden');
      btnSubmit.innerHTML = `<i class="ph-bold ph-user-plus"></i> Cadastrar`;
      toggleText.textContent = "Já possui uma conta?";
      btnToggle.textContent = "Entrar";
    } else {
      authTitle.textContent = "Acesse sua Conta";
      authSubtitle.textContent = "Entre para transformar sua escola e acumular pontos.";
      groupName.classList.add('hidden');
      btnSubmit.innerHTML = `<i class="ph-bold ph-sign-in"></i> Entrar`;
      toggleText.textContent = "Não tem uma conta?";
      btnToggle.textContent = "Cadastre-se";
    }
  });

  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('auth-name').value.trim();
    appState.userName = isSignupMode && nameInput ? nameInput : (appState.userName || "Alex Silva");
    loginSuccess(isSignupMode ? "Conta criada com sucesso!" : "Login realizado com sucesso!");
  });

  btnDemo.addEventListener('click', () => {
    appState.userName = "Alex Silva (Demo)";
    loginSuccess("Entrou como Conta de Demonstração!");
  });

  btnLogout.addEventListener('click', () => {
    appState.isLoggedIn = false;
    saveState();
    document.getElementById('main-nav').classList.add('hidden');
    switchScreen('screen-auth');
    showToast("Você saiu da conta.");
  });
}

function loginSuccess(message) {
  appState.isLoggedIn = true;
  saveState();
  updateUI();
  document.getElementById('main-nav').classList.remove('hidden');
  switchScreen('screen-dashboard');
  showToast(`👋 Bem-vindo! ${message}`);
}

function switchScreen(screenId) {
  const screens = document.querySelectorAll('.tab-screen');
  const navButtons = document.querySelectorAll('.nav-btn');

  screens.forEach(screen => {
    screen.classList.toggle('active', screen.id === screenId);
  });

  navButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-target') === screenId);
  });
}

// MODAL DE NÍVEIS
function initModalLevels() {
  const modal = document.getElementById('modal-levels');
  const btnOpen = document.getElementById('btn-open-levels');
  const btnClose = document.getElementById('btn-close-modal');

  btnOpen.addEventListener('click', () => {
    renderLevelsModal();
    modal.classList.remove('hidden');
  });

  btnClose.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });
}

function renderLevelsModal() {
  const levelsList = document.getElementById('levels-list');
  levelsList.innerHTML = '';

  LEVEL_DEFINITIONS.forEach(def => {
    const isUnlocked = appState.totalXP >= def.minXP;
    const isCurrent = appState.totalXP >= def.minXP && (def.maxXP === Infinity || appState.totalXP <= def.maxXP);

    const item = document.createElement('div');
    item.className = `level-card-item ${isUnlocked ? 'unlocked' : ''} ${isCurrent ? 'current' : ''}`;
    
    const xpRangeText = def.maxXP === Infinity ? `${def.minXP}+ XP` : `${def.minXP} - ${def.maxXP} XP`;
    const statusLabel = isCurrent ? "ATUAL" : (isUnlocked ? "CONQUISTADO" : "BLOQUEADO");

    item.innerHTML = `
      <div class="level-info-left">
        <div class="level-icon-box">
          <i class="${def.icon}"></i>
        </div>
        <div class="level-details">
          <h4>Nível ${def.level}: ${def.name}</h4>
          <p>${xpRangeText}</p>
        </div>
      </div>
      <span class="level-status-tag">${statusLabel}</span>
    `;

    levelsList.appendChild(item);
  });
}

// TOAST
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  const toastIcon = document.getElementById('toast-icon');

  toastMsg.textContent = message;
  toast.classList.toggle('error', isError);
  toastIcon.className = isError ? 'ph-bold ph-warning-circle' : 'ph-bold ph-check-circle';

  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3500);
}

// NAVEGAÇÃO
function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchScreen(btn.getAttribute('data-target'));
    });
  });
}

// SIMULADOR
function initSimulator() {
  const categorySelect = document.getElementById('sim-category');
  const amountInput = document.getElementById('sim-amount');
  const previewText = document.getElementById('sim-total-preview');

  function calculateSimulation() {
    const pointsPerUnit = parseInt(categorySelect.value) || 0;
    const amount = parseInt(amountInput.value) || 1;
    previewText.textContent = `+${pointsPerUnit * amount} pts`;
  }

  categorySelect.addEventListener('change', calculateSimulation);
  amountInput.addEventListener('input', calculateSimulation);
}

// REGISTRO DE AÇÃO
function initForm() {
  const form = document.getElementById('action-form');
  const categorySelect = document.getElementById('sim-category');
  const amountInput = document.getElementById('sim-amount');
  const titleInput = document.getElementById('action-title');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    if (!title) return;

    const pointsPerUnit = parseInt(categorySelect.value) || 100;
    const amount = parseInt(amountInput.value) || 1;
    const earnedPoints = pointsPerUnit * amount;

    appState.points += earnedPoints;
    appState.totalXP += earnedPoints;
    appState.tasksCompleted += 1;
    appState.co2Saved += (amount * 1.5);

    const selectedOptionText = categorySelect.options[categorySelect.selectedIndex].text.split(' (')[0];
    appState.tasks.unshift({
      title: title,
      category: selectedOptionText,
      points: earnedPoints,
      time: "Agora mesmo"
    });

    saveState();
    updateUI();
    renderDashboard();

    form.reset();
    document.getElementById('sim-amount').value = 1;
    document.getElementById('sim-total-preview').textContent = '+100 pts';

    showToast(`🎉 Ação enviada! Você ganhou +${earnedPoints} pontos.`);
    switchScreen('screen-dashboard');
  });
}

// ATUALIZAR INTERFACE
function updateUI() {
  document.getElementById('dash-user-name').textContent = appState.userName;
  document.getElementById('profile-user-name').textContent = appState.userName;

  document.getElementById('total-points-dash').textContent = appState.points;
  document.getElementById('total-points-profile').textContent = appState.points;
  document.getElementById('stat-tasks').textContent = appState.tasksCompleted;
  document.getElementById('stat-co2').textContent = `${appState.co2Saved.toFixed(1)} kg`;

  // Calcular Nível Atual
  let currentLevelObj = LEVEL_DEFINITIONS[0];
  let nextLevelObj = LEVEL_DEFINITIONS[1];

  for (let i = 0; i < LEVEL_DEFINITIONS.length; i++) {
    if (appState.totalXP >= LEVEL_DEFINITIONS[i].minXP) {
      currentLevelObj = LEVEL_DEFINITIONS[i];
      nextLevelObj = LEVEL_DEFINITIONS[i + 1] || LEVEL_DEFINITIONS[i];
    }
  }

  const nextMaxXP = nextLevelObj.minXP === currentLevelObj.minXP ? currentLevelObj.minXP : nextLevelObj.minXP;
  const progressPct = nextMaxXP === currentLevelObj.minXP ? 100 : Math.min(100, Math.round((appState.totalXP / nextMaxXP) * 100));

  document.getElementById('level-badge').textContent = `Nível ${currentLevelObj.level}: ${currentLevelObj.name}`;
  document.getElementById('progress-title').textContent = nextMaxXP === currentLevelObj.minXP ? 'Nível Máximo Alcançado!' : `Progresso para Nível ${nextLevelObj.level}`;
  document.getElementById('progress-pts').textContent = `${appState.totalXP} / ${nextMaxXP} XP`;
  document.getElementById('progress-fill').style.width = `${progressPct}%`;
}

// DASHBOARD
function renderDashboard() {
  const taskListContainer = document.getElementById('task-list');
  taskListContainer.innerHTML = '';

  appState.tasks.forEach(task => {
    const taskCard = document.createElement('div');
    taskCard.className = 'task-item';
    taskCard.innerHTML = `
      <div class="task-item-info">
        <h4>${task.title}</h4>
        <p>${task.category} • ${task.time}</p>
      </div>
      <span class="task-tag">+${task.points} pts</span>
    `;
    taskListContainer.appendChild(taskCard);
  });
}

// RECOMPENSAS
function renderRewards() {
  const rewardsGrid = document.getElementById('rewards-grid');
  rewardsGrid.innerHTML = '';

  appState.rewards.forEach(reward => {
    const card = document.createElement('div');
    card.className = 'reward-card';
    card.innerHTML = `
      <i class="${reward.icon}"></i>
      <h4>${reward.title}</h4>
      <div class="cost">${reward.cost} pts</div>
      <button class="btn-redeem" onclick="redeemReward(${reward.id})">Resgatar</button>
    `;
    rewardsGrid.appendChild(card);
  });
}

// RESGATAR RECOMPENSA
window.redeemReward = function(rewardId) {
  const reward = appState.rewards.find(r => r.id === rewardId);
  if (!reward) return;

  if (appState.points >= reward.cost) {
    appState.points -= reward.cost;
    saveState();
    updateUI();
    showToast(`🎁 Sucesso! Resgatado: ${reward.title}`);
  } else {
    showToast(`❌ Pontos insuficientes! Faltam ${reward.cost - appState.points} pts.`, true);
  }
};