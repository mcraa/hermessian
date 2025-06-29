const broadcast = new BroadcastChannel('hermessian-messages');

// to receive: ping, trigger
broadcast.onmessage = (event) => {
  if (event.data && event.data.type === 'hermessian-ping') {
    sendResponse('hermessian-pong')
  }

  if (event.data && event.data.type === 'hermessian-check-trigger') {
    getUnreadCount()
        .then((res) => {
            sendResponse('hermessina-check-result', res)
        })
        .catch(console.log);
  }
};


// to send: pong, response
const sendResponse = (responseType, data) => {
    broadcast.postMessage({ type: responseType, content: data });
}

const getUnreadCount = async () => {
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