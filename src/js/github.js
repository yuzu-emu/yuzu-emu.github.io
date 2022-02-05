function fetchPR(tenant, pr) {
    return fetch(`https://api.github.com/repos/${tenant}-emu/${tenant}/pulls/${pr}`, {
        headers: {
            Accept: 'application/vnd.github.v3+json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        method: 'GET',
    }).then(function (response) {
        return response.json();
    });
}

function buildHovercard(data) {
    const elem = document.getElementById('gh-template');
    const title = elem.getElementsByClassName('gh-hover-title')[0];
    title.firstChild.innerText = data.title;
    title.href = data.html_url;
    const mergedAt = data.merged_at;
    let state = 'open';
    let mergedDate = '';
    if (mergedAt) {
        // eslint-disable-next-line no-undef
        let parsedDate = moment.utc(mergedAt);
        mergedDate = parsedDate.fromNow();
        state = 'merged';
        elem.getElementsByClassName('gh-hover-date')[0].innerText = `Merged ${mergedDate}.`;
    } else if (data.state === 'closed') {
        state = 'closed';
    }
    elem.getElementsByClassName('gh-hover-icon')[0].classList.add(state);
    elem.getElementsByClassName('gh-hover-number')[0].innerText = `#${data.number}`;
    return elem.innerHTML;
}

function createHovercard(tenant, pr) {
    return fetchPR(tenant, pr).then(function (response) {
        return buildHovercard(response);
    });
}

function showHovercard(instance, tenant) {
    if (instance._loading) return;
    if (instance._cached) {
        instance.setContent(instance._cached);
        return;
    }
    instance._loading = true;
    const pr_number = instance.reference.getAttribute('data-gh-pr');
    createHovercard(tenant, pr_number).then(function(content) {
        instance._cached = content;
        instance.setContent(content);
        instance._loading = false;
    }).catch(function(error) {
        instance.setContent('Error fetching data from GitHub: ' + error);
        instance._loading = false;
    });
}

window.showHovercard = showHovercard;
