// Service Worker for Sleep Set PWA

const CACHE_NAME = 'sleep-set-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/static/style.css',
  '/static/icons/icon.svg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// API endpoints to cache separately
const API_CACHE_NAME = 'sleep-set-api-v1';
const API_ENDPOINTS = [
  '/api/analyze'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'sync-sleep-data') {
    event.waitUntil(syncSleepData());
  }
});

// Function to sync data when back online
async function syncSleepData() {
  try {
    // Get offline data from IndexedDB
    const offlineData = await getOfflineData();
    
    if (!offlineData || !offlineData.sleepData || offlineData.sleepData.length === 0) {
      console.log('No offline data to sync');
      return;
    }
    
    // Send data to server
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(offlineData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Data synced successfully:', result);
      
      // Update local data with merged data from server
      await saveOfflineData(result.data);
      
      // Show notification
      self.registration.showNotification('スリープセット', {
        body: 'データが同期されました。',
        icon: '/static/icons/icon.svg'
      });
    } else {
      console.error('Sync failed:', response.statusText);
    }
  } catch (error) {
    console.error('Error syncing data:', error);
  }
}

// Helper function to get offline data (placeholder - implement with IndexedDB)
async function getOfflineData() {
  // In a real implementation, this would retrieve data from IndexedDB
  // For now, we'll return null to indicate no offline data
  return null;
}

// Helper function to save offline data (placeholder - implement with IndexedDB)
async function saveOfflineData(data) {
  // In a real implementation, this would save data to IndexedDB
  console.log('Saving synced data locally:', data);
}

// Handle offline functionality with improved caching strategy
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    // For API endpoints that should be cached
    if (API_ENDPOINTS.some(endpoint => url.pathname === endpoint)) {
      event.respondWith(
        caches.open(API_CACHE_NAME).then(cache => {
          return fetch(event.request)
            .then(response => {
              // Cache a clone of the response
              cache.put(event.request, response.clone());
              return response;
            })
            .catch(() => {
              // Return cached response if available
              return cache.match(event.request);
            });
        })
      );
    } else if (!navigator.onLine) {
      // For other API endpoints when offline
      event.respondWith(
        caches.match(event.request).then(response => {
          if (response) {
            return response;
          }
          
          // If it's a POST request, queue it for background sync
          if (event.request.method === 'POST') {
            // In a real implementation, we would store the request in IndexedDB
            // and register a background sync
            self.registration.sync.register('sync-sleep-data');
          }
          
          return new Response(JSON.stringify({
            offline: true,
            message: 'オフライン状態です。データは再接続時に同期されます。'
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
      );
    }
    return;
  }
  
  // For non-API requests
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      
      return fetch(event.request).then(response => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200) {
          return response;
        }
        
        // Cache successful responses
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      }).catch(() => {
        // Return the offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        
        // Return nothing for other requests
        return new Response('', { status: 408, statusText: 'Offline' });
      });
    })
  );
});