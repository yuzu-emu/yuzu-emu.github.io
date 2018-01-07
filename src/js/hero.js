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
