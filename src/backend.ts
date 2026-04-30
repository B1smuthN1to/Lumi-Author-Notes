declare const spindle: import('lumiverse-spindle-types').SpindleAPI

// ─── State ───────────────────────────────────────────────────────────────────
let currentCharacterId: string | null = null

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function sendCharacterNotes(characterId: string): Promise<void> {
  try {
    const character = await spindle.characters.get(characterId)
    if (!character) {
      spindle.sendToFrontend({
        type: 'author_notes_data',
        characterId,
        characterName: '',
        creatorNotes: '',
        found: false,
      })
      return
    }

    spindle.sendToFrontend({
      type: 'author_notes_data',
      characterId: character.id,
      characterName: character.name,
      creatorNotes: character.creator_notes ?? '',
      found: true,
    })
  } catch (err: any) {
    spindle.log.warn(`[author_notes] Failed to fetch character ${characterId}: ${err?.message}`)
    spindle.sendToFrontend({
      type: 'author_notes_data',
      characterId,
      characterName: '',
      creatorNotes: '',
      found: false,
    })
  }
}

// ─── Frontend messages ───────────────────────────────────────────────────────

spindle.onFrontendMessage(async (payload: any) => {
  if (payload.type === 'author_notes_request') {
    const id: string = payload.characterId
    if (id) {
      currentCharacterId = id
      await sendCharacterNotes(id)
    }
  }

  if (payload.type === 'author_notes_chat_changed') {
    if (payload.characterId) {
      currentCharacterId = payload.characterId
      await sendCharacterNotes(payload.characterId)
    }
  }
})

// ─── Backend events ──────────────────────────────────────────────────────────

spindle.on('CHAT_CHANGED', (_payload: any) => {
  spindle.sendToFrontend({ type: 'author_notes_chat_changed' })
})

spindle.on('CHARACTER_EDITED', async (payload: any) => {
  const id: string = payload?.id ?? payload?.character?.id
  if (id && id === currentCharacterId) {
    await sendCharacterNotes(id)
  }
})

spindle.log.info('[author_notes] Backend loaded.')
