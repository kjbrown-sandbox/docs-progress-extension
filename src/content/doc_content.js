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
      // Try to fetch canonical text from background (Docs API) on explicit requests.
      const m = location.href.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (m) {
         const documentId = m[1];
         chrome.runtime.sendMessage({ type: "FETCH_DOC_BY_ID", documentId }, (resp) => {
            if (resp && resp.ok && typeof resp.text === "string") {
               const t = resp.text;
               const c = wordCount(t);
               lastCount = c;
               sendResponse({ count: c });
            } else {
               // fallback to DOM heuristic
               const c2 = wordCount(getDocText());
               lastCount = c2;
               sendResponse({ count: c2, error: resp && resp.error });
            }
         });
         return true; // will respond asynchronously
      }
      // No documentId found — return cached or DOM-derived value
      sendResponse({ count: lastCount === -1 ? wordCount(getDocText()) : lastCount });
   }
});

// Try to request canonical text from background (Docs API). If successful, use that to compute count and send update.
function requestCanonicalText() {
   const m = location.href.match(/\/d\/([a-zA-Z0-9-_]+)/);
   if (!m) return;
   const documentId = m[1];
   chrome.runtime.sendMessage({ type: "FETCH_DOC_BY_ID", documentId }, (resp) => {
      if (resp && resp.ok && typeof resp.text === "string") {
         const t = resp.text;
         const c = wordCount(t);
         if (c !== lastCount) {
            lastCount = c;
            chrome.runtime.sendMessage({ type: "DOC_WORD_COUNT", count: c });
         }
      }
   });
}

// request canonical text once on load
requestCanonicalText();

// Inject overlay UI (progress bar + connect button)
function createOverlay() {
   if (document.getElementById("docs-progress-overlay")) return;
   const overlay = document.createElement("div");
   overlay.id = "docs-progress-overlay";
   overlay.style.position = "absolute";
   overlay.style.top = "129px";
   overlay.style.left = "50%";
   overlay.style.transform = "translateX(-50%)";
   overlay.style.zIndex = 999999;
   overlay.style.pointerEvents = "auto";

   overlay.innerHTML = `
      <div id="dp-container" style="background: rgba(255,255,255,0.95); padding:8px 12px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15); display:flex; align-items:center; gap:12px;">
         <div style="min-width:200px">
            <div style="font-size:12px; color:#666">Today's progress</div>
            <div style="height:12px; background:#eee; border-radius:6px; overflow:hidden; margin-top:6px"><div id="dp-fill" style="height:100%; width:0%; background:linear-gradient(90deg,#1a73e8,#4caf50)"></div></div>
         </div>
         <div>
            <button id="dp-connect">Connect to Google</button>
            <button id="dp-signout" style="display:none; margin-left:6px">Sign out</button>
         </div>
      </div>
   `;
   document.body.appendChild(overlay);

   // wire buttons
   document.getElementById("dp-connect").addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "TRIGGER_AUTH" }, (r) => {
         // background will open interactive auth via getAuthToken when needed; we can then request canonical text
         requestCanonicalText();
         updateProfileUI();
      });
   });

   document.getElementById("dp-signout").addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "SIGN_OUT" }, (r) => {
         updateProfileUI();
      });
   });

   updateProfileUI();
}

function updateProgressUI(count) {
   const pct = Math.min(100, Math.round((count / 2000) * 100));
   const fill = document.getElementById("dp-fill");
   if (fill) fill.style.width = pct + "%";
   // update badge
   chrome.runtime.sendMessage({ type: "SET_BADGE", text: String(count) });
}

function updateProfileUI() {
   chrome.runtime.sendMessage({ type: "GET_PROFILE" }, (resp) => {
      const signedIn = resp && resp.ok && resp.profile && (resp.profile.email || resp.profile.id);
      const connectBtn = document.getElementById("dp-connect");
      const signoutBtn = document.getElementById("dp-signout");
      if (signedIn) {
         if (connectBtn) connectBtn.style.display = "none";
         if (signoutBtn) signoutBtn.style.display = "inline-block";
      } else {
         if (connectBtn) connectBtn.style.display = "inline-block";
         if (signoutBtn) signoutBtn.style.display = "none";
      }
   });
}

createOverlay();

// update overlay when counts arrive
chrome.runtime.onMessage.addListener((msg) => {
   if (msg && msg.type === "DOC_WORD_COUNT") {
      updateProgressUI(msg.count);
   }
});
