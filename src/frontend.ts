import type { SpindleFrontendContext } from 'lumiverse-spindle-types'

export function setup(ctx: SpindleFrontendContext) {

  // ─── Constants ──────────────────────────────────────────────────────────────
  const PANEL_ID = 'spindle-author-notes-panel'
  const STYLE_ID = 'spindle-author-notes-styles'

  // ─── State ───────────────────────────────────────────────────────────────────
  let currentCharacterId: string | null = null
  let currentNotes: string = ''
  let isOpen = false
  let observer: MutationObserver | null = null

  // ─── Styles ──────────────────────────────────────────────────────────────────
  const removeStyle = ctx.dom.addStyle(`
    /* ── Author Notes accordion panel ── */
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
    }

    .an-body.open {
      max-height: 2000px;
      opacity: 1;
    }

    .an-content {
      padding: 4px 14px 14px 14px;
      font-size: 13px;
      line-height: 1.6;
      color: var(--lumiverse-text);
      word-break: break-word;
    }

    /* Allow basic HTML formatting inside creator notes */
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
  `)

  // ─── SVGs ────────────────────────────────────────────────────────────────────
  // Description icon (document/lines) — same as used by Description section
  const descriptionIconSvg = `
    <svg class="an-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>`

  const chevronSvg = `
    <svg class="an-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
         stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <polyline points="6 9 12 15 18 9"/>
    </svg>`

  // ─── Build panel HTML ────────────────────────────────────────────────────────
  function buildPanelHTML(notes: string): string {
    const isEmpty = !notes || notes.trim() === ''
    const bodyContent = isEmpty
      ? `<span class="an-empty">No creator notes available for this character.</span>`
      : notes   // raw — DOMPurify will sanitize on inject

    return `
      <div id="${PANEL_ID}">
        <button class="an-accordion-header" aria-expanded="${isOpen}" aria-controls="an-body-inner">
          ${descriptionIconSvg}
          <span class="an-title">Creator Notes</span>
          <svg class="an-chevron${isOpen ? ' open' : ''}" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
               stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div class="an-body${isOpen ? ' open' : ''}" id="an-body-inner" role="region">
          <div class="an-content">${bodyContent}</div>
        </div>
      </div>
    `
  }

  // ─── Toggle open/close ────────────────────────────────────────────────────────
  function attachToggle(): void {
    const header = document.querySelector(`#${PANEL_ID} .an-accordion-header`) as HTMLButtonElement | null
    const body = document.querySelector(`#${PANEL_ID} .an-body`) as HTMLElement | null
    const chevron = document.querySelector(`#${PANEL_ID} .an-chevron`) as HTMLElement | null

    if (!header || !body) return

    header.addEventListener('click', () => {
      isOpen = !isOpen
      body.classList.toggle('open', isOpen)
      chevron?.classList.toggle('open', isOpen)
      header.setAttribute('aria-expanded', String(isOpen))
    })
  }

  // ─── Find insertion point ─────────────────────────────────────────────────────
  //
  // The profile tab renders accordion items for Description, Personality, etc.
  // We look for the element containing "Description" text and insert our panel
  // directly after it (before Personality). We try several selector strategies
  // to be robust against minor DOM changes.
  //
  function findInsertionPoint(): { parent: Element; after: Element } | null {
    // Strategy 1: data-field attributes (ideal)
    const descByAttr = document.querySelector('[data-field="description"]')
    if (descByAttr?.parentElement) {
      return { parent: descByAttr.parentElement, after: descByAttr }
    }

    // Strategy 2: Look for accordion headers whose text contains "Description"
    // Lumiverse uses uppercase section labels
    const allHeaders = Array.from(document.querySelectorAll('button, [role="button"], .section-header, h3, h4, label'))
    for (const el of allHeaders) {
      const text = el.textContent?.trim().toLowerCase() ?? ''
      if (text === 'description' || text.startsWith('description')) {
        // Walk up to find the containing section wrapper
        let section: Element | null = el
        for (let i = 0; i < 5; i++) {
          if (!section?.parentElement) break
          section = section.parentElement
          // If the parent contains a sibling that says "personality", this is the right level
          const sibling = section.nextElementSibling
          if (sibling) {
            const sibText = sibling.textContent?.toLowerCase() ?? ''
            if (sibText.includes('personality')) {
              return { parent: section.parentElement!, after: section }
            }
          }
        }
        // Fallback: use the immediate parent of the header element
        if (el.parentElement) {
          return { parent: el.parentElement, after: el }
        }
      }
    }

    // Strategy 3: Use data-spindle-mount attribute for sidebar profile area
    const profileMount = document.querySelector('[data-spindle-mount="character_profile"]')
      ?? document.querySelector('[data-spindle-mount="sidebar_profile"]')
      ?? document.querySelector('[data-spindle-mount="profile"]')
    if (profileMount) {
      const children = Array.from(profileMount.children)
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        const text = child.textContent?.toLowerCase() ?? ''
        if (text.includes('description') && i + 1 < children.length) {
          return { parent: profileMount, after: child }
        }
      }
    }

    return null
  }

  // ─── Inject / update panel ───────────────────────────────────────────────────
  function removeExistingPanel(): void {
    const existing = document.getElementById(PANEL_ID)
    if (existing) existing.remove()
  }

  function injectPanel(notes: string): void {
    removeExistingPanel()

    const insertion = findInsertionPoint()
    if (!insertion) {
      // Could not find the profile tab DOM — silently do nothing
      return
    }

    const { parent, after } = insertion
    const wrapper = document.createElement('div')
    // We inject via innerHTML on a temp element so DOMPurify (via ctx.dom.inject) sanitizes.
    // However ctx.dom.inject requires a selector string. We'll use a temp id trick:
    const tempId = 'an-temp-mount-' + Date.now()
    wrapper.id = tempId
    // Insert wrapper after the "Description" section
    if (after.nextSibling) {
      parent.insertBefore(wrapper, after.nextSibling)
    } else {
      parent.appendChild(wrapper)
    }

    // Use ctx.dom.inject to sanitize and inject the HTML into our wrapper
    ctx.dom.inject(`#${tempId}`, buildPanelHTML(notes), 'beforeend')

    // Remove the wrapper div (the panel itself is now in the DOM)
    // Actually keep it — it acts as the mount host. Just give it a clean id.
    wrapper.id = ''
    wrapper.style.cssText = 'display:contents'

    attachToggle()
  }

  function updatePanelContent(notes: string): void {
    const existing = document.getElementById(PANEL_ID)
    if (!existing) {
      injectPanel(notes)
      return
    }

    // Update only the content area
    const contentEl = existing.querySelector('.an-content')
    if (contentEl) {
      const isEmpty = !notes || notes.trim() === ''
      // Use a temp wrapper to get sanitized HTML
      const tempWrapper = document.createElement('div')
      tempWrapper.id = 'an-temp-content-' + Date.now()
      tempWrapper.style.display = 'none'
      document.body.appendChild(tempWrapper)
      const innerHTML = isEmpty
        ? `<span class="an-empty">No creator notes available for this character.</span>`
        : notes
      ctx.dom.inject(`#${tempWrapper.id}`, innerHTML, 'beforeend')
      contentEl.innerHTML = tempWrapper.innerHTML
      tempWrapper.remove()
    }
  }

  // ─── Detect active character from the DOM ─────────────────────────────────────
  //
  // Lumiverse renders character ID as data attributes or in the URL. We look for
  // the most reliable signal available.
  //
  function detectActiveCharacterId(): string | null {
    // data-character-id on a parent element of the profile area
    const withId = document.querySelector('[data-character-id]') as HTMLElement | null
    if (withId?.dataset?.characterId) return withId.dataset.characterId

    // data-char-id
    const withCharId = document.querySelector('[data-char-id]') as HTMLElement | null
    if (withCharId?.dataset?.charId) return withCharId.dataset.charId

    // href/URL based — some SPAs encode characterId in the URL path
    const match = window.location.pathname.match(/\/character(?:s)?\/([a-zA-Z0-9_-]+)/)
    if (match?.[1]) return match[1]

    // data-spindle-character-id (spindle standard)
    const spindleEl = document.querySelector('[data-spindle-character-id]') as HTMLElement | null
    if (spindleEl?.dataset?.spindleCharacterId) return spindleEl.dataset.spindleCharacterId

    return null
  }

  // ─── Profile tab presence check ───────────────────────────────────────────────
  function isProfileTabActive(): boolean {
    // Look for known profile panel markers
    return !!(
      document.querySelector('[data-spindle-mount="character_profile"]') ??
      document.querySelector('[data-spindle-mount="sidebar_profile"]') ??
      document.querySelector('[data-field="description"]') ??
      // Fallback: check if our insertion point exists
      findInsertionPoint()
    )
  }

  // ─── Main injection logic ─────────────────────────────────────────────────────
  function tryInject(): void {
    if (!isProfileTabActive()) return
    if (document.getElementById(PANEL_ID)) return // already injected

    const charId = detectActiveCharacterId()
    if (charId && charId !== currentCharacterId) {
      currentCharacterId = charId
      ctx.sendToBackend({ type: 'author_notes_request', characterId: charId })
    } else if (charId && currentNotes !== undefined) {
      injectPanel(currentNotes)
    }
  }

  // ─── MutationObserver — watch for profile tab mounting ───────────────────────
  observer = new MutationObserver((_mutations) => {
    // Debounce slightly so we don't fire on every micro-mutation
    requestAnimationFrame(() => {
      // If panel was removed (e.g. tab switch), try re-inject
      if (!document.getElementById(PANEL_ID)) {
        tryInject()
      }
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // ─── Frontend events ──────────────────────────────────────────────────────────
  // Listen for chat changes from backend (backend pushes this on CHAT_CHANGED)
  const unsubBackend = ctx.onBackendMessage((payload: any) => {
    if (payload.type === 'author_notes_data') {
      currentCharacterId = payload.characterId
      currentNotes = payload.creatorNotes ?? ''

      const panel = document.getElementById(PANEL_ID)
      if (panel) {
        updatePanelContent(currentNotes)
      } else {
        injectPanel(currentNotes)
      }
    }

    if (payload.type === 'author_notes_chat_changed') {
      // Re-detect character after a brief delay (DOM updates after chat switch)
      setTimeout(() => {
        const charId = detectActiveCharacterId()
        if (charId) {
          if (charId !== currentCharacterId) {
            currentCharacterId = charId
            ctx.sendToBackend({
              type: 'author_notes_chat_changed',
              characterId: charId,
            })
          } else {
            tryInject()
          }
        }
      }, 300)
    }
  })

  // Also listen to frontend chat changed events
  const unsubChatChanged = ctx.events.on('CHAT_CHANGED', (_payload: any) => {
    setTimeout(() => {
      const charId = detectActiveCharacterId()
      if (charId && charId !== currentCharacterId) {
        currentCharacterId = charId
        ctx.sendToBackend({ type: 'author_notes_request', characterId: charId })
      }
    }, 400)
  })

  // Character edited in frontend
  const unsubCharEdited = ctx.events.on('CHARACTER_EDITED', (payload: any) => {
    const id = payload?.id ?? payload?.character?.id
    if (id && id === currentCharacterId) {
      ctx.sendToBackend({ type: 'author_notes_request', characterId: id })
    }
  })

  // Initial injection attempt
  setTimeout(() => tryInject(), 500)

  // ─── Cleanup ──────────────────────────────────────────────────────────────────
  return () => {
    unsubBackend()
    unsubChatChanged()
    unsubCharEdited()
    observer?.disconnect()
    removeExistingPanel()
    removeStyle()
    ctx.dom.cleanup()
  }
}
