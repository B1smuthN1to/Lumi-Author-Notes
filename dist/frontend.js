// Author Notes — frontend.js (compiled from src/frontend.ts)
// Injects a "Creator Notes" accordion into the character profile sidebar tab,
// positioned between Description and Personality, matching their visual style.

export function setup(ctx) {
  // ─── Constants ────────────────────────────────────────────────────────────
  const PANEL_ID = 'spindle-author-notes-panel';

  // ─── State ────────────────────────────────────────────────────────────────
  let currentCharacterId = null;
  let currentNotes = '';
  let isOpen = false;
  let observer = null;
  let pendingInjectTimer = null;

  // ─── Styles ───────────────────────────────────────────────────────────────
  const removeStyle = ctx.dom.addStyle(`
    #${PANEL_ID} {
      display: flex;
      flex-direction: column;
      width: 100%;
      box-sizing: border-box;
    }
    .an-accordion-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      cursor: pointer;
      user-select: none;
      background: transparent;
      border: none;
      width: 100%;
      text-align: left;
      color: var(--lumiverse-text);
      border-radius: var(--lumiverse-radius);
      transition: background var(--lumiverse-transition-fast, 0.15s ease);
      outline: none;
    }
    .an-accordion-header:hover {
      background: var(--lumiverse-fill-subtle);
    }
    .an-icon {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      color: var(--lumiverse-text-muted);
      opacity: 0.75;
    }
    .an-title {
      flex: 1;
      font-size: 13px;
      font-weight: 600;
      color: var(--lumiverse-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .an-chevron {
      flex-shrink: 0;
      width: 14px;
      height: 14px;
      color: var(--lumiverse-text-dim);
      transition: transform var(--lumiverse-transition-fast, 0.15s ease);
    }
    .an-chevron.open {
      transform: rotate(180deg);
    }
    .an-body {
      overflow: hidden;
      max-height: 0;
      transition: max-height 0.22s ease, opacity 0.18s ease;
      opacity: 0;
      pointer-events: none;
    }
    .an-body.open {
      max-height: 2000px;
      opacity: 1;
      pointer-events: auto;
    }
    .an-content {
      padding: 4px 14px 14px 14px;
      font-size: 13px;
      line-height: 1.6;
      color: var(--lumiverse-text);
      word-break: break-word;
    }
    .an-content p { margin: 0 0 8px 0; }
    .an-content p:last-child { margin-bottom: 0; }
    .an-content a { color: var(--lumiverse-accent); text-decoration: underline; }
    .an-content strong, .an-content b { font-weight: 600; }
    .an-content em, .an-content i { font-style: italic; }
    .an-content ul, .an-content ol { padding-left: 20px; margin: 6px 0; }
    .an-content li { margin-bottom: 4px; }
    .an-content hr { border: none; border-top: 1px solid var(--lumiverse-border); margin: 10px 0; }
    .an-content h1, .an-content h2, .an-content h3 {
      font-weight: 600;
      margin: 10px 0 4px 0;
      color: var(--lumiverse-text);
    }
    .an-content h1 { font-size: 15px; }
    .an-content h2 { font-size: 14px; }
    .an-content h3 { font-size: 13px; }
    .an-content code {
      font-family: monospace;
      font-size: 12px;
      background: var(--lumiverse-fill-subtle);
      padding: 1px 5px;
      border-radius: 3px;
      border: 1px solid var(--lumiverse-border);
    }
    .an-content blockquote {
      border-left: 3px solid var(--lumiverse-accent);
      margin: 6px 0;
      padding: 4px 10px;
      color: var(--lumiverse-text-muted);
      font-style: italic;
    }
    .an-empty {
      color: var(--lumiverse-text-dim);
      font-style: italic;
      font-size: 12.5px;
    }
  `);

  // ─── Build panel ──────────────────────────────────────────────────────────
  function buildPanel(notes) {
    const isEmpty = !notes || notes.trim() === '';
    const bodyContent = isEmpty
      ? `<span class="an-empty">No creator notes available for this character.</span>`
      : notes;

    const openClass = isOpen ? ' open' : '';

    return `<div id="${PANEL_ID}">
      <button class="an-accordion-header" aria-expanded="${isOpen}" aria-controls="an-body-inner">
        <svg class="an-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <span class="an-title">Creator Notes</span>
        <svg class="an-chevron${openClass}" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
             stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div class="an-body${openClass}" id="an-body-inner" role="region">
        <div class="an-content">${bodyContent}</div>
      </div>
    </div>`;
  }

  function attachToggle() {
    const header = document.querySelector(`#${PANEL_ID} .an-accordion-header`);
    const body = document.querySelector(`#${PANEL_ID} .an-body`);
    const chevron = document.querySelector(`#${PANEL_ID} .an-chevron`);
    if (!header || !body) return;
    header.addEventListener('click', () => {
      isOpen = !isOpen;
      body.classList.toggle('open', isOpen);
      chevron && chevron.classList.toggle('open', isOpen);
      header.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // ─── Find insertion anchor ─────────────────────────────────────────────────
  // We try to land between the Description accordion and Personality accordion.
  // Multiple selector strategies ordered by specificity.
  function findInsertionAnchor() {
    // 1. Spindle data-field attributes
    const descField = document.querySelector('[data-field="description"]');
    if (descField) {
      return { parent: descField.parentElement, after: descField };
    }

    // 2. Walk accordion sections looking for "Description" followed by "Personality"
    // Look for any element that contains ONLY "Description" as its label text
    const candidates = Array.from(
      document.querySelectorAll([
        '[class*="accordion"] [class*="header"]',
        '[class*="accordion"] [class*="label"]',
        '[class*="section"] [class*="title"]',
        '[class*="profile"] [class*="header"]',
        '[class*="sidebar"] button',
        '[class*="char"] [class*="section"]',
        'details > summary',
      ].join(', '))
    );

    for (const el of candidates) {
      const text = el.textContent?.trim() ?? '';
      if (/^description$/i.test(text)) {
        // The section container is typically 1-2 levels up
        let section = el.parentElement;
        for (let i = 0; i < 4 && section; i++) {
          const next = section.nextElementSibling;
          if (next) {
            const nextText = (next.textContent ?? '').toLowerCase();
            if (nextText.includes('personality') && section.parentElement) {
              return { parent: section.parentElement, after: section };
            }
          }
          section = section.parentElement;
        }
        // Fallback: use immediate parent
        if (el.parentElement?.parentElement) {
          const sectionEl = el.parentElement;
          return { parent: sectionEl.parentElement, after: sectionEl };
        }
      }
    }

    // 3. data-spindle-mount profile area
    const mounts = [
      '[data-spindle-mount="character_profile"]',
      '[data-spindle-mount="sidebar_profile"]',
      '[data-spindle-mount="profile_tab"]',
      '[data-spindle-mount="profile"]',
    ];
    for (const sel of mounts) {
      const mount = document.querySelector(sel);
      if (!mount) continue;
      const children = Array.from(mount.children);
      for (let i = 0; i < children.length; i++) {
        const t = (children[i].textContent ?? '').toLowerCase();
        if (t.includes('description') && i + 1 < children.length) {
          return { parent: mount, after: children[i] };
        }
      }
    }

    return null;
  }

  // ─── Inject ────────────────────────────────────────────────────────────────
  function removePanel() {
    const el = document.getElementById(PANEL_ID);
    if (el) {
      // Remove including wrapper
      const wrapper = el.parentElement;
      el.remove();
      if (wrapper && wrapper.dataset.anMount === '1') wrapper.remove();
    }
  }

  function injectPanel(notes) {
    removePanel();
    const anchor = findInsertionAnchor();
    if (!anchor) return; // profile tab not visible yet

    const { parent, after } = anchor;

    // Create a mount wrapper
    const wrapper = document.createElement('div');
    wrapper.dataset.anMount = '1';
    wrapper.style.cssText = 'display:contents;width:100%';

    if (after.nextSibling) {
      parent.insertBefore(wrapper, after.nextSibling);
    } else {
      parent.appendChild(wrapper);
    }

    // Inject sanitized HTML via ctx.dom.inject
    const tempId = 'an-mount-' + Math.random().toString(36).slice(2);
    wrapper.id = tempId;
    ctx.dom.inject('#' + tempId, buildPanel(notes), 'beforeend');
    wrapper.id = ''; // clear temp id after inject

    attachToggle();
  }

  function updateContent(notes) {
    const existing = document.getElementById(PANEL_ID);
    if (!existing) {
      injectPanel(notes);
      return;
    }
    const contentEl = existing.querySelector('.an-content');
    if (!contentEl) return;

    const isEmpty = !notes || notes.trim() === '';
    const html = isEmpty
      ? `<span class="an-empty">No creator notes available for this character.</span>`
      : notes;

    // Sanitize via a temp DOM inject
    const tempId = 'an-content-tmp-' + Math.random().toString(36).slice(2);
    const tmp = document.createElement('div');
    tmp.id = tempId;
    tmp.style.display = 'none';
    document.body.appendChild(tmp);
    ctx.dom.inject('#' + tempId, html, 'beforeend');
    contentEl.innerHTML = tmp.innerHTML;
    tmp.remove();
  }

  // ─── Detect active character ───────────────────────────────────────────────
  function detectCharacterId() {
    // data attributes (most reliable if Lumiverse sets them)
    for (const attr of ['data-character-id', 'data-char-id', 'data-spindle-character-id']) {
      const el = document.querySelector(`[${attr}]`);
      if (el) {
        const id = el.getAttribute(attr);
        if (id) return id;
      }
    }
    // URL path
    const m = window.location.pathname.match(/\/characters?\/([a-zA-Z0-9_-]+)/);
    if (m?.[1]) return m[1];
    return null;
  }

  function isProfileVisible() {
    return !!(
      document.querySelector('[data-field="description"]') ||
      document.querySelector('[data-spindle-mount="character_profile"]') ||
      document.querySelector('[data-spindle-mount="sidebar_profile"]') ||
      findInsertionAnchor()
    );
  }

  // ─── Try inject logic ──────────────────────────────────────────────────────
  function tryInject() {
    if (!isProfileVisible()) return;
    if (document.getElementById(PANEL_ID)) return; // already present

    const charId = detectCharacterId();
    if (charId) {
      if (charId !== currentCharacterId) {
        currentCharacterId = charId;
        ctx.sendToBackend({ type: 'author_notes_request', characterId: charId });
      } else {
        // Already have notes, just inject
        injectPanel(currentNotes);
      }
    } else {
      // No character id detectable, inject empty panel
      injectPanel(currentNotes);
    }
  }

  // ─── MutationObserver ──────────────────────────────────────────────────────
  let mutationDebounce = null;
  observer = new MutationObserver(() => {
    if (mutationDebounce) return;
    mutationDebounce = requestAnimationFrame(() => {
      mutationDebounce = null;
      if (!document.getElementById(PANEL_ID)) {
        tryInject();
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // ─── Backend messages ──────────────────────────────────────────────────────
  const unsubBackend = ctx.onBackendMessage((payload) => {
    if (payload.type === 'author_notes_data') {
      currentCharacterId = payload.characterId;
      currentNotes = payload.creatorNotes ?? '';

      if (document.getElementById(PANEL_ID)) {
        updateContent(currentNotes);
      } else {
        injectPanel(currentNotes);
      }
    }

    if (payload.type === 'author_notes_chat_changed') {
      setTimeout(() => {
        const charId = detectCharacterId();
        if (charId && charId !== currentCharacterId) {
          currentCharacterId = charId;
          ctx.sendToBackend({ type: 'author_notes_chat_changed', characterId: charId });
        } else if (charId) {
          tryInject();
        }
      }, 350);
    }
  });

  // ─── Frontend events ───────────────────────────────────────────────────────
  const unsubChat = ctx.events.on('CHAT_CHANGED', () => {
    setTimeout(() => {
      const charId = detectCharacterId();
      if (charId && charId !== currentCharacterId) {
        currentCharacterId = charId;
        ctx.sendToBackend({ type: 'author_notes_request', characterId: charId });
      }
    }, 400);
  });

  const unsubChar = ctx.events.on('CHARACTER_EDITED', (payload) => {
    const id = payload?.id ?? payload?.character?.id;
    if (id && id === currentCharacterId) {
      ctx.sendToBackend({ type: 'author_notes_request', characterId: id });
    }
  });

  // ─── Initial ───────────────────────────────────────────────────────────────
  setTimeout(() => tryInject(), 600);

  // ─── Cleanup ───────────────────────────────────────────────────────────────
  return () => {
    unsubBackend();
    unsubChat();
    unsubChar();
    observer && observer.disconnect();
    if (pendingInjectTimer) clearTimeout(pendingInjectTimer);
    removePanel();
    removeStyle();
    ctx.dom.cleanup();
  };
}
