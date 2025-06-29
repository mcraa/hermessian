let tabName = document.getElementById("tab-name-div");

let mainButton = document.getElementById("main-button");
mainButton.addEventListener("click", () => {
    chrome.tabs.create({
        url: "overView.html"
    });
})

let addButton = document.getElementById("add-tab-button");
addButton.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tab) {
        tabName.innerText = `${tab.url} added`
        setTimeout(() => {
            tabName.innerText = ""
        }, 800)
        chrome.storage.local.set({ "urls": tab.url })
    }
})

let getCookies = async () => {
    let creds = await chrome.cookies.getAll({ url: 'https://home.atlassian.com'})

    var response = await fetch(
    "https://home.atlassian.com/gateway/api/notification-log/api/3/notifications/count/unseen",
    {
      mode: 'no-cors',
      credentials: "include",
      headers : {
          Cookie: creds.map((c) => `${c.name}=${c.value}`).join(';')
      }
    });
  if (!response.ok) {
    // TODO login?
    return;
  }
}