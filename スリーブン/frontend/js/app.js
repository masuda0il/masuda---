/**
 * スリープセット - メインアプリケーションJavaScript
 */

// グローバル変数
const API_BASE_URL = '/api';
let currentPage = 'home';
let sleepData = null;
let sleepenData = null;
let isOnline = navigator.onLine;

// DOM要素
const navLinks = document.querySelectorAll('.nav-menu a');
const pages = document.querySelectorAll('.page');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const modalContainer = document.getElementById('modal-container');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');
const notificationContainer = document.getElementById('notification-container');
const installBtn = document.getElementById('install-btn');

// PWAインストールプロンプト
let deferredPrompt;

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

/**
 * アプリケーションの初期化
 */
async function initApp() {
    // ナビゲーションの設定
    setupNavigation();
    
    // モーダルの設定
    setupModal();
    
    // オンライン/オフライン状態の監視
    setupConnectivityMonitoring();
    
    // PWAインストールの設定
    setupPWAInstall();
    
    // データの初期ロード
    await loadInitialData();
    
    // ホームページの更新
    updateHomePage();
}

/**
 * ナビゲーションの設定
 */
function setupNavigation() {
    // ナビゲーションリンクのクリックイベント
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');
            navigateTo(targetPage);
        });
    });
    
    // モバイルメニュートグル
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    
    // ページ内リンク
    document.querySelectorAll('a[data-page]').forEach(link => {
        if (!link.classList.contains('nav-menu')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = link.getAttribute('data-page');
                navigateTo(targetPage);
            });
        }
    });
}

/**
 * 指定したページに移動
 * @param {string} pageName - 移動先のページ名
 */
function navigateTo(pageName) {
    // 現在のページを非アクティブにする
    document.getElementById(`${currentPage}-page`).classList.remove('active');
    document.querySelector(`.nav-menu a[data-page="${currentPage}"]`).classList.remove('active');
    
    // 新しいページをアクティブにする
    document.getElementById(`${pageName}-page`).classList.add('active');
    document.querySelector(`.nav-menu a[data-page="${pageName}"]`).classList.add('active');
    
    // モバイルメニューを閉じる
    navMenu.classList.remove('active');
    
    // 現在のページを更新
    currentPage = pageName;
    
    // ページ固有の初期化
    switch (pageName) {
        case 'home':
            updateHomePage();
            break;
        case 'record':
            initSleepCalendar();
            break;
        case 'stats':
            updateStatsPage();
            break;
        case 'goals':
            updateGoalsPage();
            break;
        case 'analysis':
            updateAnalysisPage();
            break;
        case 'sleepen':
            updateSleepenPage();
            break;
    }
}

/**
 * モーダルの設定
 */
function setupModal() {
    // モーダルを閉じる
    modalClose.addEventListener('click', closeModal);
    
    // モーダル外をクリックしても閉じる
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            closeModal();
        }
    });
}

/**
 * モーダルを開く
 * @param {string} title - モーダルのタイトル
 * @param {string|HTMLElement} content - モーダルの内容
 */
function openModal(title, content) {
    modalTitle.textContent = title;
    
    if (typeof content === 'string') {
        modalContent.innerHTML = content;
    } else {
        modalContent.innerHTML = '';
        modalContent.appendChild(content);
    }
    
    modalContainer.classList.add('active');
    
    // スクロールを防止
    document.body.style.overflow = 'hidden';
}

/**
 * モーダルを閉じる
 */
function closeModal() {
    modalContainer.classList.remove('active');
    
    // スクロールを再開
    document.body.style.overflow = '';
}

/**
 * 通知を表示
 * @param {string} message - 通知メッセージ
 * @param {string} type - 通知タイプ (success, warning, error, info)
 * @param {number} duration - 表示時間（ミリ秒）
 */
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notificationContainer.appendChild(notification);
    
    // 一定時間後に通知を削除
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

/**
 * オンライン/オフライン状態の監視
 */
function setupConnectivityMonitoring() {
    // オンラインになったとき
    window.addEventListener('online', () => {
        isOnline = true;
        showNotification('オンラインに戻りました。データを同期しています...', 'success');
        syncData();
    });
    
    // オフラインになったとき
    window.addEventListener('offline', () => {
        isOnline = false;
        showNotification('オフラインになりました。データはローカルに保存されます。', 'warning');
    });
}

/**
 * PWAインストールの設定
 */
function setupPWAInstall() {
    // インストールプロンプトを保存
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = 'block';
    });
    
    // インストールボタンのクリックイベント
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            showNotification('アプリがインストールされました！', 'success');
        }
        
        deferredPrompt = null;
        installBtn.style.display = 'none';
    });
    
    // インストール済みの場合はボタンを非表示
    window.addEventListener('appinstalled', () => {
        installBtn.style.display = 'none';
        deferredPrompt = null;
    });
}

/**
 * 初期データのロード
 */
async function loadInitialData() {
    try {
        // 睡眠データのロード
        const sleepResponse = await fetchWithFallback(`${API_BASE_URL}/sleep`);
        sleepData = await sleepResponse.json();
        
        // スリープンデータのロード
        const sleepenResponse = await fetchWithFallback(`${API_BASE_URL}/sleepen`);
        sleepenData = await sleepenResponse.json();
        
        console.log('初期データのロード完了');
    } catch (error) {
        console.error('初期データのロード中にエラーが発生しました:', error);
        showNotification('データのロード中にエラーが発生しました。', 'error');
        
        // オフラインの場合はローカルデータを使用
        if (!isOnline) {
            sleepData = loadFromLocalStorage('sleepData') || { records: [], goals: { sleepDuration: 8, bedtime: "23:00", wakeTime: "07:00" }, statistics: { averageSleepDuration: 0, sleepDebt: 0, averageQuality: 0, sleepEfficiency: 0 } };
            sleepenData = loadFromLocalStorage('sleepenData') || { name: "スリープン", level: 1, exp: 0, mood: 80, energy: 100, friendship: 50, evolutionStage: 1, skills: [], items: [], discoveredPlaces: [] };
        }
    }
}

/**
 * データの同期
 */
async function syncData() {
    if (!isOnline) return;
    
    try {
        // 睡眠データの同期
        const localSleepData = loadFromLocalStorage('sleepData');
        if (localSleepData && localSleepData.pendingRecords && localSleepData.pendingRecords.length > 0) {
            for (const record of localSleepData.pendingRecords) {
                await fetch(`${API_BASE_URL}/sleep/record`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record)
                });
            }
            
            // 同期後にローカルデータを更新
            const sleepResponse = await fetch(`${API_BASE_URL}/sleep`);
            sleepData = await sleepResponse.json();
            saveToLocalStorage('sleepData', sleepData);
            
            showNotification(`${localSleepData.pendingRecords.length}件の睡眠データを同期しました。`, 'success');
        }
        
        // スリープンデータの同期
        const localSleepenData = loadFromLocalStorage('sleepenData');
        if (localSleepenData && localSleepenData.pendingUpdates && localSleepenData.pendingUpdates.length > 0) {
            for (const update of localSleepenData.pendingUpdates) {
                await fetch(`${API_BASE_URL}/sleepen/update`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(update)
                });
            }
            
            // 同期後にローカルデータを更新
            const sleepenResponse = await fetch(`${API_BASE_URL}/sleepen`);
            sleepenData = await sleepenResponse.json();
            saveToLocalStorage('sleepenData', sleepenData);
            
            showNotification(`${localSleepenData.pendingUpdates.length}件のスリープンデータを同期しました。`, 'success');
        }
    } catch (error) {
        console.error('データの同期中にエラーが発生しました:', error);
        showNotification('データの同期中にエラーが発生しました。', 'error');
    }
}

/**
 * フォールバック付きのフェッチ
 * @param {string} url - フェッチするURL
 * @param {Object} options - フェッチオプション
 * @returns {Promise<Response>} レスポンス
 */
async function fetchWithFallback(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // レスポンスをローカルストレージに保存
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        
        if (url.includes('/sleep')) {
            saveToLocalStorage('sleepData', data);
        } else if (url.includes('/sleepen')) {
            saveToLocalStorage('sleepenData', data);
        }
        
        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        
        // オフラインの場合はローカルストレージから取得
        if (!isOnline) {
            let localData;
            
            if (url.includes('/sleep')) {
                localData = loadFromLocalStorage('sleepData');
            } else if (url.includes('/sleepen')) {
                localData = loadFromLocalStorage('sleepenData');
            }
            
            if (localData) {
                return new Response(JSON.stringify(localData), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }
        
        throw error;
    }
}

/**
 * ローカルストレージにデータを保存
 * @param {string} key - キー
 * @param {Object} data - 保存するデータ
 */
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('ローカルストレージへの保存中にエラーが発生しました:', error);
    }
}

/**
 * ローカルストレージからデータを読み込み
 * @param {string} key - キー
 * @returns {Object|null} 読み込んだデータ
 */
function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('ローカルストレージからの読み込み中にエラーが発生しました:', error);
        return null;
    }
}

/**
 * ホームページの更新
 */
function updateHomePage() {
    if (!sleepData || !sleepenData) return;
    
    // 今日の睡眠サマリー
    updateTodaySummary();
    
    // 睡眠統計
    updateStatsPreview();
    
    // スリープンプレビュー
    updateSleepenPreview();
    
    // 今日のヒント
    updateDailyTip();
}

/**
 * 今日の睡眠サマリーの更新
 */
function updateTodaySummary() {
    const todaySummary = document.getElementById('today-summary');
    const today = new Date().toISOString().split('T')[0];
    
    // 今日の記録を検索
    const todayRecord = sleepData.records.find(record => record.date === today);
    
    if (todayRecord) {
        todaySummary.innerHTML = `
            <div class="summary-item">
                <span class="summary-label">就寝時間</span>
                <span class="summary-value">${todayRecord.bedtime}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">起床時間</span>
                <span class="summary-value">${todayRecord.wakeTime}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">睡眠時間</span>
                <span class="summary-value">${todayRecord.duration}時間</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">睡眠の質</span>
                <span class="summary-value">${'★'.repeat(todayRecord.quality)}</span>
            </div>
        `;
    } else {
        todaySummary.innerHTML = `<p class="no-data-message">今日のデータはまだありません</p>`;
    }
}

/**
 * 睡眠統計プレビューの更新
 */
function updateStatsPreview() {
    document.getElementById('avg-duration').textContent = `${sleepData.statistics.averageSleepDuration}時間`;
    document.getElementById('sleep-debt').textContent = `${sleepData.statistics.sleepDebt}時間`;
    document.getElementById('avg-quality').textContent = `${sleepData.statistics.averageQuality}★`;
    document.getElementById('sleep-efficiency').textContent = `${sleepData.statistics.sleepEfficiency}%`;
}

/**
 * スリープンプレビューの更新
 */
function updateSleepenPreview() {
    document.getElementById('sleepen-name').textContent = sleepenData.name;
    document.getElementById('sleepen-level').textContent = `Lv.${sleepenData.level}`;
    document.getElementById('sleepen-image').src = `images/sleepen/stage${sleepenData.evolutionStage}.png`;
    
    document.getElementById('mood-bar').style.width = `${sleepenData.mood}%`;
    document.getElementById('energy-bar').style.width = `${sleepenData.energy}%`;
    document.getElementById('friendship-bar').style.width = `${sleepenData.friendship}%`;
}

/**
 * 今日のヒントの更新
 */
function updateDailyTip() {
    const dailyTip = document.getElementById('daily-tip');
    const tips = [
        "規則正しい睡眠スケジュールを維持することで、睡眠の質が向上します。毎日同じ時間に寝て、同じ時間に起きるようにしましょう。",
        "就寝前の30分間はブルーライトを避けましょう。スマートフォンやパソコンの使用を控え、リラックスする活動に切り替えましょう。",
        "寝室は涼しく、静かで、暗い環境に保ちましょう。理想的な睡眠温度は18〜20℃です。",
        "日中に適度な運動をすることで、夜の睡眠の質が向上します。ただし、就寝前の激しい運動は避けましょう。",
        "カフェインやアルコールは睡眠に悪影響を与えることがあります。就寝の4〜6時間前からは摂取を控えましょう。",
        "就寝前のリラクゼーション技術（深呼吸、瞑想、ストレッチなど）を試してみましょう。",
        "昼寝は15〜20分程度に抑えましょう。長すぎる昼寝は夜の睡眠に影響を与えることがあります。",
        "寝る前に軽い炭水化物を含むスナック（バナナ、全粒粉クラッカーなど）を食べると、睡眠ホルモンのメラトニンの生成を促進します。",
        "週末に「寝だめ」をしても睡眠負債は解消されません。毎日一定の睡眠時間を確保することが大切です。",
        "睡眠中に何度も目が覚める場合は、睡眠時無呼吸症候群などの睡眠障害の可能性があります。医師に相談しましょう。"
    ];
    
    // 日付に基づいてヒントを選択（毎日変わるように）
    const today = new Date();
    const tipIndex = (today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()) % tips.length;
    
    dailyTip.innerHTML = `<p>${tips[tipIndex]}</p>`;
}

/**
 * 日付をフォーマット
 * @param {Date} date - 日付
 * @returns {string} フォーマットされた日付（YYYY-MM-DD）
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 時間をフォーマット
 * @param {string} timeStr - 時間文字列（HH:MM）
 * @returns {Date} 日付オブジェクト
 */
function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
}

/**
 * 時間差を計算（時間単位）
 * @param {string} startTime - 開始時間（HH:MM）
 * @param {string} endTime - 終了時間（HH:MM）
 * @returns {number} 時間差（時間）
 */
function calculateTimeDifference(startTime, endTime) {
    const start = parseTime(startTime);
    let end = parseTime(endTime);
    
    // 終了時間が開始時間より前の場合（例：就寝23:00、起床06:00）
    if (end < start) {
        end.setDate(end.getDate() + 1);
    }
    
    const diffMs = end - start;
    return diffMs / (1000 * 60 * 60); // ミリ秒を時間に変換
}

/**
 * グローバル関数のエクスポート
 */
window.app = {
    openModal,
    closeModal,
    showNotification,
    formatDate,
    parseTime,
    calculateTimeDifference,
    navigateTo
};