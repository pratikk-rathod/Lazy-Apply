# 🚀 Naukri Auto Apply Extension

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Status](https://img.shields.io/badge/status-active-success)

A lightweight Google Chrome extension built using Manifest V3 to streamline multi-job applications on Naukri.com.

This project demonstrates:
- Browser extension architecture
- DOM parsing and automation
- Background service worker communication
- Secure cookie handling
- Workflow orchestration
- Dynamic form handling logic

---

## ⚠️ Disclaimer

This project is intended for educational and research purposes only.

Users are solely responsible for ensuring compliance with Naukri.com’s Terms of Service and platform policies.

The maintainers assume no responsibility for misuse, account restrictions, or service limitations resulting from usage.

---

# ✨ Features

- 📄 Extracts job IDs from visible job listings
- ⚡ One-click bulk apply workflow
- 🧠 Handles questionnaire-based applications
- 💾 Stores default answers locally
- 🔐 Secure authentication retrieval via Chrome APIs
- 📊 Application progress logging
- 🧱 Manifest V3 compliant architecture

---

# 🛠 Tech Stack

- JavaScript (Vanilla)
- Chrome Extension APIs
- Manifest V3
- Background Service Workers
- DOM Manipulation
- Local Storage (`chrome.storage.local`)

---

# 📦 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/pratikk-rathod/Lazy-Apply.git
```

### 2️⃣ Load in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer Mode**
3. Click **Load Unpacked**
4. Select the project folder (must contain `manifest.json`)
5. Pin the extension to your toolbar

---

# 🚀 Usage

1. Open a Naukri job listing page  
   Example:
   ```
   https://www.naukri.com/mnjuser/recommendedjobs
   ```

2. Click the extension icon

3. Configure your default answers:
   - Expected CTC
   - Notice Period
   - Total Experience
   - Other supported inputs

4. Click **Apply While I Nap 🍌**

5. Monitor logs for application status

The extension processes jobs currently visible on the page.

---

# 🧱 Architecture

## 🔹 Manifest V3 Structure

### `manifest.json`
Defines:
- Permissions (`activeTab`, `scripting`, `cookies`, `storage`)
- Background service worker
- Content scripts
- Popup configuration

---

### `popup.*`
- User configuration UI
- Stores defaults in `chrome.storage.local`
- Sends `START_APPLY` message to content script

---

### `content.js`
- Extracts job IDs from DOM
- Initiates apply workflow
- Handles questionnaire mapping logic
- Communicates with background service worker

---

### `background.js`
- Retrieves authentication cookies using `chrome.cookies`
- Runs as service worker (MV3)
- Provides secure token handling layer

---

# 🔄 Application Workflow Overview

### Step 1: Initial Apply Request
- Send selected job IDs
- Receive response:
  - Success
  - Or questionnaire requirements

### Step 2: Questionnaire Resolution
- Map dynamic questions to configured defaults
- Construct structured payload
- Submit final application request

---

# 🧠 Roadmap

- ✅ Smarter questionnaire semantic matching
- 🔁 Pagination auto-processing
- 📊 Application tracking dashboard
- 🚦 Built-in rate limit counter
- 🗃 Retry queue for failed submissions
- 🧩 Better error mapping & UI alerts

---

# 🔐 Security Considerations

- No external servers are used
- All processing happens locally
- User data is stored only in `chrome.storage.local`
- No credentials are transmitted outside browser context

---

# 🤝 Contributing

1. Fork the repository
2. Clone your fork

```bash
git clone https://github.com/<your-username>/Lazy-Apply.git
```

3. Create a branch

```bash
git checkout -b feature/your-feature-name
```

4. Make changes
5. Test as unpacked extension
6. Submit Pull Request to `develop`

---

# 📄 License

MIT License

Copyright (c) 2026 Pratik Rathod

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---

# 👨‍💻 Maintainer

Pratik Rathod  
Chrome Extension & Workflow Automation Project  
Built for experimentation and architectural exploration.
