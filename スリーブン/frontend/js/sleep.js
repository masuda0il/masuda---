/**
 * スリープセット - 睡眠記録機能
 */

// DOM要素
const sleepCalendar = document.getElementById('sleep-calendar');
const recordFormCard = document.getElementById('record-form-card');
const recordViewCard = document.getElementById('record-view-card');
const sleepRecordForm = document.getElementById('sleep-record-form');
const recordDate = document.getElementById('record-date');
const bedtime = document.getElementById('bedtime');
const wakeTime = document.getElementById('wake-time');
const timeInBed = document.getElementById('time-in-bed');
const sleepDuration = document.getElementById('sleep-duration');
const sleepNotes = document.getElementById('sleep-notes');
const challengesContainer = document.getElementById('challenges-container');
const addSleepBtn = document.getElementById('add-sleep-btn');
const cancelRecordBtn = document.getElementById('cancel-record');
const editRecordBtn = document.getElementById('edit-record');
const deleteRecordBtn = document.getElementById('delete-record');
const recordViewContent = document.getElementById('record-view-content');

// 現在の日付と選択された日付
let currentDate = new Date();
let selectedDate = null;
let editMode = false;

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // 睡眠記録ボタンのイベントリスナー
    addSleepBtn.addEventListener('click', () => {
        app.navigateTo('record');
        showRecordForm(new Date());
    });
    
    // フォームの送信イベント
    sleepRecordForm.addEventListener('submit', handleFormSubmit);
    
    // キャンセルボタンのイベント
    cancelRecordBtn.addEventListener('click', () => {
        hideRecordForm();
        if (selectedDate) {
            showRecordView(selectedDate);
        }
    });
    
    // 編集ボタンのイベント
    editRecordBtn.addEventListener('click', () => {
        if (selectedDate) {
            editMode = true;
            showRecordForm(selectedDate);
        }
    });
    
    // 削除ボタンのイベント
    deleteRecordBtn.addEventListener('click', () => {
        if (selectedDate) {
            confirmDeleteRecord(selectedDate);
        }
    });
    
    // 時間入力の変更イベント
    bedtime.addEventListener('change', calculateSleepDuration);
    wakeTime.addEventListener('change', calculateSleepDuration);
    timeInBed.addEventListener('change', validateTimeInBed);
    sleepDuration.addEventListener('change', validateSleepDuration);
});

/**
 * 睡眠カレンダーの初期化
 */
function initSleepCalendar() {
    if (!sleepData) return;
    
    // 現在の年月を取得
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // カレンダーを生成
    generateCalendar(year, month);
    
    // 記録フォームを非表示
    hideRecordForm();
    hideRecordView();
}

/**
 * カレンダーを生成
 * @param {number} year - 年
 * @param {number} month - 月（0-11）
 */
function generateCalendar(year, month) {
    // カレンダーのHTML
    let calendarHTML = `
        <div class="calendar-header">
            <button id="prev-month" class="btn icon-btn"><span class="material-icons">chevron_left</span></button>
            <h3>${year}年${month + 1}月</h3>
            <button id="next-month" class="btn icon-btn"><span class="material-icons">chevron_right</span></button>
        </div>
        <table class="calendar">
            <thead>
                <tr>
                    <th>日</th>
                    <th>月</th>
                    <th>火</th>
                    <th>水</th>
                    <th>木</th>
                    <th>金</th>
                    <th>土</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // 月の最初の日の曜日（0:日曜日, 1:月曜日, ..., 6:土曜日）
    const firstDay = new Date(year, month, 1).getDay();
    
    // 月の日数
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // 日付を配置
    let date = 1;
    for (let i = 0; i < 6; i++) {
        calendarHTML += '<tr>';
        
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                // 月の最初の週の空白
                calendarHTML += '<td></td>';
            } else if (date > daysInMonth) {
                // 月の最後の週の空白
                calendarHTML += '<td></td>';
            } else {
                // 日付
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                const isToday = dateStr === app.formatDate(new Date());
                
                // 睡眠データがあるかチェック
                const record = sleepData.records.find(r => r.date === dateStr);
                let classNames = '';
                
                if (isToday) classNames += ' today';
                if (record) {
                    classNames += ` has-data quality-${record.quality}`;
                }
                
                calendarHTML += `<td class="${classNames}" data-date="${dateStr}">${date}</td>`;
                date++;
            }
        }
        
        calendarHTML += '</tr>';
        
        // 月の日数を超えたら終了
        if (date > daysInMonth) {
            break;
        }
    }
    
    calendarHTML += `
            </tbody>
        </table>
    `;
    
    // カレンダーを表示
    sleepCalendar.innerHTML = calendarHTML;
    
    // 前月・次月ボタンのイベントリスナー
    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        initSleepCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        initSleepCalendar();
    });
    
    // 日付クリックのイベントリスナー
    document.querySelectorAll('.calendar td[data-date]').forEach(cell => {
        cell.addEventListener('click', () => {
            const dateStr = cell.getAttribute('data-date');
            const date = new Date(dateStr);
            
            // 選択された日付の記録を表示
            selectedDate = date;
            const record = sleepData.records.find(r => r.date === dateStr);
            
            if (record) {
                showRecordView(date);
            } else {
                showRecordForm(date);
            }
        });
    });
}

/**
 * 記録フォームを表示
 * @param {Date} date - 日付
 */
function showRecordForm(date) {
    // 日付をフォーマット
    const dateStr = app.formatDate(date);
    
    // フォームをリセット
    sleepRecordForm.reset();
    
    // 日付を設定
    recordDate.value = dateStr;
    
    // 編集モードの場合は既存のデータを設定
    if (editMode) {
        const record = sleepData.records.find(r => r.date === dateStr);
        
        if (record) {
            bedtime.value = record.bedtime;
            wakeTime.value = record.wakeTime;
            timeInBed.value = record.timeInBed;
            sleepDuration.value = record.duration;
            
            // 睡眠の質
            document.querySelector(`input[name="sleep-quality"][value="${record.quality}"]`).checked = true;
            
            // メモ
            sleepNotes.value = record.notes || '';
            
            // チャレンジ
            updateChallenges(record.challengesCompleted || []);
        }
    } else {
        // デフォルト値を設定
        bedtime.value = sleepData.goals.bedtime;
        wakeTime.value = sleepData.goals.wakeTime;
        timeInBed.value = '';
        sleepDuration.value = '';
        
        // チャレンジを更新
        updateChallenges([]);
    }
    
    // フォームを表示
    recordFormCard.style.display = 'block';
    recordViewCard.style.display = 'none';
}

/**
 * 記録フォームを非表示
 */
function hideRecordForm() {
    recordFormCard.style.display = 'none';
    editMode = false;
}

/**
 * 記録詳細を表示
 * @param {Date} date - 日付
 */
function showRecordView(date) {
    // 日付をフォーマット
    const dateStr = app.formatDate(date);
    
    // 記録を検索
    const record = sleepData.records.find(r => r.date === dateStr);
    
    if (record) {
        // 記録の詳細を表示
        recordViewContent.innerHTML = `
            <div class="record-detail">
                <div class="record-item">
                    <span class="record-label">日付</span>
                    <span class="record-value">${record.date}</span>
                </div>
                <div class="record-item">
                    <span class="record-label">就寝時間</span>
                    <span class="record-value">${record.bedtime}</span>
                </div>
                <div class="record-item">
                    <span class="record-label">起床時間</span>
                    <span class="record-value">${record.wakeTime}</span>
                </div>
                <div class="record-item">
                    <span class="record-label">ベッドで過ごした時間</span>
                    <span class="record-value">${record.timeInBed}時間</span>
                </div>
                <div class="record-item">
                    <span class="record-label">実際に眠った時間</span>
                    <span class="record-value">${record.duration}時間</span>
                </div>
                <div class="record-item">
                    <span class="record-label">睡眠の質</span>
                    <span class="record-value">${'★'.repeat(record.quality)}</span>
                </div>
                ${record.notes ? `
                <div class="record-item">
                    <span class="record-label">メモ</span>
                    <span class="record-value">${record.notes}</span>
                </div>
                ` : ''}
                ${record.challengesCompleted && record.challengesCompleted.length > 0 ? `
                <div class="record-item">
                    <span class="record-label">完了したチャレンジ</span>
                    <ul class="challenges-list">
                        ${record.challengesCompleted.map(challenge => `<li>${challenge}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        `;
        
        // 詳細を表示
        recordViewCard.style.display = 'block';
        recordFormCard.style.display = 'none';
    }
}

/**
 * 記録詳細を非表示
 */
function hideRecordView() {
    recordViewCard.style.display = 'none';
}

/**
 * フォーム送信処理
 * @param {Event} e - イベント
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // フォームデータを取得
    const date = recordDate.value;
    const bedtimeValue = bedtime.value;
    const wakeTimeValue = wakeTime.value;
    const timeInBedValue = parseFloat(timeInBed.value);
    const durationValue = parseFloat(sleepDuration.value);
    const quality = parseInt(document.querySelector('input[name="sleep-quality"]:checked').value);
    const notes = sleepNotes.value;
    
    // チャレンジを取得
    const challengesCompleted = [];
    document.querySelectorAll('#challenges-container input[type="checkbox"]:checked').forEach(checkbox => {
        challengesCompleted.push(checkbox.value);
    });
    
    // 記録データを作成
    const record = {
        date,
        bedtime: bedtimeValue,
        wakeTime: wakeTimeValue,
        timeInBed: timeInBedValue,
        duration: durationValue,
        quality,
        notes,
        challengesCompleted
    };
    
    try {
        if (editMode) {
            // 既存の記録を更新
            await updateSleepRecord(date, record);
            app.showNotification('睡眠記録を更新しました。', 'success');
        } else {
            // 新しい記録を追加
            await addSleepRecord(record);
            app.showNotification('睡眠記録を追加しました。', 'success');
        }
        
        // カレンダーを更新
        initSleepCalendar();
        
        // 記録詳細を表示
        showRecordView(new Date(date));
        
        // ホームページも更新
        if (date === app.formatDate(new Date())) {
            updateHomePage();
        }
    } catch (error) {
        console.error('睡眠記録の保存中にエラーが発生しました:', error);
        app.showNotification('睡眠記録の保存中にエラーが発生しました。', 'error');
    }
}

/**
 * 睡眠記録を追加
 * @param {Object} record - 記録データ
 */
async function addSleepRecord(record) {
    try {
        const response = await fetch(`${API_BASE_URL}/sleep/record`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(record)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // 睡眠データを更新
        sleepData.records.push(record);
        sleepData.statistics = result.statistics || sleepData.statistics;
        
        // ローカルストレージに保存
        saveToLocalStorage('sleepData', sleepData);
    } catch (error) {
        console.error('睡眠記録の追加中にエラーが発生しました:', error);
        
        // オフラインの場合はローカルに保存
        if (!navigator.onLine) {
            // 保留中の記録を追加
            if (!sleepData.pendingRecords) {
                sleepData.pendingRecords = [];
            }
            
            sleepData.pendingRecords.push(record);
            sleepData.records.push(record);
            
            // ローカルストレージに保存
            saveToLocalStorage('sleepData', sleepData);
            
            app.showNotification('オフラインモード: 記録はローカルに保存され、オンラインになったときに同期されます。', 'info');
        } else {
            throw error;
        }
    }
}

/**
 * 睡眠記録を更新
 * @param {string} date - 日付
 * @param {Object} record - 記録データ
 */
async function updateSleepRecord(date, record) {
    try {
        const response = await fetch(`${API_BASE_URL}/sleep/record/${date}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(record)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // 睡眠データを更新
        const index = sleepData.records.findIndex(r => r.date === date);
        if (index !== -1) {
            sleepData.records[index] = record;
        }
        
        sleepData.statistics = result.statistics || sleepData.statistics;
        
        // ローカルストレージに保存
        saveToLocalStorage('sleepData', sleepData);
    } catch (error) {
        console.error('睡眠記録の更新中にエラーが発生しました:', error);
        
        // オフラインの場合はローカルに保存
        if (!navigator.onLine) {
            // 保留中の更新を追加
            if (!sleepData.pendingUpdates) {
                sleepData.pendingUpdates = [];
            }
            
            sleepData.pendingUpdates.push({
                date,
                record
            });
            
            // ローカルデータを更新
            const index = sleepData.records.findIndex(r => r.date === date);
            if (index !== -1) {
                sleepData.records[index] = record;
            }
            
            // ローカルストレージに保存
            saveToLocalStorage('sleepData', sleepData);
            
            app.showNotification('オフラインモード: 更新はローカルに保存され、オンラインになったときに同期されます。', 'info');
        } else {
            throw error;
        }
    }
}

/**
 * 睡眠記録を削除
 * @param {string} date - 日付
 */
async function deleteSleepRecord(date) {
    try {
        const response = await fetch(`${API_BASE_URL}/sleep/record/${date}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // 睡眠データを更新
        sleepData.records = sleepData.records.filter(r => r.date !== date);
        sleepData.statistics = result.statistics || sleepData.statistics;
        
        // ローカルストレージに保存
        saveToLocalStorage('sleepData', sleepData);
        
        // カレンダーを更新
        initSleepCalendar();
        
        // フォームと詳細を非表示
        hideRecordForm();
        hideRecordView();
        
        app.showNotification('睡眠記録を削除しました。', 'success');
    } catch (error) {
        console.error('睡眠記録の削除中にエラーが発生しました:', error);
        app.showNotification('睡眠記録の削除中にエラーが発生しました。', 'error');
    }
}

/**
 * 睡眠記録の削除確認
 * @param {Date} date - 日付
 */
function confirmDeleteRecord(date) {
    const dateStr = app.formatDate(date);
    
    const content = `
        <p>この日付の睡眠記録を削除してもよろしいですか？</p>
        <p>日付: ${dateStr}</p>
        <div class="form-actions">
            <button id="confirm-delete" class="btn danger-btn">削除</button>
            <button id="cancel-delete" class="btn secondary-btn">キャンセル</button>
        </div>
    `;
    
    app.openModal('記録の削除', content);
    
    // 削除確認ボタンのイベントリスナー
    document.getElementById('confirm-delete').addEventListener('click', () => {
        deleteSleepRecord(dateStr);
        app.closeModal();
    });
    
    // キャンセルボタンのイベントリスナー
    document.getElementById('cancel-delete').addEventListener('click', () => {
        app.closeModal();
    });
}

/**
 * 睡眠時間を計算
 */
function calculateSleepDuration() {
    if (bedtime.value && wakeTime.value) {
        const duration = app.calculateTimeDifference(bedtime.value, wakeTime.value);
        
        // ベッドで過ごした時間を設定
        timeInBed.value = duration.toFixed(1);
        
        // 実際に眠った時間のデフォルト値（ベッドで過ごした時間の90%）
        sleepDuration.value = (duration * 0.9).toFixed(1);
    }
}

/**
 * ベッドで過ごした時間のバリデーション
 */
function validateTimeInBed() {
    if (bedtime.value && wakeTime.value && timeInBed.value) {
        const maxDuration = app.calculateTimeDifference(bedtime.value, wakeTime.value);
        const timeInBedValue = parseFloat(timeInBed.value);
        
        if (timeInBedValue > maxDuration) {
            app.showNotification('ベッドで過ごした時間は就寝時間と起床時間の間隔を超えることはできません。', 'warning');
            timeInBed.value = maxDuration.toFixed(1);
        }
    }
}

/**
 * 実際に眠った時間のバリデーション
 */
function validateSleepDuration() {
    if (timeInBed.value && sleepDuration.value) {
        const timeInBedValue = parseFloat(timeInBed.value);
        const sleepDurationValue = parseFloat(sleepDuration.value);
        
        if (sleepDurationValue > timeInBedValue) {
            app.showNotification('実際に眠った時間はベッドで過ごした時間を超えることはできません。', 'warning');
            sleepDuration.value = timeInBedValue.toFixed(1);
        }
    }
}

/**
 * チャレンジを更新
 * @param {Array} completedChallenges - 完了したチャレンジ
 */
function updateChallenges(completedChallenges) {
    // 日々のチャレンジ
    const challenges = [
        "就寝前30分間はスクリーンを見ない",
        "就寝時間を目標時間通りに守る",
        "起床時間を目標時間通りに守る",
        "就寝前にリラクゼーション活動を行う",
        "カフェインを午後に摂取しない",
        "寝室の温度を18〜20℃に保つ",
        "寝室を暗く、静かに保つ",
        "就寝前のアルコール摂取を避ける",
        "日中に適度な運動をする",
        "就寝前の大食を避ける"
    ];
    
    // チャレンジのHTML
    let challengesHTML = '';
    
    challenges.forEach(challenge => {
        const isCompleted = completedChallenges.includes(challenge);
        
        challengesHTML += `
            <div class="challenge-item">
                <input type="checkbox" id="challenge-${challenges.indexOf(challenge)}" name="challenges" value="${challenge}" ${isCompleted ? 'checked' : ''}>
                <label for="challenge-${challenges.indexOf(challenge)}">${challenge}</label>
            </div>
        `;
    });
    
    // チャレンジを表示
    challengesContainer.innerHTML = challengesHTML;
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