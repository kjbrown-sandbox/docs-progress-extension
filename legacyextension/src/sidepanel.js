// Side panel elements
const fillEl = document.getElementById("fill");
const goalEl = document.getElementById("goal");
chrome.runtime.onMessage.addListener((msg, sender) => {
   console.log();
   if (msg && msg.type === "DOC_WORD_COUNT" && typeof msg.count === "number") {
      console.log("sidepanel received DOC_WORD_COUNT", msg.count);
      if (fillEl) {
         const pct = Math.min(100, Math.round((msg.count / 2000) * 100));
         fillEl.style.width = pct + "%";
      }

      if (goalEl) {
         goalEl.textContent = `${msg.count}/2000 words`;
      }
   }
});

// On panel load, poll the active tab for the current count so we don't miss broadcasts
document.addEventListener("DOMContentLoaded", () => {
   try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
         if (!tabs || tabs.length === 0) return;
         const tabId = tabs[0].id;
         if (typeof tabId !== "number") return;
         chrome.tabs.sendMessage(tabId, { type: "REQUEST_WORD_COUNT" }, (resp) => {
            // resp may be undefined if the content script isn't injected on this page
            if (chrome.runtime.lastError) {
               console.log("sidepanel: request_word_count error", chrome.runtime.lastError.message);
               return;
            }
            if (resp && typeof resp.count === "number") {
               applyCount(resp.count);
            }
         });
      });
   } catch (err) {
      console.log("sidepanel poll error", err);
   }
});
