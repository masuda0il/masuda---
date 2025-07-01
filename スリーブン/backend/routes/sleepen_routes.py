from flask import Blueprint, jsonify, request
import os
import json
import random
from models.sleepen_data import SleepenData, Skill, Item, Place

# Create a Blueprint for sleepen routes
sleepen_bp = Blueprint('sleepen', __name__)

# Data file path
SLEEPEN_DATA_FILE = os.path.join('data', 'sleepen_data.json')

# Helper functions
def load_sleepen_data():
    """Load sleepen data from file"""
    return SleepenData.load_from_file(SLEEPEN_DATA_FILE)

def save_sleepen_data(data):
    """Save sleepen data to file"""
    data.save_to_file(SLEEPEN_DATA_FILE)

# Routes
@sleepen_bp.route('/api/sleepen', methods=['GET'])
def get_sleepen_data():
    """Get all sleepen data"""
    data = load_sleepen_data()
    return jsonify(data.to_dict())

@sleepen_bp.route('/api/sleepen/update', methods=['PUT'])
def update_sleepen():
    """Update sleepen data"""
    data = load_sleepen_data()
    updates = request.json
    
    # Update sleepen data
    if 'name' in updates:
        data.name = updates['name']
    if 'mood' in updates:
        data.mood = max(0, min(100, updates['mood']))
    if 'energy' in updates:
        data.energy = max(0, min(100, updates['energy']))
    if 'friendship' in updates:
        data.friendship = max(0, min(100, updates['friendship']))
    
    # Save the updated data
    save_sleepen_data(data)
    
    return jsonify({"success": True, "sleepen": data.to_dict()})

@sleepen_bp.route('/api/sleepen/activity', methods=['POST'])
def perform_sleepen_activity():
    """Perform a sleepen activity"""
    data = load_sleepen_data()
    activity = request.json.get('activity')
    
    # Perform the activity
    result = data.perform_activity(activity)
    
    # Save the updated data
    save_sleepen_data(data)
    
    # Add the updated sleepen data to the result
    result["sleepen"] = data.to_dict()
    
    return jsonify(result)

@sleepen_bp.route('/api/sleepen/items', methods=['GET'])
def get_sleepen_items():
    """Get all sleepen items"""
    data = load_sleepen_data()
    return jsonify([item.to_dict() for item in data.items])

@sleepen_bp.route('/api/sleepen/items/<item_id>/use', methods=['POST'])
def use_sleepen_item(item_id):
    """Use a sleepen item"""
    data = load_sleepen_data()
    
    # Find the item
    item_index = None
    for i, item in enumerate(data.items):
        if item.id == item_id:
            item_index = i
            break
    
    if item_index is None:
        return jsonify({"error": "Item not found"}), 404
    
    # Get the item
    item = data.items[item_index]
    
    # Apply the item's effect
    result = {
        "success": True,
        "message": f"{item.name}を使用しました。",
        "effects": []
    }
    
    # Parse the effect string
    effects = item.effect.split(',')
    for effect in effects:
        if '+' in effect:
            stat, value = effect.split('+')
            value = int(value.rstrip('%'))
            
            if stat == "mood":
                data.mood = min(100, data.mood + value)
                result["effects"].append(f"機嫌が{value}ポイント上昇しました。")
            elif stat == "energy":
                data.energy = min(100, data.energy + value)
                result["effects"].append(f"エネルギーが{value}ポイント回復しました。")
            elif stat == "exp":
                data.add_exp(value)
                result["effects"].append(f"経験値が{value}ポイント増加しました。")
            elif stat == "friendship":
                data.friendship = min(100, data.friendship + value)
                result["effects"].append(f"友情度が{value}ポイント上昇しました。")
            elif stat == "discover_chance":
                # This is a special effect for the next adventure
                result["effects"].append(f"次の冒険で新しい場所を発見する確率が{value}%上昇します。")
            elif stat == "all_stats":
                data.mood = min(100, data.mood + value)
                data.energy = min(100, data.energy + value)
                data.friendship = min(100, data.friendship + value)
                result["effects"].append(f"全てのステータスが{value}ポイント上昇しました。")
        elif effect == "unlock_special_place":
            # Unlock a special place
            special_places = [
                {"id": "dream_castle", "name": "夢の城", "description": "夢の世界の中心にある神秘的な城。", "rewards": "special_items"},
                {"id": "time_library", "name": "時の図書館", "description": "過去と未来の全ての本が収められた図書館。", "rewards": "knowledge_items"},
                {"id": "star_observatory", "name": "星の天文台", "description": "全ての星を観測できる特別な天文台。", "rewards": "cosmic_items"}
            ]
            
            # Check if we already have all special places
            existing_ids = [place.id for place in data.discovered_places]
            available_places = [place for place in special_places if place["id"] not in existing_ids]
            
            if available_places:
                place_data = random.choice(available_places)
                new_place = Place(
                    id=place_data["id"],
                    name=place_data["name"],
                    description=place_data["description"],
                    rewards=place_data["rewards"]
                )
                data.discovered_places.append(new_place)
                result["effects"].append(f"特別な場所「{new_place.name}」を発見しました！")
            else:
                result["effects"].append("既に全ての特別な場所を発見しています。")
        elif effect == "special_adventure":
            # This is a special effect that will be handled by the frontend
            result["effects"].append("特別な冒険ができるようになりました。")
    
    # Remove the item from inventory
    del data.items[item_index]
    
    # Save the updated data
    save_sleepen_data(data)
    
    # Add the updated sleepen data to the result
    result["sleepen"] = data.to_dict()
    
    return jsonify(result)

@sleepen_bp.route('/api/sleepen/places', methods=['GET'])
def get_sleepen_places():
    """Get all discovered places"""
    data = load_sleepen_data()
    return jsonify([place.to_dict() for place in data.discovered_places])

@sleepen_bp.route('/api/sleepen/places/<place_id>/visit', methods=['POST'])
def visit_sleepen_place(place_id):
    """Visit a discovered place"""
    data = load_sleepen_data()
    
    # Find the place
    place = None
    for p in data.discovered_places:
        if p.id == place_id:
            place = p
            break
    
    if place is None:
        return jsonify({"error": "Place not found"}), 404
    
    # Check if sleepen has enough energy
    if data.energy < 25:
        return jsonify({
            "success": False,
            "message": "スリープンは疲れすぎていて冒険に行けません。"
        })
    
    # Consume energy
    data.energy = max(0, data.energy - 25)
    
    # Add experience
    data.add_exp(15)
    
    # Determine rewards based on place type
    result = {
        "success": True,
        "message": f"スリープンは{place.name}を訪れました。",
        "rewards": []
    }
    
    # 80% chance to find an item
    if random.random() < 0.8:
        # Determine item rarity based on place
        if place.rewards.startswith("special") or place.rewards.startswith("cosmic") or place.rewards.startswith("knowledge"):
            # Special places have better rewards
            rarity_weights = [0.4, 0.4, 0.2]  # 40% common, 40% rare, 20% legendary
        else:
            # Normal places have normal rewards
            rarity_weights = [0.7, 0.25, 0.05]  # 70% common, 25% rare, 5% legendary
        
        # Generate a random item
        new_item = data.generate_random_item()
        data.items.append(new_item)
        
        result["message"] = f"スリープンは{place.name}で「{new_item.name}」を見つけました！"
        result["rewards"].append({"type": "item", "item": new_item.to_dict()})
    
    # Save the updated data
    save_sleepen_data(data)
    
    # Add the updated sleepen data to the result
    result["sleepen"] = data.to_dict()
    
    return jsonify(result)

@sleepen_bp.route('/api/sleepen/skills', methods=['GET'])
def get_sleepen_skills():
    """Get all sleepen skills"""
    data = load_sleepen_data()
    return jsonify([skill.to_dict() for skill in data.skills])

@sleepen_bp.route('/api/sleepen/skills/<skill_id>/use', methods=['POST'])
def use_sleepen_skill(skill_id):
    """Use a sleepen skill"""
    data = load_sleepen_data()
    
    # Find the skill
    skill = None
    for s in data.skills:
        if s.id == skill_id:
            skill = s
            break
    
    if skill is None:
        return jsonify({"error": "Skill not found"}), 404
    
    # Check if sleepen has enough energy
    if data.energy < 15:
        return jsonify({
            "success": False,
            "message": "スリープンは疲れすぎていてスキルを使えません。"
        })
    
    # Consume energy
    data.energy = max(0, data.energy - 15)
    
    # Apply the skill's effect
    result = {
        "success": True,
        "message": f"スリープンは{skill.name}を使用しました。",
        "effects": []
    }
    
    if skill.id == "dream_decode":
        # Dream decoding gives random insights
        insights = [
            "あなたの夢は創造性が高まっていることを示しています。",
            "あなたの夢は何か未解決の問題があることを示唆しています。",
            "あなたの夢は近い将来に良いことが起こる前兆です。",
            "あなたの夢は過去の記憶が影響していることを示しています。",
            "あなたの夢はあなたの潜在意識からのメッセージです。"
        ]
        result["effects"].append(random.choice(insights))
    
    elif skill.id == "healing_light":
        # Healing light improves mood
        mood_increase = random.randint(10, 20)
        data.mood = min(100, data.mood + mood_increase)
        result["effects"].append(f"癒しの光があなたの気分を改善しました。機嫌が{mood_increase}ポイント上昇しました。")
    
    elif skill.id == "memory_storage":
        # Memory storage saves a memory
        result["effects"].append("スリープンはあなたの大切な記憶を保管しました。必要なときに思い出すことができます。")
    
    elif skill.id == "dream_manipulation":
        # Dream manipulation improves sleep quality
        result["effects"].append("スリープンはあなたの夢を良い方向に操作しました。次の睡眠の質が向上するでしょう。")
    
    elif skill.id == "time_sense":
        # Time sense suggests optimal sleep time
        optimal_hours = random.randint(7, 9)
        optimal_minutes = random.choice([0, 15, 30, 45])
        result["effects"].append(f"スリープンはあなたの最適な睡眠時間を感知しました。今日は{optimal_hours}時間{optimal_minutes}分の睡眠が理想的です。")
    
    elif skill.id == "dimension_door":
        # Dimension door discovers a new special place
        special_places = [
            {"id": "dream_castle", "name": "夢の城", "description": "夢の世界の中心にある神秘的な城。", "rewards": "special_items"},
            {"id": "time_library", "name": "時の図書館", "description": "過去と未来の全ての本が収められた図書館。", "rewards": "knowledge_items"},
            {"id": "star_observatory", "name": "星の天文台", "description": "全ての星を観測できる特別な天文台。", "rewards": "cosmic_items"},
            {"id": "crystal_palace", "name": "水晶宮殿", "description": "全てが水晶でできた美しい宮殿。", "rewards": "crystal_items"},
            {"id": "forgotten_garden", "name": "忘れられた庭", "description": "時が止まったような神秘的な庭園。", "rewards": "nature_items"}
        ]
        
        # Check if we already have all special places
        existing_ids = [place.id for place in data.discovered_places]
        available_places = [place for place in special_places if place["id"] not in existing_ids]
        
        if available_places:
            place_data = random.choice(available_places)
            new_place = Place(
                id=place_data["id"],
                name=place_data["name"],
                description=place_data["description"],
                rewards=place_data["rewards"]
            )
            data.discovered_places.append(new_place)
            result["effects"].append(f"スリープンは次元の扉を開き、新しい場所「{new_place.name}」を発見しました！")
            result["rewards"] = [{"type": "place", "place": new_place.to_dict()}]
        else:
            # If all special places are discovered, give a legendary item instead
            new_item = data.generate_random_item()
            data.items.append(new_item)
            result["effects"].append(f"スリープンは次元の扉を開きましたが、新しい場所は見つかりませんでした。代わりに「{new_item.name}」を見つけました！")
            result["rewards"] = [{"type": "item", "item": new_item.to_dict()}]
    
    # Save the updated data
    save_sleepen_data(data)
    
    # Add the updated sleepen data to the result
    result["sleepen"] = data.to_dict()
    
    return jsonify(result)

# Function to update sleepen with sleep data (called from sleep_routes.py)
def update_sleepen_with_sleep_data(quality, duration):
    """Update sleepen based on sleep quality and duration"""
    data = load_sleepen_data()
    data.update_with_sleep_data(quality, duration)
    save_sleepen_data(data)