/**
 * Service worker — receives Web Push and raises a system notification.
 *
 * This is what makes an alert reach the owner's phone when the browser tab is
 * closed. The browser wakes this worker, it draws the notification, and a tap
 * opens (or focuses) the admin page.
 *
 * Deliberately minimal: no offline caching, no fetch interception. Caching an
 * admin panel that shows live money numbers would do more harm than good, and
 * a fetch handler that goes wrong can take the whole site down.
 */

self.addEventListener('install', (event) => {
  // Take over immediately rather than waiting for every old tab to close.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {
    title: 'Aqua Perl',
    body: 'Naya update hai',
    link: '/admin',
    priority: 'normal',
    tag: 'general',
  };

  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (_) {
    try {
      if (event.data) data.body = event.data.text();
    } catch (_) { /* keep defaults */ }
  }

  const options = {
    body: data.body,
    icon: '/brand/icon-512.png',
    badge: '/brand/favicon-32.png',
    // Same tag replaces an earlier alert instead of stacking duplicates.
    tag: data.tag,
    renotify: true,
    // High-priority alerts stay on screen until acted on.
    requireInteraction: data.priority === 'high',
    vibrate: data.priority === 'high' ? [200, 100, 200, 100, 200] : [150, 80, 150],
    data: { link: data.link },
    actions: [
      { action: 'open', title: 'Kholo' },
      { action: 'dismiss', title: 'Baad me' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const link = (event.notification.data && event.notification.data.link) || '/admin';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      // Reuse an already-open admin tab rather than piling up new windows.
      for (const client of list) {
        if (client.url.includes('/admin') && 'focus' in client) {
          client.navigate(link);
          return client.focus();
        }
      }
      return self.clients.openWindow(link);
    }),
  );
});
