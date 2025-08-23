# Docs Progress Extension

A Chrome extension to surface live writing metrics and progress bars inside Google Docs.

What this scaffold contains:

- `manifest.json` - extension manifest (MV3)
- `src/content/doc_content.js` - initial content script that reads Google Docs content and computes word count
- `src/background.js` - background service worker
- `src/popup/` - popup UI files
- `icons/` - placeholder SVG icon

How to use

1. Open chrome://extensions
2. Enable Developer Mode
3. Install dependencies: `npm install`
4. Build: `npm run build`
5. Load unpacked and point to the `dist/` folder created by the build
6. Open a Google Doc and click the extension icon to see the popup

Notes

This is an initial scaffold. The content script uses DOM heuristics for Google Docs and will be refined.
