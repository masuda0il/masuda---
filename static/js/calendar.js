/**
 * Calendar functionality for sleep tracking application
 */

// Generate monthly calendar
function generateMonthlyCalendar(year, month) {
    const monthlyCalendar = document.getElementById('monthly-calendar');
    const currentMonthDisplay = document.getElementById('current-month-display');
    
    // Clear previous calendar
    monthlyCalendar.innerHTML = '';
    
    // Set current month display
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    currentMonthDisplay.textContent = `${year}年${monthNames[month]}`;
    
    // Get first day of month and number of days in month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        monthlyCalendar.appendChild(emptyCell);
    }
    
    // Add cells for each day of the month
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateCell = document.createElement('div');
        dateCell.className = 'calendar-day';
        
        // Check if this day is today
        if (year === currentYear && month === currentMonth && day === currentDate) {
            dateCell.classList.add('today');
        }
        
        // Format date string for data attribute (YYYY-MM-DD)
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dateCell.setAttribute('data-date', dateStr);
        
        // Add day number
        dateCell.textContent = day;
        
        // Check if this day has sleep data
        const hasSleepData = window.sleepDataDates && window.sleepDataDates.includes(dateStr);
        if (hasSleepData) {
            dateCell.classList.add('has-data');
        }
        
        // Add click event to view/edit sleep data for this day
        dateCell.addEventListener('click', () => {
            selectDate(dateStr);
        });
        
        monthlyCalendar.appendChild(dateCell);
    }
}

// Select a date for viewing/editing sleep data
function selectDate(dateStr) {
    // Update record date input
    document.getElementById('record-date').value = dateStr;
    document.getElementById('selected-date').value = dateStr;
    
    // Fetch sleep data for this date
    fetch(`/api/view_date/${dateStr}`)
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // Update form with sleep data
                const data = result.data;
                
                // Update form fields
                document.getElementById('bed-in-time').value = data.bedInTime || '';
                document.getElementById('bed-out-time').value = data.bedOutTime || '';
                document.getElementById('bedtime').value = data.bedtime || '';
                document.getElementById('wake-time').value = data.wakeTime || '';
                document.getElementById('sleep-quality').value = data.sleepQuality || 0;
                document.getElementById('sleep-notes').value = data.notes || '';
                
                // Update star rating
                const ratingStars = document.querySelectorAll('.rating i');
                updateStarRating(ratingStars, data.sleepQuality || 0);
                
                // Update challenge completed checkbox
                const challengeCheckbox = document.getElementById('challenge-completed');
                if (challengeCheckbox) {
                    challengeCheckbox.checked = data.challengeCompleted || false;
                }
                
                // Update reflection data if exists
                if (data.reflection) {
                    document.getElementById('morning-feeling').value = data.reflection.morningFeeling || 0;
                    document.getElementById('sleep-worked-well').value = data.reflection.workedWell || '';
                    document.getElementById('sleep-improve').value = data.reflection.improve || '';
                    document.getElementById('sleep-next-goal').value = data.reflection.nextGoal || '';
                    
                    // Update morning feeling star rating
                    const morningFeelingStars = document.querySelectorAll('#morning-feeling-rating i');
                    updateStarRating(morningFeelingStars, data.reflection.morningFeeling || 0);
                }
                
                // Update date display
                const date = new Date(dateStr);
                const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
                document.getElementById('current-date').textContent = date.toLocaleDateString('ja-JP', options);
            } else {
                // Clear form for new data
                document.getElementById('sleep-log-form').reset();
                document.getElementById('reflection-form').reset();
                
                // Reset star ratings
                const sleepQualityStars = document.querySelectorAll('.rating i');
                updateStarRating(sleepQualityStars, 0);
                
                const morningFeelingStars = document.querySelectorAll('#morning-feeling-rating i');
                updateStarRating(morningFeelingStars, 0);
                
                // Update date display
                const date = new Date(dateStr);
                const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
                document.getElementById('current-date').textContent = date.toLocaleDateString('ja-JP', options);
            }
        })
        .catch(error => {
            console.error('Error fetching date data:', error);
        });
}

// View data for a specific day
function viewDayData(day) {
    fetch(`/api/view_day/${day}`)
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                const data = result.data;
                let message = `Day ${day} データ:\n\n`;
                message += `就寝時間: ${data.bedtime || 'なし'}\n`;
                message += `起床時間: ${data.wakeTime || 'なし'}\n`;
                message += `睡眠時間: ${data.sleepHours ? data.sleepHours.toFixed(1) + '時間' : 'なし'}\n`;
                message += `睡眠の質: ${data.sleepQuality || 0}/5\n`;
                message += `メモ: ${data.notes || 'なし'}\n`;
                message += `チャレンジ完了: ${data.challengeCompleted ? 'はい' : 'いいえ'}`;
                
                // Add reflection data if exists
                if (data.reflection) {
                    message += `\n\n睡眠振り返り:\n\n`;
                    message += `朝の目覚め具合: ${data.reflection.morningFeeling || 0}/5\n`;
                    message += `良かった点: ${data.reflection.workedWell || 'なし'}\n`;
                    message += `改善したい点: ${data.reflection.improve || 'なし'}\n`;
                    message += `次の目標: ${data.reflection.nextGoal || 'なし'}`;
                }
                
                alert(message);
            } else {
                alert(result.message);
            }
        })
        .catch(error => {
            console.error('Error fetching day data:', error);
            alert('データの取得中にエラーが発生しました。');
        });
}