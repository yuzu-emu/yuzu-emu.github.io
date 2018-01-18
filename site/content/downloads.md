+++
title = "Downloads"
+++

The nightly build of yuzu contains already reviewed and tested features. If you require support with the installation 
 or use of yuzu, or you want to report bugs you should use this version. This version is still in development, so 
 expect crashes and bugs.

The Canary build of yuzu is the same as our nightly builds, with additional features that are still waiting on review 
 before making it into the official yuzu builds. We will not provide support for issues found only in this version. If 
 you believe you've found a bug, please retest on our nightly builds. This version is still in development, so expect 
 crashes and bugs.
 
<div class="columns">
  <div class="column">
      <div class="box">
        <h3>Nightly Build <span style='font-size: smaller; margin-left: 6px;'>
            Last release was  <span id='last-updated-nightly'></span></span></h3>
        <table id="downloads-nightly" class="table">
            <thead>
                <tr>
                    <th>Build Date</th>
                    <th>Commit Information</th>
                    <th>Download</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
        <div id="unavailable-nightly" class="is-hidden">There was a problem checking GitHub. Click the link below
          to view them directly.</div>
        <div style="text-align: center; padding: 0px; margin: 0px;">
            <a href = "https://github.com/yuzu-emu/yuzu-nightly/releases">Click here to view previous versions...</a>
        </div>
      </div>
  </div>
  <div class="column">
      <div class="box">
          <h3>Canary Build <span style='font-size: smaller; margin-left: 6px;'> 
              Last release was  <span id='last-updated-canary'></span></span></h3>
          <table id="downloads-canary" class="table">
              <thead>
                  <tr>
                      <th>Build Date</th>
                      <th>Commit Information</th>
                      <th>Download</th>
                  </tr>
              </thead>
              <tbody>
              </tbody>
          </table>
          <div id="unavailable-canary" class="is-hidden">There was a problem checking GitHub. Click the link below
            to view them directly.</div>
          <div style="text-align: center; padding: 0px; margin: 0px;">
              <a href = "https://github.com/yuzu-emu/yuzu-canary/releases">Click here to view previous versions...</a>
          </div>    
      </div>
  </div>
</div>

<script type="text/javascript" src="/js/moment.min.js"></script>
<script type="text/javascript">
    function releaseCallback(v, count, e) {
        if (e.status !== 200 || e.responseText.length < 10) {
            document.getElementById(`last-updated-${v}`).innerText = "never";
            document.getElementById(`unavailable-${v}`).classList.remove("is-hidden");
            document.getElementById(`downloads-${v}`).classList.add("is-hidden");
            return;
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

            release.assets.forEach(function(asset) {
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
                download_span += `<a class="dl-icon" href="${download_url}"><span class="icon"><i class="fab fa-${env_icon}"></i></span></a>`;
            });

            /* Generate the link to the Github release. */
            download_span += `<a class="dl-icon" href="${release.html_url}"><span class="icon"><i class="fab fa-github"></i></span></a>`;

            if (release_commit_url != null) {
                document.getElementById(`downloads-${v}`).innerHTML += 
                    `<tr><td>${release_date}</td>` +
                    `<td><a href="${release_commit_url}">${release_title}</a></td><td>${download_span}</td></tr>`;
            } else {
                document.getElementById(`downloads-${v}`).innerHTML += 
                    `<tr><td>${release_date}</td>` +
                    `<td>${release_title}</td><td>${download_span}</td></tr>`;
            }
            if (i + 1 >= count) { break; }
        };
    }
    
    function getRelease(v, count = 5) {
        var netReq = new XMLHttpRequest();
        netReq.open("GET", `https://api.github.com/repos/yuzu-emu/yuzu-${v}/releases`);
        netReq.onload = function() {
            releaseCallback(v, count, this);
        };
        netReq.send();
    }
    
    function fetchReleases() {
        getRelease('nightly');
        getRelease('canary');
    }
    
    fetchReleases();
</script>