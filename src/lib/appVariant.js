const DPG_HOSTS = new Set([
  'dualpowerwest.org',
  'www.dualpowerwest.org',
]);

function readQueryVariant() {
  try {
    const qs = new URLSearchParams(window.location.search);
    return String(qs.get('app') || '').trim().toLowerCase();
  } catch {
    return '';
  }
}

export function getAppVariant() {
  const envVariant = String(import.meta.env.VITE_APP_VARIANT || '').trim().toLowerCase();
  const queryVariant = typeof window !== 'undefined' ? readQueryVariant() : '';
  const host = typeof window !== 'undefined' ? String(window.location.hostname || '').toLowerCase() : '';

  if (queryVariant === 'dpg' || queryVariant === 'bondfire') return queryVariant;
  if (envVariant === 'dpg' || envVariant === 'bondfire') return envVariant;
  if (DPG_HOSTS.has(host)) return 'dpg';
  return 'bondfire';
}

export function isDpgVariant() {
  return getAppVariant() === 'dpg';
}

export function getAdminBasePath() {
  return isDpgVariant() ? '/admin' : '';
}

export function getBranding() {
  if (isDpgVariant()) {
    return {
      key: 'dpg',
      appName: 'Dual Power West',
      shortName: 'DPG',
      publicSiteTitle: 'Dual Power West',
      publicSiteTagline: 'A yearly gathering for shared power, skill, strategy, and on-the-ground imagination.',
      adminBasePath: '/admin',
      adminSignInHref: '/admin/#/signin',
      homeHref: '/orgs',
      logoSrc: '/logo-bondfire.png',
      poweredByBondfire: true,
    };
  }

  return {
    key: 'bondfire',
    appName: 'Bondfire',
    shortName: 'Bondfire',
    publicSiteTitle: 'Bondfire',
    publicSiteTagline: 'Mutual aid ops in one place.',
    adminBasePath: '',
    adminSignInHref: '/#/signin',
    homeHref: '/orgs',
    logoSrc: '/logo-bondfire.png',
    poweredByBondfire: false,
  };
}
