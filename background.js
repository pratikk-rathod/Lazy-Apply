chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_TOKEN") {
        chrome.cookies.get({ url: "https://www.naukri.com", name: "nauk_at" }, (cookie) => {
            if (cookie) {
                sendResponse({ token: cookie.value });
            } else {
                sendResponse({ error: "Could not find nauk_at cookie." });
            }
        });
        return true; // Keep the message channel open for async sendResponse
    }
});
