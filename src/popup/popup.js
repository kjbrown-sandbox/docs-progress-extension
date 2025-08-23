// Popup script: requests the latest word count from the active tab

const countEl = document.getElementById('wordCount');
const fillEl = document.getElementById('fill');
const refreshBtn = document.getElementById('refresh');

function setCount(n) {
  countEl.textContent = n;
  // For demo: assume daily goal 2000 words
  const pct = Math.min(100, Math.round((n / 2000) * 100));
  fillEl.style.width = pct + '%';
}

function requestCount() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) return;
    chrome.tabs.sendMessage(tabs[0].id, { type: 'REQUEST_WORD_COUNT' }, (resp) => {
      if (chrome.runtime.lastError) {
        // no content script
        countEl.textContent = '—';
        fillEl.style.width = '0%';
        return;
      }
      if (resp && typeof resp.count === 'number') setCount(resp.count);
    });
  });
}

refreshBtn.addEventListener('click', requestCount);

// Listen for live messages from content script
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg && msg.type === 'DOC_WORD_COUNT') {
    setCount(msg.count);
  }
});

// initial
requestCount();
