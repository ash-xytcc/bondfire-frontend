// Minimal debug hooks for testers.
// Toggle: localStorage.setItem('bf_debug','1') then reload.
// Disable: localStorage.removeItem('bf_debug') then reload.

(function initBondfireDebug() {
  try {
    if (window.bfDebug) return;

    const isEnabled = () => {
      try {
        return localStorage.getItem('bf_debug') === '1' || new URLSearchParams(window.location.search).has('debug');
      } catch {
        return false;
      }
    };

    const dump = () => {
      const out = {
        now: new Date().toISOString(),
        path: window.location.pathname,
        helpMounted: !!window.__BF_HELP_MOUNTED,
        swController: !!navigator.serviceWorker?.controller,
      };
      try {
        const orgs = JSON.parse(localStorage.getItem('bf_orgs') || '[]');
        out.orgCount = Array.isArray(orgs) ? orgs.length : 0;
      } catch {
        out.orgCount = null;
      }
      return out;
    };

    window.bfDebug = {
      isEnabled,
      enable() {
        try { localStorage.setItem('bf_debug','1'); } catch {}
        return true;
      },
      disable() {
        try { localStorage.removeItem('bf_debug'); } catch {}
        return true;
      },
      dump,
      log(message, meta) {
        if (!isEnabled()) return;
        const safeMessage = typeof message === 'string' ? message.slice(0, 300) : '[diagnostic]';
        const safeMeta = meta && typeof meta === 'object'
          ? Object.fromEntries(Object.entries(meta).filter(([key, value]) => !/(token|secret|key|cookie|password|authorization|ciphertext|content|body|notes?|phone|address|email)/i.test(key) && ['string', 'number', 'boolean'].includes(typeof value)).slice(0, 20))
          : undefined;
        // eslint-disable-next-line no-console
        console.log('[BF]', safeMessage, safeMeta || '');
      },
    };

    if (isEnabled()) {
      // eslint-disable-next-line no-console
      console.log('[BF] Debug enabled. Try bfDebug.dump()');
    }
  } catch {
    // ignore
  }
})();
