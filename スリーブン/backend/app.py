from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
import datetime

app = Flask(__name__, static_folder='../frontend')
CORS(app)  # Enable CORS for all routes

# Data file paths
SLEEP_DATA_FILE = os.path.join('data', 'sleep_data.json')
SLEEPEN_DATA_FILE = os.path.join('data', 'sleepen_data.json')

# Helper functions
def load_json_data(file_path):
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_json_data(file_path, data):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# Initialize data files if they don't exist
def init_data_files():
    # Initialize sleep data
    if not os.path.exists(SLEEP_DATA_FILE):
        initial_sleep_data = {
            "records": [],
            "goals": {
                "sleepDuration": 8,
                "bedtime": "23:00",
                "wakeTime": "07:00"
            },
            "statistics": {
                "averageSleepDuration": 0,
                "sleepDebt": 0,
                "averageQuality": 0,
                "sleepEfficiency": 0
            }
        }
        save_json_data(SLEEP_DATA_FILE, initial_sleep_data)
    
    # Initialize sleepen data
    if not os.path.exists(SLEEPEN_DATA_FILE):
        initial_sleepen_data = {
            "name": "スリープン",
            "level": 1,
            "exp": 0,
            "mood": 80,
            "energy": 100,
            "friendship": 50,
            "evolutionStage": 1,
            "skills": [],
            "items": [],
            "discoveredPlaces": []
        }
        save_json_data(SLEEPEN_DATA_FILE, initial_sleepen_data)

# API Routes for Sleep Data
@app.route('/api/sleep', methods=['GET'])
def get_sleep_data():
    data = load_json_data(SLEEP_DATA_FILE)
    return jsonify(data)

@app.route('/api/sleep/record', methods=['POST'])
def add_sleep_record():
    data = load_json_data(SLEEP_DATA_FILE)
    new_record = request.json
    
    # Add timestamp
    new_record['timestamp'] = datetime.datetime.now().isoformat()
    
    # Add the new record
    data['records'].append(new_record)
    
    # Update statistics
    update_sleep_statistics(data)
    
    # Save the updated data
    save_json_data(SLEEP_DATA_FILE, data)
    
    # Update sleepen based on sleep quality
    update_sleepen_with_sleep_data(new_record)
    
    return jsonify({"success": True, "record": new_record})

@app.route('/api/sleep/goals', methods=['PUT'])
def update_sleep_goals():
    data = load_json_data(SLEEP_DATA_FILE)
    goals = request.json
    
    # Update goals
    data['goals'] = goals
    
    # Save the updated data
    save_json_data(SLEEP_DATA_FILE, data)
    
    return jsonify({"success": True, "goals": goals})

# Helper function to update sleep statistics
def update_sleep_statistics(data):
    records = data['records']
    if not records:
        return
    
    # Calculate average sleep duration
    total_duration = sum(record.get('duration', 0) for record in records)
    data['statistics']['averageSleepDuration'] = round(total_duration / len(records), 2)
    
    # Calculate sleep debt
    ideal_duration = data['goals']['sleepDuration']
    data['statistics']['sleepDebt'] = round(ideal_duration - data['statistics']['averageSleepDuration'], 2)
    
    # Calculate average quality
    total_quality = sum(record.get('quality', 0) for record in records)
    data['statistics']['averageQuality'] = round(total_quality / len(records), 2)
    
    # Calculate sleep efficiency
    total_efficiency = sum(record.get('duration', 0) / record.get('timeInBed', 1) * 100 for record in records)
    data['statistics']['sleepEfficiency'] = round(total_efficiency / len(records), 2)

# API Routes for Sleepen
@app.route('/api/sleepen', methods=['GET'])
def get_sleepen_data():
    data = load_json_data(SLEEPEN_DATA_FILE)
    return jsonify(data)

@app.route('/api/sleepen/update', methods=['PUT'])
def update_sleepen():
    data = load_json_data(SLEEPEN_DATA_FILE)
    updates = request.json
    
    # Update sleepen data
    for key, value in updates.items():
        if key in data:
            data[key] = value
    
    # Check for evolution
    check_sleepen_evolution(data)
    
    # Save the updated data
    save_json_data(SLEEPEN_DATA_FILE, data)
    
    return jsonify({"success": True, "sleepen": data})

@app.route('/api/sleepen/activity', methods=['POST'])
def perform_sleepen_activity():
    data = load_json_data(SLEEPEN_DATA_FILE)
    activity = request.json.get('activity')
    
    result = {
        "success": True,
        "message": "",
        "rewards": []
    }
    
    if activity == "play":
        # Playing increases mood and friendship but consumes energy
        data['mood'] = min(100, data['mood'] + 15)
        data['energy'] = max(0, data['energy'] - 10)
        data['friendship'] = min(100, data['friendship'] + 5)
        data['exp'] += 5
        result['message'] = "スリープンと楽しく遊びました！"
    
    elif activity == "rest":
        # Resting recovers energy
        data['energy'] = min(100, data['energy'] + 30)
        result['message'] = "スリープンはエネルギーを回復しました。"
    
    elif activity == "adventure":
        # Adventure consumes energy but can find items and discover places
        if data['energy'] < 20:
            result['success'] = False
            result['message'] = "スリープンは疲れすぎていて冒険に行けません。"
        else:
            data['energy'] = max(0, data['energy'] - 20)
            data['exp'] += 10
            
            # Chance to find an item or discover a place
            import random
            if random.random() < 0.7:  # 70% chance to find something
                if random.random() < 0.3:  # 30% chance to discover a place
                    new_place = generate_random_place()
                    if new_place not in data['discoveredPlaces']:
                        data['discoveredPlaces'].append(new_place)
                        result['message'] = f"スリープンは新しい場所「{new_place['name']}」を発見しました！"
                        result['rewards'].append({"type": "place", "place": new_place})
                else:  # 70% chance to find an item
                    new_item = generate_random_item()
                    data['items'].append(new_item)
                    result['message'] = f"スリープンは「{new_item['name']}」を見つけました！"
                    result['rewards'].append({"type": "item", "item": new_item})
            else:
                result['message'] = "スリープンは冒険に出かけましたが、特に何も見つかりませんでした。"
    
    elif activity == "train":
        # Training improves skills but consumes energy
        if data['energy'] < 15:
            result['success'] = False
            result['message'] = "スリープンは疲れすぎていてトレーニングできません。"
        else:
            data['energy'] = max(0, data['energy'] - 15)
            data['exp'] += 8
            result['message'] = "スリープンはトレーニングを行いました。"
    
    # Check for level up
    check_sleepen_level_up(data)
    
    # Check for evolution
    check_sleepen_evolution(data)
    
    # Save the updated data
    save_json_data(SLEEPEN_DATA_FILE, data)
    
    result['sleepen'] = data
    return jsonify(result)

# Helper function to update sleepen based on sleep data
def update_sleepen_with_sleep_data(sleep_record):
    sleepen_data = load_json_data(SLEEPEN_DATA_FILE)
    
    # Update sleepen based on sleep quality
    quality = sleep_record.get('quality', 3)
    
    # Sleep quality affects mood and energy
    mood_change = (quality - 3) * 10  # Quality 5 gives +20, Quality 1 gives -20
    sleepen_data['mood'] = max(0, min(100, sleepen_data['mood'] + mood_change))
    
    # Good sleep restores energy
    energy_change = (quality - 1) * 5  # Quality 5 gives +20, Quality 1 gives 0
    sleepen_data['energy'] = max(0, min(100, sleepen_data['energy'] + energy_change))
    
    # Add experience points
    sleepen_data['exp'] += quality * 2
    
    # Check for level up
    check_sleepen_level_up(sleepen_data)
    
    # Save the updated data
    save_json_data(SLEEPEN_DATA_FILE, sleepen_data)

# Helper function to check for sleepen level up
def check_sleepen_level_up(data):
    # Experience needed for each level (level 1 starts at 0 exp)
    exp_needed = data['level'] * 20
    
    if data['exp'] >= exp_needed:
        data['level'] += 1
        data['exp'] -= exp_needed
        
        # Check for new skills
        if data['level'] == 3:
            data['skills'].append({"id": "dream_decode", "name": "夢の解読", "description": "スリープンが夢の意味を解読できるようになります。"})
        elif data['level'] == 5:
            data['skills'].append({"id": "healing_light", "name": "癒しの光", "description": "スリープンが癒しの光を放ち、ユーザーの気分を改善します。"})
        elif data['level'] == 7:
            data['skills'].append({"id": "memory_storage", "name": "記憶の保管", "description": "スリープンが重要な記憶を保管し、必要なときに思い出させてくれます。"})
        elif data['level'] == 10:
            data['skills'].append({"id": "dream_manipulation", "name": "夢の操作", "description": "スリープンがユーザーの夢を良い方向に操作できるようになります。"})
        elif data['level'] == 12:
            data['skills'].append({"id": "time_sense", "name": "時間感覚", "description": "スリープンが最適な睡眠時間を感知し、ユーザーに知らせます。"})
        elif data['level'] == 15:
            data['skills'].append({"id": "dimension_door", "name": "次元の扉", "description": "スリープンが夢の世界の新しい次元への扉を開けるようになります。"})

# Helper function to check for sleepen evolution
def check_sleepen_evolution(data):
    if data['level'] >= 5 and data['evolutionStage'] == 1:
        data['evolutionStage'] = 2
    elif data['level'] >= 10 and data['evolutionStage'] == 2:
        data['evolutionStage'] = 3
    elif data['level'] >= 15 and data['evolutionStage'] == 3:
        data['evolutionStage'] = 4

# Helper function to generate a random item
def generate_random_item():
    import random
    
    # Item rarity
    rarity = random.choices(["common", "rare", "legendary"], weights=[0.7, 0.25, 0.05])[0]
    
    # Item pools by rarity
    items = {
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
    }
    
    # Select a random item from the appropriate rarity pool
    selected_item = random.choice(items[rarity])
    selected_item["rarity"] = rarity
    
    return selected_item

# Helper function to generate a random place
def generate_random_place():
    import random
    
    places = [
        {"id": "crystal_forest", "name": "クリスタルの森", "description": "透明な木々が立ち並ぶ幻想的な森。", "rewards": "crystal_items"},
        {"id": "floating_islands", "name": "浮遊島", "description": "空に浮かぶ小さな島々。", "rewards": "sky_items"},
        {"id": "dream_lake", "name": "夢見の湖", "description": "見る者の夢を映し出す神秘的な湖。", "rewards": "water_items"},
        {"id": "star_cave", "name": "星の洞窟", "description": "天井に星が輝く美しい洞窟。", "rewards": "star_items"},
        {"id": "memory_ruins", "name": "記憶の遺跡", "description": "古代の記憶が宿る神秘的な遺跡。", "rewards": "memory_items"},
        {"id": "rainbow_valley", "name": "虹の谷", "description": "常に虹がかかる色彩豊かな谷。", "rewards": "color_items"},
        {"id": "whispering_meadow", "name": "囁きの草原", "description": "風が秘密を囁く不思議な草原。", "rewards": "wind_items"},
        {"id": "moonlight_beach", "name": "月光の浜辺", "description": "月の光に照らされた神秘的な浜辺。", "rewards": "moon_items"}
    ]
    
    return random.choice(places)

# Serve frontend files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# Initialize data files on startup
init_data_files()

if __name__ == '__main__':
    app.run(debug=True)