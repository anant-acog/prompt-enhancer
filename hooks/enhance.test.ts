import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'prompt-enhancer',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 10 },
    view: {},
  },
} as const

const USAGE = {
  input_tokens: 1,
  output_tokens: 1,
  cache_read_input_tokens: 0,
  cache_creation_input_tokens: 0,
}

for (const surface of ['terminal', 'desktop'] as const) {
  test(`enhance fills the box and undo restores it (${surface})`, async ($, on) => {
    let box = 'fix teh login bug its broken'
    let sent = ''

    on('prompt.read', () => ({ value: { text: box, cursor: box.length } }))
    on('prompt.fill', (_$, e) => {
      box = e.text

      return { isFilled: true }
    })
    on('model.complete', (_$, e) => {
      sent = e.prompt

      return { value: { isAnswered: true, text: ' Fix the login bug: sign-in fails. ', usage: USAGE } }
    })

    const ui = await $.ui.mount({ ...BAND, surface })

    await ui.press({ key: 'enhance' })
    expect(sent).toContain('fix teh login bug its broken')
    expect(box).toBe('Fix the login bug: sign-in fails.')

    await ui.press({ key: 'undo' })
    expect(box).toBe('fix teh login bug its broken')
  })

  test(`an empty draft calls no model (${surface})`, async ($, on) => {
    let calls = 0

    on('prompt.read', () => ({ value: { text: '  ', cursor: 0 } }))
    on('model.complete', () => {
      calls += 1

      return { value: { isAnswered: true, text: 'x', usage: USAGE } }
    })

    const ui = await $.ui.mount({ ...BAND, surface })

    await ui.press({ key: 'enhance' })
    expect(calls).toBe(0)
  })
}
