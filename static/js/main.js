/**
 * Main JavaScript for sleep tracking application
 */

// Clear localStorage to prevent old data from overriding server data
localStorage.removeItem('currentDay');
localStorage.removeItem('sleepData');
localStorage.removeItem('settings');

// Chart data from server
let chartData;

document.addEventListener('DOMContentLoaded', () => {
    // Get data from hidden elements
    chartData = JSON.parse(document.getElementById('chart-data').textContent);
    window.sleepDataDates = JSON.parse(document.getElementById('sleep-data-dates').textContent);
    
    // Initialize chart
    initChart(chartData);
    
    // Setup event listeners
    setupEventListeners();
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('ServiceWorker registration successful');
            
            // Request notification permission
            if ('Notification' in window) {
                Notification.requestPermission();
            }
            
            // Setup background sync
            if ('SyncManager' in window) {
                registration.sync.register('sync-sleep-data');
            }
        }).catch(error => {
            console.log('ServiceWorker registration failed: ', error);
        });
    }
    
    // Add to home screen prompt
    setupInstallPrompt();
    
    // Handle offline/online status
    setupOfflineHandling();
});

// Initialize the sleep chart
function initChart(data) {
    const ctx = document.getElementById('sleep-chart').getContext('2d');
    
    const sleepChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: '睡眠時間',
                    data: data.sleepHours,
                    borderColor: '#3a6ea5',
                    backgroundColor: 'rgba(58, 110, 165, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: '睡眠の質',
                    data: data.sleepQuality,
                    borderColor: '#6c5ce7',
                    backgroundColor: 'rgba(108, 92, 231, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '睡眠時間 (時間)'
                    },
                    suggestedMax: 10
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: '睡眠の質 (1-5)'
                    },
                    suggestedMax: 5,
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

function setupInstallPrompt() {
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        
        // Show install button or notification
        const installButton = document.createElement('button');
        installButton.textContent = 'アプリをインストール';
        installButton.classList.add('btn', 'primary-btn');
        installButton.style.position = 'fixed';
        installButton.style.bottom = '20px';
        installButton.style.right = '20px';
        installButton.style.zIndex = '1000';
        
        installButton.addEventListener('click', (e) => {
            // Show the install prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                deferredPrompt = null;
                installButton.remove();
            });
        });
        
        document.body.appendChild(installButton);
    });
}

function setupOfflineHandling() {
    window.addEventListener('online', () => {
        console.log('Back online, syncing data...');
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
                registration.sync.register('sync-sleep-data');
            });
        }
        
        // Simply reload to get fresh server data instead of syncing old localStorage
        console.log('Back online, reloading page to get latest server data...');
        window.location.reload();
    });
    
    window.addEventListener('offline', () => {
        console.log('Offline mode activated');
        // Show offline notification to user
        const offlineNotification = document.createElement('div');
        offlineNotification.textContent = 'オフライン状態です。データは再接続時に同期されます。';
        offlineNotification.style.position = 'fixed';
        offlineNotification.style.top = '0';
        offlineNotification.style.left = '0';
        offlineNotification.style.right = '0';
        offlineNotification.style.backgroundColor = '#fdcb6e';
        offlineNotification.style.color = '#2d3436';
        offlineNotification.style.padding = '10px';
        offlineNotification.style.textAlign = 'center';
        offlineNotification.style.zIndex = '1001';
        
        document.body.appendChild(offlineNotification);
        
        // Remove notification when back online
        window.addEventListener('online', () => {
            offlineNotification.remove();
        }, { once: true });
    });
}