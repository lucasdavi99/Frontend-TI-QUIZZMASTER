// 🔧 MODAL.JS 

var modal = document.getElementById("myModal");
var modalText = document.getElementById("modalText");

// 🔧 CORREÇÃO: Função para fechar o modal
function closeModal() {
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("active");
    modal.classList.remove("game-end");
    
    // 🔧 ADICIONADO: Limpar flags
    window.gameEnded = false;
    window.gameEndModalActive = false;
    
    // 🔧 ADICIONADO: Limpar timer se existir
    if (window.modalRedirectTimer) {
      clearTimeout(window.modalRedirectTimer);
      window.modalRedirectTimer = null;
    }
  }
}

// Event listener para clique fora do modal
window.onclick = function(event) {
  if (event.target == modal) {
    // 🔧 ADICIONADO: Não permitir fechar modal de fim de jogo clicando fora
    if (window.gameEndModalActive) {
      console.log('⚠️ Modal de fim de jogo não pode ser fechado manualmente');
      return;
    }
    
    closeModal();
  }
}

// 🔧 ADICIONADO: Event listener para tecla ESC
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' && modal && modal.style.display === 'block') {
    // 🔧 ADICIONADO: Não permitir fechar modal de fim de jogo com ESC
    if (window.gameEndModalActive) {
      console.log('⚠️ Modal de fim de jogo não pode ser fechado com ESC');
      return;
    }
    
    closeModal();
  }
});

// 🔧 CORREÇÃO: Função melhorada para mostrar o modal
function showModal(text, autoRedirect = false, redirectDelay = 5000) {
  console.log('📢 Mostrando modal:', text);
  
  if (!modal || !modalText) {
    console.error('❌ Elementos do modal não encontrados');
    alert(text);
    if (autoRedirect) {
      setTimeout(() => {
        window.location.href = "index.html";
      }, redirectDelay);
    }
    return;
  }
  
  // Define o texto do modal
  modalText.textContent = text;
  
  // 🔧 ADICIONADO: Garantir z-index e posicionamento corretos
  modal.style.zIndex = "99999";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  
  // Mostra o modal
  modal.style.display = "block";
  modal.classList.add("active");
  
  // 🔧 ADICIONADO: Força o foco no modal
  modal.focus();
  
  console.log('✅ Modal exibido com sucesso');
  
  // 🔧 CORREÇÃO: Auto-redirecionamento obrigatório
  if (autoRedirect) {
    console.log(`⏱️ Redirecionamento OBRIGATÓRIO em ${redirectDelay/1000} segundos`);
    
    // 🔧 ADICIONADO: Limpar timer anterior se existir
    if (window.modalRedirectTimer) {
      clearTimeout(window.modalRedirectTimer);
    }
    
    window.modalRedirectTimer = setTimeout(() => {
      console.log('🔄 Executando redirecionamento automático...');
      
      // 🔧 ADICIONADO: Limpar flags
      window.gameEnded = false;
      window.gameEndModalActive = false;
      
      // 🔧 ADICIONADO: Remover classe especial
      if (modal) {
        modal.classList.remove('game-end');
      }
      
      closeModal();
      window.location.href = "index.html";
    }, redirectDelay);
  }
}

// 🔧 MODIFICADO: Função específica para fim de jogo com 7 segundos
function showGameEndModal(message, score = null, isSuccess = false) {
    let fullMessage = message;
    
    if (score !== null) {
        fullMessage += ` Pontuação final: ${score}`;
    }
    
    if (isSuccess) {
        fullMessage += " 🎉";
    }
    
    // 🔧 ADICIONADO: Adicionar informação sobre redirecionamento
    fullMessage += "\n\nRedirecionando em 7 segundos...";
    
    // Marca que o jogo terminou
    window.gameEnded = true;
    
    // 🔧 ADICIONADO: Aplicar classe especial ao modal
    if (modal) {
        modal.classList.add('game-end');
    }
    
    // 🔧 CORREÇÃO: Desabilitar clique fora do modal para fim de jogo
    window.gameEndModalActive = true;
    
    // Mostra modal com redirecionamento automático em 7 segundos
    showModal(fullMessage, true, 7000);
    
    console.log('🏁 Modal de fim de jogo exibido - redirecionamento OBRIGATÓRIO em 7 segundos');
}

// 🔧 ADICIONADO: Função para mostrar modal de erro
function showErrorModal(errorMessage) {
  const message = `❌ Erro: ${errorMessage}`;
  showModal(message, false);
  
  console.log('⚠️ Modal de erro exibido');
}

// 🔧 ADICIONADO: Função para mostrar modal de sucesso
function showSuccessModal(successMessage, autoClose = true) {
  const message = `✅ ${successMessage}`;
  showModal(message, autoClose, 3000);
  
  console.log('🎉 Modal de sucesso exibido');
}

// 🔧 CORREÇÃO: Event listener para pageshow (evita cache)
window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    // Se a página foi carregada do cache, recarrega para garantir estado limpo
    console.log('🔄 Página carregada do cache, recarregando...');
    window.location.reload();
  }
});

// 🔧 ADICIONADO: Função de debug para testar o modal
window.testModal = function(message = "Teste do modal") {
  console.log('🧪 Testando modal...');
  showModal(message);
};

// 🔧 ADICIONADO: Inicialização do modal
document.addEventListener('DOMContentLoaded', function() {
  console.log('📢 Modal.js carregado e inicializado');
  
  // Verifica se os elementos necessários existem
  if (!modal) {
    console.error('❌ Elemento modal não encontrado');
  }
  if (!modalText) {
    console.error('❌ Elemento modalText não encontrado');
  }
  
  // 🔧 ADICIONADO: Garante que o modal esteja oculto inicialmente
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("active");
  }
});

// 🔧 ADICIONADO: Exporta as funções para uso global
window.showModal = showModal;
window.showGameEndModal = showGameEndModal;
window.showErrorModal = showErrorModal;
window.showSuccessModal = showSuccessModal;
window.closeModal = closeModal;

console.log('📢 Modal.js carregado completamente');