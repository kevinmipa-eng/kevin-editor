window.addEventListener("load", function() {
    
    // --- LÓGICA DAS ABAS (TABS) ---
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
        });
    });

    // --- LÓGICA DO CARROSSEL ---
    const slides = document.querySelectorAll(".slide");
    const captions = document.querySelectorAll(".caption");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    let currentIndex = 0;

    if (slides.length > 0 && captions.length > 0 && prevBtn && nextBtn) {
        function updateCarousel(index) {
            slides.forEach(s => s.classList.remove("active"));
            captions.forEach(c => c.classList.remove("active"));

            slides[index].classList.add("active");
            captions[index].classList.add("active");
        }

        nextBtn.addEventListener("click", function(e) {
            e.preventDefault();
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel(currentIndex);
        });

        prevBtn.addEventListener("click", function(e) {
            e.preventDefault();
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel(currentIndex);
        });
    }
});