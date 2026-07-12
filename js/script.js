/* js/script.js */

window.addEventListener("load", function() {
    
    // ==========================================================================
    // 1. CONTROLE AVANÇADO DO VÍDEO (RECURSOS ESTILO YOUTUBE & DOUBLE TAP)
    // ==========================================================================
    const video = document.getElementById("showreel-video");
    const videoWrapper = document.querySelector(".video-native-wrapper"); // Container do vídeo
    const playPauseBtn = document.getElementById("play-pause-btn");
    const muteBtn = document.getElementById("mute-toggle-btn");
    const rewindBtn = document.getElementById("rewind-10s-btn");
    const forwardBtn = document.getElementById("forward-10s-btn");
    const progressBar = document.getElementById("progress-bar");
    const progressContainer = document.getElementById("progress-container");
    const timeDisplay = document.getElementById("video-time");
    
    // Elementos mobile de duplo clique (IDs mantidos para o CSS funcionar)
    const feedbackLeft = document.getElementById("feedback-left");
    const feedbackRight = document.getElementById("feedback-right");

    if (video) {
        // Função para alternar Play / Pause
        function togglePlay() {
            if (video.paused) {
                video.play();
                if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            } else {
                video.pause();
                if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            }
        }

        // --- NOVA FUNCIONALIDADE: Play / Pause ao clicar no vídeo (PC/Celular) ---
        // Adiciona o ouvinte diretamente no elemento de vídeo
        video.addEventListener("click", togglePlay);

        // Play / Pause pelo botão de controle
        if (playPauseBtn) playPauseBtn.addEventListener("click", togglePlay);
        
        // Mudo / Áudio
        if (muteBtn) {
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

        // Funções para adiantar e voltar tempo (10 segundos)
        function skipTime(seconds) {
            video.currentTime = Math.min(video.duration, Math.max(0, video.currentTime + seconds));
        }
        if (rewindBtn) rewindBtn.addEventListener("click", () => skipTime(-10));
        if (forwardBtn) forwardBtn.addEventListener("click", () => skipTime(10));

        // Formatação de minutos e segundos (ex: 0:05 / 1:30)
        function formatTime(timeInSeconds) {
            if (isNaN(timeInSeconds)) return "0:00";
            const mins = Math.floor(timeInSeconds / 60);
            const secs = Math.floor(timeInSeconds % 60);
            return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
        }

        // Atualização da barra de progresso e do relógio indicador
        video.addEventListener("timeupdate", function() {
            const percentage = (video.currentTime / video.duration) * 100;
            if (progressBar) progressBar.style.width = `${percentage}%`;
            if (timeDisplay) {
                timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
            }
        });

        // Clique na barra para navegar no vídeo (Scrubbing)
        if (progressContainer) {
            progressContainer.addEventListener("click", function(e) {
                const containerWidth = progressContainer.offsetWidth;
                const clickX = e.offsetX;
                video.currentTime = (clickX / containerWidth) * video.duration;
            });
        }

        // --- SISTEMA DE DUPLO CLIQUE MOBILE (MELHORADO) ---
        // Gerencia múltiplos toques para detecção de duplo toque
        let tapCount = 0;
        let tapTimeout;

        // Função para engatilhar animação de feedback
        function triggerAnimation(element) {
            element.classList.remove("animate");
            void element.offsetWidth; // Truque para resetar animação CSS
            element.classList.add("animate");
            setTimeout(() => element.classList.remove("animate"), 600); // Remove classe após animação
        }

        // Adiciona ouvinte de toque ao container do vídeo para detecção de duplo toque
        if (videoWrapper) {
            videoWrapper.addEventListener("touchend", function(e) {
                tapCount++;
                const currentTime = new Date().getTime();
                const wrapperWidth = videoWrapper.offsetWidth;
                // Obtém posição horizontal relativa ao container do vídeo
                const touchX = e.changedTouches[0].clientX - videoWrapper.getBoundingClientRect().left;

                if (tapCount === 1) {
                    // Primeiro toque: define temporizador para detectar segundo toque
                    tapTimeout = setTimeout(function() {
                        tapCount = 0;
                        // Opcionalmente, você pode lidar com toque simples aqui se não for detectado o duplo toque.
                    }, 300); // Janela de 300ms para o segundo toque
                } else if (tapCount === 2) {
                    // Segundo toque dentro do tempo limite (duplo toque)
                    clearTimeout(tapTimeout); // Cancela o temporizador de toque simples
                    tapCount = 0; // Reinicia contador

                    // Determina se o toque foi à esquerda ou à direita do container
                    if (touchX < wrapperWidth / 2) {
                        // Toque à esquerda: retrocede 10s
                        skipTime(-10);
                        triggerAnimation(feedbackLeft);
                    } else {
                        // Toque à direita: avança 10s
                        skipTime(10);
                        triggerAnimation(feedbackRight);
                    }
                }
            });
        }
    }

    // ==========================================================================
    // 2. LÓGICA DAS ABAS (TABS) com Rolagem Automática
    // ==========================================================================
    const navLinks = document.querySelectorAll(".nav-link[data-tab]");
    const tabContents = document.querySelectorAll(".tab-content");

    navLinks.forEach(link => {
        link.addEventListener("click", function() {
            const targetTab = this.getAttribute("data-tab");

            navLinks.forEach(l => l.classList.remove("active"));
            this.classList.add("active");

            tabContents.forEach(content => {
                if (content.id === targetTab) {
                    content.classList.add("active");
                } else {
                    content.classList.remove("active");
                }
            });

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
    // 3. LÓGICA DO CARROSSEL DE CANAIS (CORRIGIDO)
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