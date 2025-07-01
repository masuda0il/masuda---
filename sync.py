import json
import os
from datetime import datetime

class SleepDataSync:
    """
    Class to handle synchronization between offline and online sleep data
    """
    def __init__(self, data_file='sleep_data.json'):
        self.data_file = data_file
        self.default_data = {
            'sleepData': [],
            'currentDay': 1,
            'settings': {
                'idealSleepTime': 8,
                'bedtimeReminder': '22:00',
                'sleepGoals': {
                    'duration': 8,
                    'bedtime': '23:00',
                    'wakeTime': '07:00'
                }
            }
        }
    
    def load_data(self):
        """Load sleep data from JSON file"""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                print(f"Error decoding {self.data_file}. Using default data.")
                return self.default_data
        else:
            # Return default data structure if file doesn't exist
            return self.default_data
    
    def save_data(self, data):
        """Save sleep data to JSON file"""
        with open(self.data_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def merge_offline_data(self, offline_data):
        """
        Merge offline data with server data
        Strategy: For each day, use the most recent data based on timestamp
        """
        server_data = self.load_data()
        
        # Extract sleep data from both sources
        server_sleep_data = {day['day']: day for day in server_data['sleepData']}
        offline_sleep_data = {day['day']: day for day in offline_data['sleepData']}
        
        # Merge sleep data
        for day, data in offline_sleep_data.items():
            if day not in server_sleep_data:
                # Day doesn't exist in server data, add it
                server_sleep_data[day] = data
            else:
                # Day exists in both, use the most recent one
                server_date = datetime.fromisoformat(server_sleep_data[day]['date'])
                offline_date = datetime.fromisoformat(data['date'])
                
                if offline_date > server_date:
                    server_sleep_data[day] = data
        
        # Update server data
        server_data['sleepData'] = list(server_sleep_data.values())
        
        # Use the highest current day from either source
        server_data['currentDay'] = max(server_data['currentDay'], offline_data['currentDay'])
        
        # For settings, use the most recent one (assuming offline is more recent)
        server_data['settings'] = offline_data['settings']
        
        # Save merged data
        self.save_data(server_data)
        
        return server_data
    
    def get_offline_data_template(self):
        """
        Get a template for offline data storage
        """
        return self.default_data