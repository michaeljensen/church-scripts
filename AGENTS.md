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

A bookmarklet `.js` file is the exact text pasted into a bookmark's address field:

- One line, starting with `javascript:`, wrapping the code in an IIFE.
- A literal `%` starts a URL escape. Write it as `%25`, or build it at runtime (`show-pics.js` uses `var P='%'`).
- Detect the wrong page and say so with `alert()`, then stop. Guard against a second run with a marker element ID (e.g. `#lcr-tile-view`). Undo is a page refresh.
- Insert page data with `textContent`, never `innerHTML`.
- Prefer stable hooks (`data-*` attributes, ARIA) over framework internals. Where internals are unavoidable (`show-pics.js` reads React fiber props), keep the stable hook as the first choice and the internals as a fallback.
- Use GET requests to Church origins only, with `credentials: 'include'` when an endpoint needs the user's session.

### Editing

1. Decode to a readable copy:

   ```sh
   python3 -I -c 'import sys, urllib.parse; print(urllib.parse.unquote(open(sys.argv[1]).read().strip()))' lcr/show-pics.js \
     | sed '1s/^javascript://' > .tmp/show-pics.js
   ```

2. The decoded copy is one long line; run it through a formatter if that helps. Edit it, then test by pasting it into the browser DevTools console on the target page.
3. Encode it back into the bookmarklet file. Newlines and `//` comments survive because they are percent-encoded:

   ```sh
   python3 -I -c 'import sys, urllib.parse; print("javascript:" + urllib.parse.quote(open(sys.argv[1]).read().strip(), safe="(){}[];,=+!&|<>?:*/._-"))' .tmp/show-pics.js \
     > lcr/show-pics.js
   ```

4. Reinstall the bookmark from the file and click it on the target page.
5. Bump the version in the script's `.md` and in the [README.md](README.md#scripts) table, and add a changelog line: minor for fixes and small changes, major for changes users must relearn. Update the rest of the `.md` if behavior, messages, or page dependencies changed.
