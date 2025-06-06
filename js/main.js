/**
 * MAIN APPLICATION CONTROLLER
 * Central initialization and configuration for T.I QUIZZMASTER
 */

class QuizMasterApp {
  constructor() {
    this.isInitialized = false;
    this.config = {
      version: '2.0.0',
      debug: false,
      animations: true,
      audio: false,
      theme: 'matrix'
    };

    this.init();
  }

  init() {
    if (this.isInitialized) return;

    this.setupGlobalStyles();
    this.setupPerformanceOptimizations();
    this.setupAccessibility();
    this.setupAudio();
    this.setupGlobalEvents();
    this.startupSequence();

    this.isInitialized = true;
    this.log('🚀 QuizMaster App initialized successfully');
  }

  setupGlobalStyles() {
    // Add dynamic CSS variables based on screen size
    this.updateCSSVariables();

    // Handle responsive design updates
    window.addEventListener('resize', this.debounce(() => {
      this.updateCSSVariables();
    }, 250));
  }

  updateCSSVariables() {
    const root = document.documentElement;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Dynamic font scaling
    const baseFontSize = Math.min(vw / 20, vh / 15);
    root.style.setProperty('--dynamic-font-size', `${baseFontSize}px`);

    // Dynamic spacing
    const baseSpacing = Math.min(vw / 50, vh / 40);
    root.style.setProperty('--dynamic-spacing', `${baseSpacing}px`);

    // Aspect ratio adjustments
    root.style.setProperty('--screen-ratio', `${vw / vh}`);
  }

  setupPerformanceOptimizations() {
    // Reduce animations on low-end devices
    if (this.isLowEndDevice()) {
      document.body.classList.add('reduced-motion');
      this.config.animations = false;
    }

    // Optimize canvas performance
    this.optimizeCanvas();

    // Preload critical images
    this.preloadImages();
  }

  isLowEndDevice() {
    // Simple heuristic for low-end device detection
    const memory = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 2;
    const connection = navigator.connection;

    return (
      memory < 2 ||
      cores < 4 ||
      (connection && connection.saveData) ||
      /Android.*4\.|iPhone.*OS [5-8]_/.test(navigator.userAgent)
    );
  }

  optimizeCanvas() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    // Set appropriate pixel ratio for high DPI displays
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.style.transform = `scale(${1 / pixelRatio})`;
    canvas.style.transformOrigin = '0 0';

    // Optimize canvas context
    const context = canvas.getContext('2d');
    if (context) {
      context.imageSmoothingEnabled = false;
    }
  }

  preloadImages() {
    const imagesToPreload = [
      'img/login-image.png',
      'img/logout.png',
      'img/Vector 1.png'
    ];

    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }

  setupAccessibility() {
    // Add skip navigation
    this.addSkipNavigation();

    // Handle reduced motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('reduced-motion');
      this.config.animations = false;
    }

    // Handle high contrast preferences
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      document.body.classList.add('high-contrast');
    }

    // Keyboard navigation improvements
    this.setupKeyboardNavigation();
  }

  addSkipNavigation() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Pular para o conteúdo principal';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: var(--primary-green);
      color: var(--background-black);
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      font-family: 'Press Start 2P', monospace;
      font-size: 0.7rem;
      z-index: 10000;
      transition: top 0.3s ease;
    `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);

    // Add main content ID to container
    const container = document.querySelector('.container');
    if (container) {
      container.id = 'main-content';
      container.setAttribute('tabindex', '-1');
    }
  }

  setupKeyboardNavigation() {
    // Enhanced keyboard navigation
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Escape':
          this.handleEscape();
          break;
        case 'Enter':
          if (e.target.classList.contains('btn')) {
            e.target.click();
          }
          break;
        case 'g':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.toggleGlitchIntensity();
          }
          break;
      }
    });

    // Focus management
    this.setupFocusManagement();
  }

  setupFocusManagement() {
    // Trap focus within main navigation
    const focusableElements = document.querySelectorAll(
      'a[href], button, [tabindex]:not([tabindex=\"-1\"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    });
  }

  setupAudio() {
    const audio = document.getElementById('backgroundAudio');
    if (!audio) return;

    // Handle audio loading errors gracefully
    audio.addEventListener('error', () => {
      this.log('🔇 Background audio failed to load');
    });

    // Respect user's audio preferences
    audio.volume = 0.3;
    audio.muted = !this.config.audio;

    // Add audio control toggle
    this.addAudioControl();
  }

  addAudioControl() {
    const audioToggle = document.createElement('button');
    audioToggle.className = 'audio-toggle';
    audioToggle.setAttribute('aria-label', 'Toggle background audio');
    audioToggle.innerHTML = this.config.audio ? '🔊' : '🔇';

    audioToggle.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: rgba(0, 0, 0, 0.8);
      border: 2px solid var(--primary-green);
      color: var(--primary-green);
      padding: 1rem;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.2rem;
      transition: all 0.3s ease;
      z-index: 1000;
      backdrop-filter: blur(10px);
    `;

    audioToggle.addEventListener('click', () => {
      this.toggleAudio();
      audioToggle.innerHTML = this.config.audio ? '🔊' : '🔇';
    });

    document.body.appendChild(audioToggle);
  }

  setupGlobalEvents() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAnimations();
      } else {
        this.resumeAnimations();
      }
    });

    // Handle online/offline status
    window.addEventListener('online', () => {
      this.showConnectionStatus('online');
    });

    window.addEventListener('offline', () => {
      this.showConnectionStatus('offline');
    });

    // Handle errors gracefully
    window.addEventListener('error', (e) => {
      this.handleGlobalError(e);
    });
  }

  startupSequence() {
    // Show loading indicator
    this.showStartupAnimation();

    // Initialize components with delays for smooth startup
    setTimeout(() => {
      this.log('⚡ Core systems online');
    }, 500);

    setTimeout(() => {
      this.log('🎯 All systems ready');
      this.hideStartupAnimation();
    }, 1500);
  }

  showStartupAnimation() {
    const startup = document.createElement('div');
    startup.id = 'startup-overlay';
    startup.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: var(--background-black);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.5s ease;
    `;

    startup.innerHTML = `
      <div style="text-align: center;">
        <div style="color: var(--primary-green); font-family: 'Orbitron', monospace; font-size: 1.5rem; margin-bottom: 2rem;">
          INITIALIZING SYSTEMS...
        </div>
        <div style="width: 200px; height: 4px; background: #333; border-radius: 2px; overflow: hidden;">
          <div style="width: 0%; height: 100%; background: var(--primary-green); border-radius: 2px; animation: loadingBar 1.5s ease-out forwards;"></div>
        </div>
      </div>
    `;

    document.body.appendChild(startup);

    // Add loading animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes loadingBar {
        to { width: 100%; }
      }
    `;
    document.head.appendChild(style);
  }

  hideStartupAnimation() {
    const startup = document.getElementById('startup-overlay');
    if (startup) {
      startup.style.opacity = '0';
      setTimeout(() => {
        startup.remove();
      }, 500);
    }
  }

  // Utility methods
  toggleAudio() {
    this.config.audio = !this.config.audio;
    const audio = document.getElementById('backgroundAudio');
    if (audio) {
      audio.muted = !this.config.audio;
    }
  }

  toggleGlitchIntensity() {
    if (window.glitchController) {
      const newIntensity = window.glitchController.glitchIntensity > 1 ? 0.5 : 2;
      window.glitchController.setIntensity(newIntensity);
      this.log(`🎛️ Glitch intensity: ${newIntensity}x`);
    }
  }

  pauseAnimations() {
    if (window.glitchController) {
      window.glitchController.pause();
    }
  }

  resumeAnimations() {
    if (window.glitchController) {
      window.glitchController.resume();
    }
  }

  showConnectionStatus(status) {
    const message = status === 'online' ? 'Conexão restaurada' : 'Conexão perdida';
    const color = status === 'online' ? '#00ff41' : '#ff0040';

    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: ${color};
      color: #000;
      padding: 1rem 2rem;
      border-radius: 4px;
      font-family: 'Press Start 2P', monospace;
      font-size: 0.8rem;
      z-index: 10000;
      box-shadow: 0 0 30px ${color};
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 2000);
  }

  handleEscape() {
    // Close any open modals or return to main state
    this.log('⚡ Escape pressed - returning to main state');
  }

  handleGlobalError(error) {
    if (this.config.debug) {
      console.error('Global error:', error);
    }

    // Show user-friendly error message
    this.showNotification('Algo deu errado. Recarregue a página.', 'error');
  }

  showNotification(message, type = 'info') {
    // Reuse auth handler notification if available
    if (window.authHandler && window.authHandler.showNotification) {
      window.authHandler.showNotification(message, type);
    }
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  log(message) {
    if (this.config.debug) {
      console.log(`[QuizMaster] ${message}`);
    }
  }

  // Public API
  getConfig() {
    return { ...this.config };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  window.quizMasterApp = new QuizMasterApp();
});

// Export for module use if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuizMasterApp;
}

// Script para mostrar/esconder botão de perfil
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔧 Iniciando controle do botão de perfil...');

  // Função para verificar se usuário está logado
  function checkUserLogin() {
    const token = localStorage.getItem('token') ||
      (window.authData && window.authData.token) ||
      sessionStorage.getItem('token');
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true' ||
      (window.authData && window.authData.loggedIn) ||
      sessionStorage.getItem('loggedIn') === 'true';

    return !!(token && isLoggedIn);
  }

  // Função para atualizar visibilidade do botão de perfil
  function updateProfileButtonVisibility() {
    const profileBtn = document.getElementById('profile-btn');
    const navigation = document.querySelector('.navigation');

    if (profileBtn) {
      const isLoggedIn = checkUserLogin();
      console.log('🔧 Status de login:', isLoggedIn);

      if (isLoggedIn) {
        // 🔧 CORRIGIDO: Usar classes CSS para controle completo
        profileBtn.classList.remove('hidden');
        profileBtn.classList.add('profile-fade-in');
        if (navigation) navigation.classList.remove('no-profile');
        console.log('👤 Botão de perfil exibido');
      } else {
        // 🔧 CORRIGIDO: Remove da renderização completamente
        profileBtn.classList.add('hidden');
        profileBtn.classList.remove('profile-fade-in');
        if (navigation) navigation.classList.add('no-profile');
        console.log('👤 Botão de perfil ocultado');
      }
    } else {
      console.warn('⚠️ Elemento profile-btn não encontrado');
    }
  }

  // Verificar inicialmente após um pequeno delay
  setTimeout(() => {
    updateProfileButtonVisibility();
  }, 100);

  // Verificar quando o authHandler for carregado
  setTimeout(() => {
    updateProfileButtonVisibility();
  }, 1000);

  // Verificar após o carregamento completo
  setTimeout(() => {
    updateProfileButtonVisibility();
  }, 2000);

  // Listener para mudanças no localStorage
  window.addEventListener('storage', (e) => {
    if (e.key === 'token' || e.key === 'loggedIn') {
      console.log('🔧 Mudança detectada no storage:', e.key);
      setTimeout(updateProfileButtonVisibility, 100);
    }
  });

  // Verificar periodicamente (fallback)
  setInterval(updateProfileButtonVisibility, 5000);

  // 🔧 NOVO: Debug function
  window.debugProfileButton = function () {
    const profileBtn = document.getElementById('profile-btn');
    const computedStyle = profileBtn ? window.getComputedStyle(profileBtn) : null;
    console.log('🔧 Debug do botão de perfil:', {
      exists: !!profileBtn,
      hasHiddenClass: profileBtn?.classList.contains('hidden'),
      hasFadeInClass: profileBtn?.classList.contains('profile-fade-in'),
      computedDisplay: computedStyle?.display,
      computedOpacity: computedStyle?.opacity,
      computedVisibility: computedStyle?.visibility,
      computedWidth: computedStyle?.width,
      computedHeight: computedStyle?.height,
      classList: profileBtn?.classList.toString(),
      isLoggedIn: checkUserLogin()
    });
  };

  console.log('✅ Controle do botão de perfil configurado');
  console.log('💡 Use debugProfileButton() no console para debug');
});
