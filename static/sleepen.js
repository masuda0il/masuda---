// Sleepen functionality
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const sleepenNameInput = document.getElementById('sleepen-name-input');
    const saveSleepenNameButton = document.getElementById('save-sleepen-name');
    const playWithSleepenButton = document.getElementById('play-with-sleepen');
    const restSleepenButton = document.getElementById('rest-sleepen');
    const adventureSleepenButton = document.getElementById('adventure-sleepen');
    const trainSleepenButton = document.getElementById('train-sleepen');
    const interpretDreamButton = document.getElementById('interpret-dream');
    const sleepenLevelElement = document.getElementById('sleepen-level');
    const sleepenExpElement = document.getElementById('sleepen-exp');
    const sleepenMoodElement = document.getElementById('sleepen-mood');
    const sleepenEnergyElement = document.getElementById('sleepen-energy');
    const sleepenFriendshipElement = document.getElementById('sleepen-friendship');
    const sleepenBody = document.querySelector('.sleepen-body');
    const sleepenMouth = document.querySelector('.sleepen-mouth');
    
    // Modals
    const dreamJournalModal = document.getElementById('dream-journal-modal');
    const closeDreamModalButton = document.querySelector('.close-dream-modal');
    const dreamJournalForm = document.getElementById('dream-journal-form');
    const dreamDescriptionInput = document.getElementById('dream-description');
    const interpretDreamBtn = document.getElementById('interpret-dream-btn');
    const dreamInterpretationResult = document.getElementById('dream-interpretation-result');
    const interpretationText = document.getElementById('interpretation-text');
    
    const adventureLocationModal = document.getElementById('adventure-location-modal');
    const closeAdventureModalButton = document.querySelector('.close-adventure-modal');
    const adventureLocationCards = document.querySelectorAll('.adventure-location-card');
    const startAdventureBtn = document.getElementById('start-adventure-btn');
    
    // Save Sleepen name
    saveSleepenNameButton.addEventListener('click', () => {
        const name = sleepenNameInput.value.trim();
        if (name) {
            const formData = new FormData();
            formData.append('name', name);
            
            fetch('/api/sleepen/name', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                }
            });
        }
    });
    
    // Play with Sleepen
    playWithSleepenButton.addEventListener('click', () => {
        fetch('/api/sleepen/play', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                updateSleepenUI(data);
            }
        });
    });
    
    // Rest Sleepen
    restSleepenButton.addEventListener('click', () => {
        fetch('/api/sleepen/rest', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                updateSleepenUI(data);
            }
        });
    });
    
    // Adventure with Sleepen
    adventureSleepenButton.addEventListener('click', () => {
        if (adventureSleepenButton.classList.contains('disabled')) {
            alert('スリープンは疲れています。先に休ませてください。');
            return;
        }
        
        // Show adventure location modal
        adventureLocationModal.style.display = 'block';
    });
    
    // Close adventure location modal
    closeAdventureModalButton.addEventListener('click', () => {
        adventureLocationModal.style.display = 'none';
    });
    
    // Select adventure location
    let selectedLocation = 'random';
    adventureLocationCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove selected class from all cards
            adventureLocationCards.forEach(c => c.classList.remove('selected'));
            // Add selected class to clicked card
            card.classList.add('selected');
            // Update selected location
            selectedLocation = card.getAttribute('data-location');
        });
    });
    
    // Start adventure
    startAdventureBtn.addEventListener('click', () => {
        // Close modal
        adventureLocationModal.style.display = 'none';
        
        // Prepare form data
        const formData = new FormData();
        if (selectedLocation !== 'random') {
            formData.append('location', selectedLocation);
        }
        
        // Send adventure request
        fetch('/api/sleepen/adventure', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                updateSleepenUI(data);
                
                // Add new adventure to the list
                if (data.adventure) {
                    addAdventureToUI(data.adventure);
                }
                
                // If a new location was discovered, reload the page to show it
                if (data.adventure && data.adventure.new_location_discovered) {
                    window.location.reload();
                }
            } else {
                alert(data.message);
            }
        });
    });
    
    // Train Sleepen
    trainSleepenButton.addEventListener('click', () => {
        if (trainSleepenButton.classList.contains('disabled')) {
            alert('スリープンはまだスキルを習得していません。');
            return;
        }
        
        fetch('/api/sleepen/train', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                updateSleepenUI(data);
            } else {
                alert(data.message);
            }
        });
    });
    
    // Interpret Dream
    interpretDreamButton.addEventListener('click', () => {
        if (interpretDreamButton.classList.contains('disabled')) {
            alert('スリープンはまだ夢を解読するスキルを習得していません。レベル3になると解読できるようになります。');
            return;
        }
        
        // Show dream journal modal
        dreamJournalModal.style.display = 'block';
    });
    
    // Close dream journal modal
    closeDreamModalButton.addEventListener('click', () => {
        dreamJournalModal.style.display = 'none';
        // Reset form
        dreamJournalForm.reset();
        dreamInterpretationResult.classList.add('hidden');
    });
    
    // Submit dream for interpretation
    dreamJournalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const dreamDescription = dreamDescriptionInput.value.trim();
        if (!dreamDescription) {
            alert('夢の内容を入力してください。');
            return;
        }
        
        const formData = new FormData();
        formData.append('dream', dreamDescription);
        
        fetch('/api/sleepen/interpret_dream', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                interpretationText.textContent = data.interpretation;
                dreamInterpretationResult.classList.remove('hidden');
                
                // Update Sleepen UI if data is provided
                if (data.sleepen) {
                    updateSleepenUI(data.sleepen);
                }
            } else {
                alert(data.message);
            }
        });
    });
    
    // Update Sleepen UI
    function updateSleepenUI(data) {
        if (data.mood) {
            sleepenMoodElement.textContent = `${data.mood}%`;
            const moodProgressFill = sleepenMoodElement.nextElementSibling.querySelector('.sleepen-progress-fill');
            moodProgressFill.style.width = `${data.mood}%`;
            
            // Update mouth based on mood
            if (data.mood > 50) {
                sleepenMouth.classList.remove('sad');
                sleepenMouth.classList.add('happy');
            } else {
                sleepenMouth.classList.remove('happy');
                sleepenMouth.classList.add('sad');
            }
        }
        
        if (data.energy) {
            sleepenEnergyElement.textContent = `${data.energy}%`;
            const energyProgressFill = sleepenEnergyElement.nextElementSibling.querySelector('.sleepen-progress-fill');
            energyProgressFill.style.width = `${data.energy}%`;
            
            // Update adventure button based on energy
            if (data.energy < 30) {
                adventureSleepenButton.classList.add('disabled');
            } else {
                adventureSleepenButton.classList.remove('disabled');
            }
        }
        
        if (data.friendship !== undefined) {
            sleepenFriendshipElement.textContent = `${data.friendship}%`;
            const friendshipProgressFill = sleepenFriendshipElement.nextElementSibling.querySelector('.sleepen-progress-fill');
            friendshipProgressFill.style.width = `${data.friendship}%`;
        }
        
        if (data.level) {
            sleepenLevelElement.textContent = data.level;
            
            // Update evolution stage if needed
            let evolutionStage = 1;
            if (data.level >= 15) {
                evolutionStage = 4;
            } else if (data.level >= 10) {
                evolutionStage = 3;
            } else if (data.level >= 5) {
                evolutionStage = 2;
            }
            
            sleepenBody.className = `sleepen-body stage-${evolutionStage}`;
            
            // Check if interpret dream button should be enabled
            if (data.skills && data.skills.some(skill => skill.name === '夢の解読')) {
                interpretDreamButton.classList.remove('disabled');
            }
        }
        
        if (data.exp !== undefined) {
            const expNeeded = parseInt(sleepenLevelElement.textContent) * 100;
            sleepenExpElement.textContent = `${data.exp}/${expNeeded}`;
            const expProgressFill = sleepenExpElement.nextElementSibling.querySelector('.sleepen-progress-fill');
            expProgressFill.style.width = `${(data.exp / expNeeded) * 100}%`;
        }
        
        // Enable/disable train button based on skills
        if (data.skills && data.skills.length > 0) {
            trainSleepenButton.classList.remove('disabled');
        } else {
            trainSleepenButton.classList.add('disabled');
        }
    }
    
    // Add new adventure to UI
    function addAdventureToUI(adventure) {
        const adventuresContainer = document.querySelector('.sleepen-adventures');
        const noAdventuresMessage = adventuresContainer.querySelector('p');
        
        if (noAdventuresMessage) {
            noAdventuresMessage.remove();
        }
        
        const adventureCard = document.createElement('div');
        adventureCard.className = 'adventure-card';
        
        const dateStr = adventure.date.split('T')[0];
        
        // Define rare and legendary items
        const rareItems = [
            "夢想の宝石", "記憶の結晶", "星空のマント", "幻影の鏡", "永遠の砂時計", "夢幻の笛"
        ];
        
        const legendaryItems = [
            "創造主の筆", "夢の王冠", "次元の鍵", "星の心臓"
        ];
        
        // Create HTML for adventure card
        let adventureHTML = `
            <div class="adventure-header">
                <div class="adventure-type">${adventure.type}</div>
                <div class="adventure-date">${dateStr}</div>
            </div>
        `;
        
        // Add location if present
        if (adventure.location) {
            adventureHTML += `
                <div class="adventure-location">
                    <i class="fas fa-map-marker-alt"></i> ${adventure.location}
                </div>
            `;
        }
        
        // Add description
        adventureHTML += `
            <div class="adventure-description">${adventure.description}</div>
            <div class="adventure-rewards">
                <div class="adventure-exp">経験値 +${adventure.exp_gained}</div>
                ${adventure.items_found.map(item => {
                    let itemClass = '';
                    if (rareItems.includes(item)) itemClass = 'rare-item';
                    if (legendaryItems.includes(item)) itemClass = 'legendary-item';
                    return `<div class="adventure-item ${itemClass}">${item}</div>`;
                }).join('')}
            </div>
        `;
        
        adventureCard.innerHTML = adventureHTML;
        
        // Add to the beginning of the list
        const firstCard = adventuresContainer.querySelector('.adventure-card');
        if (firstCard) {
            adventuresContainer.insertBefore(adventureCard, firstCard);
        } else {
            adventuresContainer.appendChild(adventureCard);
        }
        
        // Add items to the items grid if it exists
        if (adventure.items_found.length > 0) {
            let itemsSection = document.querySelector('.sleepen-items');
            
            // Create items section if it doesn't exist
            if (!itemsSection) {
                itemsSection = document.createElement('div');
                itemsSection.className = 'sleepen-items';
                itemsSection.innerHTML = `
                    <h3>集めたアイテム</h3>
                    <div class="items-grid"></div>
                `;
                document.querySelector('.sleepen-container').appendChild(itemsSection);
            }
            
            const itemsGrid = itemsSection.querySelector('.items-grid');
            
            adventure.items_found.forEach(item => {
                const itemCard = document.createElement('div');
                
                // Add appropriate class for rare/legendary items
                if (rareItems.includes(item)) {
                    itemCard.className = 'item-card rare-item';
                } else if (legendaryItems.includes(item)) {
                    itemCard.className = 'item-card legendary-item';
                } else {
                    itemCard.className = 'item-card';
                }
                
                // Determine icon based on item name
                let iconClass = 'fa-star';
                if (item.includes('石') || item.includes('宝石')) iconClass = 'fa-gem';
                else if (item.includes('花')) iconClass = 'fa-seedling';
                else if (item.includes('砂') && !item.includes('砂時計')) iconClass = 'fa-hourglass';
                else if (item.includes('しずく')) iconClass = 'fa-tint';
                else if (item.includes('欠片') || item.includes('心臓')) iconClass = 'fa-moon';
                else if (item.includes('クッション') || item.includes('マント')) iconClass = 'fa-cloud';
                else if (item.includes('砂時計')) iconClass = 'fa-hourglass-half';
                else if (item.includes('羽根')) iconClass = 'fa-feather';
                else if (item.includes('クリスタル') || item.includes('結晶')) iconClass = 'fa-dice-d20';
                else if (item.includes('鏡')) iconClass = 'fa-mirror';
                else if (item.includes('筆')) iconClass = 'fa-paint-brush';
                else if (item.includes('王冠')) iconClass = 'fa-crown';
                else if (item.includes('鍵')) iconClass = 'fa-key';
                else if (item.includes('笛')) iconClass = 'fa-music';
                
                itemCard.innerHTML = `
                    <div class="item-icon">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <div class="item-name">${item}</div>
                `;
                
                itemsGrid.appendChild(itemCard);
            });
        }
        
        // If a new location was discovered, add it to the dream world map
        if (adventure.new_location_discovered) {
            let dreamWorldSection = document.querySelector('.dream-world-section');
            const dreamWorldMap = dreamWorldSection.querySelector('.dream-world-map');
            const noLocationsMessage = dreamWorldMap.querySelector('.no-locations');
            
            if (noLocationsMessage) {
                noLocationsMessage.remove();
            }
            
            const locationCard = document.createElement('div');
            locationCard.className = 'dream-location';
            locationCard.setAttribute('data-location', adventure.new_location_discovered);
            
            // Determine icon based on location name
            let iconClass = 'fa-map-marker-alt';
            if (adventure.new_location_discovered.includes('神殿')) iconClass = 'fa-landmark';
            else if (adventure.new_location_discovered.includes('海')) iconClass = 'fa-star';
            else if (adventure.new_location_discovered.includes('迷宮')) iconClass = 'fa-dungeon';
            else if (adventure.new_location_discovered.includes('渓谷')) iconClass = 'fa-mountain';
            else if (adventure.new_location_discovered.includes('島')) iconClass = 'fa-island-tropical';
            
            locationCard.innerHTML = `
                <div class="location-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="location-name">${adventure.new_location_discovered}</div>
                <div class="location-visits">訪問: 1回</div>
            `;
            
            dreamWorldMap.appendChild(locationCard);
        }
    }
    
    // Update Sleepen when sleep data is saved
    const saveSleepDataButton = document.getElementById('save-sleep-data');
    if (saveSleepDataButton) {
        const originalSaveSleepData = saveSleepDataButton.onclick;
        
        saveSleepDataButton.onclick = function(e) {
            e.preventDefault();
            
            const form = document.getElementById('sleep-log-form');
            const formData = new FormData(form);
            
            fetch(form.action, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    
                    // Update Sleepen if adventure happened
                    if (data.sleepen) {
                        if (data.sleepen.level) {
                            sleepenLevelElement.textContent = data.sleepen.level;
                            
                            // Update evolution stage if needed
                            let evolutionStage = 1;
                            if (data.sleepen.level >= 15) {
                                evolutionStage = 4;
                            } else if (data.sleepen.level >= 10) {
                                evolutionStage = 3;
                            } else if (data.sleepen.level >= 5) {
                                evolutionStage = 2;
                            }
                            
                            sleepenBody.className = `sleepen-body stage-${evolutionStage}`;
                        }
                        
                        if (data.sleepen.exp !== undefined) {
                            const expNeeded = parseInt(sleepenLevelElement.textContent) * 100;
                            sleepenExpElement.textContent = `${data.sleepen.exp}/${expNeeded}`;
                            const expProgressFill = sleepenExpElement.nextElementSibling.querySelector('.sleepen-progress-fill');
                            expProgressFill.style.width = `${(data.sleepen.exp / expNeeded) * 100}%`;
                        }
                        
                        if (data.sleepen.friendship !== undefined) {
                            sleepenFriendshipElement.textContent = `${data.sleepen.friendship}%`;
                            const friendshipProgressFill = sleepenFriendshipElement.nextElementSibling.querySelector('.sleepen-progress-fill');
                            friendshipProgressFill.style.width = `${data.sleepen.friendship}%`;
                        }
                        
                        // Add adventure to UI if exists
                        if (data.sleepen.adventure) {
                            addAdventureToUI(data.sleepen.adventure);
                        }
                        
                        // Check if new skills were learned
                        if (data.sleepen.new_skill) {
                            alert(`${data.sleepen.name}が新しいスキル「${data.sleepen.new_skill.name}」を習得しました！\n${data.sleepen.new_skill.description}`);
                            
                            // Enable train button if skills exist
                            trainSleepenButton.classList.remove('disabled');
                            
                            // Enable interpret dream button if the skill is dream interpretation
                            if (data.sleepen.new_skill.name === '夢の解読') {
                                interpretDreamButton.classList.remove('disabled');
                            }
                        }
                    }
                    
                    // Reload page to show updated data
                    window.location.reload();
                }
            });
        };
    }
    
    // Initialize dream world map location clicks
    const dreamLocations = document.querySelectorAll('.dream-location');
    dreamLocations.forEach(location => {
        location.addEventListener('click', () => {
            const locationName = location.getAttribute('data-location');
            
            // Show adventure location modal and pre-select this location
            adventureLocationModal.style.display = 'block';
            
            // Find and select the corresponding location card
            adventureLocationCards.forEach(card => {
                if (card.getAttribute('data-location') === locationName) {
                    // Remove selected class from all cards
                    adventureLocationCards.forEach(c => c.classList.remove('selected'));
                    // Add selected class to this card
                    card.classList.add('selected');
                    // Update selected location
                    selectedLocation = locationName;
                }
            });
        });
    });
});