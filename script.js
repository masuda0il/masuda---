document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const currentDayElement = document.getElementById('current-day');
    const progressFillElement = document.getElementById('progress-fill');
    const programCalendarElement = document.getElementById('program-calendar');
    const MAX_CALENDAR_DAYS = 42; // 6 weeks (6x7) for calendar display
    const currentDateElement = document.getElementById('current-date');
    const avgSleepTimeElement = document.getElementById('avg-sleep-time');
    const sleepDebtElement = document.getElementById('sleep-debt');
    const avgSleepQualityElement = document.getElementById('avg-sleep-quality');
    const sleepEfficiencyElement = document.getElementById('sleep-efficiency');
    const optimalSleepTimeElement = document.getElementById('optimal-sleep-time');
    const optimalBedtimeElement = document.getElementById('optimal-bedtime');
    const optimalWakeTimeElement = document.getElementById('optimal-wake-time');
    
    // Sleep Goals Elements
    const sleepDurationGoalInput = document.getElementById('sleep-duration-goal');
    const sleepDurationProgressElement = document.getElementById('sleep-duration-progress');
    const sleepDurationPercentageElement = document.getElementById('sleep-duration-percentage');
    const bedtimeGoalInput = document.getElementById('bedtime-goal');
    const bedtimeProgressElement = document.getElementById('bedtime-progress');
    const bedtimePercentageElement = document.getElementById('bedtime-percentage');
    const wakeTimeGoalInput = document.getElementById('wake-time-goal');
    const wakeTimeProgressElement = document.getElementById('wake-time-progress');
    const wakeTimePercentageElement = document.getElementById('wake-time-percentage');
    const saveGoalsButton = document.getElementById('save-goals');
    const bedInTimeInput = document.getElementById('bed-in-time');
    const bedOutTimeInput = document.getElementById('bed-out-time');
    const bedtimeInput = document.getElementById('bedtime');
    const wakeTimeInput = document.getElementById('wake-time');
    const sleepQualityInput = document.getElementById('sleep-quality');
    const sleepNotesInput = document.getElementById('sleep-notes');
    const saveSleepDataButton = document.getElementById('save-sleep-data');
    const ratingStars = document.querySelectorAll('.rating i');
    
    // Sleep Reflection Elements
    const morningFeelingInput = document.getElementById('morning-feeling');
    const morningFeelingRatingStars = document.querySelectorAll('#morning-feeling-rating i');
    const sleepWorkedWellInput = document.getElementById('sleep-worked-well');
    const sleepImproveInput = document.getElementById('sleep-improve');
    const sleepNextGoalInput = document.getElementById('sleep-next-goal');
    const saveReflectionButton = document.getElementById('save-reflection');
    const tipTitleElement = document.getElementById('tip-title');
    const tipTextElement = document.getElementById('tip-text');
    const challengeTitleElement = document.getElementById('challenge-title');
    const challengeTextElement = document.getElementById('challenge-text');
    const challengeCompletedCheckbox = document.getElementById('challenge-completed');
    const settingsButton = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeModalButton = document.querySelector('.close-btn');
    const idealSleepTimeInput = document.getElementById('ideal-sleep-time');
    const bedtimeReminderInput = document.getElementById('bedtime-reminder');
    const resetProgramButton = document.getElementById('reset-program');
    const saveSettingsButton = document.getElementById('save-settings');
    const sleepChartCanvas = document.getElementById('sleep-chart');

    // App State
    let sleepData = [];
    let currentDay = 1;
    let settings = {
        idealSleepTime: 8,
        bedtimeReminder: '22:00',
        sleepGoals: {
            duration: 8,
            bedtime: '23:00',
            wakeTime: '07:00'
        }
    };
    let optimalSleepData = {
        optimalSleepTime: '8.0時間',
        optimalBedtime: '23:00',
        optimalWakeTime: '07:00'
    };
    let sleepChart = null;

    // Tips and Challenges Data
    const sleepTips = [
        {
            title: '規則正しい睡眠スケジュール',
            text: '毎日同じ時間に就寝し、同じ時間に起床することで、体内時計を整えましょう。週末も平日と同じリズムを保つことが重要です。'
        },
        {
            title: '睡眠環境の最適化',
            text: '寝室は涼しく（18-20℃）、静かで、暗くしましょう。快適なマットレスと枕を使用し、リラックスできる環境を作りましょう。'
        },
        {
            title: '就寝前のルーティン',
            text: '就寝の30-60分前から、リラックスするルーティンを作りましょう。読書、瞑想、ストレッチなどがおすすめです。'
        },
        {
            title: 'カフェインとアルコールの制限',
            text: '午後からのカフェイン摂取を避け、就寝前のアルコールは控えましょう。どちらも睡眠の質に悪影響を与えます。'
        },
        {
            title: '日中の運動',
            text: '定期的な運動は睡眠の質を向上させますが、就寝の3時間前までに終えるようにしましょう。'
        },
        {
            title: '日光を浴びる',
            text: '朝の日光を浴びることで体内時計をリセットし、夜の睡眠の質を向上させることができます。'
        },
        {
            title: '夕食の時間',
            text: '就寝の2-3時間前には夕食を済ませ、消化が睡眠を妨げないようにしましょう。'
        },
        {
            title: 'リラクゼーション技術',
            text: '深呼吸、プログレッシブ筋弛緩法、瞑想などのリラクゼーション技術を学び、就寝前に実践しましょう。'
        },
        {
            title: '睡眠と覚醒のサイクル',
            text: '90分の睡眠サイクルを意識し、サイクルの切れ目で起きるように就寝時間を計画しましょう。'
        },
        {
            title: '昼寝の取り方',
            text: '昼寝は20-30分以内に抑え、午後3時以降は避けましょう。長すぎる昼寝や遅い時間の昼寝は夜の睡眠に影響します。'
        },
        {
            title: '寝室はベッドと睡眠のためだけに',
            text: '寝室では仕事や娯楽を避け、睡眠と休息のための場所として使いましょう。脳が寝室を睡眠と関連付けるようになります。'
        },
        {
            title: '睡眠サプリメント',
            text: 'メラトニンやマグネシウムなどのサプリメントが睡眠の質を向上させる可能性がありますが、使用前に医師に相談しましょう。'
        },
        {
            title: '睡眠負債の解消',
            text: '睡眠不足が続いた場合、数日かけて少しずつ睡眠時間を増やし、負債を解消しましょう。一度に取り戻そうとしないことが大切です。'
        },
        {
            title: '睡眠トラッキング',
            text: '睡眠の質や時間を記録することで、パターンを把握し、改善点を見つけることができます。'
        },
        {
            title: '温かい入浴',
            text: '就寝の1-2時間前に温かいお風呂に入ることで、体温の自然な低下を促し、睡眠を誘導することができます。'
        }
    ];

    const sleepChallenges = [
        {
            title: '就寝前のスクリーンタイムを制限する',
            text: '今日は就寝の1時間前にはすべての電子機器（スマホ、タブレット、PC）の使用を止めましょう。ブルーライトは睡眠を妨げる可能性があります。'
        },
        {
            title: '就寝時間を30分早める',
            text: '今日はいつもより30分早く就寝しましょう。早寝早起きのリズムを作るための第一歩です。'
        },
        {
            title: '睡眠日記をつける',
            text: '今日から1週間、就寝時間、起床時間、睡眠の質、気分などを記録しましょう。パターンを把握するのに役立ちます。'
        },
        {
            title: '寝室の環境を整える',
            text: '今日は寝室の温度、光、音などを最適化しましょう。理想的には涼しく、暗く、静かな環境が睡眠に最適です。'
        },
        {
            title: '就寝前のリラックスルーティンを作る',
            text: '今日は就寝前の30分間、リラックスするための活動（読書、ストレッチ、瞑想など）を行いましょう。'
        },
        {
            title: 'カフェインフリーの一日',
            text: '今日は一日中カフェインを摂取しないようにしましょう。カフェインは体内に長時間残り、睡眠に影響を与えることがあります。'
        },
        {
            title: '朝の日光浴',
            text: '今朝、起床後30分以内に15分間、外で日光を浴びましょう。体内時計の調整に役立ちます。'
        },
        {
            title: '夕食を早めに済ませる',
            text: '今日は就寝の少なくとも3時間前には夕食を済ませましょう。消化活動が睡眠を妨げないようにします。'
        },
        {
            title: '就寝前のストレッチ',
            text: '今日は就寝前に10分間の軽いストレッチを行いましょう。体の緊張をほぐし、リラックスするのに役立ちます。'
        },
        {
            title: '深呼吸エクササイズ',
            text: '就寝前に5分間、4-7-8呼吸法（4秒吸って、7秒止めて、8秒かけて吐く）を実践しましょう。'
        },
        {
            title: 'デジタルデトックスの夜',
            text: '今夜は夕食後からすべての電子機器の使用を避けましょう。代わりに読書や会話などのアナログな活動を楽しみましょう。'
        },
        {
            title: '睡眠に良い飲み物を試す',
            text: '今夜は就寝前にカモミールティーやホットミルクなど、睡眠を促進する飲み物を飲みましょう。'
        },
        {
            title: '寝室の整理整頓',
            text: '今日は寝室を整理整頓し、清潔で落ち着ける空間にしましょう。散らかった環境はストレスを引き起こし、睡眠に影響することがあります。'
        },
        {
            title: '感謝の日記',
            text: '就寝前に、今日感謝したことを3つ書き出しましょう。ポジティブな思考は心を落ち着かせ、良い睡眠につながります。'
        },
        {
            title: '早朝の運動',
            text: '今日は朝に15-30分の軽い運動（ウォーキング、ストレッチなど）を行いましょう。日中の活動は夜の良い睡眠につながります。'
        }
    ];

    // IndexedDB setup for offline storage
    let db;
    const DB_NAME = 'sleep-set-db';
    const DB_VERSION = 1;
    const STORE_NAME = 'sleep-data';
    
    function initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onerror = event => {
                console.error('IndexedDB error:', event.target.error);
                reject('IndexedDB error');
            };
            
            request.onsuccess = event => {
                db = event.target.result;
                console.log('IndexedDB opened successfully');
                resolve(db);
            };
            
            request.onupgradeneeded = event => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    console.log('Object store created');
                }
            };
        });
    }
    
    // Save data to IndexedDB
    function saveToIndexedDB(data) {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject('IndexedDB not initialized');
                return;
            }
            
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            const request = store.put({ id: 'sleepData', ...data });
            
            request.onsuccess = () => {
                console.log('Data saved to IndexedDB');
                resolve();
            };
            
            request.onerror = event => {
                console.error('Error saving to IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    
    // Load data from IndexedDB
    function loadFromIndexedDB() {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject('IndexedDB not initialized');
                return;
            }
            
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            
            const request = store.get('sleepData');
            
            request.onsuccess = event => {
                const data = event.target.result;
                if (data) {
                    console.log('Data loaded from IndexedDB');
                    resolve(data);
                } else {
                    console.log('No data in IndexedDB');
                    resolve(null);
                }
            };
            
            request.onerror = event => {
                console.error('Error loading from IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    
    // Sync data with server
    async function syncWithServer() {
        try {
            const data = {
                sleepData,
                currentDay,
                settings
            };
            
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Data synced with server:', result);
                
                if (result.data) {
                    // Update local data with merged data from server
                    sleepData = result.data.sleepData || sleepData;
                    currentDay = result.data.currentDay || currentDay;
                    settings = result.data.settings || settings;
                    
                    // Save updated data to IndexedDB
                    await saveToIndexedDB({
                        sleepData,
                        currentDay,
                        settings
                    });
                    
                    // Update UI
                    updateUI();
                }
                
                return true;
            } else {
                console.error('Sync failed:', response.statusText);
                return false;
            }
        } catch (error) {
            console.error('Error syncing with server:', error);
            return false;
        }
    }
    
    // Initialize the app
    async function init() {
        try {
            // Initialize IndexedDB
            await initIndexedDB();
            
            // Try to load data from IndexedDB first
            const offlineData = await loadFromIndexedDB();
            if (offlineData) {
                sleepData = offlineData.sleepData || [];
                currentDay = offlineData.currentDay || 1;
                settings = offlineData.settings || {
                    idealSleepTime: 8,
                    bedtimeReminder: '22:00',
                    sleepGoals: {
                        duration: 8,
                        bedtime: '23:00',
                        wakeTime: '07:00'
                    }
                };
            } else {
                // Fall back to localStorage if no IndexedDB data
                loadData();
            }
            
            // Setup UI
            setupCalendar();
            updateCurrentDate();
            updateUI();
            setupEventListeners();
            initChart();
            showDailyTipAndChallenge();
            checkBedtimeReminder();
            
            // Sync with server if online
            if (navigator.onLine) {
                syncWithServer();
            }
        } catch (error) {
            console.error('Error initializing app:', error);
            // Fall back to localStorage if IndexedDB fails
            loadData();
            setupCalendar();
            updateCurrentDate();
            updateUI();
            setupEventListeners();
            initChart();
            showDailyTipAndChallenge();
            checkBedtimeReminder();
        }
    }

    // Load data from localStorage (fallback)
    function loadData() {
        const savedData = localStorage.getItem('sleepSetData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            sleepData = parsedData.sleepData || [];
            currentDay = parsedData.currentDay || 1;
            settings = parsedData.settings || {
                idealSleepTime: 8,
                bedtimeReminder: '22:00',
                sleepGoals: {
                    duration: 8,
                    bedtime: '23:00',
                    wakeTime: '07:00'
                }
            };
        }

        // Update settings inputs
        idealSleepTimeInput.value = settings.idealSleepTime;
        bedtimeReminderInput.value = settings.bedtimeReminder;
        
        // Update sleep goals inputs
        sleepDurationGoalInput.value = settings.sleepGoals.duration;
        bedtimeGoalInput.value = settings.sleepGoals.bedtime;
        wakeTimeGoalInput.value = settings.sleepGoals.wakeTime;
    }

    // Save data to localStorage and IndexedDB
    async function saveData() {
        const dataToSave = {
            sleepData,
            currentDay,
            settings
        };
        
        // Save to localStorage as fallback
        localStorage.setItem('sleepSetData', JSON.stringify(dataToSave));
        
        // Save to IndexedDB if available
        try {
            if (db) {
                await saveToIndexedDB(dataToSave);
            }
        } catch (error) {
            console.error('Error saving to IndexedDB:', error);
        }
        
        // Try to sync with server if online
        if (navigator.onLine) {
            try {
                syncWithServer();
            } catch (error) {
                console.error('Error syncing with server:', error);
            }
        } else if ('serviceWorker' in navigator && 'SyncManager' in window) {
            // Register for background sync when offline
            navigator.serviceWorker.ready.then(registration => {
                registration.sync.register('sync-sleep-data');
            });
        }
    }

    // Setup the 30-day calendar
    function setupCalendar() {
        programCalendarElement.innerHTML = '';
        
        // Calculate how many days to show in the calendar
        // Show at least current day + 14 more days, rounded up to fill grid rows
        const minDaysToShow = Math.max(currentDay + 14, 28); // At least 28 days (4 weeks)
        const daysToShow = Math.min(MAX_CALENDAR_DAYS, minDaysToShow);
        
        for (let i = 1; i <= daysToShow; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            dayElement.textContent = i;
            
            // Mark completed days
            if (i < currentDay) {
                dayElement.classList.add('completed');
            }
            
            // Mark current day
            if (i === currentDay) {
                dayElement.classList.add('today');
            }
            
            // Add click event to view day data
            dayElement.addEventListener('click', () => viewDayData(i));
            
            programCalendarElement.appendChild(dayElement);
        }
    }

    // Update the current date display
    function updateCurrentDate() {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        currentDateElement.textContent = today.toLocaleDateString('ja-JP', options);
    }

    // Update UI elements
    function updateUI() {
        // Update day counter and progress
        currentDayElement.textContent = currentDay;
        // Calculate progress based on completed days vs total recorded days
        const totalDays = sleepData.length > 0 ? Math.max(currentDay, sleepData.length) : currentDay;
        const progressPercentage = Math.min(((currentDay - 1) / totalDays) * 100, 100);
        progressFillElement.style.width = `${progressPercentage}%`;
        
        // Update sleep stats
        updateSleepStats();
        
        // Load today's sleep data if exists
        loadTodaySleepData();
        
        // Update sleep goals progress
        updateSleepGoalsProgress();
    }
    
    // Update sleep goals progress
    function updateSleepGoalsProgress() {
        if (sleepData.length === 0) {
            sleepDurationProgressElement.style.width = '0%';
            sleepDurationPercentageElement.textContent = '0%';
            bedtimeProgressElement.style.width = '0%';
            bedtimePercentageElement.textContent = '0%';
            wakeTimeProgressElement.style.width = '0%';
            wakeTimePercentageElement.textContent = '0%';
            return;
        }
        
        // Calculate progress for each goal
        let durationSuccessCount = 0;
        let bedtimeSuccessCount = 0;
        let wakeTimeSuccessCount = 0;
        
        sleepData.forEach(day => {
            // Sleep duration goal
            if (day.sleepHours >= settings.sleepGoals.duration) {
                durationSuccessCount++;
            }
            
            // Bedtime goal
            if (day.bedtime && isTimeEqualOrEarlier(day.bedtime, settings.sleepGoals.bedtime)) {
                bedtimeSuccessCount++;
            }
            
            // Wake time goal
            if (day.wakeTime && isTimeEqualOrEarlier(settings.sleepGoals.wakeTime, day.wakeTime)) {
                wakeTimeSuccessCount++;
            }
        });
        
        // Calculate percentages
        const durationPercentage = Math.round((durationSuccessCount / sleepData.length) * 100);
        const bedtimePercentage = Math.round((bedtimeSuccessCount / sleepData.length) * 100);
        const wakeTimePercentage = Math.round((wakeTimeSuccessCount / sleepData.length) * 100);
        
        // Update UI
        sleepDurationProgressElement.style.width = `${durationPercentage}%`;
        sleepDurationPercentageElement.textContent = `${durationPercentage}%`;
        bedtimeProgressElement.style.width = `${bedtimePercentage}%`;
        bedtimePercentageElement.textContent = `${bedtimePercentage}%`;
        wakeTimeProgressElement.style.width = `${wakeTimePercentage}%`;
        wakeTimePercentageElement.textContent = `${wakeTimePercentage}%`;
    }
    
    // Helper function to compare times (HH:MM format)
    function isTimeEqualOrEarlier(time1, time2) {
        const [hours1, minutes1] = time1.split(':').map(Number);
        const [hours2, minutes2] = time2.split(':').map(Number);
        
        if (hours1 < hours2) {
            return true;
        } else if (hours1 === hours2) {
            return minutes1 <= minutes2;
        }
        return false;
    }
    
    // Save sleep goals
    function saveSleepGoals() {
        settings.sleepGoals.duration = parseFloat(sleepDurationGoalInput.value) || 8;
        settings.sleepGoals.bedtime = bedtimeGoalInput.value;
        settings.sleepGoals.wakeTime = wakeTimeGoalInput.value;
        
        saveData();
        updateSleepGoalsProgress();
        
        const message = navigator.onLine ?
            '睡眠目標が保存されました！' :
            '睡眠目標がオフラインで保存されました。再接続時に同期されます。';
        alert(message);
    }

    // Calculate and update sleep statistics
    function updateSleepStats() {
        if (sleepData.length === 0) {
            avgSleepTimeElement.textContent = '0時間';
            sleepDebtElement.textContent = '0時間';
            avgSleepQualityElement.textContent = '0/5';
            sleepEfficiencyElement.textContent = '0%';
            optimalSleepTimeElement.textContent = '8.0時間';
            optimalBedtimeElement.textContent = '23:00';
            optimalWakeTimeElement.textContent = '07:00';
            return;
        }
        
        // Calculate average sleep time
        let totalSleepHours = 0;
        let totalSleepQuality = 0;
        let totalSleepEfficiency = 0;
        let recordedDays = 0;
        let efficiencyRecordedDays = 0;
        
        // For optimal sleep time analysis
        let qualitySleepHours = [];  // List of (sleep_hours, sleep_quality) tuples
        
        sleepData.forEach(day => {
            if (day.sleepHours) {
                totalSleepHours += day.sleepHours;
                const sleepQuality = day.sleepQuality || 0;
                totalSleepQuality += sleepQuality;
                recordedDays++;
                
                // Store sleep hours and quality for analysis
                if (sleepQuality > 0) {  // Only consider days with quality ratings
                    qualitySleepHours.push({hours: day.sleepHours, quality: sleepQuality});
                }
                
                if (day.sleepEfficiency) {
                    totalSleepEfficiency += day.sleepEfficiency;
                    efficiencyRecordedDays++;
                }
            }
        });
        
        const avgSleepHours = recordedDays > 0 ? totalSleepHours / recordedDays : 0;
        const avgQuality = recordedDays > 0 ? totalSleepQuality / recordedDays : 0;
        const avgEfficiency = efficiencyRecordedDays > 0 ? totalSleepEfficiency / efficiencyRecordedDays : 0;
        
        // Calculate sleep debt
        const sleepDebt = Math.max(0, (settings.idealSleepTime * recordedDays) - totalSleepHours);
        
        // Update UI
        avgSleepTimeElement.textContent = `${avgSleepHours.toFixed(1)}時間`;
        sleepDebtElement.textContent = `${sleepDebt.toFixed(1)}時間`;
        avgSleepQualityElement.textContent = `${avgQuality.toFixed(1)}/5`;
        sleepEfficiencyElement.textContent = `${avgEfficiency.toFixed(1)}%`;
        
        // Calculate optimal sleep time
        analyzeOptimalSleepTime(qualitySleepHours);
        
        // Update optimal sleep UI
        optimalSleepTimeElement.textContent = optimalSleepData.optimalSleepTime;
        optimalBedtimeElement.textContent = optimalSleepData.optimalBedtime;
        optimalWakeTimeElement.textContent = optimalSleepData.optimalWakeTime;
        
        // Update chart
        updateChart();
    }
    
    // Analyze sleep data to determine optimal sleep time
    function analyzeOptimalSleepTime(qualitySleepHours) {
        if (qualitySleepHours.length === 0) {
            return;
        }
        
        // Find sleep duration with highest quality
        let bestQuality = 0;
        let optimalDuration = 8.0;  // Default
        
        for (const {hours, quality} of qualitySleepHours) {
            if (quality > bestQuality) {
                bestQuality = quality;
                optimalDuration = hours;
            }
        }
        
        // Find the most common bedtime and wake time for high quality sleep
        const highQualityDays = sleepData.filter(day =>
            day.sleepQuality >= 3 && day.bedtime && day.wakeTime);
        
        // Find most common bedtime and wake time in high quality days
        const bedtimes = {};
        const wakeTimes = {};
        
        for (const day of highQualityDays) {
            bedtimes[day.bedtime] = (bedtimes[day.bedtime] || 0) + 1;
            wakeTimes[day.wakeTime] = (wakeTimes[day.wakeTime] || 0) + 1;
        }
        
        // Get most common times
        let optimalBedtime = '23:00';  // Default
        let optimalWakeTime = '07:00';  // Default
        
        if (Object.keys(bedtimes).length > 0) {
            optimalBedtime = Object.keys(bedtimes).reduce((a, b) =>
                bedtimes[a] > bedtimes[b] ? a : b);
        }
        
        if (Object.keys(wakeTimes).length > 0) {
            optimalWakeTime = Object.keys(wakeTimes).reduce((a, b) =>
                wakeTimes[a] > wakeTimes[b] ? a : b);
        }
        
        // If no high quality days, use the day with highest quality
        if (highQualityDays.length === 0 && qualitySleepHours.length > 0) {
            const bestDay = sleepData.find(day =>
                day.sleepQuality === bestQuality && day.bedtime && day.wakeTime);
            
            if (bestDay) {
                optimalBedtime = bestDay.bedtime;
                optimalWakeTime = bestDay.wakeTime;
            }
        }
        
        optimalSleepData = {
            optimalSleepTime: `${optimalDuration.toFixed(1)}時間`,
            optimalBedtime: optimalBedtime,
            optimalWakeTime: optimalWakeTime
        };
    }

    // Load today's sleep data if it exists
    function loadTodaySleepData() {
        const todayData = sleepData.find(day => day.day === currentDay);
        
        if (todayData) {
            bedInTimeInput.value = todayData.bedInTime || '';
            bedOutTimeInput.value = todayData.bedOutTime || '';
            bedtimeInput.value = todayData.bedtime || '';
            wakeTimeInput.value = todayData.wakeTime || '';
            sleepQualityInput.value = todayData.sleepQuality || 0;
            sleepNotesInput.value = todayData.notes || '';
            
            // Update star rating
            updateStarRating(todayData.sleepQuality);
            
            // Update challenge checkbox
            challengeCompletedCheckbox.checked = todayData.challengeCompleted || false;
            
            // Load reflection data if exists
            if (todayData.reflection) {
                morningFeelingInput.value = todayData.reflection.morningFeeling || 0;
                sleepWorkedWellInput.value = todayData.reflection.workedWell || '';
                sleepImproveInput.value = todayData.reflection.improve || '';
                sleepNextGoalInput.value = todayData.reflection.nextGoal || '';
                
                // Update morning feeling star rating
                updateMorningFeelingRating(todayData.reflection.morningFeeling);
            } else {
                // Reset reflection form
                morningFeelingInput.value = 0;
                sleepWorkedWellInput.value = '';
                sleepImproveInput.value = '';
                sleepNextGoalInput.value = '';
                updateMorningFeelingRating(0);
            }
        } else {
            // Reset form
            bedInTimeInput.value = '';
            bedOutTimeInput.value = '';
            bedtimeInput.value = '';
            wakeTimeInput.value = '';
            sleepQualityInput.value = 0;
            sleepNotesInput.value = '';
            updateStarRating(0);
            challengeCompletedCheckbox.checked = false;
            
            // Reset reflection form
            morningFeelingInput.value = 0;
            sleepWorkedWellInput.value = '';
            sleepImproveInput.value = '';
            sleepNextGoalInput.value = '';
            updateMorningFeelingRating(0);
        }
    }
    
    // Update morning feeling star rating display
    function updateMorningFeelingRating(rating) {
        morningFeelingRatingStars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas');
            } else {
                star.classList.remove('fas');
                star.classList.add('far');
            }
        });
    }
    
    // Save sleep reflection data
    function saveReflection() {
        const morningFeeling = parseInt(morningFeelingInput.value) || 0;
        const workedWell = sleepWorkedWellInput.value;
        const improve = sleepImproveInput.value;
        const nextGoal = sleepNextGoalInput.value;
        
        // Find if data for this day already exists
        const existingDayIndex = sleepData.findIndex(day => day.day === currentDay);
        
        if (existingDayIndex >= 0) {
            // Update existing data with reflection
            sleepData[existingDayIndex].reflection = {
                morningFeeling,
                workedWell,
                improve,
                nextGoal
            };
        } else {
            // Create new day data with reflection only
            sleepData.push({
                day: currentDay,
                date: new Date().toISOString(),
                reflection: {
                    morningFeeling,
                    workedWell,
                    improve,
                    nextGoal
                }
            });
        }
        
        // Save data
        saveData();
        
        // Show success message
        const message = navigator.onLine ?
            '睡眠の振り返りが保存されました！' :
            '睡眠の振り返りがオフラインで保存されました。再接続時に同期されます。';
        alert(message);
    }

    // Update star rating display
    function updateStarRating(rating) {
        ratingStars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas');
            } else {
                star.classList.remove('fas');
                star.classList.add('far');
            }
        });
    }

    // Calculate sleep hours between bedtime and wake time
    function calculateSleepHours(bedtime, wakeTime) {
        if (!bedtime || !wakeTime) return 0;
        
        const bedtimeParts = bedtime.split(':');
        const wakeParts = wakeTime.split(':');
        
        let bedtimeHours = parseInt(bedtimeParts[0]);
        const bedtimeMinutes = parseInt(bedtimeParts[1]);
        let wakeHours = parseInt(wakeParts[0]);
        const wakeMinutes = parseInt(wakeParts[1]);
        
        // Convert to 24-hour format for calculation
        if (bedtimeHours < wakeHours) {
            // Same day sleep (e.g., 22:00 to 06:00)
            const bedtimeDecimal = bedtimeHours + (bedtimeMinutes / 60);
            const wakeDecimal = wakeHours + (wakeMinutes / 60);
            return wakeDecimal - bedtimeDecimal;
        } else {
            // Overnight sleep (e.g., 23:00 to 07:00)
            const bedtimeDecimal = bedtimeHours + (bedtimeMinutes / 60);
            const wakeDecimal = wakeHours + (wakeMinutes / 60);
            return (24 - bedtimeDecimal) + wakeDecimal;
        }
    }

    // Save sleep data for the current day
    function saveSleepData() {
        const bedInTime = bedInTimeInput.value;
        const bedOutTime = bedOutTimeInput.value;
        const bedtime = bedtimeInput.value;
        const wakeTime = wakeTimeInput.value;
        const sleepQuality = parseInt(sleepQualityInput.value) || 0;
        const notes = sleepNotesInput.value;
        const challengeCompleted = challengeCompletedCheckbox.checked;
        
        // Calculate sleep hours
        const sleepHours = calculateSleepHours(bedtime, wakeTime);
        
        // Calculate time in bed
        const timeInBed = calculateSleepHours(bedInTime, bedOutTime);
        
        // Calculate sleep efficiency
        const sleepEfficiency = timeInBed > 0 ? (sleepHours / timeInBed) * 100 : 0;
        
        // Find if data for this day already exists
        const existingDayIndex = sleepData.findIndex(day => day.day === currentDay);
        
        const dayData = {
            day: currentDay,
            date: new Date().toISOString(),
            bedInTime,
            bedOutTime,
            bedtime,
            wakeTime,
            sleepHours,
            timeInBed,
            sleepEfficiency,
            sleepQuality,
            notes,
            challengeCompleted,
            reflection: {
                morningFeeling: parseInt(morningFeelingInput.value) || 0,
                workedWell: sleepWorkedWellInput.value || '',
                improve: sleepImproveInput.value || '',
                nextGoal: sleepNextGoalInput.value || ''
            }
        };
        
        if (existingDayIndex >= 0) {
            // Update existing data
            sleepData[existingDayIndex] = dayData;
        } else {
            // Add new data
            sleepData.push(dayData);
        }
        
        // Save data
        saveData();
        
        // Update UI
        updateSleepStats();
        
        // Show success message
        const message = navigator.onLine ?
            '睡眠データが保存されました！' :
            '睡眠データがオフラインで保存されました。再接続時に同期されます。';
        alert(message);
    }

    // View data for a specific day
    function viewDayData(day) {
        const dayData = sleepData.find(d => d.day === day);
        
        if (dayData) {
            let message = `Day ${day} データ:\n
就寝時間: ${dayData.bedtime || 'なし'}\n
起床時間: ${dayData.wakeTime || 'なし'}\n
睡眠時間: ${dayData.sleepHours ? dayData.sleepHours.toFixed(1) + '時間' : 'なし'}\n
睡眠の質: ${dayData.sleepQuality || 0}/5\n
メモ: ${dayData.notes || 'なし'}\n
チャレンジ完了: ${dayData.challengeCompleted ? 'はい' : 'いいえ'}`;
            
            // Add reflection data if exists
            if (dayData.reflection) {
                message += `\n\n睡眠振り返り:\n
朝の目覚め具合: ${dayData.reflection.morningFeeling || 0}/5\n
良かった点: ${dayData.reflection.workedWell || 'なし'}\n
改善したい点: ${dayData.reflection.improve || 'なし'}\n
次の目標: ${dayData.reflection.nextGoal || 'なし'}`;
            }
            
            alert(message);
        } else {
            alert(`Day ${day} のデータはまだ記録されていません。`);
        }
    }

    // Show daily tip and challenge
    function showDailyTipAndChallenge() {
        // Use currentDay as seed for pseudo-random selection
        const tipIndex = (currentDay - 1) % sleepTips.length;
        const challengeIndex = (currentDay - 1) % sleepChallenges.length;
        
        const dailyTip = sleepTips[tipIndex];
        const dailyChallenge = sleepChallenges[challengeIndex];
        
        tipTitleElement.textContent = dailyTip.title;
        tipTextElement.textContent = dailyTip.text;
        
        challengeTitleElement.textContent = dailyChallenge.title;
        challengeTextElement.textContent = dailyChallenge.text;
    }

    // Initialize the sleep chart
    function initChart() {
        const ctx = sleepChartCanvas.getContext('2d');
        
        sleepChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: '睡眠時間',
                        data: [],
                        borderColor: '#3a6ea5',
                        backgroundColor: 'rgba(58, 110, 165, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: '睡眠の質',
                        data: [],
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
        
        updateChart();
    }

    // Update the sleep chart with current data
    function updateChart() {
        if (!sleepChart) return;
        
        // Sort data by day
        const sortedData = [...sleepData].sort((a, b) => a.day - b.day);
        
        // Prepare chart data
        const labels = sortedData.map(day => `Day ${day.day}`);
        const sleepHours = sortedData.map(day => day.sleepHours || 0);
        const sleepQuality = sortedData.map(day => day.sleepQuality || 0);
        
        // Update chart
        sleepChart.data.labels = labels;
        sleepChart.data.datasets[0].data = sleepHours;
        sleepChart.data.datasets[1].data = sleepQuality;
        sleepChart.update();
    }

    // Check if it's time for bedtime reminder
    function checkBedtimeReminder() {
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        
        const reminderParts = settings.bedtimeReminder.split(':');
        const reminderHours = parseInt(reminderParts[0]);
        const reminderMinutes = parseInt(reminderParts[1]);
        
        if (currentHours === reminderHours && currentMinutes === reminderMinutes) {
            // Show notification if supported
            if (Notification.permission === "granted") {
                new Notification("スリープセット30", {
                    body: "就寝時間です。睡眠の準備を始めましょう。",
                    icon: "https://example.com/icon.png"
                });
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission();
            }
            
            // Also show alert as fallback
            const message = "就寝時間です。睡眠の準備を始めましょう。";
            alert(message);
        }
        
        // Check again in a minute
        setTimeout(checkBedtimeReminder, 60000);
    }

    // Advance to the next day
    function advanceToNextDay() {
        currentDay++;
        saveData();
        setupCalendar();
        updateUI();
        showDailyTipAndChallenge();
        
        // Show milestone messages at certain intervals
        if (currentDay % 30 === 0) {
            const message = `おめでとうございます！${currentDay}日間継続しました！引き続き睡眠習慣の改善を続けましょう。`;
            alert(message);
            
            // Show notification if permission granted
            if (Notification.permission === "granted") {
                new Notification("スリープセット30", {
                    body: message,
                    icon: "/static/icons/icon.svg"
                });
            }
        }
    }

    // Reset the program
    function resetProgram() {
        if (confirm("プログラムをリセットすると、すべてのデータが消去されます。続行しますか？")) {
            sleepData = [];
            currentDay = 1;
            saveData();
            setupCalendar();
            updateUI();
            showDailyTipAndChallenge();
            const message = navigator.onLine ?
                'プログラムがリセットされました。Day 1から再開します。' :
                'プログラムがオフラインでリセットされました。再接続時に同期されます。';
            alert(message);
        }
    }

    // Save settings
    function saveSettings() {
        settings.idealSleepTime = parseFloat(idealSleepTimeInput.value) || 8;
        settings.bedtimeReminder = bedtimeReminderInput.value;
        
        saveData();
        updateSleepStats();
        
        // Close modal
        settingsModal.style.display = "none";
        
        const message = navigator.onLine ?
            '設定が保存されました。' :
            '設定がオフラインで保存されました。再接続時に同期されます。';
        alert(message);
    }

    // Setup event listeners
    function setupEventListeners() {
        // Save sleep data
        saveSleepDataButton.addEventListener('click', () => {
            saveSleepData();
            
            // Check if we should advance to next day
            const today = new Date();
            const lastSavedDay = sleepData.find(day => day.day === currentDay);
            
            if (lastSavedDay) {
                const lastSavedDate = new Date(lastSavedDay.date);
                const isNewDay = today.getDate() !== lastSavedDate.getDate() ||
                                today.getMonth() !== lastSavedDate.getMonth() ||
                                today.getFullYear() !== lastSavedDate.getFullYear();
                
                if (isNewDay) {
                    if (confirm("新しい日のデータを記録しますか？次の日に進みます。")) {
                        advanceToNextDay();
                    }
                }
            }
        });
        
        // Save reflection data
        saveReflectionButton.addEventListener('click', saveReflection);
        
        // Sleep quality star rating
        ratingStars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                sleepQualityInput.value = rating;
                updateStarRating(rating);
            });
        });
        
        // Morning feeling star rating
        morningFeelingRatingStars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                morningFeelingInput.value = rating;
                updateMorningFeelingRating(rating);
            });
        });
        
        // Settings modal
        settingsButton.addEventListener('click', () => {
            settingsModal.style.display = "block";
        });
        
        closeModalButton.addEventListener('click', () => {
            settingsModal.style.display = "none";
        });
        
        window.addEventListener('click', (event) => {
            if (event.target === settingsModal) {
                settingsModal.style.display = "none";
            }
        });
        
        // Reset program
        resetProgramButton.addEventListener('click', resetProgram);
        
        // Save settings
        saveSettingsButton.addEventListener('click', saveSettings);
        
        // Save sleep goals
        saveGoalsButton.addEventListener('click', saveSleepGoals);
        
        // Challenge completed
        challengeCompletedCheckbox.addEventListener('change', () => {
            const todayData = sleepData.find(day => day.day === currentDay);
            
            if (todayData) {
                todayData.challengeCompleted = challengeCompletedCheckbox.checked;
                saveData();
            }
        });
    }

    // Initialize the app
    init();
});