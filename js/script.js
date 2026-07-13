window.addEventListener("load", function() {

    // Inicializa o player customizado Plyr sobre o vídeo do YouTube
    const player = new Plyr('#player', {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
        autoplay: true,
        muted: true
    });
    
    // ==========================================================================
    // 1. LÓGICA DAS ABAS (TABS) com Rolagem Automática
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
    // 2. LÓGICA DO CARROSSEL DE CANAIS
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