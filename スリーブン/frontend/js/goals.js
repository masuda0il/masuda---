/**
 * スリープセット - 睡眠目標機能
 */

// DOM要素
const goalsForm = document.getElementById('goals-form');
const goalSleepDuration = document.getElementById('goal-sleep-duration');
const goalBedtime = document.getElementById('goal-bedtime');
const goalWakeTime = document.getElementById('goal-wake-time');
const durationGoalValue = document.getElementById('duration-goal-value');
const durationGoalProgress = document.getElementById('duration-goal-progress');
const durationGoalPercentage = document.getElementById('duration-goal-percentage');
const bedtimeGoalValue = document.getElementById('bedtime-goal-value');
const bedtimeGoalProgress = document.getElementById('bedtime-goal-progress');
const bedtimeGoalPercentage = document.getElementById('bedtime-goal-percentage');
const wakeTimeGoalValue = document.getElementById('wake-time-goal-value');
const wakeTimeGoalProgress = document.getElementById('wake-time-goal-progress');
const wakeTimeGoalPercentage = document.getElementById('wake-time-goal-percentage');

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // 目標フォームの送信イベント
    goalsForm.addEventListener('submit', handleGoalsSubmit);
    
    // 目標睡眠時間の変更イベント
    goalSleepDuration.addEventListener('input', validateSleepDuration);
    
    // 目標就寝時間と起床時間の変更イベント
    goalBedtime.addEventListener('change', validateBedtime);
    goalWakeTime.addEventListener('change', validateWakeTime);
});

/**
 * 目標ページの更新
 */
function updateGoalsPage() {
    if (!sleepData) return;
    
    // 目標フォームの値を設定
    goalSleepDuration.value = sleepData.goals.sleepDuration;
    goalBedtime.value = sleepData.goals.bedtime;
    goalWakeTime.value = sleepData.goals.wakeTime;
    
    // 目標達成状況を更新
    updateGoalsProgress();
}

/**
 * 目標達成状況の更新
 */
function updateGoalsProgress() {
    // 記録が少ない場合は処理しない
    if (sleepData.records.length === 0) {
        document.querySelectorAll('.goal-progress-item').forEach(item => {
            const progressBar = item.querySelector('.progress');
            const percentage = item.querySelector('.goal-percentage');
            
            progressBar.style.width = '0%';
            percentage.textContent = '0%';
        });
        return;
    }
    
    // 最新の7日分のデータを取得
    const recentRecords = [...sleepData.records]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 7);
    
    // 目標値を表示
    durationGoalValue.textContent = `${sleepData.goals.sleepDuration}時間`;
    bedtimeGoalValue.textContent = sleepData.goals.bedtime;
    wakeTimeGoalValue.textContent = sleepData.goals.wakeTime;
    
    // 睡眠時間の目標達成率
    const durationAchievement = calculateDurationAchievement(recentRecords);
    durationGoalProgress.style.width = `${durationAchievement}%`;
    durationGoalPercentage.textContent = `${durationAchievement}%`;
    
    // 就寝時間の目標達成率
    const bedtimeAchievement = calculateBedtimeAchievement(recentRecords);
    bedtimeGoalProgress.style.width = `${bedtimeAchievement}%`;
    bedtimeGoalPercentage.textContent = `${bedtimeAchievement}%`;
    
    // 起床時間の目標達成率
    const wakeTimeAchievement = calculateWakeTimeAchievement(recentRecords);
    wakeTimeGoalProgress.style.width = `${wakeTimeAchievement}%`;
    wakeTimeGoalPercentage.textContent = `${wakeTimeAchievement}%`;
}

/**
 * 睡眠時間の目標達成率を計算
 * @param {Array} records - 睡眠記録の配列
 * @returns {number} 達成率（%）
 */
function calculateDurationAchievement(records) {
    if (records.length === 0) return 0;
    
    const targetDuration = sleepData.goals.sleepDuration;
    let achievedCount = 0;
    
    records.forEach(record => {
        // 目標の90%以上を達成していれば成功とみなす
        if (record.duration >= targetDuration * 0.9) {
            achievedCount++;
        }
    });
    
    return Math.round((achievedCount / records.length) * 100);
}

/**
 * 就寝時間の目標達成率を計算
 * @param {Array} records - 睡眠記録の配列
 * @returns {number} 達成率（%）
 */
function calculateBedtimeAchievement(records) {
    if (records.length === 0) return 0;
    
    const targetBedtime = convertTimeToMinutes(sleepData.goals.bedtime);
    let achievedCount = 0;
    
    records.forEach(record => {
        const actualBedtime = convertTimeToMinutes(record.bedtime);
        
        // 目標就寝時間の30分以内であれば成功とみなす
        // 目標が23:00で、実際が22:30〜23:30の範囲内ならOK
        if (Math.abs(actualBedtime - targetBedtime) <= 30) {
            achievedCount++;
        }
    });
    
    return Math.round((achievedCount / records.length) * 100);
}

/**
 * 起床時間の目標達成率を計算
 * @param {Array} records - 睡眠記録の配列
 * @returns {number} 達成率（%）
 */
function calculateWakeTimeAchievement(records) {
    if (records.length === 0) return 0;
    
    const targetWakeTime = convertTimeToMinutes(sleepData.goals.wakeTime);
    let achievedCount = 0;
    
    records.forEach(record => {
        const actualWakeTime = convertTimeToMinutes(record.wakeTime);
        
        // 目標起床時間の30分以内であれば成功とみなす
        // 目標が7:00で、実際が6:30〜7:30の範囲内ならOK
        if (Math.abs(actualWakeTime - targetWakeTime) <= 30) {
            achievedCount++;
        }
    });
    
    return Math.round((achievedCount / records.length) * 100);
}

/**
 * 目標フォームの送信処理
 * @param {Event} e - イベント
 */
async function handleGoalsSubmit(e) {
    e.preventDefault();
    
    // フォームデータを取得
    const sleepDuration = parseFloat(goalSleepDuration.value);
    const bedtimeValue = goalBedtime.value;
    const wakeTimeValue = goalWakeTime.value;
    
    // 目標データを作成
    const goals = {
        sleepDuration,
        bedtime: bedtimeValue,
        wakeTime: wakeTimeValue
    };
    
    try {
        // 目標を更新
        await updateSleepGoals(goals);
        
        // 目標達成状況を更新
        updateGoalsProgress();
        
        app.showNotification('睡眠目標を更新しました。', 'success');
    } catch (error) {
        console.error('睡眠目標の更新中にエラーが発生しました:', error);
        app.showNotification('睡眠目標の更新中にエラーが発生しました。', 'error');
    }
}

/**
 * 睡眠目標を更新
 * @param {Object} goals - 目標データ
 */
async function updateSleepGoals(goals) {
    try {
        const response = await fetch(`${API_BASE_URL}/sleep/goals`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(goals)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // 睡眠データを更新
        sleepData.goals = goals;
        
        // ローカルストレージに保存
        saveToLocalStorage('sleepData', sleepData);
    } catch (error) {
        console.error('睡眠目標の更新中にエラーが発生しました:', error);
        
        // オフラインの場合はローカルに保存
        if (!navigator.onLine) {
            // ローカルデータを更新
            sleepData.goals = goals;
            
            // ローカルストレージに保存
            saveToLocalStorage('sleepData', sleepData);
            
            app.showNotification('オフラインモード: 目標はローカルに保存され、オンラインになったときに同期されます。', 'info');
        } else {
            throw error;
        }
    }
}

/**
 * 目標睡眠時間のバリデーション
 */
function validateSleepDuration() {
    const value = parseFloat(goalSleepDuration.value);
    
    if (value < 4) {
        app.showNotification('目標睡眠時間は最低4時間以上に設定してください。', 'warning');
        goalSleepDuration.value = 4;
    } else if (value > 12) {
        app.showNotification('目標睡眠時間は最大12時間以下に設定してください。', 'warning');
        goalSleepDuration.value = 12;
    }
}

/**
 * 目標就寝時間のバリデーション
 */
function validateBedtime() {
    if (goalBedtime.value && goalWakeTime.value) {
        const bedtimeMinutes = convertTimeToMinutes(goalBedtime.value);
        const wakeTimeMinutes = convertTimeToMinutes(goalWakeTime.value);
        
        // 就寝時間と起床時間の差が4時間未満の場合
        const timeDiff = (wakeTimeMinutes - bedtimeMinutes + 24 * 60) % (24 * 60);
        
        if (timeDiff < 4 * 60) {
            app.showNotification('就寝時間と起床時間の間隔は最低4時間以上必要です。', 'warning');
            
            // 就寝時間を4時間前に設定
            const newBedtimeMinutes = (wakeTimeMinutes - 4 * 60 + 24 * 60) % (24 * 60);
            goalBedtime.value = convertMinutesToTime(newBedtimeMinutes);
        }
    }
}

/**
 * 目標起床時間のバリデーション
 */
function validateWakeTime() {
    if (goalBedtime.value && goalWakeTime.value) {
        const bedtimeMinutes = convertTimeToMinutes(goalBedtime.value);
        const wakeTimeMinutes = convertTimeToMinutes(goalWakeTime.value);
        
        // 就寝時間と起床時間の差が4時間未満の場合
        const timeDiff = (wakeTimeMinutes - bedtimeMinutes + 24 * 60) % (24 * 60);
        
        if (timeDiff < 4 * 60) {
            app.showNotification('就寝時間と起床時間の間隔は最低4時間以上必要です。', 'warning');
            
            // 起床時間を4時間後に設定
            const newWakeTimeMinutes = (bedtimeMinutes + 4 * 60) % (24 * 60);
            goalWakeTime.value = convertMinutesToTime(newWakeTimeMinutes);
        }
    }
}

/**
 * 時間を分に変換
 * @param {string} timeStr - 時間文字列（HH:MM）
 * @returns {number} 分
 */
function convertTimeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes;
    
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