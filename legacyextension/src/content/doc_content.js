// // Content script for Google Docs - read Docs' own word-count widget and update an overlay progress bar every second.

// // default 2000 words
// function getGoal() {
//    const saved = localStorage.getItem("word_goal");
//    return saved ? parseInt(saved, 10) : 2000;
// }

// function setGoal(value) {
//    localStorage.setItem("word_goal", value);
// }

// function insert() {
//    if (document.getElementById("word-progress")) return;

//    const container = document.createElement("div");
//    container.id = "word-progress";
//    container.style.position = "absolute";
//    container.style.left = "50%";
//    container.style.transform = "translateX(-50%)";
//    container.style.top = "129px";
// Content script for Google Docs - read Docs' own word-count widget and update an overlay progress bar every second.

// default 2000 words
function getGoal() {
	const saved = localStorage.getItem("word_goal");
	return saved ? parseInt(saved, 10) : 2000;
}

function setGoal(value) {
	localStorage.setItem("word_goal", value);
}

function getWordCount() {
	const container = document.getElementById("kix-documentmetrics-widget-content");
	if (!container) return null;

	const numberSpan = container.querySelector(".kix-documentmetrics-widget-number");
	if (!numberSpan) return null;

	const raw = numberSpan.innerText.trim().replace(/[\u00A0,]/g, "");
	const count = parseInt(raw, 10);
	return isNaN(count) ? null : count;
}

function insert() {
	if (document.getElementById("word-progress")) return;

	const container = document.createElement("div");
	container.id = "word-progress";
	container.style.position = "absolute";
	container.style.left = "50%";
	container.style.transform = "translateX(-50%)";
	container.style.top = "129px";
	container.style.zIndex = 999999;
	// avoid blocking the docs UI; enable interactions only inside inner box
	container.style.pointerEvents = "none";

	container.innerHTML = `
		<div id="word-progress-inner" style="pointer-events:auto; background: rgba(255,255,255,0.98); padding:8px 12px; border-radius:10px; width:520px; max-width:90vw; box-shadow:0 6px 14px rgba(0,0,0,0.08);">
			<div id="label" title="Click to set word goal" style="display:flex; flex-direction:column; gap:6px;">
				<div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
					<div style="display:flex; align-items:center; gap:6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
					<span id="status">Word count: 0 / 2000</span></div>
					<div id="count-text" style="font-weight:600;color:#222">—</div>
				</div>
				<div style="font-size:12px; color:#666;">Progress: <span id="percent">0.00%</span></div>
			</div>
			<div id="bar" style="height:12px; background:#eee; border-radius:8px; overflow:hidden; margin-top:8px;"><div id="bar-fill" style="height:100%; width:0%; background:green; transition: width 300ms ease;"></div></div>
		</div>
	`;

	document.body.appendChild(container);

	// clicking the label sets the goal
	const lbl = document.getElementById("label");
	if (lbl) {
		lbl.addEventListener("click", () => {
			const current = getGoal();
			const input = prompt("Set your word goal:", current);
			if (input !== null) {
				const newGoal = parseInt(input, 10);
				if (!isNaN(newGoal) && newGoal > 0) {
					setGoal(newGoal);
					update();
				} else {
					alert("Please enter a valid number.");
				}
			}
		});
	}
}

function update() {
	const count = getWordCount();
	const goal = getGoal();
	const percentEl = document.getElementById("percent");
	const barFill = document.getElementById("bar-fill");
	const status = document.getElementById("status");
	const countText = document.getElementById("count-text");

	if (!percentEl || !barFill || !status) return; // UI not ready

	if (count === null) {
		percentEl.textContent = "0%";
		barFill.style.width = "0%";
		barFill.style.backgroundColor = "gray";
		status.textContent = 'Please enable "Tools -> Display word count while typing"';
		if (countText) countText.textContent = "—";
		return;
	}

	const percent = Math.min((count / goal) * 100, 100);
	percentEl.textContent = percent.toFixed(2) + "%";
	barFill.style.width = percent + "%";

	if (percent < 40) {
		barFill.style.backgroundColor = "red";
	} else if (percent < 70) {
		barFill.style.backgroundColor = "orange";
	} else {
		barFill.style.backgroundColor = "green";
	}

	status.textContent = `Word count: ${count} / ${goal}`;
	if (countText) countText.textContent = String(count);

	// Broadcast the count so side panel and others can receive it while open
	if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
		try {
			chrome.runtime.sendMessage({ type: 'DOC_WORD_COUNT', count });
		} catch (e) {
			// ignore
		}
	}
}

// Reply to explicit requests for the current word count (used by the side panel when it opens)
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
	chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
		if (msg && msg.type === 'REQUEST_WORD_COUNT') {
			const count = getWordCount();
			sendResponse({ count });
		}
	});
}

// initialize
insert();
update();
// update every second
setInterval(update, 1000);
