// Runs inside the webpage

function extractText() {
	return document.body.innerText;
}

function highlightSpecificWords(keywords) {
	if (!keywords || keywords.length === 0) return;

	const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	const nodes = [];

	let node;
	while ((node = walker.nextNode())) {
		nodes.push(node);
	}

	const regexStr = keywords
		.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
		.join("|");
	const regex = new RegExp(`(${regexStr})`, "gi");

	nodes.forEach((textNode) => {
		const text = textNode.nodeValue;
		if (regex.test(text)) {
			const wrapper = document.createElement("span");
			wrapper.innerHTML = text.replace(
				regex,
				'<mark style="background: #ffd700; border-radius: 2px; padding: 0 2px;">$1</mark>',
			);
			textNode.parentNode.replaceChild(wrapper, textNode);
		}
	});
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (msg.type === "EXTRACT_PAGE") {
		const text = extractText();
		sendResponse({ text });
	}

	if (msg.type === "HIGHLIGHT") {
		highlightSpecificWords(msg.keywords);
	}
});
