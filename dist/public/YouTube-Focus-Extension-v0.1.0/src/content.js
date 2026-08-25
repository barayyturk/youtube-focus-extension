(() => {
  const YOUTUBE_ORIGIN = "https://www.youtube.com";
  let lastNavigationKey = "";
  let navigationTimer;
  let enforcementTimer;
  let settings = {
    enabled: true,
    mode: "topic",
    topic: "",
    anchorText: "",
    anchorUrl: ""
  };
  let blockedVideoId = "";
  const MIN_CONTEXT_LENGTH = 12;
  const BLOCK_CONFIRM_DELAY_MS = 400;
  const relevantVideoIds = new Set();
  let pendingBlockVideoId = null;
  let pendingBlockTimer;

  function clearPendingBlock() {
    pendingBlockVideoId = null;
    window.clearTimeout(pendingBlockTimer);
  }

  function isContextLoaded(context) {
    // YouTube renders the title before the description finishes hydrating.
    // Treat a too-short context as "not loaded yet" rather than "no match",
    // otherwise a video briefly reads as off-topic before its own
    // description has appeared in the DOM.
    return context.trim().length >= MIN_CONTEXT_LENGTH;
  }

  function getVideoId(url = window.location.href) {
    try {
      const parsedUrl = new URL(url, YOUTUBE_ORIGIN);

      if (parsedUrl.pathname === "/watch") {
        return parsedUrl.searchParams.get("v");
      }

      if (parsedUrl.pathname.startsWith("/shorts/")) {
        return parsedUrl.pathname.split("/")[2] || null;
      }

      if (parsedUrl.pathname.startsWith("/live/")) {
        return parsedUrl.pathname.split("/")[2] || null;
      }
    } catch {
      return null;
    }

    return null;
  }

  function isVideoPage(url = window.location.href) {
    return Boolean(getVideoId(url));
  }

  function getVideoTitle() {
    const title =
      document.querySelector("h1.ytd-watch-metadata yt-formatted-string") ||
      document.querySelector("h1.title") ||
      document.querySelector("title");

    return title?.textContent?.trim() ?? "";
  }

  function getVideoDescription() {
    const description =
      document.querySelector("#description-inline-expander") ||
      document.querySelector("#description");

    return description?.textContent?.trim() ?? "";
  }

  function getVideoContext() {
    return `${getVideoTitle()} ${getVideoDescription()}`.trim();
  }

  function meaningfulWords(value) {
    const stopWords = new Set([
      "about", "after", "also", "and", "are", "from", "for", "how", "into",
      "its", "more", "not", "that", "the", "this", "using", "what", "when",
      "where", "with", "your"
    ]);

    return [...new Set(
      value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 2 && !stopWords.has(word))
    )];
  }

  function isRelevant(context) {
    const target = settings.mode === "anchor" ? settings.anchorText : settings.topic;
    const targetWords = meaningfulWords(target);

    if (!settings.enabled || targetWords.length === 0) {
      return true;
    }

    const contextWords = new Set(meaningfulWords(context));
    const matches = targetWords.filter((word) => contextWords.has(word)).length;
    const threshold = targetWords.length === 1 ? 1 : Math.max(1, Math.ceil(targetWords.length / 3));

    return matches >= threshold;
  }

  function removeBlocker() {
    document.querySelector("#youtube-focus-blocker")?.remove();
    document.documentElement.style.removeProperty("overflow");
  }

  function showBlocker() {
    if (document.querySelector("#youtube-focus-blocker")) {
      return;
    }

    const video = document.querySelector("video");
    video?.pause();

    const blocker = document.createElement("div");
    blocker.id = "youtube-focus-blocker";
    blocker.innerHTML = `
      <div class="youtube-focus-card" role="dialog" aria-modal="true" aria-labelledby="youtube-focus-title">
        <div class="youtube-focus-mark">FOCUS MODE</div>
        <h2 id="youtube-focus-title">Stay with your intention</h2>
        <p>This video doesn’t match your active focus. Going back keeps your session on track.</p>
        <button id="youtube-focus-go-back" type="button">Go back to focus</button>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      #youtube-focus-blocker {
        position: fixed; inset: 0; z-index: 2147483647;
        display: grid; place-items: center; padding: 24px;
        background: rgba(8, 12, 28, .94); color: #f7f8ff;
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
      }
      .youtube-focus-card {
        width: min(420px, 100%); padding: 36px; text-align: center;
        border: 1px solid rgba(255,255,255,.14); border-radius: 24px;
        background: linear-gradient(145deg, #171f43, #0e142c);
        box-shadow: 0 24px 100px rgba(0,0,0,.5);
      }
      .youtube-focus-mark {
        color: #8be9c2; font-size: 11px; font-weight: 800;
        letter-spacing: .16em; margin-bottom: 18px;
      }
      .youtube-focus-card h2 { margin: 0 0 12px; font-size: 28px; }
      .youtube-focus-card p { color: #b7bfd9; line-height: 1.6; margin: 0 0 26px; }
      #youtube-focus-go-back {
        border: 0; border-radius: 999px; padding: 13px 22px;
        background: #8be9c2; color: #07151a; font-weight: 800; cursor: pointer;
      }
      #youtube-focus-go-back:hover { background: #b5f5d9; }
    `;

    blocker.append(style);
    document.documentElement.append(blocker);
    document.documentElement.style.overflow = "hidden";
    blocker.querySelector("#youtube-focus-go-back").addEventListener("click", () => {
      window.history.back();
    });
  }

  function enforceFocus() {
    const videoId = getVideoId();
    if (!videoId || !isVideoPage() || !settings.enabled) {
      blockedVideoId = "";
      clearPendingBlock();
      removeBlocker();
      return;
    }

    // Once a video has been confirmed relevant, don't re-litigate it on
    // every subsequent DOM mutation (chat messages, view-count ticks,
    // related-video re-renders, etc. all fire the observer repeatedly).
    if (relevantVideoIds.has(videoId)) {
      if (blockedVideoId === videoId) {
        blockedVideoId = "";
        removeBlocker();
      }
      clearPendingBlock();
      return;
    }

    const context = getVideoContext();

    // The description hydrates a beat after the title. If we judge
    // relevance against a not-yet-loaded context, it looks like "no match"
    // and the blocker flashes on for a related video before the real
    // description arrives. Wait for enough content instead of guessing.
    if (!isContextLoaded(context)) {
      return;
    }

    if (isRelevant(context)) {
      relevantVideoIds.add(videoId);
      blockedVideoId = "";
      clearPendingBlock();
      removeBlocker();
      return;
    }

    // Require the "not relevant" verdict to hold for a short window before
    // actually showing the blocker, so a single transient re-render (e.g.
    // YouTube swapping the description panel) can't cause a flash-block.
    if (pendingBlockVideoId === videoId) {
      return;
    }

    pendingBlockVideoId = videoId;
    window.clearTimeout(pendingBlockTimer);
    pendingBlockTimer = window.setTimeout(() => {
      if (pendingBlockVideoId !== videoId || getVideoId() !== videoId) {
        return;
      }

      const recheckedContext = getVideoContext();
      if (!isContextLoaded(recheckedContext) || isRelevant(recheckedContext)) {
        // Context changed while we waited (still loading, or turned out
        // relevant after all) - don't block based on stale info.
        if (isContextLoaded(recheckedContext) && isRelevant(recheckedContext)) {
          relevantVideoIds.add(videoId);
        }
        return;
      }

      if (blockedVideoId !== videoId) {
        blockedVideoId = videoId;
        showBlocker();
      }
    }, BLOCK_CONFIRM_DELAY_MS);
  }

  function publishNavigation(reason) {
    const url = window.location.href;
    const videoId = getVideoId(url);
    const navigationKey = `${videoId ?? "not-a-video"}:${url}`;

    if (navigationKey === lastNavigationKey) {
      return;
    }

    lastNavigationKey = navigationKey;
    chrome.runtime.sendMessage(
      {
        type: "YOUTUBE_VIDEO_NAVIGATED",
        reason,
        videoId,
        url,
        title: getVideoTitle(),
        context: getVideoContext()
      },
      () => {
        // A page can be unloading while the service worker is asleep.
        // The event is best-effort in this first detection-only slice.
        void chrome.runtime.lastError;
      }
    );
    enforceFocus();
  }

  function scheduleNavigationCheck(reason) {
    window.clearTimeout(navigationTimer);
    navigationTimer = window.setTimeout(() => publishNavigation(reason), 100);
  }

  function patchHistoryMethod(methodName) {
    const original = window.history[methodName];

    window.history[methodName] = function patchedHistoryMethod(...args) {
      const result = original.apply(this, args);
      scheduleNavigationCheck(`history.${methodName}`);
      return result;
    };
  }

  patchHistoryMethod("pushState");
  patchHistoryMethod("replaceState");
  window.addEventListener("popstate", () => scheduleNavigationCheck("popstate"));
  window.addEventListener("yt-navigate-finish", () =>
    scheduleNavigationCheck("yt-navigate-finish")
  );

  const observer = new MutationObserver(() => {
    if (isVideoPage() && !lastNavigationKey) {
      scheduleNavigationCheck("dom-ready");
    }
    if (isVideoPage()) {
      window.clearTimeout(enforcementTimer);
      enforcementTimer = window.setTimeout(enforceFocus, 250);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  scheduleNavigationCheck("initial-load");

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "GET_CURRENT_VIDEO") {
      sendResponse({
        ok: true,
        videoId: getVideoId(),
        url: window.location.href,
        title: getVideoTitle(),
        context: getVideoContext()
      });
      return false;
    }

    if (message?.type === "SET_SETTINGS") {
      settings = { ...settings, ...message.settings };
      // The focus topic/anchor just changed, so any cached "relevant"
      // verdicts (and any in-flight block decision) are stale.
      relevantVideoIds.clear();
      clearPendingBlock();
      enforceFocus();
      sendResponse({ ok: true });
      return false;
    }
  });

  chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (response) => {
    if (chrome.runtime.lastError || !response?.settings) {
      return;
    }
    settings = { ...settings, ...response.settings };
    relevantVideoIds.clear();
    clearPendingBlock();
    enforceFocus();
  });
})();