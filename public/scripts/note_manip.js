function note_update() {
    console.log("note_update")

    var url = window.location.href
    url = url.substring(url.lastIndexOf('/') + 1)

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'id': url, 'filename': document.getElementById('name-label').dataset.title, 
            'content':  document.getElementById('content').value})
    })
        .then(res => res.json())
        .then(data => window.location.href = data.redirect)
        .catch(err => console.log(err));
}

function note_delete() {
    var url = window.location.href
    url = url.substring(url.lastIndexOf('/') + 1)
    note_delete_request(url)
}

function note_delete_request(url) {
    fetch('/notes/' + url, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => window.location.href = data.redirect)
        .catch(err => console.log(err));
}

function note_search(query) {
    const url = 'notes/search/' + query;
    fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).catch(err => console.log(err));
}