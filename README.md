# Docs Progress Extension

A Chrome extension to surface live writing metrics and progress bars inside Google Docs.

What this scaffold contains:

-  `manifest.json` - extension manifest (MV3)
-  `src/content/doc_content.js` - initial content script that reads Google Docs content and computes word count
-  `src/background.js` - background service worker
-  `src/popup/` - popup UI files
-  `icons/` - placeholder SVG icon

How to use

1. Open chrome://extensions
2. Enable Developer Mode
3. Install dependencies: `npm install`
4. Build: `npm run build`
5. Load unpacked and point to the `dist/` folder created by the build
6. Open a Google Doc and click the extension icon to see the popup

Notes

This is an initial scaffold. The content script uses DOM heuristics for Google Docs and will be refined.

ChatGPT slop:
📊 Features of a Writing “Fitbit”

1. Core Metrics (the “steps, heart rate, calories” of writing)

Word Count: Daily, weekly, monthly totals; streaks.

Time Spent Writing: Focused writing minutes vs. distracted time.

Session Consistency: Like sleep cycles—track start times, duration, frequency.

Editing vs. Drafting Ratio: How much time spent creating new content vs. polishing.

2. Writing Quality Indicators (your “VO2 max”)

Readability Score: Flesch-Kincaid or similar.

Sentence Variety: Short vs. long, balance of structures.

Vocabulary Diversity: Type-token ratio, repeated word highlights.

Pacing & Flow: Measures of sentence rhythm, paragraph density.

Clarity Metrics: Flags overuse of adverbs, clichés, passive voice.

3. Wellness & Habit Tracking

Streaks & Milestones: Consecutive writing days, first 10k words, etc.

Mood Log: Quick check-in on how writing felt (energizing, draining, neutral).

Focus Score: How much of your “writing time” was active vs. idle.

4. Gamification

Achievements/Badges: “First Draft 5K,” “Editing Marathon,” “Late-Night Novelist.”

Leaderboards / Writing Circles: Friendly comparison with peers (like Fitbit friends).

Challenges: e.g., “Write 500 words daily for a week.”

5. Health-Style Dashboards

“Writing Fitness Report”: Weekly summary with stats (“You wrote 8,236 words this week, 2x more than last week!”).

Trend Insights: “You’re most productive at 8 AM,” or “Your editing load spikes before deadlines.”

Goal Tracking: “Reach 80,000 words by Nov 30” with progress bar.

6. Integration

Background Tracking: Connects to Google Docs, Scrivener, Word, Obsidian, etc.

Distraction Detection: Monitors app-switching or long pauses.

Export Data: For nerds who want to chart everything in Notion/Excel.

🎯 Marketing Strategy

Think of it like Fitbit’s original pitch: not just tracking, but self-improvement through awareness.

Positioning

For Writers: “Turn writing from a struggle into a daily habit—track, measure, and grow.”

For Professionals: “Optimize your productivity, clarity, and communication.”

For Students/Academics: “Hit deadlines, maintain writing health, and reduce stress.”

Taglines / Pitches

“Track your words like you track your steps.”

“Make your writing habit visible.”

“Your writing health, measured.”

“Stay consistent. Stay creative. Stay accountable.”

Target Audiences

Novelists & NaNoWriMo crowd → word count goals & streaks.

Academics / grad students → research papers, dissertations.

Bloggers / content creators → consistency & editing vs drafting ratios.

Corporate / knowledge workers → productivity & clarity metrics.

Channels

Partnerships: NaNoWriMo, Substack, Medium, Scrivener, Obsidian communities.

Communities: Writing subreddits, Discord writing servers, productivity forums.

Gamified Campaigns: Public “writing challenges” with leaderboards (like a global writing step count).

Freemium Model: Free core tracking, premium for deeper analytics & AI insights.

🚀 Possible Killer Feature (the “10k steps” equivalent)

A “Daily Writing Fitness Score” (0–100) that compresses all metrics into one simple number.
It motivates users the way Fitbit motivates with daily steps.

Example:

85/100 = Great day! 1,200 words, 90 minutes focus, diverse vocabulary.

45/100 = You wrote a bit, but lots of idle time and repetitive wording.

People will chase that score the way they chase steps.
