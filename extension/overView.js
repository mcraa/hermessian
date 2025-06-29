
let addButton = document.getElementById("saved-urls-div");

document.addEventListener("DOMContentLoaded", function(event) { 
    chrome.storage.local.get().then((items) => {
        if (items) {
            addButton.innerText = items.urls
        }
    });
});