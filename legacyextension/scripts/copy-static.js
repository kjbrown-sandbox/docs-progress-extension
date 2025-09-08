// const fs = require("fs");
// const path = require("path");

// const files = ["manifest.json", "icons"];
// const out = path.resolve(__dirname, "..", "dist");

// files.forEach((f) => {
//    const src = path.resolve(__dirname, "..", f);
//    const dest = path.resolve(out, f);
//    if (!fs.existsSync(src)) return;
//    const stat = fs.statSync(src);
//    if (stat.isDirectory()) {
//       // copy directory
//       fs.mkdirSync(dest, { recursive: true });
//       fs.readdirSync(src).forEach((child) => {
//          fs.copyFileSync(path.resolve(src, child), path.resolve(dest, child));
//       });
//    } else {
//       fs.copyFileSync(src, dest);
//    }
// });

// // copy popup html (index.html -> popup.html)
// const srcHtml = path.resolve(__dirname, "..", "index.html");
// const destHtml = path.resolve(out, "popup.html");
// if (fs.existsSync(srcHtml)) fs.copyFileSync(srcHtml, destHtml);

// console.log("copied static files to dist/");
