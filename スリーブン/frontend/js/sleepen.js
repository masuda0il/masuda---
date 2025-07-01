/**
 * スリープセット - スリープン（仮想ペット）機能
 */

// DOM要素
const sleepenMainImage = document.getElementById('sleepen-main-image');
const sleepenMainName = document.getElementById('sleepen-main-name');
const sleepenMainLevel = document.getElementById('sleepen-main-level');
const expProgress = document.getElementById('exp-progress');
const expText = document.getElementById('exp-text');
const sleepenMoodBar = document.getElementById('sleepen-mood-bar');
const sleepenEnergyBar = document.getElementById('sleepen-energy-bar');
const sleepenFriendshipBar = document.getElementById('sleepen-friendship-bar');
const moodText = document.getElementById('mood-text');
const energyText = document.getElementById('energy-text');
const friendshipText = document.getElementById('friendship-text');
const sleepenMessage = document.getElementById('sleepen-message');
const skillsContainer = document.getElementById('skills-container');
const itemsContainer = document.getElementById('items-container');
const placesContainer = document.getElementById('places-container');
const renameSleepenBtn = document.getElementById('rename-sleepen');
const playBtn = document.getElementById('play-btn');
const restBtn = document.getElementById('rest-btn');
const adventureBtn = document.getElementById('adventure-btn');
const trainBtn = document.getElementById('train-btn');

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // スリープンの名前変更ボタンのイベントリスナー
    renameSleepenBtn.addEventListener('click', showRenameModal);
    
    // アクティビティボタンのイベントリスナー
    playBtn.addEventListener('click', () => performActivity('play'));
    restBtn.addEventListener('click', () => performActivity('rest'));
    adventureBtn.addEventListener('click', () => performActivity('adventure'));
    trainBtn.addEventListener('click', () => performActivity('train'));
});

/**
 * スリープンページの更新
 */
function updateSleepenPage() {
    if (!sleepenData) return;
    
    // スリープンの基本情報を更新
    updateSleepenInfo();
    
    // スキルを更新
    updateSkills();
    
    // アイテムを更新
    updateItems();
    
    // 発見した場所を更新
    updatePlaces();
}

/**
 * スリープンの基本情報を更新
 */
function updateSleepenInfo() {
    // 名前とレベル
    sleepenMainName.textContent = sleepenData.name;
    sleepenMainLevel.textContent = `Lv.${sleepenData.level}`;
    
    // 画像
    sleepenMainImage.src = `images/sleepen/stage${sleepenData.evolutionStage}.png`;
    
    // 経験値
    const expNeeded = sleepenData.level * 20;
    const expPercentage = (sleepenData.exp / expNeeded) * 100;
    expProgress.style.width = `${expPercentage}%`;
    expText.textContent = `${sleepenData.exp}/${expNeeded}`;
    
    // ステータスバー
    sleepenMoodBar.style.width = `${sleepenData.mood}%`;
    sleepenEnergyBar.style.width = `${sleepenData.energy}%`;
    sleepenFriendshipBar.style.width = `${sleepenData.friendship}%`;
    
    // ステータステキスト
    moodText.textContent = `${sleepenData.mood}%`;
    energyText.textContent = `${sleepenData.energy}%`;
    friendshipText.textContent = `${sleepenData.friendship}%`;
    
    // ステータスに基づいてメッセージを表示
    updateSleepenMessage();
}

/**
 * スリープンのメッセージを更新
 */
function updateSleepenMessage() {
    let message = '';
    
    // エネルギーが低い場合
    if (sleepenData.energy < 20) {
        message = 'とても疲れています。休息が必要です。';
    }
    // 機嫌が悪い場合
    else if (sleepenData.mood < 30) {
        message = '機嫌が悪いようです。一緒に遊んであげましょう。';
    }
    // 友情度が高い場合
    else if (sleepenData.friendship > 80) {
        message = 'あなたのことが大好きです！';
    }
    // レベルアップした場合
    else if (sleepenData.exp >= sleepenData.level * 20 - 5) {
        message = 'もう少しでレベルアップしそうです！';
    }
    // デフォルトメッセージ
    else {
        const defaultMessages = [
            '今日も良い一日ですね！',
            '一緒に良い睡眠習慣を作りましょう！',
            'あなたの睡眠をサポートします！',
            '何か冒険に行きたいな...',
            'スキルを磨いて、もっと役立ちたいです！'
        ];
        message = defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
    }
    
    sleepenMessage.innerHTML = `<p>${message}</p>`;
}

/**
 * スキルを更新
 */
function updateSkills() {
    if (!sleepenData.skills || sleepenData.skills.length === 0) {
        skillsContainer.innerHTML = '<p class="no-data-message">スキルはまだありません。レベルアップすると獲得できます。</p>';
        return;
    }
    
    let skillsHTML = '';
    
    sleepenData.skills.forEach(skill => {
        skillsHTML += `
            <div class="skill-item" data-skill-id="${skill.id}">
                <div class="skill-info">
                    <h4>${skill.name}</h4>
                    <p>${skill.description}</p>
                </div>
                <button class="btn small-btn use-skill-btn" data-skill-id="${skill.id}">使用</button>
            </div>
        `;
    });
    
    skillsContainer.innerHTML = skillsHTML;
    
    // スキル使用ボタンのイベントリスナー
    document.querySelectorAll('.use-skill-btn').forEach(button => {
        button.addEventListener('click', () => {
            const skillId = button.getAttribute('data-skill-id');
            useSkill(skillId);
        });
    });
}

/**
 * アイテムを更新
 */
function updateItems() {
    if (!sleepenData.items || sleepenData.items.length === 0) {
        itemsContainer.innerHTML = '<p class="no-data-message">アイテムはまだありません。冒険で見つけることができます。</p>';
        return;
    }
    
    // アイテムをレア度でグループ化
    const groupedItems = {
        legendary: [],
        rare: [],
        common: []
    };
    
    sleepenData.items.forEach(item => {
        groupedItems[item.rarity].push(item);
    });
    
    let itemsHTML = '';
    
    // レア度順に表示
    ['legendary', 'rare', 'common'].forEach(rarity => {
        const items = groupedItems[rarity];
        if (items.length > 0) {
            const rarityText = {
                legendary: '伝説',
                rare: 'レア',
                common: '一般'
            }[rarity];
            
            itemsHTML += `<h4 class="rarity-heading ${rarity}">${rarityText}</h4>`;
            
            items.forEach(item => {
                itemsHTML += `
                    <div class="item-card ${rarity}" data-item-id="${item.id}">
                        <div class="item-info">
                            <h5>${item.name}</h5>
                            <p>${item.description}</p>
                            <p class="item-effect">効果: ${item.effect}</p>
                        </div>
                        <button class="btn small-btn use-item-btn" data-item-id="${item.id}">使用</button>
                    </div>
                `;
            });
        }
    });
    
    if (itemsHTML === '') {
        itemsContainer.innerHTML = '<p class="no-data-message">アイテムはまだありません。冒険で見つけることができます。</p>';
    } else {
        itemsContainer.innerHTML = itemsHTML;
        
        // アイテム使用ボタンのイベントリスナー
        document.querySelectorAll('.use-item-btn').forEach(button => {
            button.addEventListener('click', () => {
                const itemId = button.getAttribute('data-item-id');
                useItem(itemId);
            });
        });
    }
}

/**
 * 発見した場所を更新
 */
function updatePlaces() {
    if (!sleepenData.discoveredPlaces || sleepenData.discoveredPlaces.length === 0) {
        placesContainer.innerHTML = '<p class="no-data-message">まだ場所を発見していません。冒険に出かけましょう。</p>';
        return;
    }
    
    let placesHTML = '';
    
    sleepenData.discoveredPlaces.forEach(place => {
        placesHTML += `
            <div class="place-card" data-place-id="${place.id}">
                <div class="place-info">
                    <h4>${place.name}</h4>
                    <p>${place.description}</p>
                </div>
                <button class="btn small-btn visit-place-btn" data-place-id="${place.id}">訪問</button>
            </div>
        `;
    });
    
    placesContainer.innerHTML = placesHTML;
    
    // 場所訪問ボタンのイベントリスナー
    document.querySelectorAll('.visit-place-btn').forEach(button => {
        button.addEventListener('click', () => {
            const placeId = button.getAttribute('data-place-id');
            visitPlace(placeId);
        });
    });
}

/**
 * スリープンの名前変更モーダルを表示
 */
function showRenameModal() {
    const content = `
        <form id="rename-form">
            <div class="form-group">
                <label for="new-name">新しい名前</label>
                <input type="text" id="new-name" value="${sleepenData.name}" maxlength="20" required>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn primary-btn">変更</button>
                <button type="button" id="cancel-rename" class="btn secondary-btn">キャンセル</button>
            </div>
        </form>
    `;
    
    app.openModal('スリープンの名前変更', content);
    
    // フォーム送信イベント
    document.getElementById('rename-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newName = document.getElementById('new-name').value.trim();
        
        if (newName && newName !== sleepenData.name) {
            await updateSleepenName(newName);
        }
        
        app.closeModal();
    });
    
    // キャンセルボタンのイベント
    document.getElementById('cancel-rename').addEventListener('click', () => {
        app.closeModal();
    });
}

/**
 * スリープンの名前を更新
 * @param {string} newName - 新しい名前
 */
async function updateSleepenName(newName) {
    try {
        const response = await fetch(`${API_BASE_URL}/sleepen/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: newName })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // スリープンデータを更新
        sleepenData.name = newName;
        
        // UIを更新
        updateSleepenInfo();
        
        app.showNotification('スリープンの名前を変更しました。', 'success');
    } catch (error) {
        console.error('スリープンの名前変更中にエラーが発生しました:', error);
        
        // オフラインの場合はローカルに保存
        if (!navigator.onLine) {
            sleepenData.name = newName;
            
            // 保留中の更新を追加
            if (!sleepenData.pendingUpdates) {
                sleepenData.pendingUpdates = [];
            }
            
            sleepenData.pendingUpdates.push({ name: newName });
            
            // ローカルストレージに保存
            saveToLocalStorage('sleepenData', sleepenData);
            
            // UIを更新
            updateSleepenInfo();
            
            app.showNotification('オフラインモード: 名前変更はローカルに保存され、オンラインになったときに同期されます。', 'info');
        } else {
            app.showNotification('スリープンの名前変更中にエラーが発生しました。', 'error');
        }
    }
}

/**
 * アクティビティを実行
 * @param {string} activity - アクティビティタイプ（play, rest, adventure, train）
 */
async function performActivity(activity) {
    // エネルギーチェック
    if ((activity === 'adventure' && sleepenData.energy < 20) || 
        (activity === 'train' && sleepenData.energy < 15) ||
        (activity === 'play' && sleepenData.energy < 10)) {
        app.showNotification('スリープンのエネルギーが足りません。休息させてください。', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/sleepen/activity`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ activity })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // スリープンデータを更新
        sleepenData = result.sleepen;
        
        // UIを更新
        updateSleepenPage();
        
        // 結果メッセージを表示
        showActivityResult(result);
    } catch (error) {
        console.error('アクティビティの実行中にエラーが発生しました:', error);
        
        // オフラインの場合はローカルで処理
        if (!navigator.onLine) {
            // オフラインでのアクティビティ処理
            const result = processOfflineActivity(activity);
            
            // UIを更新
            updateSleepenPage();
            
            // 結果メッセージを表示
            showActivityResult(result);
            
            app.showNotification('オフラインモード: アクティビティはローカルで処理され、オンラインになったときに同期されます。', 'info');
        } else {
            app.showNotification('アクティビティの実行中にエラーが発生しました。', 'error');
        }
    }
}

/**
 * オフラインでのアクティビティ処理
 * @param {string} activity - アクティビティタイプ
 * @returns {Object} 処理結果
 */
function processOfflineActivity(activity) {
    const result = {
        success: true,
        message: "",
        rewards: []
    };
    
    // 保留中の更新を追加
    if (!sleepenData.pendingUpdates) {
        sleepenData.pendingUpdates = [];
    }
    
    // アクティビティに基づいて処理
    switch (activity) {
        case 'play':
            // 遊ぶ
            sleepenData.mood = Math.min(100, sleepenData.mood + 15);
            sleepenData.energy = Math.max(0, sleepenData.energy - 10);
            sleepenData.friendship = Math.min(100, sleepenData.friendship + 5);
            sleepenData.exp += 5;
            result.message = "スリープンと楽しく遊びました！";
            break;
            
        case 'rest':
            // 休息
            sleepenData.energy = Math.min(100, sleepenData.energy + 30);
            result.message = "スリープンはエネルギーを回復しました。";
            break;
            
        case 'adventure':
            // 冒険
            sleepenData.energy = Math.max(0, sleepenData.energy - 20);
            sleepenData.exp += 10;
            
            // 簡易的なランダム処理
            const findSomething = Math.random() < 0.7;
            
            if (findSomething) {
                const findPlace = Math.random() < 0.3;
                
                if (findPlace) {
                    // 場所を発見
                    const places = [
                        {"id": "crystal_forest", "name": "クリスタルの森", "description": "透明な木々が立ち並ぶ幻想的な森。", "rewards": "crystal_items"},
                        {"id": "floating_islands", "name": "浮遊島", "description": "空に浮かぶ小さな島々。", "rewards": "sky_items"},
                        {"id": "dream_lake", "name": "夢見の湖", "description": "見る者の夢を映し出す神秘的な湖。", "rewards": "water_items"},
                        {"id": "star_cave", "name": "星の洞窟", "description": "天井に星が輝く美しい洞窟。", "rewards": "star_items"},
                        {"id": "memory_ruins", "name": "記憶の遺跡", "description": "古代の記憶が宿る神秘的な遺跡。", "rewards": "memory_items"},
                        {"id": "rainbow_valley", "name": "虹の谷", "description": "常に虹がかかる色彩豊かな谷。", "rewards": "color_items"},
                        {"id": "whispering_meadow", "name": "囁きの草原", "description": "風が秘密を囁く不思議な草原。", "rewards": "wind_items"},
                        {"id": "moonlight_beach", "name": "月光の浜辺", "description": "月の光に照らされた神秘的な浜辺。", "rewards": "moon_items"}
                    ];
                    
                    const newPlace = places[Math.floor(Math.random() * places.length)];
                    
                    // 既に発見済みでないか確認
                    const alreadyDiscovered = sleepenData.discoveredPlaces.some(place => place.id === newPlace.id);
                    
                    if (!alreadyDiscovered) {
                        sleepenData.discoveredPlaces.push(newPlace);
                        result.message = `スリープンは新しい場所「${newPlace.name}」を発見しました！`;
                        result.rewards.push({"type": "place", "place": newPlace});
                    } else {
                        result.message = "スリープンは冒険に出かけましたが、特に何も見つかりませんでした。";
                    }
                } else {
                    // アイテムを発見
                    const rarityRoll = Math.random();
                    let rarity;
                    
                    if (rarityRoll < 0.05) {
                        rarity = "legendary";
                    } else if (rarityRoll < 0.3) {
                        rarity = "rare";
                    } else {
                        rarity = "common";
                    }
                    
                    const items = {
                        "common": [
                            {"id": "dream_feather", "name": "夢の羽", "description": "夢の世界から落ちてきた柔らかい羽。", "effect": "mood+5"},
                            {"id": "sleep_crystal", "name": "睡眠クリスタル", "description": "眠りの力が宿った小さな結晶。", "effect": "energy+10"},
                            {"id": "star_dust", "name": "星のほこり", "description": "夜空から集められた輝くほこり。", "effect": "exp+5"}
                        ],
                        "rare": [
                            {"id": "moon_fragment", "name": "月の欠片", "description": "月から落ちてきた神秘的な欠片。", "effect": "energy+20,mood+10"},
                            {"id": "dream_map", "name": "夢の地図", "description": "夢の世界の一部を示す地図。", "effect": "discover_chance+15%"},
                            {"id": "memory_bottle", "name": "記憶の小瓶", "description": "美しい記憶を保存できる小瓶。", "effect": "friendship+15"}
                        ],
                        "legendary": [
                            {"id": "dream_key", "name": "夢の鍵", "description": "夢の世界の隠された扉を開ける鍵。", "effect": "unlock_special_place"},
                            {"id": "eternal_star", "name": "永遠の星", "description": "決して消えることのない星の結晶。", "effect": "all_stats+10"},
                            {"id": "time_hourglass", "name": "時の砂時計", "description": "夢の中で時間を操ることができる砂時計。", "effect": "special_adventure"}
                        ]
                    };
                    
                    const newItem = items[rarity][Math.floor(Math.random() * items[rarity].length)];
                    newItem.rarity = rarity;
                    
                    sleepenData.items.push(newItem);
                    result.message = `スリープンは「${newItem.name}」を見つけました！`;
                    result.rewards.push({"type": "item", "item": newItem});
                }
            } else {
                result.message = "スリープンは冒険に出かけましたが、特に何も見つかりませんでした。";
            }
            break;
            
        case 'train':
            // トレーニング
            sleepenData.energy = Math.max(0, sleepenData.energy - 15);
            sleepenData.exp += 8;
            result.message = "スリープンはトレーニングを行いました。";
            break;
    }
    
    // レベルアップとスキル獲得をチェック
    checkLevelUp();
    
    // 進化をチェック
    checkEvolution();
    
    // 保留中の更新を追加
    sleepenData.pendingUpdates.push({ activity });
    
    // ローカルストレージに保存
    saveToLocalStorage('sleepenData', sleepenData);
    
    return result;
}

/**
 * レベルアップとスキル獲得をチェック
 */
function checkLevelUp() {
    // 経験値が必要量に達しているか
    const expNeeded = sleepenData.level * 20;
    
    if (sleepenData.exp >= expNeeded) {
        // レベルアップ
        sleepenData.level += 1;
        sleepenData.exp -= expNeeded;
        
        // スキル獲得
        switch (sleepenData.level) {
            case 3:
                sleepenData.skills.push({"id": "dream_decode", "name": "夢の解読", "description": "スリープンが夢の意味を解読できるようになります。"});
                break;
            case 5:
                sleepenData.skills.push({"id": "healing_light", "name": "癒しの光", "description": "スリープンが癒しの光を放ち、ユーザーの気分を改善します。"});
                break;
            case 7:
                sleepenData.skills.push({"id": "memory_storage", "name": "記憶の保管", "description": "スリープンが重要な記憶を保管し、必要なときに思い出させてくれます。"});
                break;
            case 10:
                sleepenData.skills.push({"id": "dream_manipulation", "name": "夢の操作", "description": "スリープンがユーザーの夢を良い方向に操作できるようになります。"});
                break;
            case 12:
                sleepenData.skills.push({"id": "time_sense", "name": "時間感覚", "description": "スリープンが最適な睡眠時間を感知し、ユーザーに知らせます。"});
                break;
            case 15:
                sleepenData.skills.push({"id": "dimension_door", "name": "次元の扉", "description": "スリープンが夢の世界の新しい次元への扉を開けるようになります。"});
                break;
        }
    }
}

/**
 * 進化をチェック
 */
function checkEvolution() {
    if (sleepenData.level >= 5 && sleepenData.evolutionStage === 1) {
        sleepenData.evolutionStage = 2;
    } else if (sleepenData.level >= 10 && sleepenData.evolutionStage === 2) {
        sleepenData.evolutionStage = 3;
    } else if (sleepenData.level >= 15 && sleepenData.evolutionStage === 3) {
        sleepenData.evolutionStage = 4;
    }
}

/**
 * アクティビティ結果を表示
 * @param {Object} result - アクティビティの結果
 */
function showActivityResult(result) {
    if (!result.success) {
        app.showNotification(result.message, 'warning');
        return;
    }
    
    let content = `<p>${result.message}</p>`;
    
    // 報酬がある場合
    if (result.rewards && result.rewards.length > 0) {
        content += '<div class="rewards-container">';
        
        result.rewards.forEach(reward => {
            if (reward.type === 'item') {
                const item = reward.item;
                const rarityClass = item.rarity;
                
                content += `
                    <div class="reward-item ${rarityClass}">
                        <h4>${item.name}</h4>
                        <p>${item.description}</p>
                        <p class="item-effect">効果: ${item.effect}</p>
                    </div>
                `;
            } else if (reward.type === 'place') {
                const place = reward.place;
                
                content += `
                    <div class="reward-place">
                        <h4>${place.name}</h4>
                        <p>${place.description}</p>
                    </div>
                `;
            }
        });
        
        content += '</div>';
    }
    
    app.openModal('アクティビティ結果', content);
}

/**
 * スキルを使用
 * @param {string} skillId - スキルID
 */
function useSkill(skillId) {
    const skill = sleepenData.skills.find(s => s.id === skillId);
    
    if (!skill) return;
    
    let content = '';
    
    switch (skillId) {
        case 'dream_decode':
            content = `
                <p>スリープンが夢の意味を解読します。</p>
                <form id="dream-decode-form">
                    <div class="form-group">
                        <label for="dream-description">あなたの夢の内容を教えてください</label>
                        <textarea id="dream-description" rows="4" required></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn primary-btn">解読</button>
                        <button type="button" id="cancel-skill" class="btn secondary-btn">キャンセル</button>
                    </div>
                </form>
            `;
            
            app.openModal('夢の解読', content);
            
            document.getElementById('dream-decode-form').addEventListener('submit', (e) => {
                e.preventDefault();
                
                const dreamDescription = document.getElementById('dream-description').value.trim();
                
                if (dreamDescription) {
                    showDreamDecodeResult(dreamDescription);
                }
            });
            
            document.getElementById('cancel-skill').addEventListener('click', () => {
                app.closeModal();
            });
            break;
            
        case 'healing_light':
            // 癒しの光スキル
            sleepenData.mood = Math.min(100, sleepenData.mood + 10);
            
            content = `
                <p>スリープンが癒しの光を放ちました。</p>
                <p>あなたの気分が改善されました。</p>
            `;
            
            app.openModal('癒しの光', content);
            
            // 3秒後に自動的に閉じる
            setTimeout(() => {
                app.closeModal();
                updateSleepenInfo();
            }, 3000);
            break;
            
        case 'memory_storage':
            content = `
                <p>スリープンが記憶を保管します。</p>
                <form id="memory-storage-form">
                    <div class="form-group">
                        <label for="memory-description">保管したい記憶を教えてください</label>
                        <textarea id="memory-description" rows="4" required></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn primary-btn">保管</button>
                        <button type="button" id="cancel-skill" class="btn secondary-btn">キャンセル</button>
                    </div>
                </form>
            `;
            
            app.openModal('記憶の保管', content);
            
            document.getElementById('memory-storage-form').addEventListener('submit', (e) => {
                e.preventDefault();
                
                const memoryDescription = document.getElementById('memory-description').value.trim();
                
                if (memoryDescription) {
                    // 記憶を保存
                    if (!sleepenData.storedMemories) {
                        sleepenData.storedMemories = [];
                    }
                    
                    sleepenData.storedMemories.push({
                        id: Date.now(),
                        date: new Date().toISOString(),
                        content: memoryDescription
                    });
                    
                    // ローカルストレージに保存
                    saveToLocalStorage('sleepenData', sleepenData);
                    
                    app.closeModal();
                    app.showNotification('記憶を保管しました。', 'success');
                }
            });
            
            document.getElementById('cancel-skill').addEventListener('click', () => {
                app.closeModal();
            });
            break;
            
        case 'dream_manipulation':
            content = `
                <p>スリープンがあなたの夢を良い方向に操作します。</p>
                <p>今夜、良い夢を見ることができるでしょう。</p>
                <p>効果: 次回の睡眠の質が向上します。</p>
            `;
            
            app.openModal('夢の操作', content);
            
            // 夢操作フラグを設定
            sleepenData.dreamManipulated = true;
            saveToLocalStorage('sleepenData', sleepenData);
            break;
            
        case 'time_sense':
            // 現在の睡眠データから最適な睡眠時間を計算
            let optimalBedtime = "22:00";
            let optimalWakeTime = "06:30";
            
            if (sleepData && sleepData.records && sleepData.records.length > 0) {
                // 質の高い睡眠記録を抽出
                const goodSleepRecords = sleepData.records.filter(record => record.quality >= 4);
                
                if (goodSleepRecords.length > 0) {
                    // 就寝時間の平均を計算
                    let totalBedtimeMinutes = 0;
                    goodSleepRecords.forEach(record => {
                        const [hours, minutes] = record.bedtime.split(':').map(Number);
                        totalBedtimeMinutes += hours * 60 + minutes;
                    });
                    const avgBedtimeMinutes = Math.round(totalBedtimeMinutes / goodSleepRecords.length);
                    const bedtimeHours = Math.floor(avgBedtimeMinutes / 60);
                    const bedtimeMinutes = avgBedtimeMinutes % 60;
                    optimalBedtime = `${String(bedtimeHours).padStart(2, '0')}:${String(bedtimeMinutes).padStart(2, '0')}`;
                    
                    // 起床時間の平均を計算
                    let totalWakeTimeMinutes = 0;
                    goodSleepRecords.forEach(record => {
                        const [hours, minutes] = record.wakeTime.split(':').map(Number);
                        totalWakeTimeMinutes += hours * 60 + minutes;
                    });
                    const avgWakeTimeMinutes = Math.round(totalWakeTimeMinutes / goodSleepRecords.length);
                    const wakeTimeHours = Math.floor(avgWakeTimeMinutes / 60);
                    const wakeTimeMinutes = avgWakeTimeMinutes % 60;
                    optimalWakeTime = `${String(wakeTimeHours).padStart(2, '0')}:${String(wakeTimeMinutes).padStart(2, '0')}`;
                }
            }
            
            content = `
                <p>スリープンがあなたの最適な睡眠時間を感知しました。</p>
                <div class="optimal-times">
                    <div class="optimal-time">
                        <span class="time-label">最適な就寝時間</span>
                        <span class="time-value">${optimalBedtime}</span>
                    </div>
                    <div class="optimal-time">
                        <span class="time-label">最適な起床時間</span>
                        <span class="time-value">${optimalWakeTime}</span>
                    </div>
                </div>
                <p>この時間に従うことで、睡眠の質が向上します。</p>
            `;
            
            app.openModal('時間感覚', content);
            break;
            
        case 'dimension_door':
            content = `
                <p>スリープンが次元の扉を開きます。</p>
                <p>新しい夢の世界への扉が開かれました。</p>
                <p>次回の冒険で特別な場所を発見できる確率が大幅に上昇します。</p>
            `;
            
            app.openModal('次元の扉', content);
            
            // 次元の扉フラグを設定
            sleepenData.dimensionDoorOpened = true;
            saveToLocalStorage('sleepenData', sleepenData);
            break;
    }
}

/**
 * 夢の解読結果を表示
 * @param {string} dreamDescription - 夢の内容
 */
function showDreamDecodeResult(dreamDescription) {
    // 夢の解読結果（簡易的なランダム解釈）
    const interpretations = [
        "この夢は、あなたの潜在意識が新しい可能性を探っていることを示しています。",
        "この夢は、過去の経験から学び、成長していることを表しています。",
        "この夢は、あなたの創造性とイマジネーションが活発になっていることを示しています。",
        "この夢は、あなたの内なる不安や恐れを表しています。それらに向き合うことで、成長できるでしょう。",
        "この夢は、あなたの願望や目標を反映しています。それに向かって進んでいくことが大切です。",
        "この夢は、あなたの人間関係における変化を示唆しています。",
        "この夢は、あなたの中の無意識の部分が表面化していることを示しています。",
        "この夢は、あなたの生活の中でバランスを取ることの重要性を教えています。",
        "この夢は、あなたの直感が何かを伝えようとしていることを示しています。その声に耳を傾けましょう。",
        "この夢は、あなたの中の変化と成長のプロセスを表しています。"
    ];
    
    const interpretation = interpretations[Math.floor(Math.random() * interpretations.length)];
    
    const content = `
        <div class="dream-decode-result">
            <h4>夢の内容</h4>
            <p class="dream-content">${dreamDescription}</p>
            <h4>解読結果</h4>
            <p class="dream-interpretation">${interpretation}</p>
        </div>
    `;
    
    app.openModal('夢の解読結果', content);
}

/**
 * アイテムを使用
 * @param {string} itemId - アイテムID
 */
function useItem(itemId) {
    // アイテムを検索
    const itemIndex = sleepenData.items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) return;
    
    const item = sleepenData.items[itemIndex];
    let content = '';
    let effectApplied = false;
    
    // アイテムの効果を適用
    if (item.effect.includes('mood+')) {
        const moodBoost = parseInt(item.effect.match(/mood\+(\d+)/)[1]);
        sleepenData.mood = Math.min(100, sleepenData.mood + moodBoost);
        effectApplied = true;
    }
    
    if (item.effect.includes('energy+')) {
        const energyBoost = parseInt(item.effect.match(/energy\+(\d+)/)[1]);
        sleepenData.energy = Math.min(100, sleepenData.energy + energyBoost);
        effectApplied = true;
    }
    
    if (item.effect.includes('friendship+')) {
        const friendshipBoost = parseInt(item.effect.match(/friendship\+(\d+)/)[1]);
        sleepenData.friendship = Math.min(100, sleepenData.friendship + friendshipBoost);
        effectApplied = true;
    }
    
    if (item.effect.includes('exp+')) {
        const expBoost = parseInt(item.effect.match(/exp\+(\d+)/)[1]);
        sleepenData.exp += expBoost;
        
        // レベルアップをチェック
        checkLevelUp();
        
        // 進化をチェック
        checkEvolution();
        
        effectApplied = true;
    }
    
    if (item.effect === 'all_stats+10') {
        sleepenData.mood = Math.min(100, sleepenData.mood + 10);
        sleepenData.energy = Math.min(100, sleepenData.energy + 10);
        sleepenData.friendship = Math.min(100, sleepenData.friendship + 10);
        sleepenData.exp += 10;
        
        // レベルアップをチェック
        checkLevelUp();
        
        // 進化をチェック
        checkEvolution();
        
        effectApplied = true;
    }
    
    if (item.effect === 'unlock_special_place') {
        // 特別な場所をアンロック
        const specialPlaces = [
            {"id": "crystal_palace", "name": "クリスタルの宮殿", "description": "夢の世界の中心にある神秘的な宮殿。", "rewards": "special_items"},
            {"id": "time_library", "name": "時の図書館", "description": "過去と未来のすべての知識が収められた図書館。", "rewards": "knowledge_items"},
            {"id": "infinity_garden", "name": "無限の庭園", "description": "果てしなく広がる美しい庭園。", "rewards": "rare_plants"}
        ];
        
        const newPlace = specialPlaces[Math.floor(Math.random() * specialPlaces.length)];
        
        // 既に発見済みでないか確認
        const alreadyDiscovered = sleepenData.discoveredPlaces.some(place => place.id === newPlace.id);
        
        if (!alreadyDiscovered) {
            sleepenData.discoveredPlaces.push(newPlace);
            content = `
                <p>夢の鍵が輝き、新しい場所への扉が開きました！</p>
                <div class="special-place">
                    <h4>${newPlace.name}</h4>
                    <p>${newPlace.description}</p>
                </div>
            `;
            effectApplied = true;
        } else {
            content = `
                <p>夢の鍵が輝きましたが、新しい場所は見つかりませんでした。</p>
            `;
        }
    }
    
    if (item.effect === 'special_adventure') {
        content = `
            <p>時の砂時計が輝き、特別な冒険への扉が開きました！</p>
            <p>次回の冒険で、レアアイテムを見つける確率が大幅に上昇します。</p>
        `;
        
        // 特別な冒険フラグを設定
        sleepenData.specialAdventure = true;
        effectApplied = true;
    }
    
    if (item.effect.includes('discover_chance+')) {
        content = `
            <p>夢の地図が輝き、新しい場所を発見する能力が高まりました！</p>
            <p>次回の冒険で、新しい場所を発見する確率が上昇します。</p>
        `;
        
        // 発見確率上昇フラグを設定
        sleepenData.discoverChanceBoost = true;
        effectApplied = true;
    }
    
    // デフォルトの効果メッセージ
    if (!content) {
        content = `
            <p>${item.name}を使用しました。</p>
            <p>効果: ${item.effect}</p>
        `;
    }
    
    // アイテムを消費
    if (effectApplied) {
        sleepenData.items.splice(itemIndex, 1);
        
        // ローカルストレージに保存
        saveToLocalStorage('sleepenData', sleepenData);
        
        // UIを更新
        updateSleepenPage();
    }
    
    app.openModal('アイテム使用', content);
}

/**
 * 場所を訪問
 * @param {string} placeId - 場所ID
 */
function visitPlace(placeId) {
    // 場所を検索
    const place = sleepenData.discoveredPlaces.find(p => p.id === placeId);
    
    if (!place) return;
    
    // エネルギーチェック
    if (sleepenData.energy < 15) {
        app.showNotification('スリープンのエネルギーが足りません。休息させてください。', 'warning');
        return;
    }
    
    // エネルギーを消費
    sleepenData.energy = Math.max(0, sleepenData.energy - 15);
    
    // 経験値を獲得
    sleepenData.exp += 5;
    
    // レベルアップをチェック
    checkLevelUp();
    
    // 進化をチェック
    checkEvolution();
    
    // アイテムを見つける確率
    const findItemChance = 0.7;
    
    let content = `
        <p>スリープンは${place.name}を訪れました。</p>
    `;
    
    // アイテムを見つける
    if (Math.random() < findItemChance) {
        // 場所に基づいたアイテムプール
        const placeItems = {
            "crystal_forest": [
                {"id": "crystal_shard", "name": "クリスタルの欠片", "description": "透明な森で見つけた美しい結晶。", "effect": "mood+10", "rarity": "common"},
                {"id": "crystal_flower", "name": "クリスタルの花", "description": "透明な花びらを持つ珍しい花。", "effect": "energy+15", "rarity": "rare"}
            ],
            "floating_islands": [
                {"id": "cloud_essence", "name": "雲のエッセンス", "description": "浮遊島から集めた雲の精髄。", "effect": "energy+10", "rarity": "common"},
                {"id": "sky_stone", "name": "空の石", "description": "空を漂う不思議な石。", "effect": "exp+10", "rarity": "rare"}
            ],
            "dream_lake": [
                {"id": "dream_water", "name": "夢の水", "description": "夢見の湖から汲んだ神秘的な水。", "effect": "mood+15", "rarity": "common"},
                {"id": "reflection_pearl", "name": "反射の真珠", "description": "湖底で見つけた美しい真珠。", "effect": "friendship+10", "rarity": "rare"}
            ],
            "star_cave": [
                {"id": "star_fragment", "name": "星の欠片", "description": "洞窟の天井から落ちてきた星の欠片。", "effect": "exp+15", "rarity": "common"},
                {"id": "constellation_map", "name": "星座の地図", "description": "洞窟の壁に描かれていた星座の地図。", "effect": "discover_chance+10%", "rarity": "rare"}
            ],
            "memory_ruins": [
                {"id": "memory_crystal", "name": "記憶のクリスタル", "description": "古代の記憶が宿るクリスタル。", "effect": "friendship+15", "rarity": "common"},
                {"id": "wisdom_scroll", "name": "知恵の巻物", "description": "古代の知恵が記された巻物。", "effect": "all_stats+5", "rarity": "rare"}
            ],
            "rainbow_valley": [
                {"id": "color_dust", "name": "色彩の粉", "description": "虹の谷で集めた色鮮やかな粉。", "effect": "mood+20", "rarity": "common"},
                {"id": "prism_crystal", "name": "プリズムクリスタル", "description": "光を七色に分解するクリスタル。", "effect": "energy+20", "rarity": "rare"}
            ],
            "whispering_meadow": [
                {"id": "wind_chime", "name": "風の鈴", "description": "風の囁きを奏でる小さな鈴。", "effect": "mood+10,energy+5", "rarity": "common"},
                {"id": "whisper_feather", "name": "囁きの羽", "description": "風の秘密を記憶する不思議な羽。", "effect": "friendship+20", "rarity": "rare"}
            ],
            "moonlight_beach": [
                {"id": "moon_sand", "name": "月の砂", "description": "月光に照らされた神秘的な砂。", "effect": "energy+15", "rarity": "common"},
                {"id": "tidal_pearl", "name": "潮の真珠", "description": "月の引力を宿した真珠。", "effect": "exp+20", "rarity": "rare"}
            ],
            "crystal_palace": [
                {"id": "royal_crystal", "name": "王家のクリスタル", "description": "宮殿の玉座から取れた貴重なクリスタル。", "effect": "all_stats+15", "rarity": "legendary"},
                {"id": "crown_fragment", "name": "王冠の欠片", "description": "古代の王の王冠の欠片。", "effect": "special_adventure", "rarity": "legendary"}
            ],
            "time_library": [
                {"id": "knowledge_book", "name": "知識の書", "description": "あらゆる知識が詰まった古代の書物。", "effect": "exp+30", "rarity": "legendary"},
                {"id": "time_ink", "name": "時の墨", "description": "時間そのものから作られた墨。", "effect": "unlock_special_place", "rarity": "legendary"}
            ],
            "infinity_garden": [
                {"id": "eternal_flower", "name": "永遠の花", "description": "決して枯れることのない美しい花。", "effect": "all_stats+20", "rarity": "legendary"},
                {"id": "life_seed", "name": "生命の種", "description": "あらゆる生命を宿す神秘的な種。", "effect": "friendship+30,mood+30", "rarity": "legendary"}
            ]
        };
        
        // 場所に対応するアイテムプールがない場合はデフォルトのアイテムプールを使用
        const itemPool = placeItems[place.id] || [
            {"id": "mystery_orb", "name": "神秘の球", "description": "不思議な力を秘めた球体。", "effect": "all_stats+5", "rarity": "common"},
            {"id": "unknown_artifact", "name": "未知の遺物", "description": "謎に包まれた古代の遺物。", "effect": "exp+10", "rarity": "rare"}
        ];
        
        // レア度に基づいてアイテムを選択
        const rarityRoll = Math.random();
        let selectedItem;
        
        if (rarityRoll < 0.2) {
            // レアまたは伝説のアイテム
            const rareItems = itemPool.filter(item => item.rarity !== "common");
            selectedItem = rareItems.length > 0 ? rareItems[Math.floor(Math.random() * rareItems.length)] : itemPool[0];
        } else {
            // 一般的なアイテム
            const commonItems = itemPool.filter(item => item.rarity === "common");
            selectedItem = commonItems.length > 0 ? commonItems[Math.floor(Math.random() * commonItems.length)] : itemPool[0];
        }
        
        // アイテムを追加
        sleepenData.items.push(selectedItem);
        
        content += `
            <p>スリープンは「${selectedItem.name}」を見つけました！</p>
            <div class="found-item ${selectedItem.rarity}">
                <h4>${selectedItem.name}</h4>
                <p>${selectedItem.description}</p>
                <p class="item-effect">効果: ${selectedItem.effect}</p>
            </div>
        `;
    } else {
        content += `
            <p>今回は特に何も見つかりませんでした。</p>
        `;
    }
    
    // ローカルストレージに保存
    saveToLocalStorage('sleepenData', sleepenData);
    
    // UIを更新
    updateSleepenPage();
    
    app.openModal('場所の訪問', content);
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