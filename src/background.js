// Background service worker: obtain per-user OAuth tokens and fetch Docs API
self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => {
   // ready
});

function getAuthToken(interactive = true) {
   return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive }, (token) => {
         if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
         resolve(token);
      });
   });
}

async function fetchDocById(documentId) {
   const token = await getAuthToken(true);
   const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
      headers: { Authorization: `Bearer ${token}` },
   });
   if (!res.ok) {
      // If unauthorized, clear cached token and throw
      if (res.status === 401) {
         chrome.identity.removeCachedAuthToken({ token }, () => {});
      }
      const txt = await res.text();
      throw new Error(`Docs API ${res.status}: ${txt}`);
   }
   return res.json();
}

function extractTextFromDoc(doc) {
   const parts = [];
   (doc.body?.content || []).forEach((el) => {
      if (el.paragraph?.elements) {
         el.paragraph.elements.forEach((pe) => {
            const tr = pe.textRun;
            if (tr && tr.content) parts.push(tr.content);
         });
      }
   });
   return parts.join("").replace(/\s+/g, " ").trim();
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
   if (msg && msg.type === "FETCH_DOC_BY_ID") {
      fetchDocById(msg.documentId)
         .then((doc) => {
            const text = extractTextFromDoc(doc);
            sendResponse({ ok: true, text });
         })
         .catch((err) => sendResponse({ ok: false, error: err.message || String(err) }));
      return true; // keep channel open for async response
   }
});
