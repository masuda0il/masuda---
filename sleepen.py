import random
import json
import os
from datetime import datetime

class Sleepen:
    """
    Sleepen - A dream world companion that grows as the user improves their sleep habits
    """
    def __init__(self, name="スリープン"):
        self.name = name
        self.level = 1
        self.exp = 0
        self.mood = 100  # 0-100
        self.energy = 100  # 0-100
        self.dream_items = []
        self.adventures = []
        self.skills = []  # New: Skills that Sleepen can learn
        self.friendship = 0  # New: Friendship level with user (0-100)
        self.dream_locations = []  # New: Discovered dream world locations
        self.appearance = {
            "color": "blue",
            "accessories": [],
            "evolution_stage": 1
        }
        self.creation_date = datetime.now().isoformat()
        self.last_interaction = datetime.now().isoformat()
    
    def to_dict(self):
        """Convert Sleepen object to dictionary for JSON serialization"""
        return {
            "name": self.name,
            "level": self.level,
            "exp": self.exp,
            "mood": self.mood,
            "energy": self.energy,
            "dream_items": self.dream_items,
            "adventures": self.adventures,
            "skills": self.skills,
            "friendship": self.friendship,
            "dream_locations": self.dream_locations,
            "appearance": self.appearance,
            "creation_date": self.creation_date,
            "last_interaction": self.last_interaction
        }
    
    @classmethod
    def from_dict(cls, data):
        """Create Sleepen object from dictionary"""
        sleepen = cls(name=data.get("name", "スリープン"))
        sleepen.level = data.get("level", 1)
        sleepen.exp = data.get("exp", 0)
        sleepen.mood = data.get("mood", 100)
        sleepen.energy = data.get("energy", 100)
        sleepen.dream_items = data.get("dream_items", [])
        sleepen.adventures = data.get("adventures", [])
        sleepen.skills = data.get("skills", [])
        sleepen.friendship = data.get("friendship", 0)
        sleepen.dream_locations = data.get("dream_locations", [])
        sleepen.appearance = data.get("appearance", {
            "color": "blue",
            "accessories": [],
            "evolution_stage": 1
        })
        sleepen.creation_date = data.get("creation_date", datetime.now().isoformat())
        sleepen.last_interaction = data.get("last_interaction", datetime.now().isoformat())
        return sleepen
    
    def add_exp(self, amount):
        """Add experience points and level up if necessary"""
        self.exp += amount
        
        # Check for level up
        exp_needed = self.level * 100
        if self.exp >= exp_needed:
            self.level_up()
    
    def level_up(self):
        """Level up the Sleepen"""
        self.level += 1
        self.exp = 0
        
        # Check for evolution
        if self.level == 5:
            self.evolve(2)  # Evolve to stage 2
        elif self.level == 10:
            self.evolve(3)  # Evolve to stage 3
        elif self.level == 15:
            self.evolve(4)  # New: Evolve to stage 4
        
        # Check for new skills
        self._check_new_skills()
        
        return self.level
        
    def _check_new_skills(self):
        """Check if Sleepen learns new skills based on level"""
        available_skills = [
            {"name": "夢の解読", "description": "睡眠の質を10%向上させる", "level_req": 3},
            {"name": "癒しの光", "description": "ユーザーのストレスを軽減する", "level_req": 5},
            {"name": "記憶の保管", "description": "夢の記憶を保存する", "level_req": 7},
            {"name": "夢の操作", "description": "夢の内容に影響を与える", "level_req": 10},
            {"name": "時間感覚", "description": "最適な睡眠時間を感知する", "level_req": 12},
            {"name": "次元の扉", "description": "新しい夢の世界に行ける", "level_req": 15}
        ]
        
        for skill in available_skills:
            if self.level >= skill["level_req"] and skill["name"] not in [s["name"] for s in self.skills]:
                self.skills.append(skill)
                return skill
        
        return None
    
    def evolve(self, stage):
        """Evolve Sleepen to a new stage"""
        self.appearance["evolution_stage"] = stage
        
        # Add evolution bonuses
        if stage == 2:
            self.add_exp(50)  # Bonus exp for evolving
        elif stage == 3:
            self.add_exp(100)
            self._discover_dream_location("夢の神殿")  # Discover special location
        elif stage == 4:
            self.add_exp(200)
            self._discover_dream_location("星の海")
            
        return stage
        
    def _discover_dream_location(self, location_name):
        """Discover a new dream world location"""
        if location_name not in self.dream_locations:
            location = {
                "name": location_name,
                "discovered_date": datetime.now().isoformat(),
                "visits": 0
            }
            self.dream_locations.append(location)
            return location
        return None
    
    def go_on_adventure(self, sleep_quality, location=None):
        """
        Send Sleepen on a dream adventure based on sleep quality
        sleep_quality: 1-5 rating
        location: Optional specific location for the adventure
        """
        adventure_types = [
            "森の冒険",  # Forest adventure
            "海の探検",  # Ocean exploration
            "空の旅",    # Sky journey
            "洞窟探索",  # Cave exploration
            "雪山登頂",  # Snowy mountain climb
            "砂漠の旅",  # Desert journey
            "宇宙旅行",  # Space travel
            "時間旅行",  # Time travel
            "異次元探索"  # Interdimensional exploration
        ]
        
        # Special locations have their own adventure types
        special_locations = {
            "夢の神殿": ["神秘の儀式", "古代の知恵", "神殿の秘宝"],
            "星の海": ["星の航海", "光の踊り", "銀河の交差点"],
            "記憶の迷宮": ["過去への旅", "忘れられた記憶", "未来の可能性"],
            "感情の渓谷": ["喜びの滝", "悲しみの川", "怒りの火山"],
            "想像の島": ["創造の泉", "アイデアの森", "インスピレーションの丘"]
        }
        
        # Better sleep quality = better adventures and rewards
        adventure_quality = min(5, max(1, sleep_quality))
        
        # Apply skill bonuses
        for skill in self.skills:
            if skill["name"] == "夢の操作":
                adventure_quality += 1  # Dream manipulation improves adventure quality
        
        adventure_quality = min(5, adventure_quality)  # Cap at 5
        
        # Generate adventure
        if location and location in special_locations:
            adventure_type = random.choice(special_locations[location])
            # Update location visits
            for loc in self.dream_locations:
                if loc["name"] == location:
                    loc["visits"] += 1
                    break
        else:
            adventure_type = random.choice(adventure_types)
            
        adventure_duration = adventure_quality * random.randint(1, 3)
        exp_gained = adventure_quality * random.randint(10, 20)
        
        # Friendship bonus
        friendship_bonus = int(self.friendship / 20)  # 0-5 bonus based on friendship level
        exp_gained += friendship_bonus
        
        # Possible items to find
        common_items = [
            "キラキラ石",      # Sparkling stone
            "夢の花",          # Dream flower
            "星の砂",          # Star sand
            "虹のしずく",      # Rainbow drop
            "月の欠片",        # Moon fragment
            "雲のクッション",  # Cloud cushion
            "時の砂時計",      # Hourglass of time
            "夢の羽根",        # Dream feather
            "幻想のクリスタル"  # Fantasy crystal
        ]
        
        rare_items = [
            "夢想の宝石",      # Dreaming gem
            "記憶の結晶",      # Memory crystal
            "星空のマント",    # Starry mantle
            "幻影の鏡",        # Phantom mirror
            "永遠の砂時計",    # Eternal hourglass
            "夢幻の笛"         # Ethereal flute
        ]
        
        legendary_items = [
            "創造主の筆",      # Creator's brush
            "夢の王冠",        # Dream crown
            "次元の鍵",        # Dimensional key
            "星の心臓"         # Star heart
        ]
        
        # Better sleep quality = more items and better chances for rare items
        items_found = []
        
        # Common items
        for _ in range(adventure_quality):
            if random.random() < 0.7:  # 70% chance to find a common item per quality point
                items_found.append(random.choice(common_items))
        
        # Rare items
        if adventure_quality >= 3:
            rare_chance = 0.2 + (adventure_quality - 3) * 0.1  # 20-40% chance based on quality
            if random.random() < rare_chance:
                items_found.append(random.choice(rare_items))
        
        # Legendary items
        if adventure_quality >= 4:
            legendary_chance = 0.05 + (adventure_quality - 4) * 0.05  # 5-10% chance based on quality
            if random.random() < legendary_chance:
                items_found.append(random.choice(legendary_items))
        
        # Special location bonus
        if location and location in special_locations:
            if random.random() < 0.5:  # 50% chance for a bonus item
                if random.random() < 0.7:
                    items_found.append(random.choice(rare_items))
                else:
                    items_found.append(random.choice(legendary_items))
        
        # Chance to discover a new location
        new_location = None
        if random.random() < 0.1 * adventure_quality:  # 10-50% chance based on quality
            possible_locations = list(special_locations.keys())
            discovered_locations = [loc["name"] for loc in self.dream_locations]
            undiscovered = [loc for loc in possible_locations if loc not in discovered_locations]
            
            if undiscovered:
                new_location = random.choice(undiscovered)
                self._discover_dream_location(new_location)
        
        # Create adventure record
        adventure = {
            "date": datetime.now().isoformat(),
            "type": adventure_type,
            "location": location,
            "duration": adventure_duration,
            "quality": adventure_quality,
            "exp_gained": exp_gained,
            "items_found": items_found,
            "new_location_discovered": new_location,
            "description": self._generate_adventure_description(adventure_type, adventure_quality, items_found, new_location)
        }
        
        # Update Sleepen
        self.adventures.append(adventure)
        self.dream_items.extend(items_found)
        self.add_exp(exp_gained)
        
        # Update energy, mood and friendship
        self.energy = max(0, self.energy - 20)  # Adventures consume energy
        self.mood = min(100, self.mood + 10)    # Adventures improve mood
        self.friendship = min(100, self.friendship + 5)  # Adventures increase friendship
        
        return adventure
    
    def _generate_adventure_description(self, adventure_type, quality, items, new_location=None):
        """Generate a description of the adventure"""
        quality_adjectives = ["小さな", "楽しい", "わくわくする", "素晴らしい", "伝説的な"]
        adjective = quality_adjectives[quality-1]
        
        # Base description
        if not items:
            description = f"{self.name}は{adjective}{adventure_type}に出かけました。冒険を楽しんだようです！"
        elif len(items) == 1:
            description = f"{self.name}は{adjective}{adventure_type}に出かけ、{items[0]}を見つけました！"
        else:
            items_text = "、".join(items[:-1]) + "と" + items[-1]
            description = f"{self.name}は{adjective}{adventure_type}に出かけ、{items_text}を見つけました！"
        
        # Add new location discovery
        if new_location:
            description += f" 冒険の途中で、新しい場所「{new_location}」を発見しました！"
            
        return description
    
    def rest(self):
        """Rest to recover energy"""
        recovery = 30
        
        # Apply skill bonuses
        for skill in self.skills:
            if skill["name"] == "癒しの光":
                recovery += 10  # Healing light improves rest
                
        self.energy = min(100, self.energy + recovery)
        return self.energy
    
    def play(self):
        """Play with Sleepen to improve mood and friendship"""
        mood_increase = 20
        
        # Friendship affects mood increase
        friendship_bonus = int(self.friendship / 20)  # 0-5 bonus
        mood_increase += friendship_bonus
        
        self.mood = min(100, self.mood + mood_increase)
        self.energy = max(0, self.energy - 10)
        self.friendship = min(100, self.friendship + 3)  # Playing increases friendship
        
        return self.mood
        
    def train(self, skill_name=None):
        """Train a specific skill or random skill to improve it"""
        if not self.skills:
            return None
            
        # If no skill specified, choose a random one
        if not skill_name:
            skill = random.choice(self.skills)
        else:
            skill = next((s for s in self.skills if s["name"] == skill_name), None)
            
        if not skill:
            return None
            
        # Training consumes energy but increases friendship
        self.energy = max(0, self.energy - 15)
        self.friendship = min(100, self.friendship + 2)
        
        return skill
        
    def interpret_dream(self, dream_description):
        """Interpret a user's dream based on Sleepen's skills"""
        has_interpretation_skill = any(skill["name"] == "夢の解読" for skill in self.skills)
        
        if not has_interpretation_skill:
            return "まだ夢を解読する能力を持っていません。レベル3になると解読できるようになります。"
            
        # Simple dream interpretation based on keywords
        positive_keywords = ["飛ぶ", "空", "光", "友達", "成功", "幸せ"]
        negative_keywords = ["落ちる", "暗い", "怖い", "迷う", "失敗", "追いかけられる"]
        
        positive_count = sum(1 for word in positive_keywords if word in dream_description)
        negative_count = sum(1 for word in negative_keywords if word in dream_description)
        
        if positive_count > negative_count:
            interpretation = f"{self.name}は、この夢はあなたの希望や前向きな気持ちを表していると感じています。"
        elif negative_count > positive_count:
            interpretation = f"{self.name}は、この夢はあなたの不安や心配事を表していると感じています。"
        else:
            interpretation = f"{self.name}は、この夢はあなたの複雑な感情を表していると感じています。"
            
        # Add friendship and exp for interpreting dreams
        self.friendship = min(100, self.friendship + 1)
        self.add_exp(5)
        
        return interpretation

class SleepenManager:
    """Manager class for handling Sleepen data and operations"""
    def __init__(self, data_file='sleepen_data.json'):
        self.data_file = data_file
        self.default_data = {
            "sleepen": None,
            "dream_world": {
                "visited_locations": [],
                "special_events": []
            }
        }
    
    def load_data(self):
        """Load Sleepen data from JSON file"""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                    # Convert sleepen dict to object if exists
                    if data.get("sleepen"):
                        data["sleepen"] = Sleepen.from_dict(data["sleepen"])
                    
                    return data
            except json.JSONDecodeError:
                print(f"Error decoding {self.data_file}. Using default data.")
                return self.default_data
        else:
            # Return default data structure if file doesn't exist
            return self.default_data
    
    def save_data(self, data):
        """Save Sleepen data to JSON file"""
        # Convert Sleepen object to dict for serialization
        if data.get("sleepen") and isinstance(data["sleepen"], Sleepen):
            data_copy = data.copy()
            data_copy["sleepen"] = data["sleepen"].to_dict()
        else:
            data_copy = data
            
        with open(self.data_file, 'w', encoding='utf-8') as f:
            json.dump(data_copy, f, ensure_ascii=False, indent=2)
    
    def create_sleepen(self, name="スリープン"):
        """Create a new Sleepen"""
        data = self.load_data()
        data["sleepen"] = Sleepen(name=name)
        self.save_data(data)
        return data["sleepen"]
    
    def get_sleepen(self):
        """Get the current Sleepen, create one if it doesn't exist"""
        data = self.load_data()
        if not data.get("sleepen"):
            return self.create_sleepen()
        return data["sleepen"]
    
    def update_sleepen(self, sleepen):
        """Update the Sleepen data"""
        data = self.load_data()
        data["sleepen"] = sleepen
        self.save_data(data)
        return sleepen
    
    def process_sleep_data(self, sleep_data):
        """Process sleep data to update Sleepen"""
        sleepen = self.get_sleepen()
        
        # Calculate rewards based on sleep quality and duration
        sleep_quality = sleep_data.get("sleepQuality", 0)
        sleep_hours = sleep_data.get("sleepHours", 0)
        
        # Base experience from sleep quality
        if sleep_quality > 0:
            exp_gain = sleep_quality * 10
            
            # Bonus exp for good sleep duration (7-9 hours is ideal)
            if 7 <= sleep_hours <= 9:
                exp_gain += 20
            elif 6 <= sleep_hours < 7 or 9 < sleep_hours <= 10:
                exp_gain += 10
            
            # Apply skill bonuses
            for skill in sleepen.skills:
                if skill["name"] == "時間感覚":
                    exp_gain = int(exp_gain * 1.1)  # 10% bonus with time sense skill
            
            sleepen.add_exp(exp_gain)
            
            # Increase friendship based on sleep quality
            friendship_gain = sleep_quality
            sleepen.friendship = min(100, sleepen.friendship + friendship_gain)
            
            # Send on adventure if sleep quality is good enough
            if sleep_quality >= 3:
                # Choose a random discovered location if available and quality is high enough
                location = None
                if sleep_quality >= 4 and sleepen.dream_locations:
                    if random.random() < 0.7:  # 70% chance to go to a special location
                        location = random.choice(sleepen.dream_locations)["name"]
                
                adventure = sleepen.go_on_adventure(sleep_quality, location)
            else:
                # Rest if not going on adventure
                sleepen.rest()
        else:
            # Just rest if no sleep quality data
            sleepen.rest()
        
        # Update last interaction
        sleepen.last_interaction = datetime.now().isoformat()
        
        # Save updated Sleepen
        self.update_sleepen(sleepen)
        
        return sleepen