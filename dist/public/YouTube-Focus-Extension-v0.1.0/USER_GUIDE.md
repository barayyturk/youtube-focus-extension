# YouTube Focus — User Guide

YouTube Focus helps you stay on one subject while watching YouTube. It
compares a video's title and description with your focus topic, then covers
videos that do not match.

## Install in Google Chrome

1. Download and unzip the YouTube Focus package.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** in the top-right corner.
4. Click **Load unpacked**.
5. Select the unzipped `youtube-focus-extension` folder.
6. Open or reload a YouTube tab.

Chrome does not install this extension by double-clicking the ZIP. The folder
inside the ZIP must be unzipped and selected through **Load unpacked**.

## Start a focus session

1. Open YouTube and click the **YouTube Focus** extension icon.
2. Enter a topic, such as `advanced quantum computing`.
3. Choose **Save focus**.
4. Browse YouTube normally.

Videos whose title or description does not sufficiently match the topic are
paused and covered by a Focus Mode screen.

## Use a video as your focus anchor

An anchor lets you focus on the subject of a particular video instead of
typing a topic manually.

1. Open the video you want to use as the reference.
2. Open the YouTube Focus popup.
3. Click **Use current video as anchor**.
4. The anchor is saved and applied immediately.
5. Continue browsing. Unrelated videos will be blocked.

The anchor uses the current video's title and description when the extension
can read them. If YouTube is still loading, it uses the tab's video title as a
fallback.

## Turn Focus Mode off and on

- Move the slider to the **off** position to disable blocking immediately.
- Move it back to **on** to apply the saved topic or anchor again.

The slider saves automatically. You do not need to click **Save focus** after
switching it.

## Troubleshooting

### The extension says “Open a video first”

Make sure the active browser tab is a YouTube video page, not the YouTube
homepage or a search-results page. If the video was already open when the
extension was installed or reloaded:

1. Close the popup.
2. Reload the YouTube tab.
3. Open the popup again and click **Use current video as anchor**.

### Nothing is being blocked

Check that:

- The slider is switched **on**.
- A focus topic has been saved, or an anchor has been selected.
- You are browsing on `www.youtube.com`.
- The YouTube tab was reloaded after installing the extension.

If the topic is empty, the extension allows every video because there is no
rule to match against.

### A relevant video is blocked

Matching is intentionally local and based on words in the title and
description. Try a shorter, more specific topic, or use a representative
video as an anchor.

## Privacy and limitations

- Matching happens locally in the browser.
- The extension does not call YouTube APIs or an AI service.
- The extension does not send your focus topic or browsing history to a
  remote server.
- Matching is based on visible title and description text, so it is not a
  perfect understanding of a video's content.

## Sharing the extension

### GitHub Releases — recommended

For the easiest download experience:

1. Create a GitHub repository.
2. Upload the unzipped `youtube-focus-extension` folder and this guide.
3. Create a GitHub Release.
4. Attach the ZIP package to the release.
5. Tell users to download the ZIP, unzip it, and follow the installation
   steps above.

GitHub Releases are better than putting a ZIP only in the repository because
users get a clear versioned download and release notes.

### Direct ZIP sharing

You can also share the ZIP through Google Drive, Dropbox, a website, or an
email attachment. Users still need to unzip it and load the folder through
Chrome's **Load unpacked** screen.

### Chrome Web Store

The Chrome Web Store is the best option for non-technical users because it
supports a normal one-click installation. Publishing requires a developer
account, store listing details, privacy disclosures, and Google's review
process. The current package is suitable for testing and direct sharing; a
store submission may need additional listing assets and review preparation.