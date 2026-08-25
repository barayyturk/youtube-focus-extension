const TAB_STATE_PREFIX = "tabState:";
const DEFAULT_SETTINGS = {
  enabled: true,
  mode: "topic",
  topic: "",
  anchorText: "",
  anchorUrl: ""
};

async function getSettings() {
  const { settings } = await chrome.storage.local.get("settings");
  return { ...DEFAULT_SETTINGS, ...settings };
}

/**
 * The service worker is intentionally small in Step 1.
 * It owns cross-tab state and gives later classification code one stable
 * place to receive navigation events.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "GET_SETTINGS") {
    getSettings().then((settings) => sendResponse({ ok: true, settings }));
    return true;
  }

  if (message?.type === "SAVE_SETTINGS") {
    chrome.storage.local
      .set({ settings: { ...DEFAULT_SETTINGS, ...message.settings } })
      .then(() => sendResponse({ ok: true }));
    return true;
  }

  if (message?.type !== "YOUTUBE_VIDEO_NAVIGATED") {
    return false;
  }

  const tabId = sender.tab?.id;
  if (typeof tabId !== "number") {
    sendResponse({ ok: false, error: "Navigation message has no tab id." });
    return false;
  }

  const state = {
    tabId,
    videoId: message.videoId ?? null,
    url: message.url ?? "",
    title: message.title ?? "",
    detectedAt: new Date().toISOString()
  };

  chrome.storage.session.set({ [`${TAB_STATE_PREFIX}${tabId}`]: state });
  console.info("[YouTube Focus] video navigation", state);

  sendResponse({ ok: true, state });
  return true;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session.remove(`${TAB_STATE_PREFIX}${tabId}`);
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("settings").then(({ settings }) => {
    if (settings) {
      return;
    }

    return chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
  });
});