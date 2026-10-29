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
        const player = new Plyr('#player', {
            controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
            autoplay: true,
            muted: true
        });

        function triggerAnimation(element) {
            if (!element) return;
            element.classList.remove("animate");
            void element.offsetWidth;
            element.classList.add("animate");
            setTimeout(() => element.classList.remove("animate"), 600);
        }

        player.on('ready', () => {
            const plyrContainer = player.elements.container;

            function syncCaptionsWithMute() {
                setTimeout(() => {
                    const isMuted = player.muted || player.volume === 0;
                    if (!isMuted) {
                        player.captions.active = false;
                        if (typeof player.toggleCaptions === "function") player.toggleCaptions(false);
                    } else {
                        player.captions.active = true;
                        if (typeof player.toggleCaptions === "function") player.toggleCaptions(true);
                    }
                }, 50);
            }

            const muteBtn = plyrContainer.querySelector('.plyr__control[data-plyr="mute"]');
            if (muteBtn) muteBtn.addEventListener('click', syncCaptionsWithMute);

            const volumeInput = plyrContainer.querySelector('.plyr__volume input');
            if (volumeInput) {
                volumeInput.addEventListener('input', syncCaptionsWithMute);
                volumeInput.addEventListener('change', syncCaptionsWithMute);
            }

            player.on('volumechange', syncCaptionsWithMute);
            
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
    // 3. CARROSSEL PRINCIPAL DE CANAIS E TRABALHOS COM AUTOPLAY E SETAS INTERNAS FUNCIONAIS
    // ==========================================================================
    const channelSlides = document.querySelectorAll(".channel-slide-item");
    const prevChannelBtn = document.querySelector(".prev-channel-btn");
    const nextChannelBtn = document.querySelector(".next-channel-btn");
    const channelsWrapper = document.querySelector(".main-channels-carousel-wrapper");

    let currentChannelIndex = 0;
    let channelInterval = null;
    let currentWorkInterval = null;
    let isPausedByHoverOrTouch = false;

    function getSlideDuration(slideItem) {
        if (slideItem.querySelector("video") || slideItem.classList.contains("comparison-stack")) {
            return 9000;
        }
        return 3000;
    }

    function scheduleNextWorkSlide(channelSlide) {
        if (currentWorkInterval) {
            clearTimeout(currentWorkInterval);
            currentWorkInterval = null;
        }

        if (isPausedByHoverOrTouch) return;

        const workSlides = channelSlide.querySelectorAll(".work-slide-item");
        if (workSlides.length === 0) return;

        let activeIndex = 0;
        workSlides.forEach((w, idx) => {
            if (w.classList.contains("active")) activeIndex = idx;
        });

        const currentSlide = workSlides[activeIndex];
        const duration = getSlideDuration(currentSlide);

        currentWorkInterval = setTimeout(() => {
            if (!isPausedByHoverOrTouch) {
                let nextIndex = (activeIndex + 1) % workSlides.length;
                workSlides.forEach(w => w.classList.remove("active"));
                workSlides[nextIndex].classList.add("active");
                scheduleNextWorkSlide(channelSlide);
            }
        }, duration);
    }

    function setupWorkCarousels() {
        channelSlides.forEach(channelSlide => {
            const workSlides = channelSlide.querySelectorAll(".work-slide-item");
            const prevWorkBtn = channelSlide.querySelector(".prev-work-btn");
            const nextWorkBtn = channelSlide.querySelector(".next-work-btn");

            if (!prevWorkBtn || !nextWorkBtn || workSlides.length === 0) return;

            // Substitui os botões para limpar eventos antigos
            const newPrev = prevWorkBtn.cloneNode(true);
            const newNext = nextWorkBtn.cloneNode(true);
            prevWorkBtn.parentNode.replaceChild(newPrev, prevWorkBtn);
            nextWorkBtn.parentNode.replaceChild(newNext, nextWorkBtn);

            newNext.addEventListener("click", function(e) {
                e.preventDefault();
                e.stopPropagation();

                if (currentWorkInterval) {
                    clearTimeout(currentWorkInterval);
                    currentWorkInterval = null;
                }

                let activeIndex = 0;
                workSlides.forEach((w, idx) => {
                    if (w.classList.contains("active")) activeIndex = idx;
                });

                workSlides[activeIndex].classList.remove("active");
                let nextIndex = (activeIndex + 1) % workSlides.length;
                workSlides[nextIndex].classList.add("active");

                if (!isPausedByHoverOrTouch) {
                    scheduleNextWorkSlide(channelSlide);
                }
            });

            newPrev.addEventListener("click", function(e) {
                e.preventDefault();
                e.stopPropagation();

                if (currentWorkInterval) {
                    clearTimeout(currentWorkInterval);
                    currentWorkInterval = null;
                }

                let activeIndex = 0;
                workSlides.forEach((w, idx) => {
                    if (w.classList.contains("active")) activeIndex = idx;
                });

                workSlides[activeIndex].classList.remove("active");
                let prevIndex = (activeIndex - 1 + workSlides.length) % workSlides.length;
                workSlides[prevIndex].classList.add("active");

                if (!isPausedByHoverOrTouch) {
                    scheduleNextWorkSlide(channelSlide);
                }
            });
        });
    }

    function updateChannelSlide(index) {
        if (currentWorkInterval) {
            clearTimeout(currentWorkInterval);
            currentWorkInterval = null;
        }

        channelSlides.forEach(slide => slide.classList.remove("active"));
        const activeChannel = channelSlides[index];
        activeChannel.classList.add("active");

        // Faz o último slide (vídeo) ser o primeiro a aparecer ao trocar de canal
        const workSlides = activeChannel.querySelectorAll(".work-slide-item");
        if (workSlides.length > 0) {
            workSlides.forEach(w => w.classList.remove("active"));
            const lastIndex = workSlides.length - 1; 
            workSlides[lastIndex].classList.add("active");
        }

        if (!isPausedByHoverOrTouch) {
            scheduleNextWorkSlide(activeChannel);
        }
    }

    function startChannelAutoplay() {
        if (channelInterval) {
            clearInterval(channelInterval);
            channelInterval = null;
        }

        if (isPausedByHoverOrTouch) return;

        channelInterval = setInterval(() => {
            if (!isPausedByHoverOrTouch) {
                currentChannelIndex = (currentChannelIndex + 1) % channelSlides.length;
                updateChannelSlide(currentChannelIndex);
            }
        }, 15000); 
    }

    function pauseAllCarousels() {
        isPausedByHoverOrTouch = true;
        if (channelInterval) {
            clearInterval(channelInterval);
            channelInterval = null;
        }
        if (currentWorkInterval) {
            clearTimeout(currentWorkInterval);
            currentWorkInterval = null;
        }
    }

    function resumeAllCarousels() {
        isPausedByHoverOrTouch = false;
        startChannelAutoplay();
        scheduleNextWorkSlide(channelSlides[currentChannelIndex]);
    }

    if (channelSlides.length > 0) {
        setupWorkCarousels();
        updateChannelSlide(currentChannelIndex);
        startChannelAutoplay();

        if (channelsWrapper) {
            channelsWrapper.addEventListener("mouseenter", pauseAllCarousels);
            channelsWrapper.addEventListener("mouseleave", resumeAllCarousels);
        }

        window.addEventListener("pointerdown", pauseAllCarousels);
        window.addEventListener("pointerup", resumeAllCarousels);
        window.addEventListener("pointercancel", resumeAllCarousels);

        if (prevChannelBtn && nextChannelBtn) {
            nextChannelBtn.addEventListener("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                currentChannelIndex = (currentChannelIndex + 1) % channelSlides.length;
                updateChannelSlide(currentChannelIndex);
                startChannelAutoplay(); 
            });

            prevChannelBtn.addEventListener("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                currentChannelIndex = (currentChannelIndex - 1 + channelSlides.length) % channelSlides.length;
                updateChannelSlide(currentChannelIndex);
                startChannelAutoplay(); 
            });
        }
    }
});