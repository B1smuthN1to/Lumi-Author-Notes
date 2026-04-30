// src/frontend.ts
var ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14.5 2.5a2.121 2.121 0 0 1 3 3L6 17l-4 1 1-4 11.5-11.5z"/>
</svg>`;
var PANEL_STYLES = `
  <style>
    .an-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      box-sizing: border-box;
      font-family: inherit;
    }

    /* \u2500\u2500 Empty / loading states \u2500\u2500 */
    .an-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      flex: 1;
      padding: 24px;
      text-align: center;
      color: var(--lumiverse-text-dim, #888);
    }
    .an-empty svg {
      opacity: 0.35;
    }
    .an-empty p {
      margin: 0;
      font-size: 13px;
      line-height: 1.5;
    }

    /* \u2500\u2500 Character header bar \u2500\u2500 */
    .an-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px 8px;
      border-bottom: 1px solid var(--lumiverse-border, rgba(255,255,255,0.1));
      flex-shrink: 0;
    }
    .an-header-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--lumiverse-fill-subtle, rgba(255,255,255,0.07));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
      overflow: hidden;
    }
    .an-header-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
    .an-header-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--lumiverse-text, #fff);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }
    .an-refresh-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--lumiverse-text-dim, #888);
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s, background 0.15s;
      flex-shrink: 0;
    }
    .an-refresh-btn:hover {
      color: var(--lumiverse-text, #fff);
      background: var(--lumiverse-fill-subtle, rgba(255,255,255,0.07));
    }
    .an-refresh-btn.spinning svg {
      animation: an-spin 0.7s linear infinite;
    }
    @keyframes an-spin {
      to { transform: rotate(360deg); }
    }

    /* \u2500\u2500 Notes content area \u2500\u2500 */
    .an-content {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      scrollbar-width: thin;
      scrollbar-color: var(--lumiverse-border, rgba(255,255,255,0.15)) transparent;
    }
    .an-content::-webkit-scrollbar { width: 5px; }
    .an-content::-webkit-scrollbar-track { background: transparent; }
    .an-content::-webkit-scrollbar-thumb {
      background: var(--lumiverse-border, rgba(255,255,255,0.15));
      border-radius: 3px;
    }

    /* \u2500\u2500 Rendered notes typography \u2014 these apply inside .an-notes-body \u2500\u2500 */
    .an-notes-body {
      font-size: 13px;
      line-height: 1.65;
      color: var(--lumiverse-text, #e8e8e8);
      word-break: break-word;
    }
    .an-notes-body h1,
    .an-notes-body h2,
    .an-notes-body h3,
    .an-notes-body h4,
    .an-notes-body h5,
    .an-notes-body h6 {
      margin: 1em 0 0.4em;
      line-height: 1.3;
      color: var(--lumiverse-text, #fff);
      font-weight: 700;
    }
    .an-notes-body h1 { font-size: 18px; }
    .an-notes-body h2 { font-size: 16px; }
    .an-notes-body h3 { font-size: 14px; }
    .an-notes-body h4,
    .an-notes-body h5,
    .an-notes-body h6 { font-size: 13px; }
    .an-notes-body p { margin: 0 0 0.75em; }
    .an-notes-body ul,
    .an-notes-body ol {
      padding-left: 20px;
      margin: 0 0 0.75em;
    }
    .an-notes-body li { margin-bottom: 0.25em; }
    .an-notes-body a {
      color: var(--lumiverse-accent, #7c9fff);
      text-decoration: none;
    }
    .an-notes-body a:hover { text-decoration: underline; }
    .an-notes-body strong, .an-notes-body b { font-weight: 700; }
    .an-notes-body em, .an-notes-body i { font-style: italic; }
    .an-notes-body code {
      font-family: monospace;
      font-size: 12px;
      background: var(--lumiverse-fill-subtle, rgba(255,255,255,0.08));
      border: 1px solid var(--lumiverse-border, rgba(255,255,255,0.12));
      border-radius: 3px;
      padding: 1px 5px;
    }
    .an-notes-body pre {
      background: var(--lumiverse-fill-subtle, rgba(0,0,0,0.25));
      border: 1px solid var(--lumiverse-border, rgba(255,255,255,0.1));
      border-radius: 6px;
      padding: 10px 12px;
      overflow-x: auto;
      margin: 0 0 0.75em;
    }
    .an-notes-body pre code {
      background: none;
      border: none;
      padding: 0;
      font-size: 12px;
    }
    .an-notes-body blockquote {
      border-left: 3px solid var(--lumiverse-accent, #7c9fff);
      margin: 0 0 0.75em;
      padding: 6px 12px;
      color: var(--lumiverse-text-dim, #aaa);
      background: var(--lumiverse-fill-subtle, rgba(255,255,255,0.04));
      border-radius: 0 4px 4px 0;
    }
    .an-notes-body hr {
      border: none;
      border-top: 1px solid var(--lumiverse-border, rgba(255,255,255,0.12));
      margin: 12px 0;
    }
    .an-notes-body table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 0.75em;
      font-size: 12px;
    }
    .an-notes-body th,
    .an-notes-body td {
      border: 1px solid var(--lumiverse-border, rgba(255,255,255,0.12));
      padding: 5px 8px;
      text-align: left;
    }
    .an-notes-body th {
      background: var(--lumiverse-fill-subtle, rgba(255,255,255,0.07));
      font-weight: 600;
    }

    /* \u2500\u2500 Plain-text fallback \u2500\u2500 */
    .an-notes-plain {
      white-space: pre-wrap;
      font-size: 13px;
      line-height: 1.65;
      color: var(--lumiverse-text, #e8e8e8);
      word-break: break-word;
    }

    /* \u2500\u2500 No-notes notice \u2500\u2500 */
    .an-no-notes {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px 16px;
      text-align: center;
      color: var(--lumiverse-text-dim, #888);
    }
    .an-no-notes svg { opacity: 0.3; }
    .an-no-notes p { margin: 0; font-size: 13px; line-height: 1.5; }
  </style>
`;
function looksLikeHtml(text) {
  return /<[a-zA-Z][\s\S]*?>/.test(text);
}
function plainToHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/^######\s+(.+)$/gm, "<h6>$1</h6>").replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>").replace(/^####\s+(.+)$/gm, "<h4>$1</h4>").replace(/^###\s+(.+)$/gm, "<h3>$1</h3>").replace(/^##\s+(.+)$/gm, "<h2>$1</h2>").replace(/^#\s+(.+)$/gm, "<h1>$1</h1>").replace(/^---+$/gm, "<hr>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/`(.+?)`/g, "<code>$1</code>").replace(/\n/g, "<br>");
}
function init(ctx) {
  const tab = ctx.ui.registerDrawerTab({
    id: "author-notes",
    title: "Author Notes",
    shortName: "Auth No",
    description: "View the current character's author notes",
    keywords: ["author", "notes", "creator", "character", "info"],
    headerTitle: "Author Notes",
    iconSvg: ICON_SVG
  });
  tab.root.innerHTML = PANEL_STYLES + `
    <div class="an-panel" id="an-panel">
      <div class="an-empty" id="an-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4">
          <path d="M14.5 2.5a2.121 2.121 0 0 1 3 3L6 17l-4 1 1-4 11.5-11.5z"/>
        </svg>
        <p>Open a character chat<br>to view their author notes here.</p>
      </div>

      <div id="an-char-section" style="display:none; flex-direction:column; height:100%;">
        <div class="an-header">
          <div class="an-header-avatar" id="an-avatar">\u{1F4DD}</div>
          <span class="an-header-name" id="an-char-name">\u2014</span>
          <button class="an-refresh-btn" id="an-refresh-btn" title="Refresh">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 4v6h6"/>
              <path d="M19 16v-6h-6"/>
              <path d="M17.51 9A8 8 0 0 0 3.22 6.22M2.49 11A8 8 0 0 0 16.78 13.78"/>
            </svg>
          </button>
        </div>
        <div class="an-content" id="an-content">
          <!-- notes rendered here -->
        </div>
      </div>
    </div>
  `;
  const emptyEl = tab.root.querySelector("#an-empty");
  const charSection = tab.root.querySelector("#an-char-section");
  const charNameEl = tab.root.querySelector("#an-char-name");
  const contentEl = tab.root.querySelector("#an-content");
  const refreshBtn = tab.root.querySelector("#an-refresh-btn");
  let currentCharId = null;
  let isLoading = false;
  function showEmpty() {
    emptyEl.style.display = "flex";
    charSection.style.display = "none";
  }
  function showCharacter(name, notes) {
    emptyEl.style.display = "none";
    charSection.style.display = "flex";
    charNameEl.textContent = name || "Unknown Character";
    contentEl.innerHTML = "";
    if (!notes || notes.trim() === "") {
      contentEl.innerHTML = `
        <div class="an-no-notes">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4">
            <path d="M14.5 2.5a2.121 2.121 0 0 1 3 3L6 17l-4 1 1-4 11.5-11.5z"/>
          </svg>
          <p>No author notes for <strong>${escapeHtml(name)}</strong>.</p>
        </div>`;
      return;
    }
    if (looksLikeHtml(notes)) {
      const wrapper = document.createElement("div");
      wrapper.className = "an-notes-body";
      wrapper.innerHTML = notes;
      contentEl.appendChild(wrapper);
    } else {
      const wrapper = document.createElement("div");
      wrapper.className = "an-notes-body";
      wrapper.innerHTML = plainToHtml(notes);
      contentEl.appendChild(wrapper);
    }
  }
  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function setRefreshSpinning(on) {
    if (on) {
      refreshBtn.classList.add("spinning");
    } else {
      refreshBtn.classList.remove("spinning");
    }
  }
  function resolveCharacterIdFromDom() {
    const el = document.querySelector("[data-character-id]");
    if (el) return el.dataset.characterId ?? null;
    const meta = document.querySelector("meta[name='lumiverse-character-id']");
    if (meta) return meta.content || null;
    return null;
  }
  function requestRefresh(charId) {
    if (isLoading) return;
    isLoading = true;
    setRefreshSpinning(true);
    const id = charId !== void 0 ? charId : currentCharId ?? resolveCharacterIdFromDom();
    ctx.sendToBackend({ type: "fetch_author_notes", characterId: id });
    setTimeout(() => {
      isLoading = false;
      setRefreshSpinning(false);
    }, 8e3);
  }
  refreshBtn.addEventListener("click", () => {
    requestRefresh();
  });
  ctx.onBackendMessage((payload) => {
    if (payload?.type === "author_notes_update") {
      isLoading = false;
      setRefreshSpinning(false);
      const { characterId, name, notes } = payload;
      if (!characterId && !name) {
        showEmpty();
        currentCharId = null;
      } else {
        currentCharId = characterId;
        showCharacter(name ?? "Unknown Character", notes);
        tab.setBadge(notes && notes.trim() ? "\u2713" : null);
      }
    }
    if (payload?.type === "chat_changed") {
      const domId = resolveCharacterIdFromDom();
      requestRefresh(domId);
    }
  });
  ctx.events.on("CHAT_CHANGED", (_payload) => {
    setTimeout(() => {
      const domId = resolveCharacterIdFromDom();
      requestRefresh(domId);
    }, 300);
  });
  ctx.events.on("CHARACTER_EDITED", (payload) => {
    if (payload?.id && payload.id === currentCharId) {
      requestRefresh(currentCharId);
    }
  });
  tab.onActivate(() => {
    const domId = resolveCharacterIdFromDom();
    if (domId || currentCharId) {
      requestRefresh(domId ?? currentCharId);
    }
  });
  const initialId = resolveCharacterIdFromDom();
  if (initialId) {
    requestRefresh(initialId);
  }
}
export {
  init as default
};
