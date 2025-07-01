import json
import os
import datetime
from typing import Dict, List, Any, Optional, Union

class SleepRecord:
    def __init__(self, 
                 date: str,
                 bedtime: str,
                 wake_time: str,
                 duration: float,
                 time_in_bed: float,
                 quality: int,
                 notes: str = "",
                 challenges_completed: List[str] = None):
        self.date = date
        self.bedtime = bedtime
        self.wake_time = wake_time
        self.duration = duration
        self.time_in_bed = time_in_bed
        self.quality = quality
        self.notes = notes
        self.challenges_completed = challenges_completed or []
        self.timestamp = datetime.datetime.now().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "date": self.date,
            "bedtime": self.bedtime,
            "wakeTime": self.wake_time,
            "duration": self.duration,
            "timeInBed": self.time_in_bed,
            "quality": self.quality,
            "notes": self.notes,
            "challengesCompleted": self.challenges_completed,
            "timestamp": self.timestamp
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SleepRecord':
        return cls(
            date=data.get("date", ""),
            bedtime=data.get("bedtime", ""),
            wake_time=data.get("wakeTime", ""),
            duration=data.get("duration", 0),
            time_in_bed=data.get("timeInBed", 0),
            quality=data.get("quality", 3),
            notes=data.get("notes", ""),
            challenges_completed=data.get("challengesCompleted", [])
        )

class SleepGoals:
    def __init__(self,
                 sleep_duration: float = 8.0,
                 bedtime: str = "23:00",
                 wake_time: str = "07:00"):
        self.sleep_duration = sleep_duration
        self.bedtime = bedtime
        self.wake_time = wake_time
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "sleepDuration": self.sleep_duration,
            "bedtime": self.bedtime,
            "wakeTime": self.wake_time
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SleepGoals':
        return cls(
            sleep_duration=data.get("sleepDuration", 8.0),
            bedtime=data.get("bedtime", "23:00"),
            wake_time=data.get("wakeTime", "07:00")
        )

class SleepStatistics:
    def __init__(self,
                 average_sleep_duration: float = 0,
                 sleep_debt: float = 0,
                 average_quality: float = 0,
                 sleep_efficiency: float = 0):
        self.average_sleep_duration = average_sleep_duration
        self.sleep_debt = sleep_debt
        self.average_quality = average_quality
        self.sleep_efficiency = sleep_efficiency
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "averageSleepDuration": self.average_sleep_duration,
            "sleepDebt": self.sleep_debt,
            "averageQuality": self.average_quality,
            "sleepEfficiency": self.sleep_efficiency
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SleepStatistics':
        return cls(
            average_sleep_duration=data.get("averageSleepDuration", 0),
            sleep_debt=data.get("sleepDebt", 0),
            average_quality=data.get("averageQuality", 0),
            sleep_efficiency=data.get("sleepEfficiency", 0)
        )

class SleepData:
    def __init__(self,
                 records: List[SleepRecord] = None,
                 goals: SleepGoals = None,
                 statistics: SleepStatistics = None):
        self.records = records or []
        self.goals = goals or SleepGoals()
        self.statistics = statistics or SleepStatistics()
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "records": [record.to_dict() for record in self.records],
            "goals": self.goals.to_dict(),
            "statistics": self.statistics.to_dict()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SleepData':
        records = [SleepRecord.from_dict(record) for record in data.get("records", [])]
        goals = SleepGoals.from_dict(data.get("goals", {}))
        statistics = SleepStatistics.from_dict(data.get("statistics", {}))
        
        return cls(records=records, goals=goals, statistics=statistics)
    
    def add_record(self, record: SleepRecord) -> None:
        self.records.append(record)
        self.update_statistics()
    
    def update_statistics(self) -> None:
        if not self.records:
            return
        
        # Calculate average sleep duration
        total_duration = sum(record.duration for record in self.records)
        self.statistics.average_sleep_duration = round(total_duration / len(self.records), 2)
        
        # Calculate sleep debt
        self.statistics.sleep_debt = round(self.goals.sleep_duration - self.statistics.average_sleep_duration, 2)
        
        # Calculate average quality
        total_quality = sum(record.quality for record in self.records)
        self.statistics.average_quality = round(total_quality / len(self.records), 2)
        
        # Calculate sleep efficiency
        total_efficiency = sum(record.duration / record.time_in_bed * 100 for record in self.records)
        self.statistics.sleep_efficiency = round(total_efficiency / len(self.records), 2)
    
    def save_to_file(self, file_path: str) -> None:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(self.to_dict(), f, ensure_ascii=False, indent=2)
    
    @classmethod
    def load_from_file(cls, file_path: str) -> 'SleepData':
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return cls.from_dict(data)
        return cls()