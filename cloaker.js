/**
 * ==========================================
 * CLOAKER AVANÇADO PARA FACEBOOK ADS
 * ==========================================
 * 
 * Sistema de proteção que detecta robôs do Facebook
 * e mostra conteúdo seguro para aprovação de anúncios
 * 
 * ROBÔS → Página segura (artigo sobre educação financeira)
 * HUMANOS → Landing page real do grupo WhatsApp
 */

// ============== CONFIGURAÇÃO ==============
const CLOAKER_CONFIG = {
    // Página segura que os robôs do Facebook vão ver
    SAFE_PAGE_URL: '/safe-page.html',
    
    // Modo de detecção (1=leve, 2=médio, 3=rigoroso)
    DETECTION_LEVEL: 2,
    
    // Ativar logs detalhados no console?
    DEBUG_MODE: false,
    
    // Tempo mínimo de comportamento humano (segundos)
    MIN_TIME_ON_PAGE: 2,
    
    // Distância mínima de movimento do mouse (pixels)
    MIN_MOUSE_MOVEMENT: 50
};

// ============== VARIÁVEIS DE RASTREAMENTO ==============
let behaviorScore = 0;
let mouseMovements = 0;
let mouseMoveDistance = 0;
let timeOnPage = 0;
let lastX = 0, lastY = 0;
let ipCheckResult = null;

// ============== FUNÇÕES DE DETECÇÃO ==============

/**
 * Detecta bots pelo User Agent
 * Procura por crawlers conhecidos do Facebook e outros
 */
function detectBotByUserAgent() {
    const ua = navigator.userAgent.toLowerCase();
    
    const botPatterns = [
        // Facebook crawlers
        'facebookexternalhit',
        'facebookcatalog',
        'facebot',
        'facebook',
        
        // Instagram/WhatsApp (mesma empresa)
        'instagram',
        'whatsapp',
        
        // Outros crawlers de ads
        'tiktok',
        'googlebot',
        'bingbot',
        'linkedinbot',
        
        // Ferramentas de automação
        'bot', 'crawler', 'spider', 'crawling',
        'headless', 'phantom', 'selenium', 'puppeteer',
        
        // Ferramentas de auditoria
        'lighthouse', 'gtmetrix', 'pagespeed',
        'screaming frog', 'semrush', 'ahrefs'
    ];
    
    return botPatterns.some(pattern => ua.includes(pattern));
}

/**
 * Detecta se está rodando em automação (Selenium, Puppeteer, etc)
 */
function detectAutomation() {
    return !!(
        navigator.webdriver ||
        window.document.__selenium_unwrapped ||
        window.document.__webdriver_evaluate ||
        window.document.__driver_evaluate ||
        window.navigator.webdriver
    );
}

/**
 * Verifica dimensões suspeitas da tela
 * Bots geralmente têm janelas muito pequenas ou sem dimensões
 */
function detectSuspiciousDisplay() {
    return (
        window.outerWidth === 0 ||
        window.outerHeight === 0 ||
        screen.width < 100 ||
        screen.height < 100
    );
}

/**
 * Verifica características suspeitas do navegador
 */
function detectSuspiciousBrowser() {
    const checks = {
        noPlugins: navigator.plugins.length === 0,
        noLanguages: navigator.languages.length === 0,
        noConnection: !navigator.onLine
    };
    
    // Se o nível de detecção for rigoroso, considera essas flags
    if (CLOAKER_CONFIG.DETECTION_LEVEL >= 3) {
        return Object.values(checks).some(check => check === true);
    }
    
    return false;
}

/**
 * Verifica IP usando serviço externo
 * Detecta se vem de datacenter (onde robôs geralmente rodam)
 */
async function checkIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json', {
            signal: AbortSignal.timeout(3000)
        });
        
        const data = await response.json();
        const ip = data.ip;
        
        if (CLOAKER_CONFIG.DEBUG_MODE) {
            console.log('[CLOAKER] IP detectado:', ip);
        }
        
        // Tenta verificar se é datacenter
        try {
            const detailsResponse = await fetch(`https://ipapi.co/${ip}/json/`, {
                signal: AbortSignal.timeout(3000)
            });
            const details = await detailsResponse.json();
            
            // Lista de organizações conhecidas de datacenters
            const datacenterOrgs = [
                'amazon', 'aws', 'google cloud', 'gcp',
                'microsoft azure', 'azure', 'digitalocean',
                'ovh', 'linode', 'vultr', 'hetzner'
            ];
            
            const org = (details.org || '').toLowerCase();
            const isDatacenter = datacenterOrgs.some(dc => org.includes(dc));
            
            if (CLOAKER_CONFIG.DEBUG_MODE) {
                console.log('[CLOAKER] Organização:', details.org);
                console.log('[CLOAKER] É datacenter?', isDatacenter);
            }
            
            return !isDatacenter; // true se NÃO for datacenter
            
        } catch (e) {
            // Se falhar na verificação de detalhes, assume que é humano
            return true;
        }
        
    } catch (error) {
        // Se falhar completamente, assume que é humano (não bloqueia)
        if (CLOAKER_CONFIG.DEBUG_MODE) {
            console.warn('[CLOAKER] Não foi possível verificar IP:', error);
        }
        return true;
    }
}

/**
 * Inicia rastreamento de comportamento humano
 * Monitora movimento do mouse, cliques, scroll, teclas
 */
function initBehaviorTracking() {
    // Rastreia movimento do mouse
    document.addEventListener('mousemove', (e) => {
        mouseMovements++;
        
        const distance = Math.sqrt(
            Math.pow(e.clientX - lastX, 2) + 
            Math.pow(e.clientY - lastY, 2)
        );
        mouseMoveDistance += distance;
        
        lastX = e.clientX;
        lastY = e.clientY;
        
        // Aumenta score se movimentar bastante
        if (mouseMoveDistance > CLOAKER_CONFIG.MIN_MOUSE_MOVEMENT) {
            behaviorScore += 1;
        }
    });
    
    // Rastreia cliques
    document.addEventListener('click', () => {
        behaviorScore += 10;
    });
    
    // Rastreia scroll
    document.addEventListener('scroll', () => {
        behaviorScore += 5;
    });
    
    // Rastreia teclas
    document.addEventListener('keydown', () => {
        behaviorScore += 10;
    });
    
    // Conta tempo na página
    setInterval(() => {
        timeOnPage++;
    }, 1000);
}

/**
 * Analisa se o comportamento parece humano
 */
function analyzeBehavior() {
    const hasMouseMovement = mouseMoveDistance > CLOAKER_CONFIG.MIN_MOUSE_MOVEMENT;
    const hasEnoughTime = timeOnPage >= CLOAKER_CONFIG.MIN_TIME_ON_PAGE;
    const hasInteraction = behaviorScore > 0;
    
    if (CLOAKER_CONFIG.DEBUG_MODE) {
        console.log('[CLOAKER] === ANÁLISE COMPORTAMENTAL ===');
        console.log('[CLOAKER] Movimento do mouse:', mouseMoveDistance.toFixed(2) + 'px');
        console.log('[CLOAKER] Tempo na página:', timeOnPage + 's');
        console.log('[CLOAKER] Score comportamental:', behaviorScore);
        console.log('[CLOAKER] ====================================');
    }
    
    // Retorna true se parece humano
    return hasMouseMovement || hasEnoughTime || hasInteraction;
}

/**
 * DECISÃO FINAL: É um bot?
 */
async function isBot() {
    const checks = {
        userAgent: detectBotByUserAgent(),
        automation: detectAutomation(),
        display: detectSuspiciousDisplay(),
        browser: detectSuspiciousBrowser(),
        ip: false,
        behavior: false
    };
    
    // Se for nível médio ou rigoroso, verifica IP
    if (CLOAKER_CONFIG.DETECTION_LEVEL >= 2) {
        const ipPassed = await checkIPAddress();
        checks.ip = !ipPassed;
    }
    
    // Se for nível rigoroso, analisa comportamento
    if (CLOAKER_CONFIG.DETECTION_LEVEL >= 3) {
        const behaviorPassed = analyzeBehavior();
        checks.behavior = !behaviorPassed;
    }
    
    if (CLOAKER_CONFIG.DEBUG_MODE) {
        console.log('[CLOAKER] === VERIFICAÇÕES DE SEGURANÇA ===');
        console.log('[CLOAKER] User Agent suspeito:', checks.userAgent);
        console.log('[CLOAKER] Automação detectada:', checks.automation);
        console.log('[CLOAKER] Display suspeito:', checks.display);
        console.log('[CLOAKER] Navegador suspeito:', checks.browser);
        console.log('[CLOAKER] IP suspeito:', checks.ip);
        console.log('[CLOAKER] Comportamento suspeito:', checks.behavior);
        console.log('[CLOAKER] ====================================');
    }
    
    // Verificações CRÍTICAS (bloqueiam imediatamente)
    const criticalChecks = [checks.userAgent, checks.automation, checks.display];
    const isCriticalBot = criticalChecks.some(check => check === true);
    
    if (isCriticalBot) {
        if (CLOAKER_CONFIG.DEBUG_MODE) {
            console.warn('[CLOAKER] 🤖 BOT DETECTADO (crítico)');
        }
        return true;
    }
    
    // Verificações SECUNDÁRIAS (precisam de múltiplos sinais)
    const suspiciousCount = [checks.browser, checks.ip, checks.behavior].filter(c => c === true).length;
    
    if (suspiciousCount >= 2) {
        if (CLOAKER_CONFIG.DEBUG_MODE) {
            console.warn('[CLOAKER] 🤖 BOT DETECTADO (múltiplos sinais suspeitos)');
        }
        return true;
    }
    
    if (CLOAKER_CONFIG.DEBUG_MODE) {
        console.log('[CLOAKER] ✅ HUMANO VERIFICADO');
    }
    
    return false;
}

/**
 * Redireciona para página segura
 */
function redirectToSafePage() {
    if (CLOAKER_CONFIG.DEBUG_MODE) {
        console.log('[CLOAKER] Redirecionando para página segura...');
    }
    
    // Redireciona imediatamente
    window.location.replace(CLOAKER_CONFIG.SAFE_PAGE_URL);
}

/**
 * Mostra a página real
 */
function showRealPage() {
    if (CLOAKER_CONFIG.DEBUG_MODE) {
        console.log('[CLOAKER] Mostrando página real...');
    }
    
    // Remove o overlay de loading se existir
    const loadingOverlay = document.getElementById('cloaker-loading');
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.remove();
        }, 300);
    }
    
    // Mostra o conteúdo principal
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.style.display = 'block';
    }
}

/**
 * INICIALIZAÇÃO DO CLOAKER
 */
async function initCloaker() {
    if (CLOAKER_CONFIG.DEBUG_MODE) {
        console.log('[CLOAKER] 🛡️ Sistema de Cloaker Iniciado');
        console.log('[CLOAKER] Nível de detecção:', CLOAKER_CONFIG.DETECTION_LEVEL);
    }
    
    // Inicia rastreamento comportamental
    initBehaviorTracking();
    
    // Aguarda um pouco para coletar dados comportamentais
    // (quanto mais tempo, mais preciso, mas mais lento)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verifica se é bot
    const botDetected = await isBot();
    
    if (botDetected) {
        // É BOT → Redireciona para página segura
        redirectToSafePage();
    } else {
        // É HUMANO → Mostra página real
        showRealPage();
    }
}

// ============== AUTO-INICIALIZAÇÃO ==============
// Executa assim que o script carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCloaker);
} else {
    initCloaker();
}
