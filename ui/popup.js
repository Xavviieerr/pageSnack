const summarizeBtn = document.getElementById("summarize");
const clearBtn = document.getElementById("clear");
const outputDiv = document.getElementById("output");

const placeholderHTML = `<p class="placeholder">Click summarize to get insights from this page.</p>`;

clearBtn.onclick = () => {
	outputDiv.innerHTML = placeholderHTML;
};

summarizeBtn.onclick = async () => {
	try {
		summarizeBtn.disabled = true;
		summarizeBtn.innerText = "Summarizing...";
		outputDiv.innerText = "";

		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});

		if (!tab) throw new Error("No active tab found");

		// Get content from the page
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

		// Get summary from background
		const summaryResult = await chrome.runtime.sendMessage({
			type: "SUMMARIZE",
			payload: { text: res.text },
		});

		if (!summaryResult) throw new Error("Failed to generate summary");

		console.log("Summary result", summaryResult);
		outputDiv.innerText = summaryResult.summary;

		if (summaryResult.keywords) {
			chrome.tabs.sendMessage(tab.id, {
				type: "HIGHLIGHT",
				keywords: summaryResult.keywords,
			});
		}
	} catch (error) {
		console.error("Popup error:", error);
		outputDiv.innerHTML = `<span style="color: #ff4d4d; font-size: 13px;">${error.message}</span>`;
	} finally {
		summarizeBtn.disabled = false;
		summarizeBtn.innerText = "Summarize Page";
	}
};
