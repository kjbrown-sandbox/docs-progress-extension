/**
 * Minimal Apps Script server code for a Docs Editor Add-on.
 */

function onOpen() {
  DocumentApp.getUi()
    .createMenu('Docs Progress')
    .addItem('Show word counter', 'showSidebar')
    .addToUi();
}

function onInstall(e) {
  onOpen(e);
}

function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('sidebar')
    .setTitle('Docs Progress');
  DocumentApp.getUi().showSidebar(html);
}

/**
 * Returns a simple word count for the current active document.
 * Called from the sidebar via google.script.run.
 */
function getDocumentWordCount() {
  const doc = DocumentApp.getActiveDocument();
  if (!doc) return { words: 0 };

  const body = doc.getBody();
  if (!body) return { words: 0 };

  const text = body.getText() || '';
  const words = text.trim().length === 0 ? 0 : text.trim().split(/\s+/).filter(Boolean).length;
  return { words };
}
