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
const leftJoycon = document.getElementById('LeftJoy');
const rightJoycon = document.getElementById('RightJoy');
const colors = ['orangered', 'deepskyblue', 'yellow', 'deeppink', 'lime', 'gray'];

if (leftJoycon) {
    leftJoycon.classList.add('switch-' + colors[Math.floor(Math.random() * colors.length)]); 
}

if (rightJoycon) {
    rightJoycon.classList.add('switch-' + colors[Math.floor(Math.random() * colors.length)]); 
}
