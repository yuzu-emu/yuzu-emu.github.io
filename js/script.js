function releaseCallback(v, count, e) {
    if (e.status !== 200 || e.responseText.length < 10) {
        document.getElementById(`last-updated-${v}`).innerText = "never";
        document.getElementById(`unavailable-${v}`).classList.remove("is-hidden");
        document.getElementById(`downloads-${v}`).classList.add("is-hidden");
        throw new Error(e.responseText);
    }

    var releases = JSON.parse(e.responseText);

    document.getElementById(`last-updated-${v}`).innerText = moment(releases[0].published_at).fromNow();

    for (var i = 0; i < releases.length; ++i) {
        var release = releases[i];
        var release_date = moment(release.published_at).fromNow();

        var release_commit = release.assets[0].name.split('-').pop().trim().split('.')[0];
        var release_commit_url = `https://github.com/yuzu-emu/yuzu-${v}/commit/${release_commit}`;

        var release_title = '';
        if (v == 'nightly') {
            release_title = 'Nightly Build';
        } else if (v == 'canary') {
            release_title = 'Canary Build';
        }

        if (release_commit) {
            release_title += ' - ' + release_commit;
        }

        var download_span = '';

        release.assets.forEach(function (asset) {
            if (asset.name.includes('nupkg')) return;
            if (asset.name.includes('.7z')) return;
            if (asset.name.includes('RELEASES')) return;

            /* We only want to provide mingw builds on the downloads page. */
            if (asset.name.includes('-msvc-')) return;

            var env_icon = 'unknown';
            if (asset.name.includes('windows')) env_icon = 'windows';
            else if (asset.name.includes('exe')) env_icon = 'windows';
            else if (asset.name.includes('osx')) env_icon = 'apple';
            else if (asset.name.includes('linux')) env_icon = 'linux';

            var download_url = `https://github.com/yuzu-emu/yuzu-${v}/releases/download/${release.tag_name}/${asset.name}`;

            download_span += `
            <a class="level-item">
                <a href="${download_url}">
                    <span class="icon is-medium">
                        <i class="fab fa-2x fa-${env_icon}"></i>
                    </span>
                </a>
            </a>`;
        });

        /* Generate the link to the Github release. */
        download_span += `
        <a class="level-item">
            <a href="${release.html_url}">
                <span class="icon is-medium">
                    <i class="fab fa-2x fa-github"></i>
                </span>
            </a>
        </a>
        `;

        // TODO: Add information on latest commit
        document.getElementById(`downloads-${v}`).innerHTML +=
            `<div class="box">
               <article class="media">
                <div class="media-content">
                 <div class="content">
                  <p>
                   <strong><a href="${release_commit_url}">${release_title}</a></strong>
                   <small>${release_date}</small>
                  </p>
                 </div>
                 <nav class="level is-mobile">
                  <div class="level-left">
                   ${download_span}
                  </div>
                 </nav>
                </div>
               </article>
             </div>`;
        if (i + 1 >= count) { break; }
    };
}

function getRelease(v, count = 3) {
    var netReq = new XMLHttpRequest();
    netReq.open("GET", `https://api.github.com/repos/yuzu-emu/yuzu-${v}/releases`);
    netReq.onload = function () {
        releaseCallback(v, count, this);
    };
    netReq.send();
}
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