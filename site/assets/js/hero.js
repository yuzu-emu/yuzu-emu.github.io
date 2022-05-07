// Hero navbar fades to the normal navbar color once scrolled.
const navbar = document.getElementById('hero-navbar');
const navbarBaseColor = 'is-dark';

if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 0) {
            navbar.classList.add('is-freestanding');
            navbar.classList.add(navbarBaseColor);
        } else {
            navbar.classList.remove('is-freestanding');
            navbar.classList.remove(navbarBaseColor);
        }
    });
}

// Handle random switch colors
let colors = ['orangered', 'deepskyblue', 'yellow', 'deeppink', 'lime', 'gray'];
document.body.classList.add('switch-left-' + colors.splice(Math.floor(Math.random() * colors.length), 1)[0]);
document.body.classList.add('switch-right-' + colors[Math.floor(Math.random() * colors.length)]);

// Handle lazy-loading of images
document.addEventListener('DOMContentLoaded', function () {
    const elements = document.getElementsByClassName('lazy-load');
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        element.src = element.getAttribute('data-src');
    }
});

// Show image carousel, if needed
const carousels = document.getElementsByClassName('glide');
if (carousels.length > 0) {
    document.addEventListener('DOMContentLoaded', function () {
        const glide = new Glide('.glide', {
            type: 'carousel',
            perView: 1,
            focusAt: 'center',
            autoplay: 4000,
            gap: 0,
            animationTimingFunc: 'ease-in-out',
            animationDuration: 1000
        });

        glide.mount();
    });
}
