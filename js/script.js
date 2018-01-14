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
let colors = ["orangered", "deepskyblue", "yellow", "deeppink", "lime", "gray"];
document.body.classList.add("switch-left-" + colors.splice(Math.floor(Math.random() * colors.length), 1)[0]);
document.body.classList.add("switch-right-" + colors[Math.floor(Math.random() * colors.length)]);

document.addEventListener('DOMContentLoaded', function () {

    // Get all "navbar-burger" elements
    var $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {

        // Add a click event on each of them
        $navbarBurgers.forEach(function ($el) {
            $el.addEventListener('click', function () {

                // Get the target from the "data-target" attribute
                var target = $el.dataset.target;
                var $target = document.getElementById(target);

                // Toggle the class on both the "navbar-burger" and the "navbar-menu"
                $el.classList.toggle('is-active');
                $target.classList.toggle('is-active');

            });
        });
    }

});