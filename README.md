# prompt-enhancer

A Claude Code mod that adds an **✨ Enhance prompt** button above the prompt box.
Type a rough draft, press the button, and the draft is rewritten into a clearer
prompt in place. Press **Undo** to get your original text back.

## Install

In a Claude Code terminal session:

```
/plugin install prompt-enhancer --marketplace anant-acog/prompt-enhancer
```

Answer `y` to add the marketplace, then pick a scope (user scope keeps it for
every session). The mod is active immediately.

The `/plugin install` command is a terminal command. It is not available in the
desktop app's Code tab, but a mod installed from a terminal at the user scope
also loads in the desktop app's local sessions.

## Use

1. Type a draft in the prompt box.
2. Press **✨ Enhance prompt**. The box is replaced with the rewritten prompt.
3. Edit it, send it, or press **Undo** to restore your draft.

- An empty draft shows a toast and makes no model call.
- If you edit the box while it is enhancing, the result is discarded so it
  cannot overwrite your typing.
- The button draws on the terminal and desktop surfaces only.

## What it does and costs

Each press makes one extra model call through your session's own client and
credentials, using the `haiku` model, capped at 2048 output tokens. Your draft
is sent to that model; nothing is sent anywhere else.

The rewrite keeps your intent and voice, fixes typos and vague wording, and
leaves file paths, code, identifiers and URLs as written.

## Customize

Edit the two constants at the top of `hooks/register.tsx`:

- `MODEL`: the model alias (for example `sonnet` for better rewrites).
- `SYSTEM`: the rewrite rules.

## Develop

```
claude plugin validate .
claude plugin test .
claude --plugin-dir .
```

## License

MIT
