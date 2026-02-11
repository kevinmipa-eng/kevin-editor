$(document).ready(function() {
    $('#mobile_btn').on('click', function() {
        $('#mobile_menu').toggleClass('active');
        $('#mobile_btn').find('i').toggleClass('fa-xmark fa-bars');
    });
});



// 1. Seleciona o elemento
const banner = document.querySelector('img[src="src/images/banner.webp"]');

// 2. Define os quadros (Keyframes)
const keyframes = [
  { transform: 'scale(1)', opacity: 1 },    // Início
  { transform: 'scale(1.05)', opacity: 0.8 } // Fim (Efeito pulso)
];

// 3. Define as configurações (Timing)
const config = {
  duration: 2000,          // 2 segundos (em milissegundos)
  iterations: Infinity,    // Loop infinito
  direction: 'alternate',  // O "Ping-Pong" (vai e volta)
  easing: 'ease-in-out'    // Suavidade estilo After Effects
};

// 4. Executa a animação
const animacao = banner.animate(keyframes, config);


