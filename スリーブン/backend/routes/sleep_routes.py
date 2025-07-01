from flask import Blueprint, jsonify, request
import os
import json
from models.sleep_data import SleepData, SleepRecord, SleepGoals
from routes.sleepen_routes import update_sleepen_with_sleep_data

# Create a Blueprint for sleep routes
sleep_bp = Blueprint('sleep', __name__)

# Data file path
SLEEP_DATA_FILE = os.path.join('data', 'sleep_data.json')

# Helper functions
def load_sleep_data():
    """Load sleep data from file"""
    return SleepData.load_from_file(SLEEP_DATA_FILE)

def save_sleep_data(data):
    """Save sleep data to file"""
    data.save_to_file(SLEEP_DATA_FILE)

# Routes
@sleep_bp.route('/api/sleep', methods=['GET'])
def get_sleep_data():
    """Get all sleep data"""
    data = load_sleep_data()
    return jsonify(data.to_dict())

@sleep_bp.route('/api/sleep/record', methods=['POST'])
def add_sleep_record():
    """Add a new sleep record"""
    data = load_sleep_data()
    record_data = request.json
    
    # Create a new sleep record
    record = SleepRecord(
        date=record_data.get('date', ''),
        bedtime=record_data.get('bedtime', ''),
        wake_time=record_data.get('wakeTime', ''),
        duration=record_data.get('duration', 0),
        time_in_bed=record_data.get('timeInBed', 0),
        quality=record_data.get('quality', 3),
        notes=record_data.get('notes', ''),
        challenges_completed=record_data.get('challengesCompleted', [])
    )
    
    # Add the record to the data
    data.add_record(record)
    
    # Save the updated data
    save_sleep_data(data)
    
    # Update sleepen based on sleep quality
    update_sleepen_with_sleep_data(record.quality, record.duration)
    
    return jsonify({"success": True, "record": record.to_dict()})

@sleep_bp.route('/api/sleep/record/<date>', methods=['GET'])
def get_sleep_record(date):
    """Get a specific sleep record by date"""
    data = load_sleep_data()
    
    # Find the record with the matching date
    for record in data.records:
        if record.date == date:
            return jsonify(record.to_dict())
    
    return jsonify({"error": "Record not found"}), 404

@sleep_bp.route('/api/sleep/record/<date>', methods=['PUT'])
def update_sleep_record(date):
    """Update a specific sleep record by date"""
    data = load_sleep_data()
    record_data = request.json
    
    # Find the record with the matching date
    for i, record in enumerate(data.records):
        if record.date == date:
            # Update the record
            updated_record = SleepRecord(
                date=record_data.get('date', record.date),
                bedtime=record_data.get('bedtime', record.bedtime),
                wake_time=record_data.get('wakeTime', record.wake_time),
                duration=record_data.get('duration', record.duration),
                time_in_bed=record_data.get('timeInBed', record.time_in_bed),
                quality=record_data.get('quality', record.quality),
                notes=record_data.get('notes', record.notes),
                challenges_completed=record_data.get('challengesCompleted', record.challenges_completed)
            )
            
            # Replace the old record
            data.records[i] = updated_record
            
            # Update statistics
            data.update_statistics()
            
            # Save the updated data
            save_sleep_data(data)
            
            return jsonify({"success": True, "record": updated_record.to_dict()})
    
    return jsonify({"error": "Record not found"}), 404

@sleep_bp.route('/api/sleep/record/<date>', methods=['DELETE'])
def delete_sleep_record(date):
    """Delete a specific sleep record by date"""
    data = load_sleep_data()
    
    # Find the record with the matching date
    for i, record in enumerate(data.records):
        if record.date == date:
            # Remove the record
            del data.records[i]
            
            # Update statistics
            data.update_statistics()
            
            # Save the updated data
            save_sleep_data(data)
            
            return jsonify({"success": True})
    
    return jsonify({"error": "Record not found"}), 404

@sleep_bp.route('/api/sleep/goals', methods=['GET'])
def get_sleep_goals():
    """Get sleep goals"""
    data = load_sleep_data()
    return jsonify(data.goals.to_dict())

@sleep_bp.route('/api/sleep/goals', methods=['PUT'])
def update_sleep_goals():
    """Update sleep goals"""
    data = load_sleep_data()
    goals_data = request.json
    
    # Update goals
    data.goals = SleepGoals(
        sleep_duration=goals_data.get('sleepDuration', data.goals.sleep_duration),
        bedtime=goals_data.get('bedtime', data.goals.bedtime),
        wake_time=goals_data.get('wakeTime', data.goals.wake_time)
    )
    
    # Update statistics (sleep debt depends on goals)
    data.update_statistics()
    
    # Save the updated data
    save_sleep_data(data)
    
    return jsonify({"success": True, "goals": data.goals.to_dict()})

@sleep_bp.route('/api/sleep/statistics', methods=['GET'])
def get_sleep_statistics():
    """Get sleep statistics"""
    data = load_sleep_data()
    return jsonify(data.statistics.to_dict())

@sleep_bp.route('/api/sleep/analysis', methods=['GET'])
def get_sleep_analysis():
    """Get sleep analysis"""
    data = load_sleep_data()
    
    if len(data.records) < 7:
        return jsonify({
            "error": "Not enough data for analysis",
            "message": "Please record at least 7 days of sleep data for analysis."
        }), 400
    
    # Sort records by date
    sorted_records = sorted(data.records, key=lambda r: r.date)
    
    # Get the last 7 days of records
    recent_records = sorted_records[-7:]
    
    # Get the last 30 days of records (or as many as available)
    month_records = sorted_records[-30:] if len(sorted_records) >= 30 else sorted_records
    
    # Calculate trends
    quality_trend = calculate_trend([r.quality for r in recent_records])
    duration_trend = calculate_trend([r.duration for r in recent_records])
    
    # Compare weekday vs weekend sleep
    weekday_records = [r for r in month_records if is_weekday(r.date)]
    weekend_records = [r for r in month_records if not is_weekday(r.date)]
    
    weekday_avg_duration = sum(r.duration for r in weekday_records) / len(weekday_records) if weekday_records else 0
    weekend_avg_duration = sum(r.duration for r in weekend_records) / len(weekend_records) if weekend_records else 0
    
    weekday_avg_quality = sum(r.quality for r in weekday_records) / len(weekday_records) if weekday_records else 0
    weekend_avg_quality = sum(r.quality for r in weekend_records) / len(weekend_records) if weekend_records else 0
    
    # Identify factors affecting sleep quality
    factors = identify_sleep_factors(data.records)
    
    # Generate recommendations
    recommendations = generate_recommendations(data)
    
    analysis = {
        "trends": {
            "quality": quality_trend,
            "duration": duration_trend
        },
        "comparison": {
            "weekday": {
                "avgDuration": round(weekday_avg_duration, 2),
                "avgQuality": round(weekday_avg_quality, 2)
            },
            "weekend": {
                "avgDuration": round(weekend_avg_duration, 2),
                "avgQuality": round(weekend_avg_quality, 2)
            }
        },
        "factors": factors,
        "recommendations": recommendations
    }
    
    return jsonify(analysis)

# Helper functions for analysis
def calculate_trend(values):
    """Calculate if a trend is improving, worsening, or stable"""
    if len(values) < 3:
        return "stable"
    
    # Simple linear regression to determine trend
    first_half = sum(values[:len(values)//2]) / (len(values)//2)
    second_half = sum(values[len(values)//2:]) / (len(values) - len(values)//2)
    
    if second_half > first_half * 1.05:
        return "improving"
    elif second_half < first_half * 0.95:
        return "worsening"
    else:
        return "stable"

def is_weekday(date_str):
    """Check if a date is a weekday"""
    import datetime
    date = datetime.datetime.strptime(date_str, "%Y-%m-%d")
    return date.weekday() < 5  # 0-4 are weekdays (Monday to Friday)

def identify_sleep_factors(records):
    """Identify factors affecting sleep quality"""
    factors = []
    
    # Check if late bedtime affects quality
    late_records = [r for r in records if is_late_bedtime(r.bedtime)]
    early_records = [r for r in records if not is_late_bedtime(r.bedtime)]
    
    if late_records and early_records:
        late_avg_quality = sum(r.quality for r in late_records) / len(late_records)
        early_avg_quality = sum(r.quality for r in early_records) / len(early_records)
        
        if late_avg_quality < early_avg_quality * 0.9:
            factors.append({
                "factor": "late_bedtime",
                "impact": "negative",
                "description": "遅い就寝時間は睡眠の質を下げる傾向があります。"
            })
    
    # Check if sleep duration affects quality
    short_records = [r for r in records if r.duration < 7]
    long_records = [r for r in records if r.duration >= 7]
    
    if short_records and long_records:
        short_avg_quality = sum(r.quality for r in short_records) / len(short_records)
        long_avg_quality = sum(r.quality for r in long_records) / len(long_records)
        
        if short_avg_quality < long_avg_quality * 0.9:
            factors.append({
                "factor": "short_duration",
                "impact": "negative",
                "description": "短い睡眠時間は睡眠の質を下げる傾向があります。"
            })
    
    return factors

def is_late_bedtime(bedtime):
    """Check if a bedtime is considered late (after midnight)"""
    hour = int(bedtime.split(':')[0])
    return hour >= 0 and hour < 6  # 00:00 to 05:59 is considered late

def generate_recommendations(data):
    """Generate personalized recommendations based on sleep data"""
    recommendations = []
    
    # Check sleep debt
    if data.statistics.sleep_debt > 1:
        recommendations.append({
            "type": "sleep_debt",
            "priority": "high",
            "description": f"睡眠負債が{data.statistics.sleep_debt}時間あります。毎日の睡眠時間を30分増やすことを目指しましょう。"
        })
    
    # Check sleep efficiency
    if data.statistics.sleep_efficiency < 85:
        recommendations.append({
            "type": "sleep_efficiency",
            "priority": "medium",
            "description": "睡眠効率が低いです。ベッドに入る前にリラックスする時間を設け、ベッドではすぐに眠るようにしましょう。"
        })
    
    # Check consistency
    if len(data.records) >= 7:
        bedtimes = [r.bedtime for r in data.records[-7:]]
        wake_times = [r.wake_time for r in data.records[-7:]]
        
        bedtime_variance = calculate_time_variance(bedtimes)
        wake_time_variance = calculate_time_variance(wake_times)
        
        if bedtime_variance > 60 or wake_time_variance > 60:
            recommendations.append({
                "type": "consistency",
                "priority": "high",
                "description": "就寝時間と起床時間が一定ではありません。毎日同じ時間に寝て起きることで、睡眠の質が向上します。"
            })
    
    return recommendations

def calculate_time_variance(time_strings):
    """Calculate the variance in minutes between a list of time strings (HH:MM)"""
    import statistics
    
    # Convert time strings to minutes since midnight
    minutes = []
    for time_str in time_strings:
        hour, minute = map(int, time_str.split(':'))
        total_minutes = hour * 60 + minute
        minutes.append(total_minutes)
    
    # Handle times around midnight (e.g., 23:30 vs 00:30)
    for i in range(len(minutes)):
        if i > 0 and abs(minutes[i] - minutes[i-1]) > 12 * 60:
            # If the difference is more than 12 hours, adjust by adding/subtracting 24 hours
            if minutes[i] < minutes[i-1]:
                minutes[i] += 24 * 60
            else:
                minutes[i-1] += 24 * 60
    
    # Calculate variance
    try:
        return statistics.variance(minutes)
    except statistics.StatisticsError:
        return 0  # Not enough data