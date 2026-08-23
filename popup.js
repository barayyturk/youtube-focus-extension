let settings = {
  enabled: true,
  mode: "topic",
  topic: "",
  anchorText: "",
  anchorUrl: "",
  relatedKeywords: ""
};

const $ = (selector) => document.querySelector(selector);

function sendMessage(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }
      resolve(response);
    });
  });
}

async function getActiveTabVideo() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url?.startsWith("https://www.youtube.com/")) {
    return null;
  }

  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tab.id, { type: "GET_CURRENT_VIDEO" }, (response) => {
      if (chrome.runtime.lastError) {
        // The content script may not be ready yet (for example after
        // reloading the extension while YouTube is already open). The tab
        // still contains enough information to anchor the video by title.
        try {
          const url = new URL(tab.url);
          const videoId =
            url.pathname === "/watch"
              ? url.searchParams.get("v")
              : url.pathname.match(/^\/(?:shorts|live)\/([^/?]+)/)?.[1] ?? null;

          resolve(
            videoId && tab.title
              ? { ok: true, videoId, url: tab.url, title: tab.title, context: tab.title }
              : null
          );
        } catch {
          resolve(null);
        }
        return;
      }
      resolve(response?.ok ? response : null);
    });
  });
}

function render() {
  $("#enabled").checked = settings.enabled;
  $("#topic").value = settings.topic;
  $("#related-keywords").value = settings.relatedKeywords;
  $("#mode").value = settings.mode;
  $("#anchor-status").textContent = settings.anchorText
    ? `Anchored to: ${settings.anchorText.slice(0, 70)}${settings.anchorText.length > 70 ? "…" : ""}`
    : "No anchor video saved.";
}

async function save() {
  settings = {
    ...settings,
    enabled: $("#enabled").checked,
    topic: $("#topic").value.trim(),
    relatedKeywords: $("#related-keywords").value.trim(),
    mode: $("#mode").value
  };

  const response = await sendMessage({ type: "SAVE_SETTINGS", settings });
  $("#status").textContent = response?.ok ? "Focus saved." : "Could not save focus.";
  if (response?.ok) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: "SET_SETTINGS", settings }, () => {
        void chrome.runtime.lastError;
      });
    }
  }
}

async function useCurrentVideo() {
  const currentVideo = await getActiveTabVideo();
  if (!currentVideo?.title) {
    $("#status").textContent = "Open a YouTube video first.";
    return;
  }

  settings.anchorText = currentVideo.context || currentVideo.title;
  settings.anchorUrl = currentVideo.url;
  settings.mode = "anchor";
  render();
  await save();
}

sendMessage({ type: "GET_SETTINGS" }).then((response) => {
  if (response?.settings) {
    settings = { ...settings, ...response.settings };
    render();
  }
});

$("#save").addEventListener("click", save);
$("#use-current").addEventListener("click", useCurrentVideo);
$("#enabled").addEventListener("change", save);