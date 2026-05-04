async function handleSummary(text, url) {
	try {
		// Check cache first
		const cached = await chrome.storage.local.get(url);
		if (cached[url]) {
			console.log("Returning cached summary for", url);
			return cached[url];
		}

		const response = await fetch(
			"https://pagesnack-backend.vercel.app/summarize",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-pagesnack-key": "super-secret-key-123",
				},
				body: JSON.stringify({ text }),
			},
		);

		if (!response.ok) {
			throw new Error(`Backend error: ${response.status}`);
		}

		const data = await response.json();

		// Calculates reading time
		const wordCount = text.split(/\s+/).length;
		const readingTime = Math.max(1, Math.ceil(wordCount / 200));

		const result = {
			summary: data.summary,
			keywords: data.keywords,
			insights: data.insights || "No specific insights found.",
			readingTime: data.readingTime || readingTime,
			timestamp: Date.now(),
		};

		// Save to cache
		await chrome.storage.local.set({ [url]: result });

		return result;
	} catch (error) {
		console.error("handleSummary error:", error);
		return {
			summary: "Failed to generate summary. Please try again.",
			keywords: [],
			insights: "Check your connection and try again.",
			readingTime: 0,
		};
	}
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (msg.type === "SUMMARIZE") {
		handleSummary(msg.payload.text, msg.payload.url).then(sendResponse);
		return true;
	}
});
