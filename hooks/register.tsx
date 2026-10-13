import { atom, read, update } from 'claude-code'
import type { Engine, Register } from 'claude-code'

const MODEL = 'haiku'

const SYSTEM = `You rewrite a draft prompt that a person typed for an AI coding assistant, so the assistant understands it on the first read.

Rules:
- Keep the person's intent, voice (first person) and scope. Do not add requirements, assumptions or steps they did not imply.
- Fix typos and grammar. Say what is vague plainly; where the draft names a goal, outcome or constraint, make it explicit.
- Keep file paths, code, identifiers, URLs, commands and quoted text exactly as written.
- Stay about as long as the draft. Use a short list only when the draft already lists things.
- Do not answer the prompt or explain your changes.
- Reply with the rewritten prompt only: no preamble, no quotes, no code fence around it.`

const isBusy = atom({ plugin: 'prompt-enhancer', key: 'isBusy' } as const, false)
const original = atom({ plugin: 'prompt-enhancer', key: 'original' } as const, null)

const enhance = async ($: Engine) => {
  if (await read($, isBusy)) {
    return
  }

  const draft = (await $.prompt.read()).text

  if (draft.trim() === '') {
    $.ui.toast('Type a prompt first, then press Enhance.')

    return
  }

  await update($, isBusy, () => true)

  try {
    const r = await $.model.complete({
      model: MODEL,
      system: SYSTEM,
      prompt: `<draft>\n${draft}\n</draft>`,
      maxTokens: 2048,
    })

    if (!r.isAnswered) {
      $.ui.toast(`Enhance failed: ${r.reason}`)

      return
    }

    const text = r.text.trim()

    if (text === '') {
      $.ui.toast('Enhance returned nothing; your draft is unchanged.')

      return
    }

    if ((await $.prompt.read()).text !== draft) {
      $.ui.toast('You edited the prompt while it was enhancing; not applied.')

      return
    }

    const { isFilled } = await $.prompt.fill({ text })

    if (isFilled) {
      await update($, original, () => draft)
    } else {
      $.ui.toast('Could not write to the prompt box right now.')
    }
  } finally {
    await update($, isBusy, () => false)
  }
}

const undo = async ($: Engine) => {
  const before = await read($, original)

  if (before === null) {
    return
  }

  await $.prompt.fill({ text: before })
  await update($, original, () => null)
}

export const register: Register = on => {
  on('prompt.submit', async ($, e, next) => {
    await update($, original, () => null).catch(() => {})

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) {
      return next(e)
    }

    const { Box, Button, Text } = $.ui.resolve(e)
    const busy = await read($, isBusy)
    const before = await read($, original)

    return (
      <Box>
        <Button
          key="enhance"
          variant="primary"
          label={busy ? '✨ Enhancing…' : '✨ Enhance prompt'}
          onPress={() => enhance($)}
        />
        {before === null ? (
          <Text dimColor> </Text>
        ) : (
          <Button key="undo" label="Undo" onPress={() => undo($)} />
        )}
      </Box>
    )
  })
}
