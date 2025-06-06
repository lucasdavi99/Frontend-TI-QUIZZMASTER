// Opção de pular os créditos (original funcional)
setTimeout(function() {
    document.getElementById('back-home').style.display = 'block';
    document.getElementById('back-home').classList.add('show');
}, 10000); // 10 segundos para aparecer o botão

document.getElementById('back-home').addEventListener('click', function() {
    window.location.href = 'index.html'; // Página que será redirecionado
});

// Criar efeito de estrelas no fundo
function createStars() {
    const starsContainer = document.getElementById('stars');
    if (!starsContainer) return;
    
    const numberOfStars = 100;

    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Posição aleatória
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        
        // Tamanho aleatório entre 1px e 4px
        const size = Math.random() * 3 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        
        // Delay de animação aleatório para efeito natural
        star.style.animationDelay = Math.random() * 3 + 's';
        
        starsContainer.appendChild(star);
    }
}

// Configurar controles de música
function setupMusicControls() {
    const audio = document.getElementById('creditMusic');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const volumeSlider = document.getElementById('volumeSlider');

    if (!audio || !playPauseBtn || !volumeSlider) {
        console.warn('Elementos de controle de música não encontrados');
        return;
    }

    // Definir volume inicial
    audio.volume = 0.7;

    // Botão Play/Pause
    playPauseBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().catch(e => {
                console.warn('Erro ao reproduzir áudio:', e);
            });
        } else {
            audio.pause();
        }
    });

    // Controle de volume
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value / 100;
    });

    // Atualizar ícone do botão baseado no estado do áudio
    audio.addEventListener('pause', () => {
        playPauseBtn.textContent = '▶️';
    });

    audio.addEventListener('play', () => {
        playPauseBtn.textContent = '⏸️';
    });

    // Tratar autoplay
    audio.addEventListener('canplaythrough', () => {
        audio.play().catch(e => {
            playPauseBtn.textContent = '▶️';
            console.info('Autoplay bloqueado - clique no botão play para iniciar a música');
        });
    });
}

// Adicionar efeitos hover interativos nos nomes
function setupHoverEffects() {
    const personNames = document.querySelectorAll('.person_name');
    
    personNames.forEach(name => {
        name.addEventListener('mouseenter', function() {
            if (!this.querySelector('img')) { // Só aplica hover se não for imagem
                this.style.transform = 'scale(1.05)';
                this.style.color = '#ffd700';
            }
        });
        
        name.addEventListener('mouseleave', function() {
            if (!this.querySelector('img')) { // Só aplica hover se não for imagem
                this.style.transform = 'scale(1)';
                this.style.color = '#fff';
            }
        });
    });
}

// Função principal de inicialização
function initializeCredits() {
    console.log('Inicializando página de créditos...');
    
    // Criar efeito de estrelas
    createStars();
    
    // Configurar controles de música
    setupMusicControls();
    
    // Adicionar efeitos hover
    setupHoverEffects();
    
    console.log('Página de créditos inicializada com sucesso!');
}

// Aguardar carregamento da página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCredits);
} else {
    initializeCredits();
}

// Prevenir erros se imagens não carregarem
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('.person_name img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            console.warn('Imagem não pôde ser carregada:', this.src);
        });
    });
});