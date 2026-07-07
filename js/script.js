window.addEventListener("load", function() {
    
    // ==========================================================================
    // 1. CONTROLE DE ÁUDIO DO SHOWREEL NATIVO
    // ==========================================================================
    const video = document.getElementById("showreel-video");
    const muteBtn = document.getElementById("mute-toggle-btn");

    if (video && muteBtn) {
        muteBtn.addEventListener("click", function () {
            if (video.muted) {
                video.muted = false;
                muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            } else {
                video.muted = true;
                muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            }
        });
    }

    // ==========================================================================
    // 2. LÓGICA DAS ABAS (TABS) com Rolagem Automática
    // ==========================================================================
    const navLinks = document.querySelectorAll(".nav-link[data-tab]");
    const tabContents = document.querySelectorAll(".tab-content");

    navLinks.forEach(link => {
        link.addEventListener("click", function() {
            const targetTab = this.getAttribute("data-tab");

            // Altera classe ativa dos botões da Navbar
            navLinks.forEach(l => l.classList.remove("active"));
            this.classList.add("active");

            // Exibe a aba correta e esconde as outras
            tabContents.forEach(content => {
                if (content.id === targetTab) {
                    content.classList.add("active");
                } else {
                    content.classList.remove("active");
                }
            });

            // ROLA A PÁGINA PARA BAIXO PULANDO O BANNER
            // Seleciona a primeira caixa de conteúdo dentro da aba que acabou de ficar ativa
            const activeTab = document.getElementById(targetTab);
            const firstSection = activeTab.querySelector(".section-box");

            if (firstSection) {
                // Executa a rolagem suave até o início do conteúdo da aba
                firstSection.scrollIntoView({ 
                    behavior: "smooth", 
                    block: "start" 
                });
            }
        });
    });

    // ==========================================================================
    // 3. LÓGICA DO CARROSSEL DE CANAIS (CORRIGIDO)
    // ==========================================================================
    const slides = document.querySelectorAll(".carousel-channel-item.slide");
    const captions = document.querySelectorAll(".caption");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    let currentIndex = 0;
    let autoPlayTimer;

    if (slides.length > 0 && prevBtn && nextBtn) {
        
        // Função para atualizar as classes ativas de slide e legenda
        function updateCarousel(index) {
            slides.forEach(s => s.classList.remove("active"));
            captions.forEach(c => c.classList.remove("active"));

            slides[index].classList.add("active");
            if (captions[index]) {
                captions[index].classList.add("active");
            }
        }

        // Avança para o próximo slide
        function nextSlide() {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel(currentIndex);
        }

        // Reseta o temporizador do autoplay (evita que mude logo após o clique)
        function resetAutoPlay() {
            clearInterval(autoPlayTimer);
            autoPlayTimer = setInterval(nextSlide, 4000); // Avança a cada 4 segundos
        }

        // Evento do botão "Próximo"
        nextBtn.addEventListener("click", function(e) {
            e.preventDefault();
            nextSlide();
            resetAutoPlay();
        });

        // Evento do botão "Anterior"
        prevBtn.addEventListener("click", function(e) {
            e.preventDefault();
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel(currentIndex);
            resetAutoPlay();
        });

        // Inicializa o autoplay assim que a página carrega
        resetAutoPlay();
    }
});