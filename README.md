# PageSnack 🍪

**PageSnack** is a premium, AI-powered Chrome Extension designed to provide instant, structured summaries and key insights from any webpage. It uses intelligent content extraction and a secure backend proxy to deliver high-quality summaries without compromising security.

---

## 🚀 Getting Started

### 1. Local Development Setup
1.  Clone this repository to your local machine.
2.  Ensure you have Google Chrome installed.

### 2. Loading the Extension
1.  Open Chrome and navigate to `chrome://extensions/`.
2.  Enable **Developer mode** (toggle in the top right corner).
3.  Click **Load unpacked**.
4.  Select the `pageSnack` root folder.
5.  The PageSnack icon should now appear in your extensions bar.

---

## 🏗️ Architecture Overview

PageSnack follows a modular **Client-Proxy** architecture to ensure performance and security.

### 🧩 Components
-   **Popup UI (`ui/`)**: A modern, glassmorphism-inspired interface that handles user interactions and displays summaries.
-   **Content Script (`content/`)**: Injected into the active tab to extract "meaningful" content (filtering out noise like navbars/ads) and perform in-page highlighting.
-   **Background Service Worker (`background/`)**: The extension's engine. It manages message passing, handles the AI request flow, and implements a persistent cache.
-   **Backend Proxy (Vercel)**: A secure Node.js server that holds the actual AI API keys (e.g., OpenAI/Gemini) and communicates with the AI providers.

---

## 🤖 AI Integration & Flow
1.  **Extraction**: The content script uses heuristic filtering to grab the main article text and title.
2.  **Request**: The popup sends the text to the background worker.
3.  **Caching**: The background worker checks `chrome.storage.local` for a cached summary of the current URL.
4.  **Proxy Call**: If no cache exists, the worker calls the backend proxy with an authorization header (`x-pagesnack-key`).
5.  **Response**: The proxy returns a structured JSON object containing a summary, key insights, and keywords.

---

## ⚖️ Trade-offs

| Decision | Pros | Cons |
| :--- | :--- | :--- |
| **Backend Proxy** | Protects API keys; allows rate limiting and logging. | Adds network latency; requires separate hosting and maintenance. |
| **Heuristic Extraction** | Fast, runs locally, no extra cost. | May struggle with extremely dynamic pages (SPAs) or non-standard layouts. |
| **Keyword Highlighting** | Simple, high performance. | Can result in false positives if keywords are too generic. |
| **Caching (Storage)** | Instant loads for visited pages; saves API costs. | Requires managing storage limits (though 5MB is plenty for text). |

---

## 🔒 Security & Permissions

### Security Decisions
-   **No Exposed Secrets**: AI API keys are **never** stored in the extension. They live strictly on the backend proxy.
-   **XSS Prevention**: AI-generated content is injected using `innerText` to prevent any malicious scripts in the AI response from executing.
-   **Validated Message Passing**: Messages between components use specific `type` identifiers to ensure only intended actions are performed.

### Permissions Explanation
-   `activeTab`: Allows the extension to interact only with the page you currently have open when you click the icon.
-   `scripting`: Required to inject the content script to read the page.
-   `storage`: Used to cache summaries and insights to improve user experience and reduce API load.
-   `<all_urls>` (Host Permission): Required to extract content from any site the user wishes to summarize.

---

## ⚠️ Known Limitations
-   **Dynamic Content**: Pages that load content only on scroll may not be fully captured.
-   **PDFs/Files**: Chrome Extensions have limited access to PDF viewers; summaries may not work on local or browser-rendered PDFs.
-   **Highlighting**: Uses string matching; it may occasionally highlight common words that are part of the keyword list.

---

## 🔮 Future Improvements
-   **Advanced NLP**: Integrate a library like `Readability.js` for even more accurate content extraction.
-   **User Auth**: Allow users to save their favorite summaries to a personal account.
-   **Export**: Add a "Copy to Clipboard" or "Save as PDF" button for summaries.

---

**PageSnack** — *Bite-sized insights for a faster web.*
