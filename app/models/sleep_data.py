"""Sleep data model and operations."""
import datetime
from typing import Dict, List, Optional, Any


class SleepData:
    """Sleep data model."""
    
    def __init__(self, day: int, date: str = None, bed_in_time: str = None, 
                 bed_out_time: str = None, bedtime: str = None, wake_time: str = None,
                 sleep_quality: int = 0, notes: str = "", challenge_completed: bool = False,
                 reflection: Dict = None):
        self.day = day
        self.date = date or datetime.datetime.now().isoformat()
        self.bed_in_time = bed_in_time
        self.bed_out_time = bed_out_time
        self.bedtime = bedtime
        self.wake_time = wake_time
        self.sleep_quality = sleep_quality
        self.notes = notes
        self.challenge_completed = challenge_completed
        self.reflection = reflection or {}
        
        # Calculate derived values
        self.sleep_hours = self._calculate_sleep_hours()
        self.time_in_bed = self._calculate_time_in_bed()
        self.sleep_efficiency = self._calculate_sleep_efficiency()
    
    def _calculate_sleep_hours(self) -> float:
        """Calculate sleep hours between bedtime and wake time."""
        if not self.bedtime or not self.wake_time:
            return 0
        
        return self._time_difference(self.bedtime, self.wake_time)
    
    def _calculate_time_in_bed(self) -> float:
        """Calculate time in bed between bed_in_time and bed_out_time."""
        if not self.bed_in_time or not self.bed_out_time:
            return 0
        
        return self._time_difference(self.bed_in_time, self.bed_out_time)
    
    def _calculate_sleep_efficiency(self) -> float:
        """Calculate sleep efficiency percentage."""
        if self.time_in_bed == 0:
            return 0
        
        return (self.sleep_hours / self.time_in_bed) * 100
    
    def _time_difference(self, start_time: str, end_time: str) -> float:
        """Calculate time difference in hours."""
        try:
            start_parts = start_time.split(':')
            end_parts = end_time.split(':')
            
            start_hours = int(start_parts[0])
            start_minutes = int(start_parts[1])
            end_hours = int(end_parts[0])
            end_minutes = int(end_parts[1])
            
            # Convert to decimal hours
            start_decimal = start_hours + (start_minutes / 60)
            end_decimal = end_hours + (end_minutes / 60)
            
            # Calculate sleep hours
            if start_hours < end_hours:
                # Same day (e.g., 22:00 to 06:00)
                return end_decimal - start_decimal
            else:
                # Overnight (e.g., 23:00 to 07:00)
                return (24 - start_decimal) + end_decimal
        except (ValueError, IndexError):
            return 0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'day': self.day,
            'date': self.date,
            'bedInTime': self.bed_in_time,
            'bedOutTime': self.bed_out_time,
            'bedtime': self.bedtime,
            'wakeTime': self.wake_time,
            'sleepHours': self.sleep_hours,
            'timeInBed': self.time_in_bed,
            'sleepEfficiency': self.sleep_efficiency,
            'sleepQuality': self.sleep_quality,
            'notes': self.notes,
            'challengeCompleted': self.challenge_completed,
            'reflection': self.reflection
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SleepData':
        """Create instance from dictionary."""
        return cls(
            day=data.get('day', 1),
            date=data.get('date'),
            bed_in_time=data.get('bedInTime'),
            bed_out_time=data.get('bedOutTime'),
            bedtime=data.get('bedtime'),
            wake_time=data.get('wakeTime'),
            sleep_quality=data.get('sleepQuality', 0),
            notes=data.get('notes', ''),
            challenge_completed=data.get('challengeCompleted', False),
            reflection=data.get('reflection', {})
        )


class SleepDataCollection:
    """Collection of sleep data with operations."""
    
    def __init__(self, data_list: List[Dict] = None):
        self.data = []
        if data_list:
            self.data = [SleepData.from_dict(item) for item in data_list]
    
    def add_or_update(self, sleep_data: SleepData) -> None:
        """Add new data or update existing data for the same date."""
        existing_index = self._find_by_date(sleep_data.date)
        if existing_index is not None:
            self.data[existing_index] = sleep_data
        else:
            self.data.append(sleep_data)
    
    def find_by_day(self, day: int) -> Optional[SleepData]:
        """Find data by day number."""
        for item in self.data:
            if item.day == day:
                return item
        return None
    
    def find_by_date(self, date_str: str) -> Optional[SleepData]:
        """Find data by date string."""
        for item in self.data:
            if item.date and item.date.startswith(date_str):
                return item
        return None
    
    def _find_by_date(self, date_str: str) -> Optional[int]:
        """Find index by date string."""
        for i, item in enumerate(self.data):
            if item.date and item.date.startswith(date_str):
                return i
        return None
    
    def get_recent_data(self, days: int = 7) -> List[SleepData]:
        """Get recent data sorted by day."""
        sorted_data = sorted(self.data, key=lambda x: x.day, reverse=True)
        return sorted_data[:days]
    
    def get_all_dates(self) -> List[str]:
        """Get all dates with data."""
        dates = []
        for item in self.data:
            if item.date:
                try:
                    date_str = item.date.split('T')[0]
                    dates.append(date_str)
                except (ValueError, IndexError):
                    continue
        return dates
    
    def to_dict_list(self) -> List[Dict[str, Any]]:
        """Convert to list of dictionaries."""
        return [item.to_dict() for item in self.data]