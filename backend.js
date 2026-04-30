// Author Notes — backend.js (compiled from src/backend.ts)
// Permission required: characters

let currentCharacterId = null;

async function sendCharacterNotes(characterId) {
  try {
    const character = await spindle.characters.get(characterId);
    if (!character) {
      spindle.sendToFrontend({
        type: 'author_notes_data',
        characterId,
        characterName: '',
        creatorNotes: '',
        found: false,
      });
      return;
    }
    spindle.sendToFrontend({
      type: 'author_notes_data',
      characterId: character.id,
      characterName: character.name,
      creatorNotes: character.creator_notes ?? '',
      found: true,
    });
  } catch (err) {
    spindle.log.warn(`[author_notes] Failed to fetch character ${characterId}: ${err?.message}`);
    spindle.sendToFrontend({
      type: 'author_notes_data',
      characterId,
      characterName: '',
      creatorNotes: '',
      found: false,
    });
  }
}

spindle.onFrontendMessage(async (payload) => {
  if (payload.type === 'author_notes_request') {
    const id = payload.characterId;
    if (id) {
      currentCharacterId = id;
      await sendCharacterNotes(id);
    }
  }

  if (payload.type === 'author_notes_chat_changed') {
    if (payload.characterId) {
      currentCharacterId = payload.characterId;
      await sendCharacterNotes(payload.characterId);
    }
  }
});

spindle.on('CHAT_CHANGED', (_payload) => {
  spindle.sendToFrontend({ type: 'author_notes_chat_changed' });
});

spindle.on('CHARACTER_EDITED', async (payload) => {
  const id = payload?.id ?? payload?.character?.id;
  if (id && id === currentCharacterId) {
    await sendCharacterNotes(id);
  }
});

spindle.log.info('[author_notes] Backend loaded.');
