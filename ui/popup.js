const summarizeBtn = document.getElementById("summarize");
const clearBtn = document.getElementById("clear");
const outputDiv = document.getElementById("output");
const pageTitleEl = document.getElementById("page-title");
const readingTimeEl = document.getElementById("reading-time");
const insightsContainer = document.getElementById("insights-container");
const insightsText = document.getElementById("insights-text");

const placeholderHTML = `<p class="placeholder">Click summarize to get insights from this page.</p>`;

// Get tab and title
(async () => {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	if (tab) {
		pageTitleEl.innerText = tab.title || "Unknown Page";
	}
})();

clearBtn.onclick = () => {
	outputDiv.innerHTML = placeholderHTML;
	readingTimeEl.innerText = "";
	insightsContainer.style.display = "none";
};

summarizeBtn.onclick = async () => {
	try {
		summarizeBtn.disabled = true;
		summarizeBtn.innerHTML = '<span class="spinner"></span> Summarizing...';
		outputDiv.innerText = "";
		insightsContainer.style.display = "none";

		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});

		if (!tab) throw new Error("No active tab found");
		let res;
		try {
			res = await chrome.tabs.sendMessage(tab.id, {
				type: "EXTRACT_PAGE",
			});
		} catch (e) {
			throw new Error(
				"Please refresh the page to enable PageSnack on this tab.",
			);
		}

		if (!res || !res.text) throw new Error("Could not extract text from page");
		if (res.title) pageTitleEl.innerText = res.title;

		const summaryResult = await chrome.runtime.sendMessage({
			type: "SUMMARIZE",
			payload: { text: res.text, url: tab.url },
		});

		if (!summaryResult) throw new Error("Failed to generate summary");
		
		outputDiv.innerText = summaryResult.summary;

		if (summaryResult.readingTime) {
			readingTimeEl.innerText = `⏱️ ${summaryResult.readingTime} min read`;
		}

		// Display insights
		if (summaryResult.insights) {
			insightsContainer.style.display = "block";
			insightsText.innerText = summaryResult.insights;
		}
		//display results
		if (summaryResult.keywords) {
			chrome.tabs.sendMessage(tab.id, {
				type: "HIGHLIGHT",
				keywords: summaryResult.keywords,
			});
		}
	} catch (error) {
		console.error("Popup error:", error);
		outputDiv.innerHTML = `<div class="error-box">⚠️ ${error.message}</div>`;
	} finally {
		summarizeBtn.disabled = false;
		summarizeBtn.innerText = "Summarize Page";
	}
};
