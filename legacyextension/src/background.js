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
   // UI-driven auth helpers
   if (msg && msg.type === "GET_PROFILE") {
      chrome.identity
         .getProfileUserInfo()
         .then((info) => sendResponse({ ok: true, profile: info }))
         .catch((e) => sendResponse({ ok: false, error: String(e) }));
      return true;
   }
   if (msg && msg.type === "SIGN_OUT") {
      // remove cached token and respond
      chrome.identity.getAuthToken({ interactive: false }, (tkn) => {
         if (tkn) {
            chrome.identity.removeCachedAuthToken({ token: tkn }, () => {
               sendResponse({ ok: true });
            });
         } else sendResponse({ ok: true });
      });
      return true;
   }
   if (msg && msg.type === "SET_BADGE") {
      const text = String(msg.text || "");
      chrome.action.setBadgeBackgroundColor({ color: "#1a73e8" });
      chrome.action.setBadgeText({ text: text });
      sendResponse({ ok: true });
   }
   if (msg && msg.type === "TRIGGER_AUTH") {
      // trigger interactive auth to prompt consent
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
         if (chrome.runtime.lastError)
            sendResponse({ ok: false, error: chrome.runtime.lastError.message });
         else sendResponse({ ok: true, token });
      });
      return true;
   }
});

const GOOGLE_ORIGIN = "https://docs.google.com";

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
   .setPanelBehavior({ openPanelOnActionClick: true })
   .catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
   if (!tab.url) return;
   const url = new URL(tab.url);
   // Enables the side panel on google.com
   if (url.origin === GOOGLE_ORIGIN) {
      await chrome.sidePanel.setOptions({
         tabId,
         path: "src/sidepanel.html",
         enabled: true,
      });
   } else {
      // Disables the side panel on all other sites
      await chrome.sidePanel.setOptions({
         tabId,
         enabled: false,
      });
   }
});
