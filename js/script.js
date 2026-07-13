window.addEventListener("load", function() {
    
    // ==========================================================================
    // 1. INICIALIZAÇÃO DO PLYR E CONTROLES DE PULO (10s)
    // ==========================================================================
    const playerElement = document.getElementById("player");
    const feedbackLeft = document.getElementById("feedback-left");
    const feedbackRight = document.getElementById("feedback-right");
    const btnSkipLeft = document.getElementById("btn-skip-left");
    const btnSkipRight = document.getElementById("btn-skip-right");

    if (playerElement) {
        // Inicializa o Plyr exatamente com as configurações corretas de autoplay e mute
        const player = new Plyr('#player', {
            controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
            autoplay: true,
            muted: true
        });

        // Função para engatilhar a animação do feedback visual
        function triggerAnimation(element) {
            if (!element) return;
            element.classList.remove("animate");
            void element.offsetWidth; // Truque para forçar o reset da animação CSS
            element.classList.add("animate");
            setTimeout(() => element.classList.remove("animate"), 600);
        }

        // Aguarda o Plyr estar totalmente pronto para mapear as interações
        player.on('ready', () => {
            const plyrContainer = player.elements.container;

            // --- CONTROLE DIRETO E SEGURO DE LEGENDAS (Mute/Unmute) ---
            
            // Função para atualizar as legendas baseando-se no estado de mute atual
            function syncCaptionsWithMute() {
                // Usamos um curtíssimo delay para garantir que o Plyr já mudou o estado interno
                setTimeout(() => {
                    const isMuted = player.muted || player.volume === 0;
                    if (!isMuted) {
                        // Se tem som: desativa legenda
                        player.captions.active = false;
                        if (typeof player.toggleCaptions === "function") {
                            player.toggleCaptions(false);
                        }
                    } else {
                        // Se está mutado: ativa legenda
                        player.captions.active = true;
                        if (typeof player.toggleCaptions === "function") {
                            player.toggleCaptions(true);
                        }
                    }
                }, 50);
            }

            // 1. Monitora cliques diretamente no botão de Mute do Plyr
            const muteBtn = plyrContainer.querySelector('.plyr__control[data-plyr="mute"]');
            if (muteBtn) {
                muteBtn.addEventListener('click', syncCaptionsWithMute);
            }

            // 2. Monitora mudanças e cliques na barra de volume do Plyr
            const volumeInput = plyrContainer.querySelector('.plyr__volume input');
            if (volumeInput) {
                volumeInput.addEventListener('input', syncCaptionsWithMute);
                volumeInput.addEventListener('change', syncCaptionsWithMute);
            }

            // 3. Segurança extra: monitora o evento global de alteração de volume
            player.on('volumechange', syncCaptionsWithMute);
            
            // --- EVENTOS DOS BOTÕES MANUAIS (Clique simples temporário) ---
            if (btnSkipLeft && btnSkipRight) {
                btnSkipLeft.addEventListener("click", function(e) {
                    e.stopPropagation(); 
                    player.currentTime = Math.max(0, player.currentTime - 10);
                    triggerAnimation(feedbackLeft);
                });

                btnSkipRight.addEventListener("click", function(e) {
                    e.stopPropagation(); 
                    player.currentTime = Math.min(player.duration, player.currentTime + 10);
                    triggerAnimation(feedbackRight);
                });
            }

            // --- DETECÇÃO DE DUPLO TOQUE EM CELULARES/TABLETS (Na tela) ---
            let tapCount = 0;
            let tapTimeout;

            plyrContainer.addEventListener("touchend", function(e) {
                if (e.target.closest('.skip-btn') || e.target.closest('.plyr__controls')) return;

                const containerWidth = plyrContainer.offsetWidth;
                const rect = plyrContainer.getBoundingClientRect();
                const touchX = e.changedTouches[0].clientX - rect.left;

                tapCount++;

                if (tapCount === 1) {
                    tapTimeout = setTimeout(function() {
                        tapCount = 0;
                    }, 300); 
                } else if (tapCount === 2) {
                    clearTimeout(tapTimeout);
                    tapCount = 0;

                    if (touchX < containerWidth / 2) {
                        player.currentTime = Math.max(0, player.currentTime - 10);
                        triggerAnimation(feedbackLeft);
                    } else {
                        player.currentTime = Math.min(player.duration, player.currentTime + 10);
                        triggerAnimation(feedbackRight);
                    }
                }
            });

            // --- DETECÇÃO DE DUPLO CLIQUE EM COMPUTADORES (Na tela) ---
            plyrContainer.addEventListener("dblclick", function(e) {
                if (e.target.closest('.skip-btn') || e.target.closest('.plyr__controls')) return;

                const containerWidth = plyrContainer.offsetWidth;
                const rect = plyrContainer.getBoundingClientRect();
                const clickX = e.clientX - rect.left;

                if (clickX < containerWidth / 2) {
                    player.currentTime = Math.max(0, player.currentTime - 10);
                    triggerAnimation(feedbackLeft);
                } else {
                    player.currentTime = Math.min(player.duration, player.currentTime + 10);
                    triggerAnimation(feedbackRight);
                }
            });
        });
    }

    // ==========================================================================
    // 2. LÓGICA DAS ABAS (TABS) COM ROLAGEM AUTOMÁTICA
    // ==========================================================================
    const navLinks = document.querySelectorAll(".nav-link[data-tab]");
    const tabContents = document.querySelectorAll(".tab-content");

    navLinks.forEach(link => {
        link.addEventListener("click", function() {
            const targetTab = this.getAttribute("data-tab");

            // Altera classe ativa dos botões da Navbar
            navLinks.forEach(l => l.classList.remove("active"));
            this.classList.add("active");

            // Exibe a aba correta e oculta as demais
            tabContents.forEach(content => {
                if (content.id === targetTab) {
                    content.classList.add("active");
                } else {
                    content.classList.remove("active");
                }
            });

            // Rola a página suavemente até o início do conteúdo da aba ativa
            const activeTab = document.getElementById(targetTab);
            const firstSection = activeTab.querySelector(".section-box");

            if (firstSection) {
                firstSection.scrollIntoView({ 
                    behavior: "smooth", 
                    block: "start" 
                });
            }
        });
    });

    // ==========================================================================
    // 3. LÓGICA DO CARROSSEL DE CANAIS
    // ==========================================================================
    const slides = document.querySelectorAll(".carousel-channel-item.slide");
    const captions = document.querySelectorAll(".caption");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    let currentIndex = 0;
    let autoPlayTimer;

    if (slides.length > 0 && prevBtn && nextBtn) {
        
        function updateCarousel(index) {
            slides.forEach(s => s.classList.remove("active"));
            captions.forEach(c => c.classList.remove("active"));

            slides[index].classList.add("active");
            if (captions[index]) {
                captions[index].classList.add("active");
            }
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel(currentIndex);
        }

        function resetAutoPlay() {
            clearInterval(autoPlayTimer);
            autoPlayTimer = setInterval(nextSlide, 4000);
        }

        nextBtn.addEventListener("click", function(e) {
            e.preventDefault();
            nextSlide();
            resetAutoPlay();
        });

        prevBtn.addEventListener("click", function(e) {
            e.preventDefault();
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel(currentIndex);
            resetAutoPlay();
        });

        resetAutoPlay();
    }
});