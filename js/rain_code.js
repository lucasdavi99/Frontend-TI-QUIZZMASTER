/**
 * MATRIX RAIN EFFECT - ENHANCED
 * Improved matrix digital rain background for T.I QUIZZMASTER
 */

class MatrixRain {
  constructor() {
    this.canvas = null;
    this.context = null;
    this.columns = 0;
    this.drops = [];
    this.isRunning = false;
    this.animationFrame = null;
    
    // Configuration
    this.config = {
      fontSize: 16,
      speed: 50,
      density: 0.98,
      fadeSpeed: 0.05,
      colors: {
        primary: '#00ff41',
        secondary: '#00d300',
        tertiary: '#008f11',
        glow: 'rgba(0, 255, 65, 0.8)'
      },
      characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?~`',
      glitchChance: 0.001,
      performanceMode: false
    };
    
    this.init();
  }

  init() {
    this.setupCanvas();
    this.setupMatrix();
    this.setupEventListeners();
    this.start();
    
    console.log('🌧️ Matrix Rain initialized');
  }

  setupCanvas() {
    this.canvas = document.getElementById('canvas');
    if (!this.canvas) {
      console.error('Canvas element not found');
      return;
    }
    
    this.context = this.canvas.getContext('2d');
    this.resizeCanvas();
    
    // Optimize canvas for performance
    this.context.imageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
  }

  setupMatrix() {
    this.matrix = this.config.characters.split('');
    this.calculateColumns();
    this.initializeDrops();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    this.calculateColumns();
    this.initializeDrops();
  }

  calculateColumns() {
    this.columns = Math.floor(this.canvas.width / this.config.fontSize);
  }

  initializeDrops() {
    this.drops = [];
    for (let i = 0; i < this.columns; i++) {
      this.drops[i] = {
        y: Math.random() * this.canvas.height,
        speed: 0.5 + Math.random() * 0.5,
        opacity: Math.random(),
        glitch: false,
        glitchTimer: 0
      };
    }
  }

  setupEventListeners() {
    // Handle window resize
    window.addEventListener('resize', this.debounce(() => {
      this.resizeCanvas();
    }, 250));
    
    // Handle visibility change for performance
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
    
    // Performance mode toggle based on device capabilities
    this.detectPerformanceMode();
  }

  detectPerformanceMode() {
    const memory = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 2;
    
    if (memory < 2 || cores < 4) {
      this.enablePerformanceMode();
    }
  }

  enablePerformanceMode() {
    this.config.performanceMode = true;
    this.config.speed = 80; // Slower frame rate
    this.config.fadeSpeed = 0.1; // Faster fade
    this.config.glitchChance = 0; // No glitch effects
    
    console.log('🚀 Performance mode enabled');
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.animate();
  }

  pause() {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  resume() {
    if (!this.isRunning) {
      this.start();
    }
  }

  animate() {
    if (!this.isRunning) return;
    
    this.draw();
    
    setTimeout(() => {
      this.animationFrame = requestAnimationFrame(() => this.animate());
    }, this.config.speed);
  }

  draw() {
    if (!this.context || !this.canvas) return;
    
    // Create fade effect
    this.context.fillStyle = `rgba(0, 0, 0, ${this.config.fadeSpeed})`;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Set font
    this.context.font = `${this.config.fontSize}px 'Courier New', monospace`;
    
    // Draw matrix rain
    for (let i = 0; i < this.drops.length; i++) {
      this.drawColumn(i);
      this.updateDrop(i);
    }
  }

  drawColumn(columnIndex) {
    const drop = this.drops[columnIndex];
    const x = columnIndex * this.config.fontSize;
    
    // Handle glitch effect
    if (drop.glitch) {
      this.drawGlitchColumn(columnIndex, x, drop);
    } else {
      this.drawNormalColumn(columnIndex, x, drop);
    }
  }

  drawNormalColumn(columnIndex, x, drop) {
    // Select random character
    const char = this.matrix[Math.floor(Math.random() * this.matrix.length)];
    
    // Create gradient effect
    const gradient = this.context.createLinearGradient(0, drop.y - 100, 0, drop.y);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.7, this.config.colors.tertiary);
    gradient.addColorStop(0.9, this.config.colors.secondary);
    gradient.addColorStop(1, this.config.colors.primary);
    
    this.context.fillStyle = gradient;
    this.context.globalAlpha = drop.opacity;
    
    // Add glow effect for leading character
    if (!this.config.performanceMode) {
      this.context.shadowColor = this.config.colors.glow;
      this.context.shadowBlur = 10;
    }
    
    this.context.fillText(char, x, drop.y);
    
    // Reset shadow
    this.context.shadowBlur = 0;
    this.context.globalAlpha = 1;
  }

  drawGlitchColumn(columnIndex, x, drop) {
    const chars = 3 + Math.floor(Math.random() * 5);
    
    for (let j = 0; j < chars; j++) {
      const char = this.matrix[Math.floor(Math.random() * this.matrix.length)];
      const offsetX = x + (Math.random() - 0.5) * 10;
      const offsetY = drop.y + j * this.config.fontSize;
      
      // Random glitch colors
      const colors = ['#ff0040', '#0040ff', '#00ffff', '#ff00ff'];
      this.context.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      this.context.globalAlpha = 0.8;
      
      this.context.fillText(char, offsetX, offsetY);
    }
    
    this.context.globalAlpha = 1;
  }

  updateDrop(columnIndex) {
    const drop = this.drops[columnIndex];
    
    // Move drop down
    drop.y += drop.speed * this.config.fontSize;
    
    // Handle glitch timing
    if (drop.glitch) {
      drop.glitchTimer--;
      if (drop.glitchTimer <= 0) {
        drop.glitch = false;
      }
    } else if (!this.config.performanceMode && Math.random() < this.config.glitchChance) {
      drop.glitch = true;
      drop.glitchTimer = 5 + Math.floor(Math.random() * 10);
    }
    
    // Reset drop when it goes off screen
    if (drop.y > this.canvas.height + 100) {
      if (Math.random() > this.config.density) {
        drop.y = -100;
        drop.speed = 0.5 + Math.random() * 0.5;
        drop.opacity = 0.5 + Math.random() * 0.5;
      }
    }
  }

  // Color cycling effect
  cyclePrimaryColor() {
    const colors = [
      '#00ff41', // Matrix green
      '#00ffff', // Cyan
      '#ff0040', // Red
      '#8000ff', // Purple
      '#ffff00'  // Yellow
    ];
    
    let colorIndex = 0;
    setInterval(() => {
      this.config.colors.primary = colors[colorIndex];
      colorIndex = (colorIndex + 1) % colors.length;
    }, 5000);
  }

  // Interactive effects
  addMouseInteraction() {
    let mouseX = 0;
    let mouseY = 0;
    
    this.canvas.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Create ripple effect
      this.createRipple(mouseX, mouseY);
    });
  }

  createRipple(x, y) {
    if (this.config.performanceMode) return;
    
    const nearbyColumns = Math.floor(x / this.config.fontSize);
    
    for (let i = -2; i <= 2; i++) {
      const columnIndex = nearbyColumns + i;
      if (columnIndex >= 0 && columnIndex < this.drops.length) {
        const drop = this.drops[columnIndex];
        drop.speed *= 1.5; // Increase speed temporarily
        drop.glitch = true;
        drop.glitchTimer = 10;
      }
    }
  }

  // Public API methods
  setSpeed(speed) {
    this.config.speed = Math.max(10, Math.min(200, speed));
  }

  setDensity(density) {
    this.config.density = Math.max(0.5, Math.min(0.99, density));
  }

  setColors(colorSet) {
    this.config.colors = { ...this.config.colors, ...colorSet };
  }

  triggerGlitchWave() {
    if (this.config.performanceMode) return;
    
    // Trigger glitch effect across all columns
    this.drops.forEach((drop, index) => {
      setTimeout(() => {
        drop.glitch = true;
        drop.glitchTimer = 15;
      }, index * 10);
    });
  }

  // Utility methods
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

  destroy() {
    this.pause();
    if (this.canvas) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// Initialize Matrix Rain when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.matrixRain = new MatrixRain();
  
  // Enable mouse interaction and color cycling
  if (window.matrixRain) {
    window.matrixRain.addMouseInteraction();
    window.matrixRain.cyclePrimaryColor();
  }
});

// Export for module use if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MatrixRain;
}