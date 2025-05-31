/**
 * AUTHENTICATION HANDLER - ENHANCED
 * Manages login/logout functionality for T.I QUIZZMASTER
 * Compatible with both old and new page structures
 */

class AuthHandler {
  constructor() {
    this.loginButton = null;
    this.loginImage = null;
    this.tooltip = null;
    this.isLoggedIn = false;
    
    this.init();
  }

  init() {
    this.setupElements();
    this.checkAuthStatus();
    this.setupEventListeners();
    
    console.log('🔐 Auth Handler initialized');
  }

  setupElements() {
    // Support both old and new selectors
    this.loginButton = document.getElementById('login');
    this.loginImage = document.getElementById('loginImage');
    this.tooltip = document.querySelector('.auth-tooltip');
    
    if (!this.loginButton || !this.loginImage) {
      console.warn('Auth elements not found');
      return;
    }
  }

  checkAuthStatus() {
    // Check if user is logged in from localStorage or memory storage
    const token = this.getStoredToken();
    const loginStatus = this.getStoredLoginStatus();
    
    this.isLoggedIn = !!(token && loginStatus);
    this.updateUI();
  }

  updateUI() {
    if (!this.loginImage || !this.loginButton) return;
    
    if (this.isLoggedIn) {
      this.loginImage.src = 'img/logout.png';
      this.loginImage.alt = 'logout';
      this.loginButton.classList.add('logged-in');
      
      if (this.tooltip) {
        this.tooltip.textContent = 'Logout';
      }
    } else {
      this.loginImage.src = 'img/login-image.png';
      this.loginImage.alt = 'login';
      this.loginButton.classList.remove('logged-in');
      
      if (this.tooltip) {
        this.tooltip.textContent = 'Login';
      }
    }
  }

  setupEventListeners() {
    if (!this.loginButton) return;
    
    this.loginButton.addEventListener('click', (event) => {
      if (this.isLoggedIn) {
        event.preventDefault();
        this.handleLogout();
      } else {
        // Allow normal navigation to login page
        this.handleLoginRedirect();
      }
    });

    // Add hover effects
    this.loginButton.addEventListener('mouseenter', () => {
      this.addHoverEffect();
    });

    this.loginButton.addEventListener('mouseleave', () => {
      this.removeHoverEffect();
    });
  }

  handleLoginRedirect() {
    // Add transition effect before navigation
    this.addTransitionEffect(() => {
      window.location.href = 'login.html';
    });
  }

  handleLogout() {
    // Clear authentication data
    this.clearAuthData();
    
    // Update status
    this.isLoggedIn = false;
    this.updateUI();
    
    // Show logout feedback
    this.showLogoutFeedback();
    
    console.log('👋 User logged out');
  }

  login(token, userData = {}) {
    // Store authentication data
    this.storeAuthData(token, userData);
    
    // Update status
    this.isLoggedIn = true;
    this.updateUI();
    
    // Show login feedback
    this.showLoginFeedback();
    
    console.log('👤 User logged in');
  }

  // Enhanced storage methods with fallback support
  storeAuthData(token, userData) {
    // Try localStorage first (for production)
    try {
      if (typeof Storage !== "undefined") {
        localStorage.setItem('token', token);
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(userData));
        return;
      }
    } catch (e) {
      console.warn('localStorage not available, using memory storage');
    }
    
    // Fallback to memory storage (for Claude.ai artifacts)
    window.authData = {
      token: token,
      loggedIn: true,
      userData: userData,
      timestamp: Date.now()
    };
  }

  clearAuthData() {
    // Try localStorage first
    try {
      if (typeof Storage !== "undefined") {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('userData');
        return;
      }
    } catch (e) {
      console.warn('localStorage not available');
    }
    
    // Fallback to memory storage
    if (window.authData) {
      delete window.authData;
    }
  }

  getStoredToken() {
    // Try localStorage first
    try {
      if (typeof Storage !== "undefined") {
        const token = localStorage.getItem('token');
        if (token) return token;
      }
    } catch (e) {
      console.warn('localStorage not available');
    }
    
    // Fallback to memory storage
    return window.authData ? window.authData.token : null;
  }

  getStoredLoginStatus() {
    // Try localStorage first
    try {
      if (typeof Storage !== "undefined") {
        const status = localStorage.getItem('loggedIn');
        if (status) return status === 'true';
      }
    } catch (e) {
      console.warn('localStorage not available');
    }
    
    // Fallback to memory storage
    return window.authData ? window.authData.loggedIn : false;
  }

  getStoredUserData() {
    // Try localStorage first
    try {
      if (typeof Storage !== "undefined") {
        const userData = localStorage.getItem('userData');
        if (userData) return JSON.parse(userData);
      }
    } catch (e) {
      console.warn('localStorage not available');
    }
    
    // Fallback to memory storage
    return window.authData ? window.authData.userData : null;
  }

  // Visual feedback methods
  showLoginFeedback() {
    this.showNotification('Login realizado com sucesso!', 'success');
  }

  showLogoutFeedback() {
    this.showNotification('Logout realizado com sucesso!', 'info');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `auth-notification ${type}`;
    notification.textContent = message;
    
    const bgColor = type === 'success' ? '#00ff41' : type === 'error' ? '#ff0040' : '#00ffff';
    const shadowColor = type === 'success' ? 'rgba(0, 255, 65, 0.5)' : type === 'error' ? 'rgba(255, 0, 64, 0.5)' : 'rgba(0, 255, 255, 0.5)';
    
    notification.style.cssText = `
      position: fixed;
      top: 2rem;
      right: 2rem;
      background: ${bgColor};
      color: #000;
      padding: 1rem 2rem;
      border-radius: 4px;
      font-family: 'Press Start 2P', monospace;
      font-size: 0.7rem;
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      box-shadow: 0 0 20px ${shadowColor};
      max-width: 300px;
      word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Slide out and remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }

  addHoverEffect() {
    if (this.loginButton) {
      this.loginButton.style.transform = 'scale(1.1)';
    }
  }

  removeHoverEffect() {
    if (this.loginButton) {
      this.loginButton.style.transform = '';
    }
  }

  addTransitionEffect(callback) {
    // Create screen transition effect
    const transition = document.createElement('div');
    transition.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(45deg, #000, #003300);
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    `;
    
    document.body.appendChild(transition);
    
    setTimeout(() => {
      transition.style.opacity = '1';
      setTimeout(() => {
        if (callback) callback();
      }, 300);
    }, 50);
  }

  // Enhanced modal integration
  showModal(message) {
    // Try to use existing modal system
    if (typeof showModal === 'function') {
      showModal(message);
      return;
    }
    
    // Check for modal elements
    const modalText = document.getElementById('modalText');
    const modal = document.getElementById('myModal');
    
    if (modalText && modal) {
      modalText.textContent = message;
      modal.style.display = 'block';
      return;
    }
    
    // Fallback to notification
    this.showNotification(message, 'info');
  }

  // Integration with questions page
  setupQuestionsPageIntegration() {
    // Hide loading overlay if present
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
    
    // Update progress if elements exist
    this.updateQuestionProgress(0, 10);
  }

  updateQuestionProgress(current, total) {
    // Update progress bar
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    
    if (progressFill && progressPercentage) {
      const percentage = Math.round((current / total) * 100);
      progressFill.style.width = `${percentage}%`;
      progressPercentage.textContent = `${percentage}%`;
    }
    
    // Update question counter
    const currentQuestionEl = document.getElementById('current-question-number');
    const totalQuestionsEl = document.getElementById('total-questions');
    
    if (currentQuestionEl) currentQuestionEl.textContent = current;
    if (totalQuestionsEl) totalQuestionsEl.textContent = total;
  }

  // Public methods for external use
  getCurrentUser() {
    return this.getStoredUserData();
  }

  isAuthenticated() {
    return this.isLoggedIn;
  }

  forceLogout() {
    this.handleLogout();
  }

  forceLogin(token, userData = {}) {
    this.login(token, userData);
  }

  // Utility method for checking authentication before actions
  requireAuth(action, errorMessage = 'Você precisa fazer login primeiro!') {
    if (!this.isAuthenticated()) {
      this.showModal(errorMessage);
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
      return false;
    }
    
    if (typeof action === 'function') {
      action();
    }
    return true;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.authHandler = new AuthHandler();
  
  // Setup page-specific integrations
  const currentPage = window.location.pathname.split('/').pop();
  
  if (currentPage === 'questions.html' && window.authHandler) {
    window.authHandler.setupQuestionsPageIntegration();
  }
});

// Global authentication check utility
window.requireAuth = function(action, errorMessage) {
  if (window.authHandler) {
    return window.authHandler.requireAuth(action, errorMessage);
  }
  return false;
};

// Export for module use if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthHandler;
}