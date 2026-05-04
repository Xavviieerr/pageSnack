function extractText() {
	const selectors = [
		"article",
		"main",
		'[role="main"]',
		".post-content",
		"#content",
	];
	let contentArea = null;

	for (const selector of selectors) {
		const found = document.querySelector(selector);
		if (found) {
			contentArea = found;
			break;
		}
	}

	const root = contentArea || document.body;
	const clone = root.cloneNode(true);

	const noiseSelectors = [
		"nav",
		"header",
		"footer",
		"aside",
		"script",
		"style",
		"noscript",
		".sidebar",
		".ad",
		".ads",
		".menu",
		".social-share",
		".comments",
	];

	noiseSelectors.forEach((selector) => {
		clone.querySelectorAll(selector).forEach((el) => el.remove());
	});

	return clone.innerText
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0)
		.join("\n");
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
