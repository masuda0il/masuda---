/**
 * スリープセット - サービスワーカー
 */

const CACHE_NAME = 'sleepset-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/style.css',
    '/js/app.js',
    '/js/sleep.js',
    '/js/stats.js',
    '/js/goals.js',
    '/js/analysis.js',
    '/js/sleepen.js',
    '/js/sw-register.js',
    '/images/sleepen/stage1.png',
    '/images/sleepen/stage2.png',
    '/images/sleepen/stage3.png',
    '/images/sleepen/stage4.png',
    '/images/icons/icon-72x72.png',
    '/images/icons/icon-96x96.png',
    '/images/icons/icon-128x128.png',
    '/images/icons/icon-144x144.png',
    '/images/icons/icon-152x152.png',
    '/images/icons/icon-192x192.png',
    '/images/icons/icon-384x384.png',
    '/images/icons/icon-512x512.png',
    'https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@300;400;500;700&display=swap',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// インストール時にキャッシュ
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('キャッシュを開きました');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// アクティベート時に古いキャッシュを削除
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName !== CACHE_NAME;
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        }).then(() => self.clients.claim())
    );
});

// フェッチリクエストの処理
self.addEventListener('fetch', event => {
    // APIリクエストの場合
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    return response;
                })
                .catch(() => {
                    // オフラインの場合はキャッシュから取得
                    return caches.match(event.request);
                })
        );
    } else {
        // 静的アセットの場合
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    // キャッシュがあればそれを返す
                    if (response) {
                        return response;
                    }
                    
                    // キャッシュがなければネットワークから取得
                    return fetch(event.request).then(
                        response => {
                            // 有効なレスポンスかチェック
                            if (!response || response.status !== 200 || response.type !== 'basic') {
                                return response;
                            }
                            
                            // レスポンスをクローンしてキャッシュに保存
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                            
                            return response;
                        }
                    );
                })
                .catch(error => {
                    console.error('フェッチに失敗しました:', error);
                    // オフラインフォールバックページを返す
                    return caches.match('/index.html');
                })
        );
    }
});

// バックグラウンド同期
self.addEventListener('sync', event => {
    if (event.tag === 'sync-sleep-data') {
        event.waitUntil(syncSleepData());
    } else if (event.tag === 'sync-sleepen-data') {
        event.waitUntil(syncSleepenData());
    }
});

// 睡眠データの同期
async function syncSleepData() {
    try {
        // IndexedDBからデータを取得
        const db = await openDatabase();
        const pendingRecords = await getPendingRecords(db, 'sleepData');
        
        if (pendingRecords.length === 0) return;
        
        // サーバーに送信
        for (const record of pendingRecords) {
            await fetch('/api/sleep/record', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(record.data)
            });
            
            // 送信済みのレコードを削除
            await deletePendingRecord(db, 'sleepData', record.id);
        }
    } catch (error) {
        console.error('睡眠データの同期中にエラーが発生しました:', error);
    }
}

// スリープンデータの同期
async function syncSleepenData() {
    try {
        // IndexedDBからデータを取得
        const db = await openDatabase();
        const pendingUpdates = await getPendingRecords(db, 'sleepenData');
        
        if (pendingUpdates.length === 0) return;
        
        // サーバーに送信
        for (const update of pendingUpdates) {
            await fetch('/api/sleepen/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(update.data)
            });
            
            // 送信済みの更新を削除
            await deletePendingRecord(db, 'sleepenData', update.id);
        }
    } catch (error) {
        console.error('スリープンデータの同期中にエラーが発生しました:', error);
    }
}

// IndexedDBを開く
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('sleepsetDB', 1);
        
        request.onerror = event => {
            reject('データベースを開けませんでした');
        };
        
        request.onsuccess = event => {
            resolve(event.target.result);
        };
        
        request.onupgradeneeded = event => {
            const db = event.target.result;
            
            // 睡眠データストア
            if (!db.objectStoreNames.contains('sleepData')) {
                db.createObjectStore('sleepData', { keyPath: 'id', autoIncrement: true });
            }
            
            // スリープンデータストア
            if (!db.objectStoreNames.contains('sleepenData')) {
                db.createObjectStore('sleepenData', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

// 保留中のレコードを取得
function getPendingRecords(db, storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onerror = event => {
            reject('レコードの取得に失敗しました');
        };
        
        request.onsuccess = event => {
            resolve(event.target.result);
        };
    });
}

// 保留中のレコードを削除
function deletePendingRecord(db, storeName, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);
        
        request.onerror = event => {
            reject('レコードの削除に失敗しました');
        };
        
        request.onsuccess = event => {
            resolve();
        };
    });
}

// プッシュ通知
self.addEventListener('push', event => {
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: '/images/icons/icon-192x192.png',
        badge: '/images/icons/icon-72x72.png',
        data: {
            url: data.url || '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// 通知クリック
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});