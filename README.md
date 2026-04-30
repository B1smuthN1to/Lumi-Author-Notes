# Author Notes — Lumiverse Extension

Adds a **Creator Notes** dropdown panel to the character profile sidebar tab in Lumiverse, positioned between the Description and Personality sections.

## Features

- 📝 Shows the selected character's `creator_notes` field in a collapsible accordion
- 🎨 Matches the visual style of Description and Personality (same icon, same header style)
- 🔄 Auto-updates when you switch chats or edit a character
- ✅ Supports HTML and CSS formatting inside creator notes (sanitized via DOMPurify)
- 💡 Shows a friendly "No creator notes available" message when the field is empty

## Installation

Install directly from the Lumiverse Extensions panel using this repository URL, or via:

```
POST /api/v1/spindle/install
{ "github": "https://github.com/author/author-notes" }
```

## Permissions

| Permission | Reason |
|---|---|
| `characters` | Required to fetch `creator_notes` from the character record |

## How It Works

**Backend (`dist/backend.js`)**
- Listens for `CHAT_CHANGED` and `CHARACTER_EDITED` events
- Fetches the current character using `spindle.characters.get(id)`
- Sends `creator_notes` to the frontend via `spindle.sendToFrontend()`

**Frontend (`dist/frontend.js`)**
- Uses a `MutationObserver` to detect when the profile tab is rendered
- Injects an accordion panel between the Description and Personality sections
- Renders creator notes with full HTML/CSS formatting enabled (sanitized by Lumiverse's DOMPurify)
- Responds to `CHAT_CHANGED` and `CHARACTER_EDITED` frontend events to refresh content

## Building from Source

Requires [Bun](https://bun.sh/):

```bash
bun install
bun run build
```

## Creator Notes Formatting

Creator notes support standard HTML formatting:

```html
<b>Usage Tips</b>
<p>This character works best in fantasy settings.</p>
<ul>
  <li>Avoid triggering topic X</li>
  <li>Use scenario Y for best results</li>
</ul>
<blockquote>Originally inspired by...</blockquote>
```

Plain text is also displayed correctly.
