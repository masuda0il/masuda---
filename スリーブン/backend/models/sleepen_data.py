import json
import os
import random
from typing import Dict, List, Any, Optional, Union

class Skill:
    def __init__(self, 
                 id: str,
                 name: str,
                 description: str):
        self.id = id
        self.name = name
        self.description = description
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Skill':
        return cls(
            id=data.get("id", ""),
            name=data.get("name", ""),
            description=data.get("description", "")
        )

class Item:
    def __init__(self,
                 id: str,
                 name: str,
                 description: str,
                 effect: str,
                 rarity: str = "common"):
        self.id = id
        self.name = name
        self.description = description
        self.effect = effect
        self.rarity = rarity
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "effect": self.effect,
            "rarity": self.rarity
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Item':
        return cls(
            id=data.get("id", ""),
            name=data.get("name", ""),
            description=data.get("description", ""),
            effect=data.get("effect", ""),
            rarity=data.get("rarity", "common")
        )

class Place:
    def __init__(self,
                 id: str,
                 name: str,
                 description: str,
                 rewards: str):
        self.id = id
        self.name = name
        self.description = description
        self.rewards = rewards
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "rewards": self.rewards
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Place':
        return cls(
            id=data.get("id", ""),
            name=data.get("name", ""),
            description=data.get("description", ""),
            rewards=data.get("rewards", "")
        )

class SleepenData:
    def __init__(self,
                 name: str = "スリープン",
                 level: int = 1,
                 exp: int = 0,
                 mood: int = 80,
                 energy: int = 100,
                 friendship: int = 50,
                 evolution_stage: int = 1,
                 skills: List[Skill] = None,
                 items: List[Item] = None,
                 discovered_places: List[Place] = None):
        self.name = name
        self.level = level
        self.exp = exp
        self.mood = mood
        self.energy = energy
        self.friendship = friendship
        self.evolution_stage = evolution_stage
        self.skills = skills or []
        self.items = items or []
        self.discovered_places = discovered_places or []
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "level": self.level,
            "exp": self.exp,
            "mood": self.mood,
            "energy": self.energy,
            "friendship": self.friendship,
            "evolutionStage": self.evolution_stage,
            "skills": [skill.to_dict() for skill in self.skills],
            "items": [item.to_dict() for item in self.items],
            "discoveredPlaces": [place.to_dict() for place in self.discovered_places]
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SleepenData':
        skills = [Skill.from_dict(skill) for skill in data.get("skills", [])]
        items = [Item.from_dict(item) for item in data.get("items", [])]
        places = [Place.from_dict(place) for place in data.get("discoveredPlaces", [])]
        
        return cls(
            name=data.get("name", "スリープン"),
            level=data.get("level", 1),
            exp=data.get("exp", 0),
            mood=data.get("mood", 80),
            energy=data.get("energy", 100),
            friendship=data.get("friendship", 50),
            evolution_stage=data.get("evolutionStage", 1),
            skills=skills,
            items=items,
            discovered_places=places
        )
    
    def add_exp(self, amount: int) -> bool:
        """Add experience points and return True if leveled up"""
        self.exp += amount
        return self.check_level_up()
    
    def check_level_up(self) -> bool:
        """Check if sleepen can level up and do so if possible. Returns True if leveled up."""
        # Experience needed for each level (level 1 starts at 0 exp)
        exp_needed = self.level * 20
        
        if self.exp >= exp_needed:
            self.level += 1
            self.exp -= exp_needed
            
            # Check for new skills
            self.check_new_skills()
            
            # Check for evolution
            self.check_evolution()
            
            return True
        
        return False
    
    def check_new_skills(self) -> None:
        """Check if sleepen learns new skills based on level"""
        skill_levels = {
            3: {"id": "dream_decode", "name": "夢の解読", "description": "スリープンが夢の意味を解読できるようになります。"},
            5: {"id": "healing_light", "name": "癒しの光", "description": "スリープンが癒しの光を放ち、ユーザーの気分を改善します。"},
            7: {"id": "memory_storage", "name": "記憶の保管", "description": "スリープンが重要な記憶を保管し、必要なときに思い出させてくれます。"},
            10: {"id": "dream_manipulation", "name": "夢の操作", "description": "スリープンがユーザーの夢を良い方向に操作できるようになります。"},
            12: {"id": "time_sense", "name": "時間感覚", "description": "スリープンが最適な睡眠時間を感知し、ユーザーに知らせます。"},
            15: {"id": "dimension_door", "name": "次元の扉", "description": "スリープンが夢の世界の新しい次元への扉を開けるようになります。"}
        }
        
        if self.level in skill_levels:
            skill_data = skill_levels[self.level]
            new_skill = Skill(
                id=skill_data["id"],
                name=skill_data["name"],
                description=skill_data["description"]
            )
            self.skills.append(new_skill)
    
    def check_evolution(self) -> None:
        """Check if sleepen can evolve based on level"""
        if self.level >= 5 and self.evolution_stage == 1:
            self.evolution_stage = 2
        elif self.level >= 10 and self.evolution_stage == 2:
            self.evolution_stage = 3
        elif self.level >= 15 and self.evolution_stage == 3:
            self.evolution_stage = 4
    
    def perform_activity(self, activity: str) -> Dict[str, Any]:
        """Perform an activity and return the result"""
        result = {
            "success": True,
            "message": "",
            "rewards": []
        }
        
        if activity == "play":
            # Playing increases mood and friendship but consumes energy
            self.mood = min(100, self.mood + 15)
            self.energy = max(0, self.energy - 10)
            self.friendship = min(100, self.friendship + 5)
            self.add_exp(5)
            result["message"] = "スリープンと楽しく遊びました！"
        
        elif activity == "rest":
            # Resting recovers energy
            self.energy = min(100, self.energy + 30)
            result["message"] = "スリープンはエネルギーを回復しました。"
        
        elif activity == "adventure":
            # Adventure consumes energy but can find items and discover places
            if self.energy < 20:
                result["success"] = False
                result["message"] = "スリープンは疲れすぎていて冒険に行けません。"
            else:
                self.energy = max(0, self.energy - 20)
                self.add_exp(10)
                
                # Chance to find an item or discover a place
                if random.random() < 0.7:  # 70% chance to find something
                    if random.random() < 0.3:  # 30% chance to discover a place
                        new_place = self.generate_random_place()
                        place_ids = [place.id for place in self.discovered_places]
                        if new_place.id not in place_ids:
                            self.discovered_places.append(new_place)
                            result["message"] = f"スリープンは新しい場所「{new_place.name}」を発見しました！"
                            result["rewards"].append({"type": "place", "place": new_place.to_dict()})
                    else:  # 70% chance to find an item
                        new_item = self.generate_random_item()
                        self.items.append(new_item)
                        result["message"] = f"スリープンは「{new_item.name}」を見つけました！"
                        result["rewards"].append({"type": "item", "item": new_item.to_dict()})
                else:
                    result["message"] = "スリープンは冒険に出かけましたが、特に何も見つかりませんでした。"
        
        elif activity == "train":
            # Training improves skills but consumes energy
            if self.energy < 15:
                result["success"] = False
                result["message"] = "スリープンは疲れすぎていてトレーニングできません。"
            else:
                self.energy = max(0, self.energy - 15)
                self.add_exp(8)
                result["message"] = "スリープンはトレーニングを行いました。"
        
        return result
    
    def update_with_sleep_data(self, quality: int, duration: float) -> None:
        """Update sleepen based on sleep quality and duration"""
        # Update sleepen based on sleep quality
        mood_change = (quality - 3) * 10  # Quality 5 gives +20, Quality 1 gives -20
        self.mood = max(0, min(100, self.mood + mood_change))
        
        # Good sleep restores energy
        energy_change = (quality - 1) * 5  # Quality 5 gives +20, Quality 1 gives 0
        self.energy = max(0, min(100, self.energy + energy_change))
        
        # Add experience points
        self.add_exp(quality * 2)
    
    def generate_random_item(self) -> Item:
        """Generate a random item"""
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
        item_data = random.choice(items[rarity])
        
        return Item(
            id=item_data["id"],
            name=item_data["name"],
            description=item_data["description"],
            effect=item_data["effect"],
            rarity=rarity
        )
    
    def generate_random_place(self) -> Place:
        """Generate a random place"""
        places_data = [
            {"id": "crystal_forest", "name": "クリスタルの森", "description": "透明な木々が立ち並ぶ幻想的な森。", "rewards": "crystal_items"},
            {"id": "floating_islands", "name": "浮遊島", "description": "空に浮かぶ小さな島々。", "rewards": "sky_items"},
            {"id": "dream_lake", "name": "夢見の湖", "description": "見る者の夢を映し出す神秘的な湖。", "rewards": "water_items"},
            {"id": "star_cave", "name": "星の洞窟", "description": "天井に星が輝く美しい洞窟。", "rewards": "star_items"},
            {"id": "memory_ruins", "name": "記憶の遺跡", "description": "古代の記憶が宿る神秘的な遺跡。", "rewards": "memory_items"},
            {"id": "rainbow_valley", "name": "虹の谷", "description": "常に虹がかかる色彩豊かな谷。", "rewards": "color_items"},
            {"id": "whispering_meadow", "name": "囁きの草原", "description": "風が秘密を囁く不思議な草原。", "rewards": "wind_items"},
            {"id": "moonlight_beach", "name": "月光の浜辺", "description": "月の光に照らされた神秘的な浜辺。", "rewards": "moon_items"}
        ]
        
        place_data = random.choice(places_data)
        
        return Place(
            id=place_data["id"],
            name=place_data["name"],
            description=place_data["description"],
            rewards=place_data["rewards"]
        )
    
    def save_to_file(self, file_path: str) -> None:
        """Save sleepen data to a JSON file"""
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(self.to_dict(), f, ensure_ascii=False, indent=2)
    
    @classmethod
    def load_from_file(cls, file_path: str) -> 'SleepenData':
        """Load sleepen data from a JSON file"""
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return cls.from_dict(data)
        return cls()