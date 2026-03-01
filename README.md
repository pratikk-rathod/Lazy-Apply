# Naukri Auto Apply Extension

A lightweight, native Google Chrome extension designed to automate the process of applying to multiple job listings on Naukri.com simultaneously. It extracts job IDs from the currently visible page, gathers necessary authentication headers locally, bypasses basic questionnaire prompts, and submits applications using Naukri's internal APIs.

## Purpose
Applying to dozens of jobs on Naukri can be tedious, particularly because many jobs require you to answer identical questions (e.g., current CTC, notice period) repeatedly. This extension automates this workflow: you click once, and it attempts to apply to all jobs on the screen using your predefined default answers.

## Installation & Setup

1. **Download the code or Clone the repository:**
   ```bash
   git clone https://github.com/your-username/Lazy-Apply.git
   ```
2. Open Google Chrome and navigate to the Extensions page at `chrome://extensions/`.
3. Toggle on **Developer mode** in the top-right corner.
4. Click the **Load unpacked** button in the top-left corner.
5. Select the `Lazy-Apply` directory that contains the `manifest.json` file.
6. **Important:** The extension is now installed. Pin the "Lazy Apply 🍌" icon to your toolbar!

## How to use
1. Go to any job search page or recommended jobs page on **Naukri.com** (e.g., `naukri.com/mnjuser/recommendedjobs`).
2. Click the Lazy Apply extension icon in your toolbar.
3. Fill in your default answers like Expected CTC, Notice Period, etc.
4. Click **Apply While I Nap 🍌**.
5. Wait and look at the extension logs! The extension will scan all jobs on the page, authenticate seamlessly, and apply to them automatically filling dynamically required forms.

## Architecture & Codebase Structure

The extension follows Manifest V3 architecture.

*   **`manifest.json`**: The core configuration. Defines permissions (`activeTab`, `scripting`, `cookies`, `storage`) and registers the background service worker and content scripts.
*   **`popup.html`, `popup.css`, `popup.js`**:
    *   **UI Layer**: Provides a clean interface for the user to configure default answers (CTC, Exp, etc.).
    *   **Storage**: Saves the user's defaults to `chrome.storage.local`.
    *   **Trigger**: Injects the `START_APPLY` message into the active tab (content script) when the user clicks the "Apply" button.
*   **`content.js`**:
    *   **DOM Scraping**: Injected directly into the Naukri page environment. Finds all job IDs on the page by inspecting anchors `<a>` and `data-job-id` attributes.
    *   **API Orchestration**: Sends a message to the background worker (`GET_TOKEN`) to retrieve the user's secure authentication tokens.
    *   **Application Logic**: Performs the HTTP POST request to Naukri's `/apply` endpoint. It parses the API JSON response to see if any job requires answering a questionnaire. If so, it matches the questionnaire constraints against the user's defaults and fires a *second* POST request with the correctly shaped `applyData`.
*   **`background.js`**:
    *   **Cookie Extraction**: Operates as a background Service Worker. Because Naukri cookies like `nauk_at` (Access Token) might be `HttpOnly`, they cannot be read directly via `document.cookie` in the content layer. The background script uses the `chrome.cookies` API to safely fetch them and pass them back to `content.js`.

## API Workflow (For Future Development)

The current implementation interacts with `POST /cloudgateway-workflow/workflow-services/apply-workflow/v1/apply`.
The headers expected by this endpoint require: `appid`, `clientid`, `systemid`, and importantly: `Authorization: Bearer <nauk_at_token>`.

### Request 1: "Show" Flow
The extension first sends the job array `["job_id_1", "job_id_2"]` without answers. 
Naukri responds indicating if the job was applied successfully (`status: 200`) or if there is a `questionnaire` array attached.

### Request 2: "Apply" Flow
If `questionnaire` questions exist, the extension iterates through them. It builds a map of:
`{ "questionId": "Mapped Answer Value" }` (or an array `["Key"]` for radio buttons/lists).
It then shapes the `applyData` payload structure and sends it to the same API to finalize the application.

## Future Scope / Roadmap for AI & Human Improvement

1.  **AI Integration (Semantic Matching)**: Currently, the extension uses basic `.includes()` string logic to map "Yes" or numeric values to the dynamic keys offered by the Naukri `answerOption` object. In the future, integrating a lightweight local LLM or an API-based LLM classifier to read the exact question semantics and intelligently pick the best key would make the completion rate 100%.
2.  **Pagination Auto-Scroll**: The extension only fetches jobs currently painted on the DOM. Future versions could automatically click "Next Page" or scroll down, triggering the apply cycle in a continuous loop.
3.  **Application Logs & Retry DB**: Store successfully applied `jobIds` in local storage/IndexedDB. If a job application fails due to missing skills or a complex un-answered question, the user could answer it once manually, save it to the DB, and the extension would re-attempt it.
4.  **Rate Limiting**: Naukri restricts applications (typically ~50 a day). Building a visual counter inside the popup that parses the `quotaDetails` from the API response to warn the user when they are nearing the limit.
5.  **Robust Error Mapping**: Naukri frequently returns HTTP 406 for validation errors on custom drop-downs. Better extraction of `customErrorCode: 290` (List is required) to gracefully inform the user to configure list behaviors.
