/**
 * Author Notes Viewer — Backend Module
 *
 * Listens for character-change events and chat-change events,
 * fetches the active character's creator_notes, and pushes
 * them to the frontend so the drawer tab can display them.
 *
 * Required permission: characters
 */

// ── Helpers ────────────────────────────────────────────────────────────────

async function pushNotesForCharacter(characterId: string | null) {
  if (!characterId) {
    spindle.sendToFrontend({ type: "author_notes_update", characterId: null, notes: null, name: null });
    return;
  }

  try {
    const char = await spindle.characters.get(characterId);
    if (!char) {
      spindle.sendToFrontend({ type: "author_notes_update", characterId, notes: null, name: null });
      return;
    }
    spindle.sendToFrontend({
      type: "author_notes_update",
      characterId: char.id,
      name: char.name,
      notes: char.creator_notes ?? null,
    });
  } catch (err: any) {
    spindle.log.warn(`[AuthorNotes] Failed to fetch character ${characterId}: ${err?.message}`);
    spindle.sendToFrontend({ type: "author_notes_update", characterId, notes: null, name: null });
  }
}

// ── Startup ────────────────────────────────────────────────────────────────

spindle.log.info("[AuthorNotes] Backend started.");

// Listen for requests from the frontend (e.g. tab activated, needs refresh)
spindle.onFrontendMessage(async (payload: any) => {
  if (payload?.type === "fetch_author_notes") {
    await pushNotesForCharacter(payload.characterId ?? null);
  }
});

// React to chat changes — a new chat may use a different character
spindle.on("CHAT_CHANGED", async (payload: any) => {
  // When the chat changes we don't get the character id directly;
  // the frontend will request a refresh via fetch_author_notes once
  // it resolves the active character from the DOM / URL.
  spindle.sendToFrontend({ type: "chat_changed", chatId: payload?.chatId ?? null });
});

// React to character edits (author notes may have changed)
spindle.on("CHARACTER_EDITED", async (payload: any) => {
  const id: string | undefined = payload?.id;
  if (id) {
    spindle.log.info(`[AuthorNotes] Character edited: ${id} — refreshing notes.`);
    await pushNotesForCharacter(id);
  }
});
