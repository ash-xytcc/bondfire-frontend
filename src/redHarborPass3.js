const STYLE_ID = "red-harbor-pass3-style";

function injectPass3Styles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    /* ===== PASS 3 GLOBAL ===== */
    html.theme-dark body,
    body.theme-dark {
      --rh-border: rgba(218, 233, 242, 0.14);
      --rh-border-strong: rgba(218, 233, 242, 0.22);
      --rh-panel: linear-gradient(180deg, rgba(17,28,39,0.88), rgba(12,22,31,0.94));
      --rh-panel-soft: linear-gradient(180deg, rgba(19,31,43,0.78), rgba(11,21,30,0.88));
      --rh-text: #f5efe4;
      --rh-dim: rgba(245, 239, 228, 0.72);
      --rh-accent: #c64b33;
      --rh-shadow: 0 18px 48px rgba(0,0,0,0.28);
      --rh-radius: 22px;
    }

    /* ===== TOP NAV: kill horizontal scroller ===== */
    .rh-pass3-topnav {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      flex-wrap: nowrap !important;
      overflow: hidden !important;
      white-space: nowrap !important;
      min-width: 0 !important;
      scrollbar-width: none !important;
    }

    .rh-pass3-topnav::-webkit-scrollbar {
      display: none !important;
    }

    .rh-pass3-topnav > * {
      min-width: 0 !important;
      flex: 1 1 0 !important;
      max-width: none !important;
    }

    .rh-pass3-topnav a,
    .rh-pass3-topnav button,
    .rh-pass3-topnav [role="button"] {
      min-width: 0 !important;
      width: 100% !important;
      max-width: none !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
      font-size: clamp(12px, 1.05vw, 15px) !important;
      line-height: 1.1 !important;
      padding: 10px 12px !important;
      border-radius: 14px !important;
    }

    .rh-pass3-topnav .logout,
    .rh-pass3-topnav [data-logout="true"] {
      flex: 0 0 auto !important;
      width: auto !important;
    }

    @media (max-width: 1200px) {
      .rh-pass3-topnav {
        gap: 6px !important;
      }

      .rh-pass3-topnav a,
      .rh-pass3-topnav button,
      .rh-pass3-topnav [role="button"] {
        font-size: 12px !important;
        padding: 9px 10px !important;
        border-radius: 12px !important;
      }
    }

    /* ===== BULLETIN PAGE ===== */
    .rh-pass3-bulletin-page {
      max-width: 1380px !important;
      margin: 0 auto !important;
      padding: 18px 18px 28px !important;
    }

    .rh-pass3-bulletin-page h1:first-of-type,
    .rh-pass3-bulletin-page h2:first-of-type {
      font-size: clamp(40px, 4vw, 58px) !important;
      line-height: 0.98 !important;
      letter-spacing: -0.02em !important;
      margin: 8px 0 12px !important;
    }

    .rh-pass3-bulletin-links {
      display: flex !important;
      align-items: center !important;
      flex-wrap: wrap !important;
      gap: 10px !important;
      margin: 0 0 22px !important;
    }

    .rh-pass3-bulletin-links a,
    .rh-pass3-bulletin-links button {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6px !important;
      padding: 10px 14px !important;
      border-radius: 999px !important;
      border: 1px solid var(--rh-border) !important;
      background: rgba(255,255,255,0.03) !important;
      color: var(--rh-text) !important;
      text-decoration: none !important;
      font-weight: 600 !important;
    }

    .rh-pass3-bulletin-grid {
      display: grid !important;
      grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr) !important;
      gap: 20px !important;
      align-items: start !important;
    }

    .rh-pass3-panel {
      background: var(--rh-panel) !important;
      border: 1px solid var(--rh-border) !important;
      border-radius: var(--rh-radius) !important;
      box-shadow: var(--rh-shadow) !important;
      backdrop-filter: blur(8px) !important;
    }

    .rh-pass3-form,
    .rh-pass3-posts {
      padding: 20px 20px 22px !important;
    }

    .rh-pass3-form label,
    .rh-pass3-form .field-label {
      display: block !important;
      font-size: 14px !important;
      font-weight: 700 !important;
      color: var(--rh-text) !important;
      margin: 0 0 8px !important;
      letter-spacing: 0.01em !important;
      text-transform: none !important;
    }

    .rh-pass3-form input[type="text"],
    .rh-pass3-form input[type="search"],
    .rh-pass3-form input[type="url"],
    .rh-pass3-form textarea,
    .rh-pass3-form select {
      width: 100% !important;
      border-radius: 16px !important;
      border: 1px solid var(--rh-border-strong) !important;
      background: rgba(5, 12, 18, 0.34) !important;
      color: var(--rh-text) !important;
      padding: 14px 16px !important;
      outline: none !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.03) !important;
    }

    .rh-pass3-form textarea {
      min-height: 340px !important;
      resize: vertical !important;
      line-height: 1.6 !important;
    }

    .rh-pass3-form input::placeholder,
    .rh-pass3-form textarea::placeholder {
      color: rgba(245,239,228,0.34) !important;
    }

    .rh-pass3-form .field,
    .rh-pass3-form .form-row,
    .rh-pass3-form .stack > *,
    .rh-pass3-form > * + * {
      margin-top: 16px !important;
    }

    .rh-pass3-posts h2,
    .rh-pass3-posts h3 {
      margin: 0 0 14px !important;
      font-size: clamp(28px, 2vw, 40px) !important;
      line-height: 1 !important;
    }

    .rh-pass3-post-list {
      display: flex !important;
      flex-direction: column !important;
      gap: 12px !important;
      max-height: 72vh !important;
      overflow: auto !important;
      padding-right: 4px !important;
    }

    .rh-pass3-post-item {
      border: 1px solid var(--rh-border) !important;
      border-radius: 16px !important;
      background: rgba(255,255,255,0.025) !important;
      padding: 14px 14px 12px !important;
    }

    .rh-pass3-post-item-title {
      font-size: 18px !important;
      font-weight: 700 !important;
      color: var(--rh-text) !important;
      margin: 0 0 6px !important;
    }

    .rh-pass3-post-item-meta {
      font-size: 12px !important;
      color: var(--rh-dim) !important;
      margin: 0 0 6px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.08em !important;
    }

    .rh-pass3-post-item p {
      margin: 0 !important;
      color: var(--rh-dim) !important;
      line-height: 1.45 !important;
    }

    .rh-pass3-form button,
    .rh-pass3-posts button {
      border-radius: 14px !important;
    }

    .rh-pass3-submit-row {
      display: flex !important;
      gap: 10px !important;
      flex-wrap: wrap !important;
      margin-top: 18px !important;
    }

    @media (max-width: 980px) {
      .rh-pass3-bulletin-grid {
        grid-template-columns: 1fr !important;
      }

      .rh-pass3-post-list {
        max-height: none !important;
      }

      .rh-pass3-bulletin-page {
        padding: 14px 14px 22px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function textOf(el) {
  return (el?.textContent || "").replace(/\s+/g, " ").trim();
}

function findTopNav() {
  const candidates = Array.from(document.querySelectorAll("nav, header, div"));
  return candidates.find((el) => {
    const txt = textOf(el);
    return txt.includes("Branch Board") &&
      txt.includes("Bulletin") &&
      txt.includes("Members") &&
      txt.includes("Logout");
  }) || null;
}

function polishTopNav() {
  const nav = findTopNav();
  if (!nav) return;

  nav.classList.add("rh-pass3-topnav");

  const controls = nav.querySelectorAll("a, button, [role='button']");
  controls.forEach((el) => {
    const t = textOf(el);
    if (/logout/i.test(t)) {
      el.setAttribute("data-logout", "true");
      el.classList.add("logout");
    }
  });

  Array.from(nav.children).forEach((child) => {
    const txt = textOf(child);
    if (/^\s*$/.test(txt)) return;
    child.style.minWidth = "0";
  });

  nav.querySelectorAll("*").forEach((el) => {
    const cs = window.getComputedStyle(el);
    if (/(auto|scroll)/i.test(cs.overflowX) || /(auto|scroll)/i.test(cs.overflow)) {
      el.style.overflowX = "hidden";
      el.style.overflow = "hidden";
      el.style.scrollbarWidth = "none";
    }
  });
}

function findBulletinPageRoot() {
  const headings = Array.from(document.querySelectorAll("h1, h2, h3"));
  const head = headings.find((h) => /bulletin editor/i.test(textOf(h)));
  if (!head) return null;

  let root = head.closest("main") || head.closest("[class]") || head.parentElement;
  while (root && root.parentElement && root.children.length < 3) {
    root = root.parentElement;
  }
  return root || head.parentElement;
}

function classifyPostsPanel(root) {
  const headings = Array.from(root.querySelectorAll("h2, h3, h4"));
  const postsHeading = headings.find((h) => /^posts$/i.test(textOf(h)));
  if (!postsHeading) return null;

  let panel = postsHeading.closest("section, article, div");
  while (panel && panel.parentElement && panel.querySelectorAll("input, textarea, select").length > 0) {
    panel = panel.parentElement;
  }
  return panel;
}

function classifyFormPanel(root, postsPanel) {
  const textareas = root.querySelectorAll("textarea");
  if (!textareas.length) return null;

  let panel = textareas[0].closest("section, article, div");
  while (panel && panel.parentElement && panel === postsPanel) {
    panel = panel.parentElement;
  }
  return panel;
}

function polishBulletinPage() {
  const root = findBulletinPageRoot();
  if (!root) return;

  root.classList.add("rh-pass3-bulletin-page");

  const headings = Array.from(root.querySelectorAll("h1, h2, h3"));
  const title = headings.find((h) => /bulletin editor/i.test(textOf(h)));

  if (title && title.parentElement) {
    const siblingLinks = Array.from(title.parentElement.querySelectorAll("a, button"))
      .filter((el) => !/logout/i.test(textOf(el)));

    if (siblingLinks.length >= 2) {
      const wrap = document.createElement("div");
      wrap.className = "rh-pass3-bulletin-links";
      siblingLinks.forEach((el) => wrap.appendChild(el));
      title.insertAdjacentElement("afterend", wrap);
    }
  }

  const postsPanel = classifyPostsPanel(root);
  const formPanel = classifyFormPanel(root, postsPanel);

  if (formPanel && postsPanel && formPanel.parentElement === postsPanel.parentElement) {
    const parent = formPanel.parentElement;
    parent.classList.add("rh-pass3-bulletin-grid");
    formPanel.classList.add("rh-pass3-panel", "rh-pass3-form");
    postsPanel.classList.add("rh-pass3-panel", "rh-pass3-posts");
  } else {
    [formPanel, postsPanel].filter(Boolean).forEach((el) => {
      el.classList.add("rh-pass3-panel");
    });
    if (formPanel) formPanel.classList.add("rh-pass3-form");
    if (postsPanel) postsPanel.classList.add("rh-pass3-posts");
  }

  if (formPanel) {
    const buttons = Array.from(formPanel.querySelectorAll("button"));
    if (buttons.length) {
      let row = formPanel.querySelector(".rh-pass3-submit-row");
      if (!row) {
        row = document.createElement("div");
        row.className = "rh-pass3-submit-row";
        const tailButtons = buttons.filter((b) => {
          const t = textOf(b).toLowerCase();
          return /save|publish|update|delete|cancel|clear|create/.test(t);
        });
        if (tailButtons.length) {
          const last = tailButtons[tailButtons.length - 1];
          last.parentElement.insertBefore(row, last);
          tailButtons.forEach((b) => row.appendChild(b));
        }
      }
    }
  }

  if (postsPanel) {
    const emptyTextEls = Array.from(postsPanel.querySelectorAll("p, div, span"))
      .filter((el) => /no posts yet/i.test(textOf(el)));

    const listish = document.createElement("div");
    listish.className = "rh-pass3-post-list";

    if (emptyTextEls.length) {
      const holder = document.createElement("div");
      holder.className = "rh-pass3-post-item";
      holder.innerHTML = `
        <div class="rh-pass3-post-item-title">No posts yet</div>
        <p>Your bulletin archive will appear here once the first post exists.</p>
      `;
      listish.appendChild(holder);
      const emptyNode = emptyTextEls[0];
      if (!postsPanel.querySelector(".rh-pass3-post-list")) {
        emptyNode.replaceWith(listish);
      }
    } else {
      const candidateItems = Array.from(postsPanel.children).filter((el) => {
        const t = textOf(el);
        return t && !/^posts$/i.test(t);
      });

      if (candidateItems.length && !postsPanel.querySelector(".rh-pass3-post-list")) {
        candidateItems.forEach((item) => {
          if (item.tagName.match(/^H[1-6]$/)) return;
          item.classList.add("rh-pass3-post-item");
          listish.appendChild(item);
        });
        postsPanel.appendChild(listish);
      }
    }
  }
}

function runPass3() {
  injectPass3Styles();
  polishTopNav();
  polishBulletinPage();
}

let obs;
export function mountRedHarborPass3() {
  runPass3();

  if (obs) return;
  obs = new MutationObserver(() => {
    runPass3();
  });

  obs.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  window.addEventListener("resize", runPass3, { passive: true });
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountRedHarborPass3, { once: true });
  } else {
    mountRedHarborPass3();
  }
}
