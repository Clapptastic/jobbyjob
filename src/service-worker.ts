import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkOnly, NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope;

// Clean up old caches
cleanupOutdatedCaches();

// Precache and route assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache Vite development files
registerRoute(
  ({ url }) => {
    return url.pathname.startsWith('/@vite') || 
           url.pathname.startsWith('/@react-refresh') ||
           url.pathname.includes('node_modules/.vite');
  },
  new NetworkFirst({
    cacheName: 'vite-dev-resources',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache Google Fonts stylesheets
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache Google Fonts webfonts
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30,
      }),
    ],
  })
);

// Cache static assets
registerRoute(
  ({ request }) => {
    return request.destination === 'style' ||
           request.destination === 'script' ||
           request.destination === 'image' ||
           request.destination === 'font' ||
           /\.(js|css|html|svg|png|jpg|jpeg|gif|woff2?)$/.test(request.url);
  },
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Don't cache Supabase API requests
registerRoute(
  ({ url }) => url.hostname.includes('supabase'),
  new NetworkOnly()
);

// Handle navigation requests
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'pages',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [200],
        }),
      ],
    }),
    {
      denylist: [/^\/api/, /^\/rest/, /^\/storage/, /^\/auth/],
    }
  )
); 