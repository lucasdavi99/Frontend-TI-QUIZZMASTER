/**
 * GLITCH EFFECTS CONTROLLER
 * Watch Dogs style glitch effects for T.I QUIZZMASTER
 */

class GlitchController {
  constructor() {
    this.isInitialized = false;
    this.glitchIntensity = 1;
    this.animations = [];
    this.init();
  }

  init() {
    if (this.isInitialized) return;
    
    this.setupTitle();
    this.setupDecoding();
    this.setupRandomGlitches();
    this.setupInteractionEffects();
    
    this.isInitialized = true;
    console.log('🔥 Glitch Controller initialized');
  }

  setupTitle() {
    const title = document.getElementById('titulo');
    if (!title) return;

    // Ensure data attribute is set
    title.setAttribute('data-text', title.textContent);
    
    // Add dynamic glitch triggers
    this.addRandomGlitchBursts(title);
  }

  setupDecoding() {
    // Enhanced Baffle.js decoding effect
    if (typeof baffle !== 'undefined') {
      const titleDecoding = baffle("#titulo");
      titleDecoding.set({
        characters: '██▓▒░▓█▒░▓▒▓>▓░▓▒>/█>▓▒▓░▓▒░▓█▒',
        speed: 120
      });
      titleDecoding.start();
      titleDecoding.reveal(2500);

      // Enhanced button decoding
      const btnDecoding = baffle(".btn-text");
      btnDecoding.set({
        characters: '▓█▒░▓▒▓>▓░▓▒>/█>▓▒▓░▓▒░▓█▒░▓',
        speed: 150
      });
      btnDecoding.start();
      btnDecoding.reveal(3500);
    }
  }

  addRandomGlitchBursts(element) {
    setInterval(() => {
      if (Math.random() < 0.15) { // 15% chance every interval
        this.triggerGlitchBurst(element);
      }
    }, 3000);
  }

  triggerGlitchBurst(element) {
    element.style.animation = 'none';
    element.offsetHeight; // Force reflow
    element.style.animation = 'glitch-skew 0.2s infinite linear alternate-reverse';
    
    setTimeout(() => {
      element.style.animation = 'glitch-skew 1s infinite linear alternate-reverse';
    }, 400);
  }

  setupRandomGlitches() {
    // Random screen distortion effects
    this.createScreenDistortion();
    
    // Periodic glitch waves
    setInterval(() => {
      this.triggerGlitchWave();
    }, 8000 + Math.random() * 4000);
  }

  createScreenDistortion() {
    const distortion = document.createElement('div');
    distortion.className = 'screen-distortion';
    distortion.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 1000;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(0, 255, 65, 0.03) 2%,
        transparent 4%,
        rgba(255, 0, 64, 0.02) 6%,
        transparent 8%
      );
      background-size: 100px 100%;
      opacity: 0;
      animation: distortionSweep 12s infinite;
    `;
    
    document.body.appendChild(distortion);
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes distortionSweep {
        0%, 90% { opacity: 0; transform: translateX(-100%); }
        95% { opacity: 1; transform: translateX(0%); }
        100% { opacity: 0; transform: translateX(100%); }
      }
    `;
    document.head.appendChild(style);
  }

  triggerGlitchWave() {
    const glitchElements = document.querySelectorAll('.glitch-title, .btn');
    
    glitchElements.forEach((element, index) => {
      setTimeout(() => {
        element.style.filter = 'hue-rotate(180deg) saturate(2)';
        element.style.transform = 'scale(1.02) skew(1deg)';
        
        setTimeout(() => {
          element.style.filter = '';
          element.style.transform = '';
        }, 200);
      }, index * 100);
    });
  }

  setupInteractionEffects() {
    // Enhanced hover effects for buttons
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        this.triggerButtonGlitch(btn);
      });
      
      btn.addEventListener('click', () => {
        this.triggerClickGlitch(btn);
      });
    });

    // Title interaction
    const title = document.getElementById('titulo');
    if (title) {
      title.addEventListener('mouseenter', () => {
        this.intensifyGlitch(title);
      });
      
      title.addEventListener('mouseleave', () => {
        this.normalizeGlitch(title);
      });
    }
  }

  triggerButtonGlitch(button) {
    const originalText = button.querySelector('.btn-text').textContent;
    const glitchChars = '█▓▒░▓█▒░▓▒▓>▓░▓▒>/█>▓▒▓░▓▒░▓█▒░▓';
    
    let iterations = 0;
    const maxIterations = 8;
    
    const glitchInterval = setInterval(() => {
      button.querySelector('.btn-text').textContent = originalText
        .split('')
        .map((char, index) => {
          if (index < iterations) {
            return originalText[index];
          }
          return glitchChars[Math.floor(Math.random() * glitchChars.length)];
        })
        .join('');
      
      if (iterations >= originalText.length) {
        clearInterval(glitchInterval);
        button.querySelector('.btn-text').textContent = originalText;
      }
      
      iterations += 1/2;
    }, 30);
  }

  triggerClickGlitch(button) {
    // Screen flash effect
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
      animation: flashEffect 0.15s ease-out;
    `;
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
      flash.remove();
    }, 200);
    
    // Add flash animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes flashEffect {
        0% { opacity: 0; }
        50% { opacity: 0.3; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  intensifyGlitch(element) {
    element.style.animation = 'glitch-skew 0.3s infinite linear alternate-reverse';
    element.classList.add('glitch-intensified');
  }

  normalizeGlitch(element) {
    element.style.animation = 'glitch-skew 1s infinite linear alternate-reverse';
    element.classList.remove('glitch-intensified');
  }

  // Public methods for external control
  setIntensity(level) {
    this.glitchIntensity = Math.max(0.1, Math.min(2, level));
    this.updateAnimationSpeeds();
  }

  updateAnimationSpeeds() {
    const baseSpeed = 1 / this.glitchIntensity;
    const title = document.getElementById('titulo');
    
    if (title) {
      title.style.animationDuration = `${baseSpeed}s`;
    }
  }

  pause() {
    document.querySelectorAll('.glitch-title, .glitch-layer').forEach(el => {
      el.style.animationPlayState = 'paused';
    });
  }

  resume() {
    document.querySelectorAll('.glitch-title, .glitch-layer').forEach(el => {
      el.style.animationPlayState = 'running';
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.glitchController = new GlitchController();
});

// Export for module use if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GlitchController;
}