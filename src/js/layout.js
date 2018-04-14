document.addEventListener("DOMContentLoaded", function() {
    // .data-href
    document.querySelectorAll('div[data-href]').forEach(x => {
        x.addEventListener('click', function() {
            window.location = x.getAttribute('data-href')
        });
    })

    // .moment-timeago
    document.querySelectorAll('.moment-timeago').forEach(x => {
        x.innerHTML = moment(x.innerHTML).fromNow()
    })
})