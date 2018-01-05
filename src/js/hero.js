let navbar = document.getElementById("hero-navbar");

if (navbar) {
    window.addEventListener('scroll', function (e) {
        if (window.scrollY > 0) {
            navbar.classList.add("is-freestanding");
        } else {
            navbar.classList.remove("is-freestanding");
        }
    });
}
