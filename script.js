document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const currentDayElement = document.getElementById('current-day');
    const progressFillElement = document.getElementById('progress-fill');
    const programCalendarElement = document.getElementById('program-calendar');
    const currentDateElement = document.getElementById('current-date');
    const avgSleepTimeElement = document.getElementById('avg-sleep-time');
    const sleepDebtElement = document.getElementById('sleep-debt');
    const avgSleepQualityElement = document.getElementById('avg-sleep-quality');
    const sleepEfficiencyElement = document.getElementById('sleep-efficiency');
    
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

    // Initialize the app
    function init() {
        loadData();
        setupCalendar();
        updateCurrentDate();
        updateUI();
        setupEventListeners();
        initChart();
        showDailyTipAndChallenge();
        checkBedtimeReminder();
    }

    // Load data from localStorage
    function loadData() {
        const savedData = localStorage.getItem('sleepSet30Data');
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

    // Save data to localStorage
    function saveData() {
        const dataToSave = {
            sleepData,
            currentDay,
            settings
        };
        localStorage.setItem('sleepSet30Data', JSON.stringify(dataToSave));
    }

    // Setup the 30-day calendar
    function setupCalendar() {
        programCalendarElement.innerHTML = '';
        
        for (let i = 1; i <= 30; i++) {
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
        const progressPercentage = ((currentDay - 1) / 30) * 100;
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
        
        alert('睡眠目標が保存されました！');
    }

    // Calculate and update sleep statistics
    function updateSleepStats() {
        if (sleepData.length === 0) {
            avgSleepTimeElement.textContent = '0時間';
            sleepDebtElement.textContent = '0時間';
            avgSleepQualityElement.textContent = '0/5';
            sleepEfficiencyElement.textContent = '0%';
            return;
        }
        
        // Calculate average sleep time
        let totalSleepHours = 0;
        let totalSleepQuality = 0;
        let totalSleepEfficiency = 0;
        let recordedDays = 0;
        let efficiencyRecordedDays = 0;
        
        sleepData.forEach(day => {
            if (day.sleepHours) {
                totalSleepHours += day.sleepHours;
                totalSleepQuality += day.sleepQuality;
                recordedDays++;
                
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
        
        // Update chart
        updateChart();
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
        }
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
            challengeCompleted
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
        alert('睡眠データが保存されました！');
    }

    // View data for a specific day
    function viewDayData(day) {
        const dayData = sleepData.find(d => d.day === day);
        
        if (dayData) {
            alert(`Day ${day} データ:\n
就寝時間: ${dayData.bedtime || 'なし'}\n
起床時間: ${dayData.wakeTime || 'なし'}\n
睡眠時間: ${dayData.sleepHours ? dayData.sleepHours.toFixed(1) + '時間' : 'なし'}\n
睡眠の質: ${dayData.sleepQuality || 0}/5\n
メモ: ${dayData.notes || 'なし'}\n
チャレンジ完了: ${dayData.challengeCompleted ? 'はい' : 'いいえ'}`);
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
            alert("就寝時間です。睡眠の準備を始めましょう。");
        }
        
        // Check again in a minute
        setTimeout(checkBedtimeReminder, 60000);
    }

    // Advance to the next day
    function advanceToNextDay() {
        if (currentDay < 30) {
            currentDay++;
            saveData();
            setupCalendar();
            updateUI();
            showDailyTipAndChallenge();
        } else {
            alert("おめでとうございます！30日間のプログラムが完了しました。必要に応じてリセットして再開できます。");
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
            alert("プログラムがリセットされました。Day 1から再開します。");
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
        
        alert("設定が保存されました。");
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
        
        // Star rating
        ratingStars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                sleepQualityInput.value = rating;
                updateStarRating(rating);
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