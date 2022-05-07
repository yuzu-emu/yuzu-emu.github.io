document.addEventListener('DOMContentLoaded', function () {
    // .data-href
    document.querySelectorAll('div[data-href]').forEach((x) => {
        x.addEventListener('click', function () {
            window.location = x.getAttribute('data-href');
        });
    });

    // .moment-timeago
    document.querySelectorAll('.moment-timeago').forEach((x) => {
        x.innerHTML = moment(x.innerHTML).fromNow();
    });

    // .is-dropdown
    document.querySelectorAll('.is-dropdown').forEach((x) => {
        x.addEventListener('click', function (event) {
            event.stopPropagation();
            x.parentElement
                .querySelectorAll('.is-dropdown-target')
                .forEach((child) => {
                    child.classList.toggle('is-active');
                });
        });
    });

    // baguetteBox
    baguetteBox.run('.baguetteBox');
});
