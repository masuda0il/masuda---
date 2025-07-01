/**
 * Event handlers for sleep tracking application
 */

// Setup event listeners
function setupEventListeners() {
    // Initialize calendar
    const today = new Date();
    generateMonthlyCalendar(today.getFullYear(), today.getMonth());
    
    // Month navigation
    document.getElementById('prev-month').addEventListener('click', () => {
        const currentMonthText = document.getElementById('current-month-display').textContent;
        const [year, month] = currentMonthText.match(/(\d+)年(\d+)月/).slice(1).map(Number);
        
        let newMonth = month - 2; // Adjust for 0-based month index
        let newYear = year;
        
        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        }
        
        generateMonthlyCalendar(newYear, newMonth);
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        const currentMonthText = document.getElementById('current-month-display').textContent;
        const [year, month] = currentMonthText.match(/(\d+)年(\d+)月/).slice(1).map(Number);
        
        let newMonth = month; // Adjust for 0-based month index
        let newYear = year;
        
        if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }
        
        generateMonthlyCalendar(newYear, newMonth);
    });
    
    // Record date change
    document.getElementById('record-date').addEventListener('change', (e) => {
        selectDate(e.target.value);
    });
    
    // Sleep quality star rating
    const ratingStars = document.querySelectorAll('.rating i');
    const sleepQualityInput = document.getElementById('sleep-quality');
    
    ratingStars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            sleepQualityInput.value = rating;
            updateStarRating(ratingStars, rating);
        });
    });
    
    // Morning feeling star rating
    const morningFeelingRatingStars = document.querySelectorAll('#morning-feeling-rating i');
    const morningFeelingInput = document.getElementById('morning-feeling');
    
    morningFeelingRatingStars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            morningFeelingInput.value = rating;
            updateStarRating(morningFeelingRatingStars, rating);
        });
    });
    
    setupModalEventListeners();
    setupFormEventListeners();
    setupSleepenEventListeners();
}

function setupModalEventListeners() {
    // Settings modal
    const settingsButton = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeModalButton = document.querySelector('.close-btn');
    
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
    
    // Clear cache
    const clearCacheButton = document.getElementById('clear-cache');
    
    clearCacheButton.addEventListener('click', async () => {
        if (confirm("キャッシュとローカルストレージをクリアします。続行しますか？")) {
            try {
                // Clear localStorage
                localStorage.clear();
                
                // Clear sessionStorage
                sessionStorage.clear();
                
                // Clear service worker caches
                if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    await Promise.all(
                        cacheNames.map(cacheName => caches.delete(cacheName))
                    );
                }
                
                // Unregister service worker
                if ('serviceWorker' in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    await Promise.all(
                        registrations.map(registration => registration.unregister())
                    );
                }
                
                alert('キャッシュがクリアされました。ページを再読み込みします。');
                window.location.reload(true);
            } catch (error) {
                console.error('Error clearing cache:', error);
                alert('キャッシュのクリアに失敗しました。手動でブラウザのキャッシュをクリアしてください。');
            }
        }
    });
    
    // Reset program
    const resetProgramButton = document.getElementById('reset-program');
    
    resetProgramButton.addEventListener('click', () => {
        if (confirm("プログラムをリセットすると、すべてのデータが消去されます。続行しますか？")) {
            fetch('/api/reset_program', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                window.location.reload();
            });
        }
    });
}

function setupFormEventListeners() {
    // Challenge completed
    const challengeCompletedCheckbox = document.getElementById('challenge-completed');
    
    challengeCompletedCheckbox.addEventListener('change', () => {
        const formData = new FormData();
        formData.append('challenge_completed', challengeCompletedCheckbox.checked ? 'on' : 'off');
        
        fetch('/api/save_sleep_data', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
        });
    });
    
    // Form submissions with AJAX
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            
            fetch(form.action, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                if (data.success) {
                    // Reload page to show updated data
                    window.location.reload();
                }
            });
        });
    });
}

function setupSleepenEventListeners() {
    // Dream Journal Modal
    const dreamJournalModal = document.getElementById('dream-journal-modal');
    const interpretDreamBtn = document.getElementById('interpret-dream');
    const closeDreamModal = document.querySelector('.close-dream-modal');
    
    if (interpretDreamBtn) {
        interpretDreamBtn.addEventListener('click', () => {
            dreamJournalModal.style.display = 'block';
        });
    }
    
    if (closeDreamModal) {
        closeDreamModal.addEventListener('click', () => {
            dreamJournalModal.style.display = 'none';
        });
    }
    
    // Adventure Location Modal
    const adventureLocationModal = document.getElementById('adventure-location-modal');
    const adventureSleepenBtn = document.getElementById('adventure-sleepen');
    const closeAdventureModal = document.querySelector('.close-adventure-modal');
    
    if (adventureSleepenBtn) {
        adventureSleepenBtn.addEventListener('click', () => {
            adventureLocationModal.style.display = 'block';
        });
    }
    
    if (closeAdventureModal) {
        closeAdventureModal.addEventListener('click', () => {
            adventureLocationModal.style.display = 'none';
        });
    }
}

// Update star rating display
function updateStarRating(stars, rating) {
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('far');
            star.classList.add('fas');
        } else {
            star.classList.remove('fas');
            star.classList.add('far');
        }
    });
}