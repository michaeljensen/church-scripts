# Agent Instructions

Unofficial scripts for leaders and clerks of The Church of Jesus Christ of Latter-day Saints, mostly bookmarklets that run on Leader and Clerk Resources (LCR, `lcr.churchofjesuschrist.org`). [README.md](README.md) covers purpose, installation, and the safe-use rules every script must follow.

## Naming

Follow the Church's style guide in all prose, UI text, and alert messages:

- First reference: **The Church of Jesus Christ of Latter-day Saints**. After that: **the Church** or **the Church of Jesus Christ**.
- Don't use "LDS", "LDS Church", or "Mormon Church". Members are **Latter-day Saints** or **members of the Church**.
- Name Church tools as the Church does: Leader and Clerk Resources (LCR), Member Tools.

## Layout

- Scripts are grouped by the tool they run on: `lcr/` holds the LCR scripts.
- Each script is a `<name>.js` file with a `<name>.md` beside it covering use, messages, how it works, and the page details it depends on. Use [lcr/show-pics.md](lcr/show-pics.md) as the model.
- Add every new script to the table in [README.md](README.md#scripts).
- Put scratch work in `.tmp/` (gitignored).

## Member data

Never commit real member data: names, photos, member IDs, report exports, screenshots, or HAR files. Fixtures and doc examples must be invented. Review every diff for this before committing.

## Bookmarklets

A bookmarklet `.js` file is the exact text pasted into a bookmark's address field: readable, multi-line source that starts with `javascript:` and wraps the code in an IIFE.

Browsers delete the line breaks when it is pasted, and decode `%` escapes before running it, so the code must mean the same once the lines are joined:

- Use `/* */` comments only. A `//` comment would swallow the rest of the script.
- End every statement with a semicolon. Never rely on automatic semicolon insertion.
- Indent every line after the first, so no two words run together when the lines are joined.
- Never type `%`, even in comments. Use `PCT` (`'\x25'`) in strings instead.
- Never split a string literal across lines.

Behavior:

- Detect the wrong page and say so with `alert()`, then stop. Guard against a second run with a marker element ID (e.g. `#lcr-tile-view`). Undo is a page refresh.
- Insert page data with `textContent`, never `innerHTML`.
- Prefer stable hooks (`data-*` attributes, ARIA) over framework internals. Where internals are unavoidable (`show-pics.js` reads React fiber props), keep the stable hook as the first choice and the internals as a fallback.
- Use GET requests to Church origins only, with `credentials: 'include'` when an endpoint needs the user's session.

### Editing

1. Edit the `.js` file directly.
2. For quick tests, paste the whole file into the browser DevTools console on the target page. `javascript:` parses as a statement label, so it runs as-is. Chrome asks you to type `allow pasting` the first time. Refresh between runs.
3. Before committing, reinstall the bookmark from the file and click it. Only this tests the line-joining rules above.
4. Bump the version in the script's header comment, its `.md`, and the [README.md](README.md#scripts) table, and add a changelog line: minor for fixes and small changes, major for changes users must relearn. Update the rest of the `.md` if behavior, messages, or page dependencies changed.
