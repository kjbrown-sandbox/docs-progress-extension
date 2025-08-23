// Background service worker entry (TS). Keep logic minimal.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'GET_WORD_COUNT') {
    sendResponse({ ok: true })
  }
})
