# Church Scripts

Scripts and small tools that help leaders and clerks of The Church of Jesus Christ of Latter-day Saints work faster in the Church's online leadership tools, mainly Leader and Clerk Resources (LCR).

> **Unofficial.** This project is not affiliated with, endorsed by, or supported by the Church. The scripts rely on page layouts and internal APIs that the Church can change at any time, so expect breakage and check here for fixes.

## Scripts

| Script | Version | Runs on | What it does |
| --- | --- | --- | --- |
| [Photo Tiles](lcr/show-pics.md) (`lcr/show-pics.js`) | 1.3 | LCR Custom Report page | Replaces the report table with photo tiles: one card per member, with their photo, name, and the report's columns. |

## Installing a bookmarklet

Most scripts here are bookmarklets: a bookmark whose address is JavaScript instead of a web address. Clicking it runs the script on the page you have open.

1. Open the script's `.js` file and copy its entire contents (one long line that starts with `javascript:`).
2. Create a new bookmark in your browser's bookmarks bar.
   - **Chrome / Edge:** open the bookmark manager, then choose **Add new bookmark**.
   - **Firefox:** right-click the bookmarks toolbar, then choose **Add Bookmark**.
   - **Safari:** bookmark any page, then right-click it and choose **Edit Address**.
3. Give it a clear name that includes the version (for example, *LCR Photo Tiles 1.3*), so you can tell later whether yours is current. Paste the script into the URL/address field.
4. Sign in to the Church site, open the page the script is for, and click the bookmark.

Read a script before you install it. A bookmarklet runs with your signed-in session and can see everything you can see.

## Privacy and safe use

Member information and photos are confidential. Use these tools only for your calling, and follow the Church's guidance on protecting member information. Don't save, print, or share what they show outside those guidelines.

Every script in this repository follows these rules:

- **Read-only.** Never creates, changes, or deletes Church records.
- **Stays in your browser.** Talks only to Church servers, using the sign-in you already have. No third-party servers, analytics, or trackers.
- **Keeps nothing.** Saves no member data to files, browser storage, or the clipboard unless you ask it to.
- **Shows only what you can see.** Uses data your calling already gives you access to; it never works around access controls.

## Contributing

See [AGENTS.md](AGENTS.md) for repository layout, naming, and the conventions for writing and maintaining bookmarklets. It applies to human and AI contributors alike.
