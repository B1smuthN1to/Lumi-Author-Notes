"use strict";

// src/backend.ts
async function pushNotesForCharacter(characterId) {
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
      notes: char.creator_notes ?? null
    });
  } catch (err) {
    spindle.log.warn(`[AuthorNotes] Failed to fetch character ${characterId}: ${err?.message}`);
    spindle.sendToFrontend({ type: "author_notes_update", characterId, notes: null, name: null });
  }
}
spindle.log.info("[AuthorNotes] Backend started.");
spindle.onFrontendMessage(async (payload) => {
  if (payload?.type === "fetch_author_notes") {
    await pushNotesForCharacter(payload.characterId ?? null);
  }
});
spindle.on("CHAT_CHANGED", async (payload) => {
  spindle.sendToFrontend({ type: "chat_changed", chatId: payload?.chatId ?? null });
});
spindle.on("CHARACTER_EDITED", async (payload) => {
  const id = payload?.id;
  if (id) {
    spindle.log.info(`[AuthorNotes] Character edited: ${id} \u2014 refreshing notes.`);
    await pushNotesForCharacter(id);
  }
});
