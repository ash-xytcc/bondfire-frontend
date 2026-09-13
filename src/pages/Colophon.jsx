import React from "react";
import {
  UNSAFE_LocationContext as LocationContext,
  useParams,
} from "react-router-dom";
import { ColophonWorkspace } from "colophon/workspace";
import ColophonNativeModule from "../modules/colophon/ColophonNativeModule.jsx";

function NativeColophonBoundary({ children }) {
  const { orgId } = useParams();
  const locationContext = React.useContext(LocationContext);
  const routeBase = `/org/${encodeURIComponent(String(orgId || ""))}/colophon`;

  const embeddedLocationContext = React.useMemo(() => {
    if (!locationContext?.location || locationContext.location.pathname !== routeBase) {
      return locationContext;
    }

    return {
      ...locationContext,
      location: {
        ...locationContext.location,
        pathname: `${routeBase}/`,
      },
    };
  }, [locationContext, routeBase]);

  React.useLayoutEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.getAttribute("data-ui-theme");
    const previousPreference = root.getAttribute("data-ui-theme-preference");
    const previousColorScheme = root.style.colorScheme;

    let requestedTheme = "dark";
    try {
      const stored = window.localStorage.getItem("colophon-ui-appearance-v1");
      if (stored === "light" || stored === "dark") requestedTheme = stored;
    } catch {
      // Use Bondfire's dark workspace default when no Colophon preference exists.
    }

    root.dataset.uiThemePreference = requestedTheme;
    root.dataset.uiTheme = requestedTheme;
    root.style.colorScheme = requestedTheme;

    return () => {
      if (previousTheme == null) root.removeAttribute("data-ui-theme");
      else root.setAttribute("data-ui-theme", previousTheme);

      if (previousPreference == null) root.removeAttribute("data-ui-theme-preference");
      else root.setAttribute("data-ui-theme-preference", previousPreference);

      root.style.colorScheme = previousColorScheme;
    };
  }, []);

  React.useLayoutEffect(() => {
    if (!routeBase || typeof window === "undefined") return undefined;

    const history = window.history;
    const originalPushState = history.pushState;

    history.pushState = function bondfireColophonPushState(state, title, url) {
      const target = typeof url === "string" ? url : "";

      // The embedded Colophon public-link guard was written for BrowserRouter.
      // Bondfire uses HashRouter, so translate only its native Colophon route
      // writes into hash navigation instead of changing the real document path.
      if (target === routeBase || target.startsWith(`${routeBase}/`)) {
        const destination = new URL(target, window.location.origin);
        const current = new URL(window.location.href);
        current.hash = `#${destination.pathname}${destination.search}${destination.hash}`;
        return originalPushState.call(history, state, title, current.toString());
      }

      return originalPushState.call(history, state, title, url);
    };

    return () => {
      history.pushState = originalPushState;
    };
  }, [routeBase]);

  if (!locationContext || embeddedLocationContext === locationContext) return children;
  return (
    <LocationContext.Provider value={embeddedLocationContext}>
      {children}
    </LocationContext.Provider>
  );
}

export default function Colophon() {
  return (
    <NativeColophonBoundary>
      <ColophonNativeModule Workspace={ColophonWorkspace} />
    </NativeColophonBoundary>
  );
}
