/**
 * ENHANCED CREDITS PAGE CONTROLLER
 * Sistema aprimorado de créditos com efeitos visuais
 */

class EnhancedCreditsController {
  constructor() {
    this.canvas = null;
    this.context = null;
    this.particles = [];
    this.isAnimating = true;
    this.animationFrame = null;
    this.skipButton = null;
    this.music = null;
    this.creditsSpeed = 'normal'; // 🔧 NOVO: Controle de velocidade
    this.speedIndicator = null; // 🔧 NOVO: Indicador visual
    
    this.config = {
      particleCount: 100,
      particleSpeed: 0.5,
      particleSize: 2,
      colors: ['#00ff41', '#00d300', '#00ffff', '#8000ff'],
      glitchInterval: 5000
    };
    
    this.init();
  }

  init() {
    this.setupCanvas();
    this.setupSkipButton();
    this.setupMusic();
    this.setupParticles();
    this.setupGlitchEffects();
    this.setupScrollEffects();
    this.setupSpeedControls(); // 🔧 NOVO: Controles de velocidade
    this.createSpeedIndicator(); // 🔧 NOVO: Indicador visual
    this.startAnimation();
    
    console.log('🎬 Enhanced Credits Controller initialized');
  }

  setupCanvas() {
    this.canvas = document.getElementById('credits-canvas');
    if (!this.canvas) return;
    
    this.context = this.canvas.getContext('2d');
    this.resizeCanvas();
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.setupParticles();
    });
  }

  resizeCanvas() {
    if (!this.canvas) return;
    
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupParticles() {
    this.particles = [];
    
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * this.config.particleSpeed,
        vy: (Math.random() - 0.5) * this.config.particleSpeed,
        size: Math.random() * this.config.particleSize + 1,
        color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
        opacity: Math.random() * 0.5 + 0.2,
        life: Math.random() * 100 + 50
      });
    }
  }

  setupSkipButton() {
    this.skipButton = document.getElementById('back-home');
    
    if (!this.skipButton) return;
    
    // Show skip button after 10 seconds
    setTimeout(() => {
      if (this.skipButton) {
        this.skipButton.style.display = 'flex';
        this.skipButton.style.animation = 'fadeInUp 0.5s ease-out forwards';
      }
    }, 10000);
    
    // Add enhanced click effect
    this.skipButton.addEventListener('click', (e) => {
      this.triggerSkipEffect();
    });
    
    // Add hover sound effect simulation
    this.skipButton.addEventListener('mouseenter', () => {
      this.createHoverEffect();
    });
  }

  setupMusic() {
    this.music = document.querySelector('.credit-music');
    
    if (!this.music) return;
    
    // Enhanced music controls
    this.music.addEventListener('loadstart', () => {
      console.log('🎵 Loading music...');
    });
    
    this.music.addEventListener('canplay', () => {
      console.log('🎵 Music ready to play');
      this.syncMusicVisualization();
    });
    
    this.music.addEventListener('error', () => {
      console.warn('🎵 Music failed to load');
    });
  }

  syncMusicVisualization() {
    // Sync music visualizer bars with beat
    const bars = document.querySelectorAll('.bar');
    let beatIndex = 0;
    
    setInterval(() => {
      bars.forEach((bar, index) => {
        if (index === beatIndex % bars.length) {
          bar.style.animationDuration = '0.3s';
          bar.style.transform = 'scaleY(1.5)';
        } else {
          bar.style.animationDuration = '0.8s';
          bar.style.transform = 'scaleY(1)';
        }
      });
      beatIndex++;
    }, 400);
  }

  setupGlitchEffects() {
    // Random glitch effects on text elements
    const glitchableElements = document.querySelectorAll('.section-title, .credit-item .name');
    
    setInterval(() => {
      const element = glitchableElements[Math.floor(Math.random() * glitchableElements.length)];
      this.triggerTextGlitch(element);
    }, this.config.glitchInterval);
  }

  triggerTextGlitch(element) {
    if (!element) return;
    
    const originalText = element.textContent;
    const glitchChars = '█▓▒░▓█▒░▓▒▓>▓░▓▒>/█>▓▒▓░▓▒░▓█▒░▓';
    let glitchCount = 0;
    const maxGlitch = 3;
    
    const glitchInterval = setInterval(() => {
      if (glitchCount >= maxGlitch) {
        element.textContent = originalText;
        clearInterval(glitchInterval);
        return;
      }
      
      // Create glitched version
      const glitchedText = originalText
        .split('')
        .map(char => {
          if (Math.random() < 0.3) {
            return glitchChars[Math.floor(Math.random() * glitchChars.length)];
          }
          return char;
        })
        .join('');
      
      element.textContent = glitchedText;
      glitchCount++;
    }, 100);
  }

  setupScrollEffects() {
    // Parallax effect for background elements
    const backgroundElements = document.querySelectorAll('.particles, .grid-overlay');
    
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      
      backgroundElements.forEach(element => {
        element.style.transform = `translateY(${rate}px)`;
      });
    });
    
    // Intersection Observer for section animations
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          this.triggerSectionEffect(entry.target);
        }
      });
    }, {
      threshold: 0.3
    });
    
    document.querySelectorAll('.credits-section').forEach(section => {
      observer.observe(section);
    });
  }

  triggerSectionEffect(section) {
    // Add special entrance effect for each section
    section.style.transform = 'scale(1.02)';
    section.style.boxShadow = '0 0 50px rgba(0, 255, 65, 0.3)';
    
    setTimeout(() => {
      section.style.transform = '';
      section.style.boxShadow = '';
    }, 500);
  }

  startAnimation() {
    if (!this.isAnimating || !this.canvas || !this.context) return;
    
    this.animateParticles();
    this.animationFrame = requestAnimationFrame(() => this.startAnimation());
  }

  animateParticles() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach((particle, index) => {
      // Update particle position
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      
      // Wrap around screen edges
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;
      
      // Reset particle if life is over
      if (particle.life <= 0) {
        this.resetParticle(particle);
      }
      
      // Draw particle
      this.drawParticle(particle);
      
      // Draw connections between nearby particles
      this.drawConnections(particle, index);
    });
  }

  resetParticle(particle) {
    particle.x = Math.random() * this.canvas.width;
    particle.y = Math.random() * this.canvas.height;
    particle.vx = (Math.random() - 0.5) * this.config.particleSpeed;
    particle.vy = (Math.random() - 0.5) * this.config.particleSpeed;
    particle.life = Math.random() * 100 + 50;
    particle.color = this.config.colors[Math.floor(Math.random() * this.config.colors.length)];
  }

  drawParticle(particle) {
    this.context.save();
    this.context.globalAlpha = particle.opacity;
    this.context.fillStyle = particle.color;
    this.context.shadowColor = particle.color;
    this.context.shadowBlur = 10;
    
    this.context.beginPath();
    this.context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.context.fill();
    
    this.context.restore();
  }

  drawConnections(particle, index) {
    for (let i = index + 1; i < this.particles.length; i++) {
      const other = this.particles[i];
      const distance = Math.sqrt(
        Math.pow(particle.x - other.x, 2) + Math.pow(particle.y - other.y, 2)
      );
      
      if (distance < 100) {
        this.context.save();
        this.context.strokeStyle = particle.color;
        this.context.globalAlpha = (100 - distance) / 100 * 0.2;
        this.context.lineWidth = 1;
        
        this.context.beginPath();
        this.context.moveTo(particle.x, particle.y);
        this.context.lineTo(other.x, other.y);
        this.context.stroke();
        
        this.context.restore();
      }
    }
  }

  triggerSkipEffect() {
    // Create screen flash effect
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(45deg, #00ff41, #00ffff);
      pointer-events: none;
      z-index: 9999;
      opacity: 0;
      animation: skipFlash 0.3s ease-out;
    `;
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
      flash.remove();
    }, 300);
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes skipFlash {
        0% { opacity: 0; }
        50% { opacity: 0.3; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  createHoverEffect() {
    // Create ripple effect around skip button (posição atualizada)
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: fixed;
      top: 2rem; /* 🔧 Atualizado para nova posição */
      left: 2rem; /* 🔧 Atualizado para nova posição */
      width: 60px; /* 🔧 Menor para o botão compacto */
      height: 60px;
      border: 2px solid #00ffff;
      border-radius: 50%;
      pointer-events: none;
      z-index: 999;
      animation: rippleEffect 0.6s ease-out;
    `;
    
    document.body.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
    
    // Add ripple animation if not exists
    if (!document.getElementById('ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent = `
        @keyframes rippleEffect {
          0% { 
            opacity: 1;
            transform: scale(0.8);
          }
          100% { 
            opacity: 0;
            transform: scale(1.5);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // 🔧 NOVO: Configuração dos controles de velocidade
  setupSpeedControls() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        this.accelerateCredits();
        this.hideSpeedHint(); // 🔧 Esconde a dica quando usa pela primeira vez
      }
    });
    
    document.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowRight') {
        this.normalizeCredits();
      }
    });
    
    // 🔧 Esconde a dica automaticamente após 15 segundos
    setTimeout(() => {
      this.hideSpeedHint();
    }, 15000);
  }

  // 🔧 NOVO: Esconder dica de velocidade
  hideSpeedHint() {
    const hint = document.getElementById('speed-hint');
    if (hint) {
      hint.style.opacity = '0';
      hint.style.transform = 'translateY(20px)';
      setTimeout(() => {
        hint.style.display = 'none';
      }, 500);
    }
  }

  // 🔧 NOVO: Acelerar créditos
  accelerateCredits() {
    if (this.creditsSpeed === 'fast') return;
    
    this.creditsSpeed = 'fast';
    document.documentElement.style.setProperty('--credits-speed', 'var(--credits-speed-fast)');
    this.showSpeedIndicator('ACELERADO');
    
    console.log('⚡ Créditos acelerados!');
  }

  // 🔧 NOVO: Normalizar velocidade dos créditos
  normalizeCredits() {
    if (this.creditsSpeed === 'normal') return;
    
    this.creditsSpeed = 'normal';
    document.documentElement.style.setProperty('--credits-speed', 'var(--credits-speed-normal)');
    this.showSpeedIndicator('NORMAL');
    
    console.log('🎬 Velocidade normal dos créditos');
  }

  // 🔧 NOVO: Criar indicador de velocidade
  createSpeedIndicator() {
    this.speedIndicator = document.createElement('div');
    this.speedIndicator.id = 'speed-indicator';
    this.speedIndicator.style.cssText = `
      position: fixed;
      top: 2rem;
      right: 2rem;
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid var(--neon-blue);
      border-radius: 20px;
      padding: 0.5rem 1rem;
      color: var(--neon-blue);
      font-family: 'Press Start 2P', monospace;
      font-size: 0.5rem;
      z-index: 1000;
      opacity: 0;
      transform: translateY(-20px);
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
    `;
    this.speedIndicator.innerHTML = `
      <div style="text-align: center;">
        <div style="margin-bottom: 0.2rem;">VELOCIDADE</div>
        <div id="speed-value">NORMAL</div>
      </div>
    `;
    
    document.body.appendChild(this.speedIndicator);
  }

  // 🔧 NOVO: Mostrar indicador de velocidade
  showSpeedIndicator(speed) {
    const speedValue = document.getElementById('speed-value');
    if (speedValue) {
      speedValue.textContent = speed;
    }
    
    // Cores diferentes baseadas na velocidade
    const color = speed === 'ACELERADO' ? 'var(--glitch-red)' : 'var(--neon-blue)';
    this.speedIndicator.style.borderColor = color;
    this.speedIndicator.style.color = color;
    this.speedIndicator.style.boxShadow = `0 0 20px ${color === 'var(--glitch-red)' ? 'rgba(255, 0, 64, 0.3)' : 'rgba(0, 255, 255, 0.3)'}`;
    
    // Mostrar indicador
    this.speedIndicator.style.opacity = '1';
    this.speedIndicator.style.transform = 'translateY(0)';
    
    // Esconder após 2 segundos
    setTimeout(() => {
      this.speedIndicator.style.opacity = '0';
      this.speedIndicator.style.transform = 'translateY(-20px)';
    }, 2000);
  }

  // Public methods for external control
  pauseAnimation() {
    this.isAnimating = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  resumeAnimation() {
    this.isAnimating = true;
    this.startAnimation();
  }

  adjustParticleCount(count) {
    this.config.particleCount = Math.max(10, Math.min(200, count));
    this.setupParticles();
  }

  triggerGlobalGlitch() {
    // Trigger glitch effect on all visible elements
    const elements = document.querySelectorAll('.credits-section');
    elements.forEach((element, index) => {
      setTimeout(() => {
        this.triggerSectionGlitch(element);
      }, index * 100);
    });
  }

  triggerSectionGlitch(section) {
    section.style.filter = 'hue-rotate(180deg) saturate(2)';
    section.style.transform = 'skew(1deg) scale(1.01)';
    
    setTimeout(() => {
      section.style.filter = '';
      section.style.transform = '';
    }, 200);
  }
}

// Original credit.js functionality (mantida para compatibilidade)
function setupOriginalFunctionality() {
  // Show skip button after 10 seconds (backup)
  setTimeout(function() {
    const backHomeBtn = document.getElementById('back-home');
    if (backHomeBtn && backHomeBtn.style.display === 'none') {
      backHomeBtn.style.display = 'flex';
    }
  }, 10000);

  // Skip button click handler (backup)
  const backHomeBtn = document.getElementById('back-home');
  if (backHomeBtn) {
    backHomeBtn.addEventListener('click', function() {
      window.location.href = 'index.html';
    });
  }
}

// Enhanced page visibility handling
function setupVisibilityHandling() {
  document.addEventListener('visibilitychange', () => {
    if (window.enhancedCredits) {
      if (document.hidden) {
        window.enhancedCredits.pauseAnimation();
      } else {
        window.enhancedCredits.resumeAnimation();
      }
    }
  });
}

// Keyboard shortcuts for enhanced effects
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (!window.enhancedCredits) return;
    
    switch(e.key) {
      case 'g':
      case 'G':
        window.enhancedCredits.triggerGlobalGlitch();
        break;
      case '+':
        window.enhancedCredits.adjustParticleCount(
          window.enhancedCredits.config.particleCount + 20
        );
        break;
      case '-':
        window.enhancedCredits.adjustParticleCount(
          window.enhancedCredits.config.particleCount - 20
        );
        break;
      case ' ':
        e.preventDefault();
        if (window.enhancedCredits.isAnimating) {
          window.enhancedCredits.pauseAnimation();
        } else {
          window.enhancedCredits.resumeAnimation();
        }
        break;
      // 🔧 NOVO: Controle de velocidade já está no setupSpeedControls()
      // Mas mantemos aqui para referência e possíveis outros controles
    }
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎬 Enhanced Credits Page Loading...');
  
  // Initialize enhanced controller
  setTimeout(() => {
    window.enhancedCredits = new EnhancedCreditsController();
  }, 500);
  
  // Setup additional functionality
  setupOriginalFunctionality();
  setupVisibilityHandling();
  setupKeyboardShortcuts();
  
  // Performance optimization for low-end devices
  if (navigator.deviceMemory && navigator.deviceMemory < 4) {
    console.log('🚀 Low-end device detected, optimizing performance...');
    // Reduce particle count for better performance
    setTimeout(() => {
      if (window.enhancedCredits) {
        window.enhancedCredits.adjustParticleCount(50);
      }
    }, 1000);
  }
  
  console.log('🎬 Enhanced Credits initialized');
  console.log('💡 Keyboard shortcuts:');
  console.log('   → (Seta Direita) - Acelerar créditos (segurar)'); // 🔧 NOVO
  console.log('   G - Trigger global glitch effect');
  console.log('   +/- - Adjust particle count');
  console.log('   Space - Pause/resume animation');
});

// Export for module use if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedCreditsController;
}