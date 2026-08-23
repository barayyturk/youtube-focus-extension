# YouTube Focus — Chromium Install Guide

This package's `manifest.json` is standard Manifest V3 using only
`storage`, `tabs`, and `runtime` — no Chrome-only APIs — so it loads
identically in every Chromium-based browser: **Chrome, Edge, Brave, Opera,
Vivaldi**, and others.

## Install steps

1. Unzip this package to a folder you'll keep around (don't delete it after
   installing — "unpacked" extensions load their files live from disk).
2. Open your browser's extensions page:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
   - Opera: `opera://extensions`
   - Vivaldi: `vivaldi://extensions`
3. Turn on **Developer mode** (toggle, usually top-right).
4. Click **Load unpacked**.
5. Select the folder you unzipped (the one containing `manifest.json`).
6. Open a YouTube video. Click the extension's **service worker** link on
   the extensions page to open its console and confirm navigation events
   are logging.
7. Click the extension icon to open the popup, set a focus topic, and save.

## Notes

- Any edits you make to the files will apply after clicking the reload
  icon (↻) on the extension's card in the extensions page.
- Brave's Shields shouldn't interfere since this only touches
  `youtube.com` via its own declared content script — no need to whitelist
  anything.
- If Opera's toggle for "Install Chrome extensions" is off, that setting
  is unrelated — it only affects installs *from* the Chrome Web Store, not
  loading unpacked local extensions, which Opera supports natively.
