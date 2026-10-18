# Photo Tiles (`show-pics.js`)

**Version 1.3** · see [Changelog](#changelog)

A bookmarklet that turns an LCR Custom Report into a grid of photo tiles. It's useful for learning names and faces, for example a bishopric reviewing new move-ins or a presidency preparing for visits.

Each tile shows:

- the member's photo (a 320 px circle, with a gray placeholder until the photo loads)
- the member's name
- one labeled line for each other column in the report that has a value

## Use

1. Install the bookmarklet (see [Installing a bookmarklet](../README.md#installing-a-bookmarklet)).
2. In LCR, open **Reports → Custom Reports** and run a report. Its columns become the lines on each tile, so pick columns accordingly. Include the member name column.
3. Wait for the table to finish loading, then click the bookmarklet.
4. Scroll. Photos load as tiles come into view.
5. To get the table back, refresh the page.

A member with no photo keeps the gray placeholder.

## Messages

| Message | Meaning | What to do |
| --- | --- | --- |
| *No table found. Use this on a Custom Report page.* | The page has no table yet. | Open a custom report and let it load, then try again. |
| *Tile view already active! Refresh to reset.* | The bookmarklet already ran on this page. | Refresh, then run it again. |
| *Table found, but no member IDs could be read…* | LCR changed how it marks member rows. | The script needs an update; see [Maintenance](#maintenance). |

## How it works

1. **Reads the table.** Uses the first `<table>` on the page. Header text is cleaned up: LCR sometimes renders a label twice ("NameName"), and sometimes shows a raw label key with dots and dashes; both are turned into plain words. Cell text skips elements marked `aria-hidden`.
2. **Finds each member's ID.** Reads the `data-member-card-person-uuid` attribute in the row. If that is missing, it falls back to the member-card button's React props, looking for a UUID-shaped `id`. Rows without an ID are dropped.
3. **Picks the name and skips photos.** The name column is the first cell in the first row that holds a member-card link or button; its value becomes the tile title. A column headed "Photo" (or with id `lcr-photo-col-added`) is left out.
4. **Builds the tiles.** Hides the table and adds a `#lcr-tile-view` container to the nearest ancestor that spans at least 90% of the window, so the grid uses the full width.
5. **Loads photos lazily.** An `IntersectionObserver` fetches each member's card as the tile nears the screen. It tries `https://mltp-api.churchofjesuschrist.org/api/member/{uuid}/card` first, then `/mlt/api/member-card?uuid={uuid}` on the current site, both with the user's cookies. In the JSON it takes `tokenUrl`, or failing that the first `http(s)` value under a key containing *token*, *photo*, *image*, *avatar*, or *thumb*. It requests the `/LARGE` size unless the URL already names a size or file type, and falls back to the bare URL if that image fails.

The script only sends GET requests to Church servers and writes member data to the page with `textContent`, so report values can't inject markup.

## Maintenance

The script depends on these LCR details. When it breaks, check them first, using the browser's developer tools on a custom report page:

- the report is a plain `<table>` with `th` headers and `tbody tr` rows, and header and cell columns line up one to one
- member rows carry `data-member-card-person-uuid`, or a `button` whose React fiber props (`__reactFiber…`, up to 6 levels up) include the member UUID as `id`
- one of the two member-card endpoints above returns JSON containing a photo URL, and accepts the session cookie from the LCR page
- photo URLs accept a `/SMALL`, `/MEDIUM`, `/LARGE`, or `/ORIGINAL` size suffix

Tiles that appear with photos stuck on the placeholder usually mean the member-card endpoints or their JSON changed. Check the Network tab.

The file mixes plain and percent-encoded segments from past hand edits. Browsers accept both. See [AGENTS.md](../AGENTS.md#bookmarklets) for how to edit it safely.

## Changelog

- **1.3**: First version in this repository. Earlier versions weren't kept.
