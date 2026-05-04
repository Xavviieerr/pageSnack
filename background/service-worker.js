async function handleSummary(text) {
	// Hardcoded dummy data for testing
	const data = {
		summary: "This is a test summary.",
		keywords: ["thinking", "meet"],
	};
	console.log("handleSummary: text", text);
	return data;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (msg.type === "SUMMARIZE") {
		handleSummary(msg.payload.text).then(sendResponse);
		return true;
	}
});
