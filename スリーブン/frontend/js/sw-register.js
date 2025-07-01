/**
 * スリープセット - サービスワーカー登録
 */

// サービスワーカーが利用可能かチェック
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('サービスワーカーが登録されました:', registration.scope);
            })
            .catch(error => {
                console.error('サービスワーカーの登録に失敗しました:', error);
            });
    });
}