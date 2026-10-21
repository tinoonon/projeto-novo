// Configuração padrão
const DEFAULT_CONFIG = {
  whatsappUrl: "https://chat.whatsapp.com/I6sLuOcvVc3Gh0PufNUhb3?s=cl&p=i&mlu=4&ilr=4&iam=0",
  phoneImageUrl: "public/assets/iphone.jpeg"
};

const STORAGE_KEY = "site_config_v1";

// Elementos DOM (carregados após DOM ready)
let mainContent, adminPanel, phoneMockup, previewPhone, ctaBtn1, ctaBtn2;
let closeAdminBtn, adminForm, whatsappUrlInput, phoneImageUrlInput;
let fileUpload, removeImageBtn, resetBtn, saveBtn, successAlert;

// Estado atual
let config = { ...DEFAULT_CONFIG };

// Função para carregar configuração
function loadConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      config = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Erro ao carregar configuração:', e);
  }
  applyConfig();
}

// Função para salvar configuração
function saveConfig(newConfig) {
  try {
    config = { ...newConfig };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Erro ao salvar configuração:', e);
  }
  applyConfig();
}

// Função para aplicar configuração
function applyConfig() {
  if (!ctaBtn1 || !ctaBtn2) return;
  
  // Atualizar links dos CTAs
  ctaBtn1.href = config.whatsappUrl;
  ctaBtn2.href = config.whatsappUrl;
  
  // Atualizar mockup do telefone
  renderPhoneMockup();
  
  // Atualizar inputs do admin (se estiver aberto)
  if (whatsappUrlInput) {
    whatsappUrlInput.value = config.whatsappUrl;
    phoneImageUrlInput.value = config.phoneImageUrl;
  }
  
  // Atualizar preview do admin
  if (previewPhone) {
    renderPreview();
  }
}

// Função para renderizar o mockup do telefone
function renderPhoneMockup() {
  if (!phoneMockup) return;
  
  if (config.phoneImageUrl) {
    phoneMockup.innerHTML = `
      <div class="phone-custom-image">
        <img src="${config.phoneImageUrl}" alt="Tela do iPhone" loading="lazy">
      </div>
    `;
  } else {
    phoneMockup.innerHTML = `
      <div class="phone-default-screen">
        <div class="phone-header">
          <span>09:37</span>
          <div class="phone-icons">
            <span>📶</span>
            <span>📡</span>
            <span>🔋</span>
          </div>
        </div>
        <div class="phone-topbar">
          <button class="phone-back-btn">‹</button>
          <div class="phone-menu">
            <span class="phone-help-icon">?</span>
            <span>•••</span>
          </div>
        </div>
        <div class="phone-section-title">
          <h3>Histórico</h3>
          <div class="phone-section-icons">
            <span>↑↓</span>
            <span>📊</span>
          </div>
        </div>
        <div class="phone-search">
          <span>🔍</span>
        </div>
        <div class="phone-transfers">
          ${createTransferItem('16.645,54')}
          ${createTransferItem('5.881,31')}
          ${createTransferItem('3.255,54')}
          ${createTransferItem('8.433,31')}
        </div>
      </div>
    `;
  }
}

// Função para criar item de transferência
function createTransferItem(value) {
  return `
    <div class="transfer-item">
      <div class="transfer-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12l7 7 7-7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div class="transfer-info">
        <p class="transfer-title">Transferência recebida</p>
        <p class="transfer-sender">ZYPHER SERVICOS O...</p>
        <p class="transfer-value">R$ ${value}</p>
        <p class="transfer-method">Pix</p>
      </div>
      <span class="transfer-time">Hoje</span>
    </div>
  `;
}

// Função para renderizar preview no admin
function renderPreview() {
  if (!previewPhone) return;
  
  const imageUrl = phoneImageUrlInput.value || config.phoneImageUrl;
  if (imageUrl) {
    previewPhone.innerHTML = `<img src="${imageUrl}" alt="Pré-visualização" loading="lazy">`;
    removeImageBtn.classList.remove('hidden');
  } else {
    previewPhone.innerHTML = `
      <div class="preview-default">
        <p>Tela Padrão do Histórico Pix</p>
        <p>Nenhuma imagem personalizada carregada.</p>
      </div>
    `;
    removeImageBtn.classList.add('hidden');
  }
}

// Função para abrir painel admin
function openAdmin() {
  mainContent.style.display = 'none';
  adminPanel.classList.remove('hidden');
  applyConfig();
}

// Função para fechar painel admin
function closeAdmin() {
  adminPanel.classList.add('hidden');
  mainContent.style.display = 'block';
  if (window.location.hash === '#admin') {
    window.location.hash = '';
  }
  if (window.location.pathname === '/admin') {
    window.history.pushState({}, '', '/');
  }
}

// Mostrar alerta de sucesso
function showSuccessAlert() {
  successAlert.classList.remove('hidden');
  setTimeout(() => {
    successAlert.classList.add('hidden');
  }, 3000);
}

// Função para rastrear cliques nos CTAs (Facebook Pixel)
function trackCtaClick() {
  if (window.fbq) {
    window.fbq('track', 'Lead');
  }
}

// Event Handlers
function handleFileUpload(e) {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      phoneImageUrlInput.value = reader.result;
      renderPreview();
    };
    reader.readAsDataURL(file);
  }
}

function handleRemoveImage() {
  phoneImageUrlInput.value = '';
  fileUpload.value = '';
  renderPreview();
}

function handleReset() {
  if (confirm('Deseja restaurar as configurações originais padrão do site?')) {
    saveConfig(DEFAULT_CONFIG);
    whatsappUrlInput.value = DEFAULT_CONFIG.whatsappUrl;
    phoneImageUrlInput.value = '';
    fileUpload.value = '';
    renderPreview();
    showSuccessAlert();
  }
}

function handleSubmit(e) {
  e.preventDefault();
  
  const newConfig = {
    whatsappUrl: whatsappUrlInput.value.trim() || DEFAULT_CONFIG.whatsappUrl,
    phoneImageUrl: phoneImageUrlInput.value.trim()
  };
  
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span>💾</span><span>Salvando...</span>';
  
  setTimeout(() => {
    saveConfig(newConfig);
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<span>💾</span><span>Salvar Alterações</span>';
    showSuccessAlert();
  }, 300);
}

function handlePopState() {
  if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
    openAdmin();
  } else {
    closeAdmin();
  }
}

// Inicialização quando o DOM estiver pronto
function initApp() {
  // Carregar elementos DOM
  mainContent = document.getElementById('main-content');
  adminPanel = document.getElementById('admin-panel');
  phoneMockup = document.getElementById('phone-mockup');
  previewPhone = document.getElementById('preview-phone');
  ctaBtn1 = document.getElementById('cta-btn-1');
  ctaBtn2 = document.getElementById('cta-btn-2');
  closeAdminBtn = document.getElementById('close-admin');
  adminForm = document.getElementById('admin-form');
  whatsappUrlInput = document.getElementById('whatsapp-url');
  phoneImageUrlInput = document.getElementById('phone-image-url');
  fileUpload = document.getElementById('file-upload');
  removeImageBtn = document.getElementById('remove-image');
  resetBtn = document.getElementById('reset-btn');
  saveBtn = document.getElementById('save-btn');
  successAlert = document.getElementById('success-alert');

  // Verificar se deve abrir admin na inicialização
  if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
    openAdmin();
  }

  // Event Listeners
  closeAdminBtn.addEventListener('click', closeAdmin);
  fileUpload.addEventListener('change', handleFileUpload);
  phoneImageUrlInput.addEventListener('input', renderPreview);
  removeImageBtn.addEventListener('click', handleRemoveImage);
  resetBtn.addEventListener('click', handleReset);
  adminForm.addEventListener('submit', handleSubmit);
  ctaBtn1.addEventListener('click', trackCtaClick);
  ctaBtn2.addEventListener('click', trackCtaClick);
  window.addEventListener('popstate', handlePopState);
  
  // Carregar configuração
  loadConfig();
}

// Aguardar DOM estar pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
