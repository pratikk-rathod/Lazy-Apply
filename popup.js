document.addEventListener('DOMContentLoaded', () => {
    const fields = ['expectedCtc', 'currentCtc', 'noticePeriod', 'experience', 'catchAll'];

    // Restore saved settings
    chrome.storage.local.get(fields, (res) => {
        fields.forEach(f => {
            if (res[f] !== undefined) {
                document.getElementById(f).value = res[f];
            }
        });
    });

    // Save and Apply
    document.getElementById('applyBtn').addEventListener('click', () => {
        let defaults = {};
        fields.forEach(f => {
            defaults[f] = document.getElementById(f).value.trim();
        });

        chrome.storage.local.set(defaults);

        logMsg("Scanning page for jobs...");

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            console.log("popup.js: Found active tab", tabs[0]);
            if (tabs[0].url.includes("naukri.com")) {
                console.log("popup.js: Sending START_APPLY to content script...");
                chrome.tabs.sendMessage(tabs[0].id, { action: "START_APPLY", defaults: defaults }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("popup.js: Messaging Error:", chrome.runtime.lastError.message);
                        logMsg("Error connecting to page. Did you refresh the Naukri page after reloading the extension? " + chrome.runtime.lastError.message, true);
                    } else {
                        console.log("popup.js: Content script acknowledged:", response);
                    }
                });
            } else {
                logMsg("Error: Please open a Naukri.com job page.", true);
            }
        });
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "LOG") {
        logMsg(request.message, request.isError);
    }
});

function logMsg(msg, isError = false) {
    const statusBox = document.getElementById('status');
    const p = document.createElement('div');
    p.textContent = msg;
    p.className = isError ? 'log-error' : 'log-success';
    statusBox.appendChild(p);
    statusBox.scrollTop = statusBox.scrollHeight;
}
