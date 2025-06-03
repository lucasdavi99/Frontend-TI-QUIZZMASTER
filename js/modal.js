// 🔧 MODAL.JS 

var modal = document.getElementById("myModal");
var span = document.getElementsByClassName("close")[0];
var modalText = document.getElementById("modalText");

// 🔧 CORREÇÃO: Função para fechar o modal
function closeModal() {
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("active");
    
    // 🔧 ADICIONADO: Remove qualquer timer de redirecionamento ativo
    if (window.modalRedirectTimer) {
      clearTimeout(window.modalRedirectTimer);
      window.modalRedirectTimer = null;
    }
  }
}

// Event listener para o botão X
if (span) {
  span.onclick = function() {
    closeModal();
  }
}

// Event listener para clique fora do modal
window.onclick = function(event) {
  if (event.target == modal) {
    closeModal();
    
    // 🔧 CORREÇÃO: Só redireciona se estiver no contexto de fim de jogo
    if (window.gameEnded || (modalText && modalText.textContent.includes("Fim do jogo"))) {
      // 🔧 ADICIONADO: Delay para permitir que o usuário veja que o modal fechou
      setTimeout(() => {
        window.location.href = "index.html";
      }, 500);
    }
  }
}

// 🔧 ADICIONADO: Event listener para tecla ESC
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' && modal && modal.style.display === 'block') {
    closeModal();
  }
});

// 🔧 CORREÇÃO: Função melhorada para mostrar o modal
function showModal(text, autoRedirect = false, redirectDelay = 5000) {
  console.log('📢 Mostrando modal:', text);
  
  if (!modal || !modalText) {
    console.error('❌ Elementos do modal não encontrados');
    // Fallback para alert se o modal não estiver disponível
    alert(text);
    return;
  }
  
  // Define o texto do modal
  modalText.textContent = text;
  
  // 🔧 ADICIONADO: Garante que o modal tenha o z-index correto
  modal.style.zIndex = "99999";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  
  // Mostra o modal
  modal.style.display = "block";
  modal.classList.add("active");
  
  // 🔧 ADICIONADO: Força o foco no modal para acessibilidade
  modal.focus();
  
  console.log('✅ Modal exibido com sucesso');
  
  // 🔧 ADICIONADO: Auto-redirecionamento opcional
  if (autoRedirect) {
    console.log(`⏱️ Auto-redirecionamento em ${redirectDelay/1000} segundos`);
    
    window.modalRedirectTimer = setTimeout(() => {
      console.log('🔄 Redirecionamento automático ativado');
      closeModal();
      window.location.href = "index.html";
    }, redirectDelay);
  }
}

// 🔧 ADICIONADO: Função específica para fim de jogo
function showGameEndModal(message, score = null, isSuccess = false) {
  let fullMessage = message;
  
  if (score !== null) {
    fullMessage += ` Pontuação final: ${score}`;
  }
  
  if (isSuccess) {
    fullMessage += " 🎉";
  }
  
  // Marca que o jogo terminou
  window.gameEnded = true;
  
  // Mostra modal com redirecionamento automático
  showModal(fullMessage, true, 5000);
  
  console.log('🏁 Modal de fim de jogo exibido');
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
  if (!span) {
    console.error('❌ Elemento close não encontrado');
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