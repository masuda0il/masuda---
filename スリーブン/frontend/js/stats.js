/**
 * スリープセット - 睡眠統計機能
 */

// チャートオブジェクト
let durationChart = null;
let qualityChart = null;
let efficiencyChart = null;

// DOM要素
const statsAvgDuration = document.getElementById('stats-avg-duration');
const statsSleepDebt = document.getElementById('stats-sleep-debt');
const statsAvgQuality = document.getElementById('stats-avg-quality');
const statsSleepEfficiency = document.getElementById('stats-sleep-efficiency');
const optimalPattern = document.getElementById('optimal-pattern');

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // Chart.jsの設定
    Chart.defaults.color = '#333333';
    Chart.defaults.font.family = "'M PLUS Rounded 1c', sans-serif";
});

/**
 * 統計ページの更新
 */
function updateStatsPage() {
    if (!sleepData) return;
    
    // 統計データを表示
    updateStatistics();
    
    // チャートを更新
    updateCharts();
    
    // 最適な睡眠パターンを更新
    updateOptimalPattern();
}

/**
 * 統計データの更新
 */
function updateStatistics() {
    statsAvgDuration.textContent = `${sleepData.statistics.averageSleepDuration}時間`;
    statsSleepDebt.textContent = `${sleepData.statistics.sleepDebt}時間`;
    statsAvgQuality.textContent = `${sleepData.statistics.averageQuality}★`;
    statsSleepEfficiency.textContent = `${sleepData.statistics.sleepEfficiency}%`;
}

/**
 * チャートの更新
 */
function updateCharts() {
    // 記録が少ない場合は処理しない
    if (sleepData.records.length < 3) {
        document.querySelectorAll('.chart-container').forEach(container => {
            container.innerHTML = '<p class="no-data-message">データが不足しています。より多くの睡眠データを記録してください。</p>';
        });
        return;
    }
    
    // 最新の14日分のデータを取得
    const records = [...sleepData.records]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-14);
    
    // データの準備
    const dates = records.map(record => formatDateForDisplay(record.date));
    const durations = records.map(record => record.duration);
    const qualities = records.map(record => record.quality);
    const efficiencies = records.map(record => (record.duration / record.timeInBed * 100).toFixed(1));
    
    // 睡眠時間チャート
    updateDurationChart(dates, durations);
    
    // 睡眠の質チャート
    updateQualityChart(dates, qualities);
    
    // 睡眠効率チャート
    updateEfficiencyChart(dates, efficiencies);
}

/**
 * 睡眠時間チャートの更新
 * @param {Array} dates - 日付の配列
 * @param {Array} durations - 睡眠時間の配列
 */
function updateDurationChart(dates, durations) {
    const ctx = document.getElementById('duration-chart').getContext('2d');
    
    // 目標睡眠時間
    const targetDuration = sleepData.goals.sleepDuration;
    const targetLine = Array(dates.length).fill(targetDuration);
    
    // 既存のチャートを破棄
    if (durationChart) {
        durationChart.destroy();
    }
    
    // 新しいチャートを作成
    durationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: '睡眠時間',
                    data: durations,
                    backgroundColor: 'rgba(67, 97, 238, 0.2)',
                    borderColor: 'rgba(67, 97, 238, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: '目標',
                    data: targetLine,
                    borderColor: 'rgba(244, 67, 54, 0.7)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: Math.max(...durations, targetDuration) + 1,
                    title: {
                        display: true,
                        text: '時間'
                    }
                }
            }
        }
    });
}

/**
 * 睡眠の質チャートの更新
 * @param {Array} dates - 日付の配列
 * @param {Array} qualities - 睡眠の質の配列
 */
function updateQualityChart(dates, qualities) {
    const ctx = document.getElementById('quality-chart').getContext('2d');
    
    // 既存のチャートを破棄
    if (qualityChart) {
        qualityChart.destroy();
    }
    
    // 新しいチャートを作成
    qualityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [
                {
                    label: '睡眠の質',
                    data: qualities,
                    backgroundColor: qualities.map(quality => {
                        if (quality <= 1) return 'rgba(244, 67, 54, 0.7)';
                        if (quality <= 2) return 'rgba(255, 152, 0, 0.7)';
                        if (quality <= 3) return 'rgba(67, 97, 238, 0.7)';
                        if (quality <= 4) return 'rgba(76, 175, 80, 0.7)';
                        return 'rgba(156, 39, 176, 0.7)';
                    }),
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const quality = context.raw;
                            return `睡眠の質: ${quality}★`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    },
                    title: {
                        display: true,
                        text: '評価（星）'
                    }
                }
            }
        }
    });
}

/**
 * 睡眠効率チャートの更新
 * @param {Array} dates - 日付の配列
 * @param {Array} efficiencies - 睡眠効率の配列
 */
function updateEfficiencyChart(dates, efficiencies) {
    const ctx = document.getElementById('efficiency-chart').getContext('2d');
    
    // 既存のチャートを破棄
    if (efficiencyChart) {
        efficiencyChart.destroy();
    }
    
    // 新しいチャートを作成
    efficiencyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: '睡眠効率',
                    data: efficiencies,
                    backgroundColor: 'rgba(76, 201, 240, 0.2)',
                    borderColor: 'rgba(76, 201, 240, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const efficiency = context.raw;
                            return `睡眠効率: ${efficiency}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: '効率（%）'
                    }
                }
            }
        }
    });
}

/**
 * 最適な睡眠パターンの更新
 */
function updateOptimalPattern() {
    // 記録が少ない場合は処理しない
    if (sleepData.records.length < 7) {
        optimalPattern.innerHTML = '<p class="no-data-message">データが不足しています。より多くの睡眠データを記録してください。</p>';
        return;
    }
    
    // 睡眠の質が高い記録を抽出（4以上）
    const goodRecords = sleepData.records.filter(record => record.quality >= 4);
    
    if (goodRecords.length < 3) {
        optimalPattern.innerHTML = '<p class="no-data-message">高品質の睡眠データが不足しています。より多くの睡眠データを記録してください。</p>';
        return;
    }
    
    // 最適な睡眠時間を計算
    const avgDuration = goodRecords.reduce((sum, record) => sum + record.duration, 0) / goodRecords.length;
    
    // 最適な就寝時間と起床時間を計算
    const bedtimes = goodRecords.map(record => convertTimeToMinutes(record.bedtime));
    const waketimes = goodRecords.map(record => convertTimeToMinutes(record.wakeTime));
    
    const avgBedtime = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length;
    const avgWaketime = waketimes.reduce((sum, time) => sum + time, 0) / waketimes.length;
    
    // 分を時間と分に変換
    const optimalBedtime = convertMinutesToTime(avgBedtime);
    const optimalWaketime = convertMinutesToTime(avgWaketime);
    
    // 最適な睡眠パターンを表示
    optimalPattern.innerHTML = `
        <div class="optimal-pattern-content">
            <p>あなたの睡眠データに基づいて、以下の睡眠パターンが最適です：</p>
            <div class="optimal-item">
                <span class="optimal-label">最適な睡眠時間</span>
                <span class="optimal-value">${avgDuration.toFixed(1)}時間</span>
            </div>
            <div class="optimal-item">
                <span class="optimal-label">最適な就寝時間</span>
                <span class="optimal-value">${optimalBedtime}</span>
            </div>
            <div class="optimal-item">
                <span class="optimal-label">最適な起床時間</span>
                <span class="optimal-value">${optimalWaketime}</span>
            </div>
            <p class="optimal-note">この睡眠パターンは、あなたが高品質の睡眠を取った日のデータに基づいています。</p>
        </div>
    `;
}

/**
 * 時間を分に変換
 * @param {string} timeStr - 時間文字列（HH:MM）
 * @returns {number} 分
 */
function convertTimeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes;
    
    // 深夜の時間（00:00〜06:00）は24時間を加算して比較しやすくする
    if (hours < 6) {
        totalMinutes += 24 * 60;
    }
    
    return totalMinutes;
}

/**
 * 分を時間文字列に変換
 * @param {number} minutes - 分
 * @returns {string} 時間文字列（HH:MM）
 */
function convertMinutesToTime(minutes) {
    // 24時間を超える場合は調整
    minutes = minutes % (24 * 60);
    
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * 日付を表示用にフォーマット
 * @param {string} dateStr - 日付文字列（YYYY-MM-DD）
 * @returns {string} フォーマットされた日付（MM/DD）
 */
function formatDateForDisplay(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${month}/${day}`;
}