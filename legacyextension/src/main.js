function getWordCount() {
   const container = document.getElementById("kix-documentmetrics-widget-content");
   console.log("container", container);
   if (!container) return null;
   container["aria-hidden"] = "false";

   const numberSpan = container.querySelector(".kix-documentmetrics-widget-number");
   console.log("numberSpan", numberSpan);
   if (!numberSpan) return null;

   // strip non-digits (commas, NBSP) then parse
   const raw = numberSpan.innerText.trim().replace(/[\u00A0,]/g, "");
   const count = parseInt(raw, 10);
   console.log("count", count);
   return isNaN(count) ? null : count;
}

function update() {
   const count = getWordCount();
   console.log("Current word count:", count);
   if (count === null) return;

   chrome.runtime.sendMessage({ type: "DOC_WORD_COUNT", count });
   // const fillEl = document.getElementById("fill");
   // if (fillEl) {
   //    const pct = Math.min(100, Math.round((count / 2000) * 100));
   //    fillEl.style.width = pct + "%";
   // }
}

setInterval(update, 1000);

// Reply to explicit requests for the current word count (used by the side panel when it opens)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
   if (msg && msg.type === "REQUEST_WORD_COUNT") {
      const count = getWordCount();
      // send a simple object back; receiver will check for numeric count
      sendResponse({ count });
   }
});
