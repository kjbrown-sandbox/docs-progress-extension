// content script entry - reuses existing logic from doc_content.js

function getDocText() {
   const editor = document.querySelector('[role="main"]');
   if (!editor) return "";
   const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
   let node;
   let text = "";
   while ((node = walker.nextNode())) {
      text += node.textContent + " ";
   }
   return text.replace(/\s+/g, " ").trim();
}

function wordCount(text: string) {
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

const editorRoot = document.querySelector('[role="main"]');
if (editorRoot) {
   const obs = new MutationObserver(() => check());
   obs.observe(editorRoot, { childList: true, subtree: true, characterData: true });
}

check();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
   if (msg && msg.type === "REQUEST_WORD_COUNT") {
      sendResponse({ count: lastCount === -1 ? wordCount(getDocText()) : lastCount });
   }
});
