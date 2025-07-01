"""Sleep analytics and statistics calculation service."""
import datetime
from typing import Dict, List, Any, Tuple
from app.models.sleep_data import SleepData, SleepDataCollection


class SleepAnalytics:
    """Sleep analytics and statistics service."""
    
    def __init__(self, sleep_data: SleepDataCollection, settings: Dict[str, Any]):
        self.sleep_data = sleep_data
        self.settings = settings
    
    def calculate_stats(self) -> Dict[str, str]:
        """Calculate and return sleep statistics."""
        stats = {
            'avgSleepTime': '0時間',
            'sleepDebt': '0時間',
            'avgSleepQuality': '0/5',
            'sleepEfficiency': '0%',
            'optimalSleepTime': '8.0時間',
            'optimalBedtime': '23:00',
            'optimalWakeTime': '07:00'
        }
        
        if not self.sleep_data.data:
            return stats
        
        total_sleep_hours = 0
        total_sleep_quality = 0
        total_sleep_efficiency = 0
        recorded_days = 0
        efficiency_recorded_days = 0
        
        quality_sleep_hours = []
        
        for sleep_item in self.sleep_data.data:
            if sleep_item.sleep_hours:
                total_sleep_hours += sleep_item.sleep_hours
                total_sleep_quality += sleep_item.sleep_quality
                recorded_days += 1
                
                if sleep_item.sleep_quality > 0:
                    quality_sleep_hours.append((sleep_item.sleep_hours, sleep_item.sleep_quality))
                
                if sleep_item.sleep_efficiency:
                    total_sleep_efficiency += sleep_item.sleep_efficiency
                    efficiency_recorded_days += 1
        
        if recorded_days > 0:
            avg_sleep_hours = total_sleep_hours / recorded_days
            avg_quality = total_sleep_quality / recorded_days
            sleep_debt = max(0, (self.settings['idealSleepTime'] * recorded_days) - total_sleep_hours)
            
            stats['avgSleepTime'] = f'{avg_sleep_hours:.1f}時間'
            stats['sleepDebt'] = f'{sleep_debt:.1f}時間'
            stats['avgSleepQuality'] = f'{avg_quality:.1f}/5'
            
            optimal_sleep_data = self._analyze_optimal_sleep_time(quality_sleep_hours)
            stats.update(optimal_sleep_data)
        
        if efficiency_recorded_days > 0:
            avg_efficiency = total_sleep_efficiency / efficiency_recorded_days
            stats['sleepEfficiency'] = f'{avg_efficiency:.1f}%'
        
        return stats
    
    def calculate_goals_progress(self, goals: Dict[str, Any]) -> Dict[str, Dict[str, int]]:
        """Calculate progress for each sleep goal."""
        progress = {
            'duration': {'percentage': 0, 'success_count': 0},
            'bedtime': {'percentage': 0, 'success_count': 0},
            'wakeTime': {'percentage': 0, 'success_count': 0}
        }
        
        if not self.sleep_data.data:
            return progress
        
        for sleep_item in self.sleep_data.data:
            # Sleep duration goal
            if sleep_item.sleep_hours >= goals['duration']:
                progress['duration']['success_count'] += 1
            
            # Bedtime goal
            if sleep_item.bedtime and self._is_time_equal_or_earlier(sleep_item.bedtime, goals['bedtime']):
                progress['bedtime']['success_count'] += 1
            
            # Wake time goal
            if sleep_item.wake_time and self._is_time_equal_or_earlier(goals['wakeTime'], sleep_item.wake_time):
                progress['wakeTime']['success_count'] += 1
        
        # Calculate percentages
        total_days = len(self.sleep_data.data)
        progress['duration']['percentage'] = round((progress['duration']['success_count'] / total_days) * 100)
        progress['bedtime']['percentage'] = round((progress['bedtime']['success_count'] / total_days) * 100)
        progress['wakeTime']['percentage'] = round((progress['wakeTime']['success_count'] / total_days) * 100)
        
        return progress
    
    def _analyze_optimal_sleep_time(self, quality_sleep_hours: List[Tuple[float, int]]) -> Dict[str, str]:
        """Analyze sleep data to determine optimal sleep time."""
        result = {
            'optimalSleepTime': '8.0時間',
            'optimalBedtime': '23:00',
            'optimalWakeTime': '07:00'
        }
        
        if not quality_sleep_hours:
            return result
        
        # Find sleep duration with highest quality
        best_quality = 0
        optimal_duration = 8.0
        
        for hours, quality in quality_sleep_hours:
            if quality > best_quality:
                best_quality = quality
                optimal_duration = hours
        
        # Find the most common bedtime and wake time for high quality sleep
        high_quality_days = []
        quality_threshold = 3
        
        for sleep_item in self.sleep_data.data:
            if (sleep_item.sleep_quality >= quality_threshold and 
                sleep_item.bedtime and sleep_item.wake_time):
                high_quality_days.append(sleep_item)
        
        # Find most common bedtime and wake time in high quality days
        bedtimes = {}
        wake_times = {}
        
        for sleep_item in high_quality_days:
            bedtimes[sleep_item.bedtime] = bedtimes.get(sleep_item.bedtime, 0) + 1
            wake_times[sleep_item.wake_time] = wake_times.get(sleep_item.wake_time, 0) + 1
        
        # Get most common times
        optimal_bedtime = max(bedtimes.items(), key=lambda x: x[1])[0] if bedtimes else '23:00'
        optimal_wake_time = max(wake_times.items(), key=lambda x: x[1])[0] if wake_times else '07:00'
        
        # If no high quality days, use the day with highest quality
        if not high_quality_days and quality_sleep_hours:
            best_day = None
            best_quality = 0
            
            for sleep_item in self.sleep_data.data:
                if (sleep_item.sleep_quality > best_quality and 
                    sleep_item.bedtime and sleep_item.wake_time):
                    best_quality = sleep_item.sleep_quality
                    best_day = sleep_item
            
            if best_day:
                optimal_bedtime = best_day.bedtime
                optimal_wake_time = best_day.wake_time
        
        result['optimalSleepTime'] = f'{optimal_duration:.1f}時間'
        result['optimalBedtime'] = optimal_bedtime
        result['optimalWakeTime'] = optimal_wake_time
        
        return result
    
    def _is_time_equal_or_earlier(self, time1: str, time2: str) -> bool:
        """Compare times (HH:MM format)."""
        try:
            hours1, minutes1 = map(int, time1.split(':'))
            hours2, minutes2 = map(int, time2.split(':'))
            
            if hours1 < hours2:
                return True
            elif hours1 == hours2:
                return minutes1 <= minutes2
            return False
        except (ValueError, IndexError):
            return False
    
    def get_chart_data(self) -> Dict[str, List]:
        """Prepare data for sleep chart."""
        if not self.sleep_data.data:
            return {'labels': [], 'sleepHours': [], 'sleepQuality': []}
        
        # Sort data by day
        sorted_data = sorted(self.sleep_data.data, key=lambda x: x.day)
        
        labels = [f"Day {item.day}" for item in sorted_data]
        sleep_hours = [item.sleep_hours for item in sorted_data]
        sleep_quality = [item.sleep_quality for item in sorted_data]
        
        return {
            'labels': labels,
            'sleepHours': sleep_hours,
            'sleepQuality': sleep_quality
        }
    
    def analyze_weekday_vs_weekend(self) -> Dict[str, float]:
        """Analyze differences between weekday and weekend sleep patterns."""
        weekday_hours = []
        weekend_hours = []
        weekday_quality = []
        weekend_quality = []
        
        for sleep_item in self.sleep_data.data:
            if sleep_item.date:
                try:
                    date = datetime.datetime.fromisoformat(sleep_item.date)
                    is_weekend = date.weekday() >= 5
                    
                    if sleep_item.sleep_hours:
                        if is_weekend:
                            weekend_hours.append(sleep_item.sleep_hours)
                        else:
                            weekday_hours.append(sleep_item.sleep_hours)
                    
                    if sleep_item.sleep_quality:
                        if is_weekend:
                            weekend_quality.append(sleep_item.sleep_quality)
                        else:
                            weekday_quality.append(sleep_item.sleep_quality)
                except (ValueError, TypeError):
                    continue
        
        avg_weekday_hours = sum(weekday_hours) / len(weekday_hours) if weekday_hours else 0
        avg_weekend_hours = sum(weekend_hours) / len(weekend_hours) if weekend_hours else 0
        avg_weekday_quality = sum(weekday_quality) / len(weekday_quality) if weekday_quality else 0
        avg_weekend_quality = sum(weekend_quality) / len(weekend_quality) if weekend_quality else 0
        
        return {
            'avgWeekdayHours': round(avg_weekday_hours, 1),
            'avgWeekendHours': round(avg_weekend_hours, 1),
            'avgWeekdayQuality': round(avg_weekday_quality, 1),
            'avgWeekendQuality': round(avg_weekend_quality, 1),
            'difference': round(avg_weekend_hours - avg_weekday_hours, 1)
        }
    
    def generate_recommendations(self) -> List[Dict[str, str]]:
        """Generate personalized sleep recommendations."""
        recommendations = []
        
        # Analyze recent sleep data (last 7 days or all if less)
        recent_data = self.sleep_data.get_recent_data(7)
        
        # Check for sleep debt
        total_sleep = sum(item.sleep_hours for item in recent_data)
        ideal_sleep = self.settings['idealSleepTime'] * len(recent_data)
        sleep_debt = max(0, ideal_sleep - total_sleep)
        
        if sleep_debt > 3:
            recommendations.append({
                'type': 'warning',
                'text': f'睡眠負債が{sleep_debt:.1f}時間あります。数日かけて少しずつ睡眠時間を増やしましょう。'
            })
        
        # Check for irregular sleep schedule
        bedtimes = [item.bedtime for item in recent_data if item.bedtime]
        wake_times = [item.wake_time for item in recent_data if item.wake_time]
        
        if bedtimes and len(set(bedtimes)) > len(bedtimes) * 0.7:
            recommendations.append({
                'type': 'improvement',
                'text': '就寝時間が不規則です。毎日同じ時間に就寝することで、睡眠の質が向上します。'
            })
        
        if wake_times and len(set(wake_times)) > len(wake_times) * 0.7:
            recommendations.append({
                'type': 'improvement',
                'text': '起床時間が不規則です。毎日同じ時間に起床することで、体内時計が整います。'
            })
        
        # Check for sleep efficiency
        efficiencies = [item.sleep_efficiency for item in recent_data if item.sleep_efficiency]
        avg_efficiency = sum(efficiencies) / len(efficiencies) if efficiencies else 0
        
        if avg_efficiency < 85:
            recommendations.append({
                'type': 'improvement',
                'text': f'睡眠効率が{avg_efficiency:.1f}%と低めです。ベッドで過ごす時間を睡眠に使う時間に近づけましょう。'
            })
        
        # Add positive reinforcement if doing well
        recent_qualities = [item.sleep_quality for item in recent_data if item.sleep_quality]
        avg_quality = sum(recent_qualities) / len(recent_qualities) if recent_qualities else 0
        
        if avg_quality >= 4:
            recommendations.append({
                'type': 'positive',
                'text': '睡眠の質が高いです！現在の睡眠習慣を維持しましょう。'
            })
        
        return recommendations