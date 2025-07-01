"""Data management service."""
import datetime
import logging
from typing import Dict, Any
from config.settings import DATA_FILE, DEFAULT_SETTINGS
from sync import SleepDataSync
from app.models.sleep_data import SleepDataCollection

logger = logging.getLogger(__name__)


class DataService:
    """Service for managing sleep data and settings."""
    
    def __init__(self):
        self.sync = SleepDataSync(DATA_FILE)
    
    def load_data(self) -> Dict[str, Any]:
        """Load sleep data from JSON file."""
        return self.sync.load_data()
    
    def save_data(self, data: Dict[str, Any]) -> None:
        """Save sleep data to JSON file."""
        self.sync.save_data(data)
        logger.info(f"Data saved successfully. Current day: {data['currentDay']}")
    
    def initialize_settings(self, settings: Dict[str, Any]) -> Dict[str, Any]:
        """Initialize settings with defaults if needed."""
        # Initialize start date if not set
        if 'startDate' not in settings or not settings['startDate']:
            settings['startDate'] = datetime.datetime.now().strftime('%Y-%m-%d')
        
        # Ensure all default settings are present
        for key, value in DEFAULT_SETTINGS.items():
            if key not in settings:
                settings[key] = value
        
        return settings
    
    def calculate_current_day(self, start_date: str) -> int:
        """Calculate current day number based on start date."""
        if not start_date:
            return 1
        
        try:
            # Parse start date and normalize to date only (no time)
            start = datetime.datetime.strptime(start_date, '%Y-%m-%d').date()
            today = datetime.datetime.now().date()
            
            # Calculate the difference in days
            delta = today - start
            current_day = delta.days + 1  # Start from day 1
            
            # Ensure current day is at least 1 (handle future dates)
            return max(1, current_day)
        except (ValueError, TypeError):
            return 1
    
    def get_sleep_data_collection(self, data: Dict[str, Any]) -> SleepDataCollection:
        """Get sleep data collection from loaded data."""
        return SleepDataCollection(data.get('sleepData', []))
    
    def merge_offline_data(self, offline_data: Dict[str, Any]) -> Dict[str, Any]:
        """Merge offline data with server data."""
        return self.sync.merge_offline_data(offline_data)
    
    def reset_program(self) -> Dict[str, Any]:
        """Reset the program data."""
        data = self.load_data()
        data['sleepData'] = []
        data['currentDay'] = 1
        self.save_data(data)
        return data
    
    def advance_day(self) -> Dict[str, Any]:
        """Advance to the next day."""
        data = self.load_data()
        data['currentDay'] += 1
        self.save_data(data)
        return data