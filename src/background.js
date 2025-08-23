// Background service worker - currently minimal
self.addEventListener("install", (e) => {
   self.skipWaiting();
});

self.addEventListener("activate", (e) => {
   // ready
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
   if (msg && msg.type === "GET_WORD_COUNT") {
      // This background simply proxies to the active tab if needed.
      sendResponse({ ok: true });
   }
});
