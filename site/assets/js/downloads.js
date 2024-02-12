function releaseCallback(v, count, e) {
    if (e.status !== 200 || e.responseText.length < 10) {
        document.getElementById(`last-updated-${v}`).innerText = 'never';
        document.getElementById(`unavailable-${v}`).classList.remove('is-hidden');
        document.getElementById(`downloads-${v}`).classList.add('is-hidden');
        throw new Error(e.responseText);
    }

    var releases = JSON.parse(e.responseText);
    var shownReleases = 0;

    document.getElementById(`last-updated-${v}`).innerText = moment(releases[0].published_at).fromNow();

    for (var i = 0; i < releases.length; ++i) {
        var release = releases[i];

        var windowsFound = false;
        var androidFound = false;
        release.assets.forEach(function (asset) {
            /* We only want to provide the msvc builds on the downloads page for Windows. */
            if (asset.name.includes('-mingw-')) return;

            if (asset.name.includes('windows')) {
                windowsFound = true;
            }
            
            if (asset.name.includes('.apk')) {
                androidFound = true;
            }
        });

        if (!windowsFound && !androidFound) {
            continue;
        }

        var release_date = moment(release.published_at).fromNow();

        var release_commit = release.target_commitish;
        var release_commit_url = `https://github.com/yuzu-emu/yuzu-${v}/commit/${release_commit}`;

        var release_title = '';
        if (v == 'mainline') {
            release_title = 'Mainline Build';
        } else if (v == 'android') {
            release_title = 'Android Build';
        }

        if (release_commit) {
            release_title += ' - ' + release_commit.substring(0, 9);
        }

        var download_span = '';

        release.assets.forEach(function (asset) {
            if (asset.name.includes('nupkg')) return;
            if (asset.name.includes('.7z')) return;
            if (asset.name.includes('RELEASES')) return;
            if (asset.name.includes('.tar.xz')) return;
            if (asset.name.includes('-debugsymbols.zip')) return;
            if (asset.name.includes('.zsync')) return;
            if (asset.name.includes('.aab')) return;

            /* We only want to provide the msvc builds on the downloads page for Windows. */
            if (asset.name.includes('-mingw-')) return;

            /* We no longer support OSX builds */
            if (asset.name.includes('osx')) return;

            var env_icon = 'unknown';
            if (asset.name.includes('windows')) env_icon = 'windows';
            else if (asset.name.includes('exe')) env_icon = 'windows';
            else if (asset.name.includes('osx')) env_icon = 'apple';
            else if (asset.name.includes('AppImage')) env_icon = 'linux';
            else if (asset.name.includes('.apk')) env_icon = 'android';

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

        shownReleases++;

        if (shownReleases >= count) { break; }
    }
}

function getRelease(v, count = 3) {
    var netReq = new XMLHttpRequest();
    netReq.open('GET', `https://api.github.com/repos/yuzu-emu/yuzu-${v}/releases`);
    netReq.onload = function () {
        releaseCallback(v, count, this);
    };
    netReq.send();
}
