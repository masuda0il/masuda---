// Tab functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Store active tab in localStorage
            localStorage.setItem('activeTab', targetTab);
        });
    });
    
    // Restore active tab from localStorage
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab && document.getElementById(savedTab)) {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${savedTab}"]`).classList.add('active');
        document.getElementById(savedTab).classList.add('active');
    }
    
    // Customize modal functionality
    const customizeBtn = document.getElementById('customize-sleepen');
    const customizeModal = document.getElementById('customize-modal');
    const closeCustomizeModal = document.querySelector('.close-customize-modal');
    
    if (customizeBtn && customizeModal) {
        customizeBtn.addEventListener('click', function() {
            customizeModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeCustomizeModal) {
        closeCustomizeModal.addEventListener('click', function() {
            customizeModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Color selection functionality
    const colorOptions = document.querySelectorAll('.color-option');
    const accessoryOptions = document.querySelectorAll('.accessory-option');
    const previewSleepen = document.getElementById('preview-sleepen');
    
    let selectedColor = 'blue';
    let selectedAccessory = 'none';
    
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            selectedColor = this.getAttribute('data-color');
            updatePreview();
        });
    });
    
    accessoryOptions.forEach(option => {
        option.addEventListener('click', function() {
            accessoryOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            selectedAccessory = this.getAttribute('data-accessory');
            updatePreview();
        });
    });
    
    function updatePreview() {
        if (!previewSleepen) return;
        
        // Update color
        previewSleepen.className = `sleepen-body-preview stage-1`;
        
        switch(selectedColor) {
            case 'blue':
                previewSleepen.style.background = 'linear-gradient(135deg, #87CEEB 0%, #4682B4 100%)';
                break;
            case 'purple':
                previewSleepen.style.background = 'linear-gradient(135deg, #9370DB 0%, #4B0082 100%)';
                break;
            case 'pink':
                previewSleepen.style.background = 'linear-gradient(135deg, #FF69B4 0%, #8B008B 100%)';
                break;
            case 'gold':
                previewSleepen.style.background = 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)';
                break;
            case 'green':
                previewSleepen.style.background = 'linear-gradient(135deg, #00CED1 0%, #008B8B 100%)';
                break;
        }
        
        // Update accessories (placeholder for now)
        const accessoryPreview = previewSleepen.querySelector('.sleepen-accessories-preview');
        if (accessoryPreview) {
            accessoryPreview.innerHTML = '';
            
            if (selectedAccessory !== 'none') {
                const accessoryElement = document.createElement('div');
                accessoryElement.className = `accessory-${selectedAccessory}`;
                accessoryElement.style.cssText = `
                    position: absolute;
                    top: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 20px;
                    color: #333;
                `;
                
                switch(selectedAccessory) {
                    case 'hat':
                        accessoryElement.innerHTML = '🎩';
                        break;
                    case 'glasses':
                        accessoryElement.innerHTML = '👓';
                        break;
                    case 'bowtie':
                        accessoryElement.innerHTML = '🎀';
                        break;
                }
                
                accessoryPreview.appendChild(accessoryElement);
            }
        }
    }
    
    // Apply customization
    const applyCustomizationBtn = document.getElementById('apply-customization');
    if (applyCustomizationBtn) {
        applyCustomizationBtn.addEventListener('click', function() {
            // Apply to main sleepen avatar
            const mainSleepen = document.querySelector('.sleepen-body');
            if (mainSleepen) {
                // Update color
                switch(selectedColor) {
                    case 'blue':
                        mainSleepen.style.background = 'linear-gradient(135deg, #87CEEB 0%, #4682B4 100%)';
                        break;
                    case 'purple':
                        mainSleepen.style.background = 'linear-gradient(135deg, #9370DB 0%, #4B0082 100%)';
                        break;
                    case 'pink':
                        mainSleepen.style.background = 'linear-gradient(135deg, #FF69B4 0%, #8B008B 100%)';
                        break;
                    case 'gold':
                        mainSleepen.style.background = 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)';
                        break;
                    case 'green':
                        mainSleepen.style.background = 'linear-gradient(135deg, #00CED1 0%, #008B8B 100%)';
                        break;
                }
            }
            
            // Save to server (placeholder)
            fetch('/api/save_sleepen_appearance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    color: selectedColor,
                    accessory: selectedAccessory
                })
            }).then(response => response.json())
              .then(data => {
                  if (data.success) {
                      showNotification('着せ替えが保存されました！', 'success');
                  }
              });
            
            // Close modal
            customizeModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Reset customization
    const resetCustomizationBtn = document.getElementById('reset-customization');
    if (resetCustomizationBtn) {
        resetCustomizationBtn.addEventListener('click', function() {
            selectedColor = 'blue';
            selectedAccessory = 'none';
            
            colorOptions.forEach(opt => opt.classList.remove('active'));
            accessoryOptions.forEach(opt => opt.classList.remove('active'));
            
            document.querySelector('[data-color="blue"]').classList.add('active');
            document.querySelector('[data-accessory="none"]').classList.add('active');
            
            updatePreview();
        });
    }
    
    // Enhanced Adventure Modal
    const enhancedAdventureModal = document.getElementById('enhanced-adventure-modal');
    const closeEnhancedAdventureModal = document.querySelector('.close-enhanced-adventure-modal');
    const adventureTypeCards = document.querySelectorAll('.adventure-type-card');
    const adventureTypeOptions = document.querySelectorAll('.adventure-type-option');
    
    // Open enhanced adventure modal when clicking adventure type cards
    adventureTypeCards.forEach(card => {
        card.addEventListener('click', function() {
            const adventureType = this.getAttribute('data-adventure');
            if (enhancedAdventureModal) {
                enhancedAdventureModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
                
                // Pre-select the adventure type
                adventureTypeOptions.forEach(option => option.classList.remove('selected'));
                const targetOption = document.querySelector(`[data-type="${adventureType}"]`);
                if (targetOption) {
                    targetOption.classList.add('selected');
                    updateAdventureRewards(adventureType);
                }
            }
        });
    });
    
    // Adventure type selection
    adventureTypeOptions.forEach(option => {
        option.addEventListener('click', function() {
            adventureTypeOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            const type = this.getAttribute('data-type');
            updateAdventureRewards(type);
        });
    });
    
    function updateAdventureRewards(type) {
        const expReward = document.getElementById('exp-reward');
        const coinReward = document.getElementById('coin-reward');
        const itemReward = document.getElementById('item-reward');
        
        if (!expReward || !coinReward || !itemReward) return;
        
        switch(type) {
            case 'exploration':
                expReward.textContent = '20-50 経験値';
                coinReward.textContent = '10-30 コイン';
                itemReward.textContent = 'アイテム発見チャンス';
                break;
            case 'battle':
                expReward.textContent = '50-100 経験値';
                coinReward.textContent = '30-80 コイン';
                itemReward.textContent = 'レアアイテム確定';
                break;
            case 'treasure':
                expReward.textContent = '30-70 経験値';
                coinReward.textContent = '20-60 コイン';
                itemReward.textContent = '貴重アイテム確定';
                break;
            case 'mystery':
                expReward.textContent = '40-80 経験値';
                coinReward.textContent = '15-40 コイン';
                itemReward.textContent = 'スキル習得チャンス';
                break;
        }
    }
    
    // Close enhanced adventure modal
    if (closeEnhancedAdventureModal) {
        closeEnhancedAdventureModal.addEventListener('click', function() {
            enhancedAdventureModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Start enhanced adventure
    const startEnhancedAdventureBtn = document.getElementById('start-enhanced-adventure-btn');
    if (startEnhancedAdventureBtn) {
        startEnhancedAdventureBtn.addEventListener('click', function() {
            const selectedType = document.querySelector('.adventure-type-option.selected');
            const duration = document.getElementById('adventure-duration').value;
            const risk = document.getElementById('adventure-risk').value;
            const location = document.getElementById('adventure-location-select').value;
            const partySize = document.getElementById('party-size').value;
            
            if (!selectedType) {
                showNotification('冒険タイプを選択してください', 'error');
                return;
            }
            
            const adventureData = {
                type: selectedType.getAttribute('data-type'),
                duration: duration,
                risk: risk,
                location: location,
                partySize: partySize
            };
            
            // Send to server
            fetch('/api/start_enhanced_adventure', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(adventureData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('冒険が開始されました！', 'success');
                    enhancedAdventureModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    
                    // Refresh sleepen data
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                } else {
                    showNotification(data.message || '冒険を開始できませんでした', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('エラーが発生しました', 'error');
            });
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === customizeModal) {
            customizeModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (event.target === enhancedAdventureModal) {
            enhancedAdventureModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            font-weight: 600;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Add CSS animations for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize preview with default values
    updatePreview();
});