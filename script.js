// Rolagem suave para âncoras (links internos)
document.addEventListener("DOMContentLoaded", () => {
  // --- Lógica do Carrossel Manual ---
  const carouselItems = document.querySelectorAll('.carousel-item-custom');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const indicators = document.querySelectorAll('.carousel-indicator-btn');
  let currentIndex = 0;
  let intervalId;

  // Verifica se os elementos do carrossel principal existem antes de adicionar listeners
  if (carouselItems.length > 0 && prevBtn && nextBtn && indicators.length > 0) {
      // Função para exibir um slide específico
      const showSlide = (index) => {
          carouselItems.forEach(item => item.classList.remove('active'));
          indicators.forEach(indicator => indicator.classList.remove('active'));
          carouselItems[index].classList.add('active');
          indicators[index].classList.add('active');
          currentIndex = index;
      };

      const nextSlide = () => {
          let newIndex = (currentIndex + 1) % carouselItems.length;
          showSlide(newIndex);
      };

      const prevSlide = () => {
          let newIndex = (currentIndex - 1 + carouselItems.length) % carouselItems.length;
          showSlide(newIndex);
      };

      const startAutoPlay = () => {
          intervalId = setInterval(nextSlide, 5000);
      };

      const stopAutoPlay = () => {
          clearInterval(intervalId);
      };

      nextBtn.addEventListener('click', () => {
          stopAutoPlay();
          nextSlide();
          startAutoPlay();
      });

      prevBtn.addEventListener('click', () => {
          stopAutoPlay();
          prevSlide();
          startAutoPlay();
      });

      indicators.forEach((indicator, index) => {
          indicator.addEventListener('click', () => {
              stopAutoPlay();
              showSlide(index);
              startAutoPlay();
          });
      });

      startAutoPlay();
  }

  // --- Lógica de Rolagem Suave ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener("click", function(e) {
        // Pega o ID do alvo (ex: "#contato")
        const targetId = this.getAttribute("href");
        
        // Verifica se é um link para uma âncora na mesma página
        if (targetId && targetId.startsWith('#') && targetId.length > 1) {
            const targetElement = document.querySelector(targetId);
            
            // Se o elemento alvo existir, previne o salto padrão e rola suavemente
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
      });
  });

  // Animação dos contadores com requestAnimationFrame
  const counterElements = document.querySelectorAll('.display-4[data-target]');
  let countersAnimated = false;

  const animateCounter = (timestamp) => {
    let allDone = true;
    counterElements.forEach(counter => {
      if (!counter.startTime) counter.startTime = timestamp;
      const target = +counter.getAttribute('data-target');
      const duration = 1500;
      const elapsed = timestamp - counter.startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentCount = Math.ceil(progress * target);
      counter.innerText = "+" + currentCount;
      if (progress < 1) allDone = false;
    });

    if (!allDone) {
        requestAnimationFrame(animateCounter);
    }
  };

  // AJUSTE AQUI: threshold alterado de 0.1 para 0
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersAnimated) {
        countersAnimated = true;
        requestAnimationFrame(animateCounter);
      }
    });
  }, { threshold: 0 }); // Gatilho imediato
  
  const numerosSection = document.getElementById('Numeros');
  if (numerosSection) {
      counterObserver.observe(numerosSection);
  }

  // --- Lógica para animação de fade-in ao rolar seção sobre nós ---
  const fadeInObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in-section').forEach(section => {
    fadeInObserver.observe(section);
  });

  // --- Lógica para animação da Timeline de Serviços ---
  const timelineElement = document.querySelector('.timeline');
  if (timelineElement) {
    // AJUSTE AQUI: threshold alterado de 0.05 para 0
    const timelineObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0 }); // Gatilho imediato
    timelineObserver.observe(timelineElement);
  }

  // =======================================================
  // --- SCRIPT ADICIONADO PARA PÁGINA INCORPORADORA PRO ---
  // =======================================================
  if (document.querySelector('.pagina-incorporadora')) {
      if (typeof lucide !== 'undefined') {
          lucide.createIcons();
      } else {
          console.error("Biblioteca Lucide não encontrada. Verifique se o script está no HTML.");
      }
  }
  // =======================================================
  // --- LÓGICA DO FORMULÁRIO 'NEGOCIE SEU TERRENO' ---
  // =======================================================
  const terrenoForm = document.getElementById('terreno-form');

  if (terrenoForm) {
    terrenoForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const submitBtn = document.getElementById('submit-btn');
      const spinner = submitBtn.querySelector('.spinner-border');
      const formMessage = document.getElementById('form-message');
      
      // Desabilitar botão e mostrar spinner
      submitBtn.disabled = true;
      spinner.style.display = 'inline-block';
      formMessage.innerHTML = '';

      // 1. Obter os dados do formulário
      const formData = new FormData(terrenoForm);
      const data = Object.fromEntries(formData.entries());

      // 2. Formatar o número de telefone
      // Remove tudo que não for dígito e depois adiciona o +55 na frente
      const telefoneLimpo = data.telefone.replace(/\D/g, '');
      data.telefone_formatado = `+55${telefoneLimpo}`;

      // 3. Enviar para o Webhook
      const webhookUrl = 'URL_DO_SEU_WEBHOOK_AQUI'; // <-- ATENÇÃO: SUBSTITUA ESTA URL!

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Houve um problema ao enviar sua proposta. Tente novamente.');
        }

        // Sucesso!
        formMessage.innerHTML = `<div class="alert alert-success">Proposta enviada com sucesso! Agradecemos o seu contato.</div>`;
        terrenoForm.reset(); // Limpa o formulário

      } catch (error) {
        // Erro
        console.error('Erro no webhook:', error);
        formMessage.innerHTML = `<div class="alert alert-danger">${error.message || 'Não foi possível enviar sua proposta. Verifique sua conexão.'}</div>`;
      } finally {
        // Reabilitar botão e esconder spinner
        submitBtn.disabled = false;
        spinner.style.display = 'none';
      }
    });
  }
  // =======================================================
  // --- LÓGICA DO FORMULÁRIO DE CONTATO (HOME) ---
  // =======================================================
  const contatoForm = document.getElementById('contato-form');

  if (contatoForm) {
    contatoForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const submitBtn = document.getElementById('contato-submit-btn');
      const spinner = submitBtn.querySelector('.spinner-border');
      const formMessage = document.getElementById('contato-form-message');
      
      // Desabilitar botão e mostrar spinner
      submitBtn.disabled = true;
      spinner.style.display = 'inline-block';
      formMessage.innerHTML = '';

      // 1. Obter os dados do formulário
      const formData = new FormData(contatoForm);
      const data = Object.fromEntries(formData.entries());

      // 2. Formatar o número de telefone com +55
      const telefoneLimpo = data.telefone.replace(/\D/g, ''); // Remove tudo que não for dígito
      data.telefone_formatado = `+55${telefoneLimpo}`; // Adiciona o +55 na frente

      // 3. Enviar para o Webhook
      const webhookUrl = 'SUA_URL_DE_WEBHOOK_AQUI'; // <-- ATENÇÃO: SUBSTITUA ESTA URL!

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Houve um problema ao enviar sua mensagem. Tente novamente.');
        }

        // Sucesso!
        formMessage.innerHTML = `<div class="alert alert-success">Mensagem enviada com sucesso! Agradecemos o seu contato.</div>`;
        contatoForm.reset(); // Limpa o formulário

      } catch (error) {
        // Erro
        formMessage.innerHTML = `<div class="alert alert-danger">${error.message || 'Não foi possível enviar sua mensagem.'}</div>`;
      } finally {
        // Reabilitar botão e esconder spinner
        submitBtn.disabled = false;
        spinner.style.display = 'none';
      }
    });
  }

});