// Content script for Google Docs - computes a live word count and sends it to the extension popup via runtime messages.

function getDocText() {
   // Google Docs uses an editable iframe-like structure; try to select the main content.
   const editor = document.querySelector('[role="main"]');
   if (!editor) return "";
   // Extract visible text nodes
   const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null, false);
   let node;
   let text = "";
   while ((node = walker.nextNode())) {
      text += node.textContent + " ";
   }
   return text.replace(/\s+/g, " ").trim();
}

function wordCount(text) {
   if (!text) return 0;
   return text.split(/\s+/).filter(Boolean).length;
}

let lastCount = -1;

function check() {
   const text = getDocText();
   const count = wordCount(text);
   if (count !== lastCount) {
      lastCount = count;
      chrome.runtime.sendMessage({ type: "DOC_WORD_COUNT", count });
   }
}

// Observe mutations to update in near-real-time
const editorRoot = document.querySelector('[role="main"]');
if (editorRoot) {
   const obs = new MutationObserver(() => check());
   obs.observe(editorRoot, { childList: true, subtree: true, characterData: true });
}

// initial check
check();

// Respond to direct requests from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
   if (msg && msg.type === "REQUEST_WORD_COUNT") {
      sendResponse({ count: lastCount === -1 ? wordCount(getDocText()) : lastCount });
   }
});
