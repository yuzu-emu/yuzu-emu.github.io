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
const colors = ["orangered", "deepskyblue", "yellow", "deeppink", "lime", "gray"];
document.body.classList.add("switch-left-" + colors[Math.floor(Math.random() * colors.length)]);
document.body.classList.add("switch-right-" + colors[Math.floor(Math.random() * colors.length)]);
