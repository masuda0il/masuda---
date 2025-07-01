from flask import Flask, render_template, request, jsonify, redirect, url_for, send_from_directory
import json
import os
import datetime
import logging
from sync import SleepDataSync
from sleepen import SleepenManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Data storage path
DATA_FILE = 'sleep_data.json'
SLEEPEN_DATA_FILE = 'sleepen_data.json'

# Default settings
DEFAULT_SETTINGS = {
    'idealSleepTime': 8,
    'bedtimeReminder': '22:00',
    'startDate': datetime.datetime.now().strftime('%Y-%m-%d'),  # Set today as default start date
    'sleepGoals': {
        'duration': 8,
        'bedtime': '23:00',
        'wakeTime': '07:00'
    }
}

# Sleep tips data
SLEEP_TIPS = [
    {
        'title': '規則正しい睡眠スケジュール',
        'text': '毎日同じ時間に就寝し、同じ時間に起床することで、体内時計を整えましょう。週末も平日と同じリズムを保つことが重要です。'
    },
    {
        'title': '睡眠環境の最適化',
        'text': '寝室は涼しく（18-20℃）、静かで、暗くしましょう。快適なマットレスと枕を使用し、リラックスできる環境を作りましょう。'
    },
    {
        'title': '就寝前のルーティン',
        'text': '就寝の30-60分前から、リラックスするルーティンを作りましょう。読書、瞑想、ストレッチなどがおすすめです。'
    },
    {
        'title': 'カフェインとアルコールの制限',
        'text': '午後からのカフェイン摂取を避け、就寝前のアルコールは控えましょう。どちらも睡眠の質に悪影響を与えます。'
    },
    {
        'title': '日中の運動',
        'text': '定期的な運動は睡眠の質を向上させますが、就寝の3時間前までに終えるようにしましょう。'
    },
    {
        'title': '日光を浴びる',
        'text': '朝の日光を浴びることで体内時計をリセットし、夜の睡眠の質を向上させることができます。'
    },
    {
        'title': '夕食の時間',
        'text': '就寝の2-3時間前には夕食を済ませ、消化が睡眠を妨げないようにしましょう。'
    },
    {
        'title': 'リラクゼーション技術',
        'text': '深呼吸、プログレッシブ筋弛緩法、瞑想などのリラクゼーション技術を学び、就寝前に実践しましょう。'
    },
    {
        'title': '睡眠と覚醒のサイクル',
        'text': '90分の睡眠サイクルを意識し、サイクルの切れ目で起きるように就寝時間を計画しましょう。'
    },
    {
        'title': '昼寝の取り方',
        'text': '昼寝は20-30分以内に抑え、午後3時以降は避けましょう。長すぎる昼寝や遅い時間の昼寝は夜の睡眠に影響します。'
    },
    {
        'title': '寝室はベッドと睡眠のためだけに',
        'text': '寝室では仕事や娯楽を避け、睡眠と休息のための場所として使いましょう。脳が寝室を睡眠と関連付けるようになります。'
    },
    {
        'title': '睡眠サプリメント',
        'text': 'メラトニンやマグネシウムなどのサプリメントが睡眠の質を向上させる可能性がありますが、使用前に医師に相談しましょう。'
    },
    {
        'title': '睡眠負債の解消',
        'text': '睡眠不足が続いた場合、数日かけて少しずつ睡眠時間を増やし、負債を解消しましょう。一度に取り戻そうとしないことが大切です。'
    },
    {
        'title': '睡眠トラッキング',
        'text': '睡眠の質や時間を記録することで、パターンを把握し、改善点を見つけることができます。'
    },
    {
        'title': '温かい入浴',
        'text': '就寝の1-2時間前に温かいお風呂に入ることで、体温の自然な低下を促し、睡眠を誘導することができます。'
    }
]

# Sleep challenges data
SLEEP_CHALLENGES = [
    {
        'title': '就寝前のスクリーンタイムを制限する',
        'text': '今日は就寝の1時間前にはすべての電子機器（スマホ、タブレット、PC）の使用を止めましょう。ブルーライトは睡眠を妨げる可能性があります。'
    },
    {
        'title': '就寝時間を30分早める',
        'text': '今日はいつもより30分早く就寝しましょう。早寝早起きのリズムを作るための第一歩です。'
    },
    {
        'title': '睡眠日記をつける',
        'text': '今日から1週間、就寝時間、起床時間、睡眠の質、気分などを記録しましょう。パターンを把握するのに役立ちます。'
    },
    {
        'title': '寝室の環境を整える',
        'text': '今日は寝室の温度、光、音などを最適化しましょう。理想的には涼しく、暗く、静かな環境が睡眠に最適です。'
    },
    {
        'title': '就寝前のリラックスルーティンを作る',
        'text': '今日は就寝前の30分間、リラックスするための活動（読書、ストレッチ、瞑想など）を行いましょう。'
    },
    {
        'title': 'カフェインフリーの一日',
        'text': '今日は一日中カフェインを摂取しないようにしましょう。カフェインは体内に長時間残り、睡眠に影響を与えることがあります。'
    },
    {
        'title': '朝の日光浴',
        'text': '今朝、起床後30分以内に15分間、外で日光を浴びましょう。体内時計の調整に役立ちます。'
    },
    {
        'title': '夕食を早めに済ませる',
        'text': '今日は就寝の少なくとも3時間前には夕食を済ませましょう。消化活動が睡眠を妨げないようにします。'
    },
    {
        'title': '就寝前のストレッチ',
        'text': '今日は就寝前に10分間の軽いストレッチを行いましょう。体の緊張をほぐし、リラックスするのに役立ちます。'
    },
    {
        'title': '深呼吸エクササイズ',
        'text': '就寝前に5分間、4-7-8呼吸法（4秒吸って、7秒止めて、8秒かけて吐く）を実践しましょう。'
    },
    {
        'title': 'デジタルデトックスの夜',
        'text': '今夜は夕食後からすべての電子機器の使用を避けましょう。代わりに読書や会話などのアナログな活動を楽しみましょう。'
    },
    {
        'title': '睡眠に良い飲み物を試す',
        'text': '今夜は就寝前にカモミールティーやホットミルクなど、睡眠を促進する飲み物を飲みましょう。'
    },
    {
        'title': '寝室の整理整頓',
        'text': '今日は寝室を整理整頓し、清潔で落ち着ける空間にしましょう。散らかった環境はストレスを引き起こし、睡眠に影響することがあります。'
    },
    {
        'title': '感謝の日記',
        'text': '就寝前に、今日感謝したことを3つ書き出しましょう。ポジティブな思考は心を落ち着かせ、良い睡眠につながります。'
    },
    {
        'title': '早朝の運動',
        'text': '今日は朝に15-30分の軽い運動（ウォーキング、ストレッチなど）を行いましょう。日中の活動は夜の良い睡眠につながります。'
    }
]

def load_data():
    """Load sleep data from JSON file"""
    sync = SleepDataSync(DATA_FILE)
    return sync.load_data()

def save_data(data):
    """Save sleep data to JSON file"""
    sync = SleepDataSync(DATA_FILE)
    sync.save_data(data)
    logger.info(f"Data saved successfully. Current day: {data['currentDay']}")

def calculate_sleep_hours(bedtime, wake_time):
    """Calculate sleep hours between bedtime and wake time"""
    if not bedtime or not wake_time:
        return 0
    
    bedtime_parts = bedtime.split(':')
    wake_parts = wake_time.split(':')
    
    bedtime_hours = int(bedtime_parts[0])
    bedtime_minutes = int(bedtime_parts[1])
    wake_hours = int(wake_parts[0])
    wake_minutes = int(wake_parts[1])
    
    # Convert to decimal hours
    bedtime_decimal = bedtime_hours + (bedtime_minutes / 60)
    wake_decimal = wake_hours + (wake_minutes / 60)
    
    # Calculate sleep hours
    if bedtime_hours < wake_hours:
        # Same day sleep (e.g., 22:00 to 06:00)
        return wake_decimal - bedtime_decimal
    else:
        # Overnight sleep (e.g., 23:00 to 07:00)
        return (24 - bedtime_decimal) + wake_decimal

def calculate_current_day(start_date):
    """Calculate current day number based on start date"""
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

def is_time_equal_or_earlier(time1, time2):
    """Compare times (HH:MM format)"""
    hours1, minutes1 = map(int, time1.split(':'))
    hours2, minutes2 = map(int, time2.split(':'))
    
    if hours1 < hours2:
        return True
    elif hours1 == hours2:
        return minutes1 <= minutes2
    return False

def update_sleep_stats(sleep_data, settings):
    """Calculate and update sleep statistics"""
    stats = {
        'avgSleepTime': '0時間',
        'sleepDebt': '0時間',
        'avgSleepQuality': '0/5',
        'sleepEfficiency': '0%',
        'optimalSleepTime': '8.0時間',
        'optimalBedtime': '23:00',
        'optimalWakeTime': '07:00'
    }
    
    if not sleep_data:
        return stats
    
    total_sleep_hours = 0
    total_sleep_quality = 0
    total_sleep_efficiency = 0
    recorded_days = 0
    efficiency_recorded_days = 0
    
    # For optimal sleep time analysis
    quality_sleep_hours = []  # List of (sleep_hours, sleep_quality) tuples
    
    for day in sleep_data:
        if 'sleepHours' in day and day['sleepHours']:
            total_sleep_hours += day['sleepHours']
            sleep_quality = day.get('sleepQuality', 0)
            total_sleep_quality += sleep_quality
            recorded_days += 1
            
            # Store sleep hours and quality for analysis
            if sleep_quality > 0:  # Only consider days with quality ratings
                quality_sleep_hours.append((day['sleepHours'], sleep_quality))
            
            if 'sleepEfficiency' in day and day['sleepEfficiency']:
                total_sleep_efficiency += day['sleepEfficiency']
                efficiency_recorded_days += 1
    
    if recorded_days > 0:
        avg_sleep_hours = total_sleep_hours / recorded_days
        avg_quality = total_sleep_quality / recorded_days
        sleep_debt = max(0, (settings['idealSleepTime'] * recorded_days) - total_sleep_hours)
        
        stats['avgSleepTime'] = f'{avg_sleep_hours:.1f}時間'
        stats['sleepDebt'] = f'{sleep_debt:.1f}時間'
        stats['avgSleepQuality'] = f'{avg_quality:.1f}/5'
        
        # Calculate optimal sleep time based on highest quality sleep
        optimal_sleep_data = analyze_optimal_sleep_time(sleep_data, quality_sleep_hours)
        stats.update(optimal_sleep_data)
    
    if efficiency_recorded_days > 0:
        avg_efficiency = total_sleep_efficiency / efficiency_recorded_days
        stats['sleepEfficiency'] = f'{avg_efficiency:.1f}%'
    
    return stats

def update_sleep_goals_progress(sleep_data, goals):
    """Calculate progress for each sleep goal"""
    progress = {
        'duration': {'percentage': 0, 'success_count': 0},
        'bedtime': {'percentage': 0, 'success_count': 0},
        'wakeTime': {'percentage': 0, 'success_count': 0}
    }
    
    if not sleep_data:
        return progress
    
    for day in sleep_data:
        # Sleep duration goal
        if 'sleepHours' in day and day['sleepHours'] >= goals['duration']:
            progress['duration']['success_count'] += 1
        
        # Bedtime goal
        if 'bedtime' in day and day['bedtime'] and is_time_equal_or_earlier(day['bedtime'], goals['bedtime']):
            progress['bedtime']['success_count'] += 1
        
        # Wake time goal
        if 'wakeTime' in day and day['wakeTime'] and is_time_equal_or_earlier(goals['wakeTime'], day['wakeTime']):
            progress['wakeTime']['success_count'] += 1
    
    # Calculate percentages
    total_days = len(sleep_data)
    progress['duration']['percentage'] = round((progress['duration']['success_count'] / total_days) * 100)
    progress['bedtime']['percentage'] = round((progress['bedtime']['success_count'] / total_days) * 100)
    progress['wakeTime']['percentage'] = round((progress['wakeTime']['success_count'] / total_days) * 100)
    
    return progress

def analyze_optimal_sleep_time(sleep_data, quality_sleep_hours):
    """Analyze sleep data to determine optimal sleep time"""
    result = {
        'optimalSleepTime': '8.0時間',  # Default value
        'optimalBedtime': '23:00',      # Default value
        'optimalWakeTime': '07:00'      # Default value
    }
    
    if not quality_sleep_hours:
        return result
    
    # Find sleep duration with highest quality
    best_quality = 0
    optimal_duration = 8.0  # Default
    
    for hours, quality in quality_sleep_hours:
        if quality > best_quality:
            best_quality = quality
            optimal_duration = hours
    
    # Find the most common bedtime and wake time for high quality sleep
    high_quality_days = []
    quality_threshold = 3  # Consider sleep quality of 3 or higher as good
    
    for day in sleep_data:
        if day.get('sleepQuality', 0) >= quality_threshold and 'bedtime' in day and 'wakeTime' in day:
            high_quality_days.append(day)
    
    # Find most common bedtime and wake time in high quality days
    bedtimes = {}
    wake_times = {}
    
    for day in high_quality_days:
        # Round to nearest hour for grouping
        bedtime = day['bedtime']
        wake_time = day['wakeTime']
        
        bedtimes[bedtime] = bedtimes.get(bedtime, 0) + 1
        wake_times[wake_time] = wake_times.get(wake_time, 0) + 1
    
    # Get most common times
    optimal_bedtime = max(bedtimes.items(), key=lambda x: x[1])[0] if bedtimes else '23:00'
    optimal_wake_time = max(wake_times.items(), key=lambda x: x[1])[0] if wake_times else '07:00'
    
    # If no high quality days, use the day with highest quality
    if not high_quality_days and quality_sleep_hours:
        best_day = None
        best_quality = 0
        
        for day in sleep_data:
            quality = day.get('sleepQuality', 0)
            if quality > best_quality and 'bedtime' in day and 'wakeTime' in day:
                best_quality = quality
                best_day = day
        
        if best_day:
            optimal_bedtime = best_day['bedtime']
            optimal_wake_time = best_day['wakeTime']
    
    result['optimalSleepTime'] = f'{optimal_duration:.1f}時間'
    result['optimalBedtime'] = optimal_bedtime
    result['optimalWakeTime'] = optimal_wake_time
    
    return result

def get_daily_tip_and_challenge(current_day):
    """Get daily tip and challenge based on current day"""
    tip_index = (current_day - 1) % len(SLEEP_TIPS)
    challenge_index = (current_day - 1) % len(SLEEP_CHALLENGES)
    
    return {
        'tip': SLEEP_TIPS[tip_index],
        'challenge': SLEEP_CHALLENGES[challenge_index]
    }

def get_chart_data(sleep_data):
    """Prepare data for sleep chart"""
    if not sleep_data:
        return {'labels': [], 'sleepHours': [], 'sleepQuality': []}
    
    # Sort data by day
    sorted_data = sorted(sleep_data, key=lambda x: x['day'])
    
    labels = [f"Day {day['day']}" for day in sorted_data]
    sleep_hours = [day.get('sleepHours', 0) for day in sorted_data]
    sleep_quality = [day.get('sleepQuality', 0) for day in sorted_data]
    
    return {
        'labels': labels,
        'sleepHours': sleep_hours,
        'sleepQuality': sleep_quality
    }

@app.route('/manifest.json')
def manifest():
    return send_from_directory('.', 'manifest.json')

@app.route('/service-worker.js')
def service_worker():
    return send_from_directory('.', 'service-worker.js')

@app.route('/favicon.ico')
def favicon():
    return send_from_directory('.', 'favicon.ico')

def get_sleep_data_dates(sleep_data):
    """Get a list of all dates that have sleep data"""
    dates = []
    for day in sleep_data:
        if 'date' in day and day['date']:
            try:
                # Extract just the date part (YYYY-MM-DD) from the ISO format
                date_str = day['date'].split('T')[0]
                dates.append(date_str)
            except (ValueError, IndexError):
                continue
    return dates

@app.route('/')
def index():
    """Main page route"""
    data = load_data()
    
    sleep_data = data['sleepData']
    settings = data['settings']
    
    # Initialize start date if not set
    if 'startDate' not in settings or not settings['startDate']:
        settings['startDate'] = datetime.datetime.now().strftime('%Y-%m-%d')
        data['settings'] = settings
        save_data(data)
    
    # Always recalculate current day based on start date
    calculated_day = calculate_current_day(settings['startDate'])
    if calculated_day != data['currentDay']:
        data['currentDay'] = calculated_day
        save_data(data)
    
    current_day = data['currentDay']
    
    # Get today's data if exists
    today = datetime.datetime.now()
    today_iso_date = today.strftime('%Y-%m-%d')
    today_data = next((day for day in sleep_data if 'date' in day and day['date'].startswith(today_iso_date)), None)
    
    # If no data for today, check by day number
    if not today_data:
        today_data = next((day for day in sleep_data if day['day'] == current_day), None)
    
    # Calculate stats
    stats = update_sleep_stats(sleep_data, settings)
    
    # Calculate goals progress
    goals_progress = update_sleep_goals_progress(sleep_data, settings['sleepGoals'])
    
    # Get daily tip and challenge
    daily_content = get_daily_tip_and_challenge(current_day)
    
    # Get chart data
    chart_data = get_chart_data(sleep_data)
    
    # Format current date
    current_date = today.strftime('%Y年%m月%d日(%a)')
    
    # Calculate progress percentage - use modulo for continuous progress
    progress_percentage = ((current_day - 1) % 30) / 30 * 100
    
    # Get Sleepen data
    sleepen_manager = SleepenManager(SLEEPEN_DATA_FILE)
    sleepen = sleepen_manager.get_sleepen()
    
    # Calculate Sleepen progress percentages
    sleepen_exp_percentage = (sleepen.exp / (sleepen.level * 100)) * 100 if sleepen.level > 0 else 0
    
    # Get recent adventures
    recent_adventures = sleepen.adventures[-3:] if sleepen.adventures else []
    
    # Get all dates with sleep data for the calendar
    sleep_data_dates = get_sleep_data_dates(sleep_data)
    
    return render_template('index.html',
                           current_day=current_day,
                           progress_percentage=progress_percentage,
                           current_date=current_date,
                           today_iso_date=today_iso_date,
                           stats=stats,
                           goals=settings['sleepGoals'],
                           goals_progress=goals_progress,
                           today_data=today_data,
                           daily_tip=daily_content['tip'],
                           daily_challenge=daily_content['challenge'],
                           settings=settings,
                           chart_data=json.dumps(chart_data),
                           sleep_data=sleep_data,
                           sleep_data_dates=json.dumps(sleep_data_dates),
                           optimal_sleep_time=stats.get('optimalSleepTime', '8.0時間'),
                           optimal_bedtime=stats.get('optimalBedtime', '23:00'),
                           optimal_wake_time=stats.get('optimalWakeTime', '07:00'),
                           sleepen=sleepen,
                           sleepen_exp_percentage=sleepen_exp_percentage,
                           recent_adventures=recent_adventures)

@app.route('/api/sync', methods=['POST'])
def sync_data():
    """API endpoint to synchronize offline data with server data"""
    try:
        offline_data = request.json
        
        if not offline_data:
            return jsonify({'success': False, 'message': 'No data provided'})
        
        sync = SleepDataSync(DATA_FILE)
        merged_data = sync.merge_offline_data(offline_data)
        
        return jsonify({
            'success': True,
            'message': 'データが同期されました。',
            'data': merged_data
        })
    except Exception as e:
        logger.error(f"Error syncing data: {str(e)}")
        return jsonify({'success': False, 'message': f'同期エラー: {str(e)}'})

@app.route('/api/save_sleep_data', methods=['POST'])
def save_sleep_data():
    """API endpoint to save sleep data"""
    data = load_data()
    form_data = request.form
    
    bed_in_time = form_data.get('bed_in_time')
    bed_out_time = form_data.get('bed_out_time')
    bedtime = form_data.get('bedtime')
    wake_time = form_data.get('wake_time')
    sleep_quality = int(form_data.get('sleep_quality', 0))
    notes = form_data.get('notes', '')
    challenge_completed = form_data.get('challenge_completed') == 'on'
    
    # Get selected date from form
    selected_date = form_data.get('selected_date')
    if not selected_date:
        selected_date = datetime.datetime.now().strftime('%Y-%m-%d')
    
    # Calculate sleep hours
    sleep_hours = calculate_sleep_hours(bedtime, wake_time)
    
    # Calculate time in bed
    time_in_bed = calculate_sleep_hours(bed_in_time, bed_out_time)
    
    # Calculate sleep efficiency
    sleep_efficiency = (sleep_hours / time_in_bed) * 100 if time_in_bed > 0 else 0
    
    current_day = data['currentDay']
    
    # Find if data for this date already exists
    day_data = next((day for day in data['sleepData'] if 'date' in day and day['date'].startswith(selected_date)), None)
    
    # If no data found by date, check by day number (for backward compatibility)
    if not day_data:
        day_data = next((day for day in data['sleepData'] if day['day'] == current_day), None)
    
    new_day_data = {
        'day': current_day,
        'date': selected_date + 'T00:00:00',  # Use selected date with midnight time
        'bedInTime': bed_in_time,
        'bedOutTime': bed_out_time,
        'bedtime': bedtime,
        'wakeTime': wake_time,
        'sleepHours': sleep_hours,
        'timeInBed': time_in_bed,
        'sleepEfficiency': sleep_efficiency,
        'sleepQuality': sleep_quality,
        'notes': notes,
        'challengeCompleted': challenge_completed
    }
    
    # Add reflection data if provided
    if 'morning_feeling' in form_data:
        new_day_data['reflection'] = {
            'morningFeeling': int(form_data.get('morning_feeling', 0)),
            'workedWell': form_data.get('worked_well', ''),
            'improve': form_data.get('improve', ''),
            'nextGoal': form_data.get('next_goal', '')
        }
    
    if day_data:
        # Update existing data
        day_index = data['sleepData'].index(day_data)
        data['sleepData'][day_index] = new_day_data
    else:
        # Add new data
        data['sleepData'].append(new_day_data)
    
    save_data(data)
    
    # Update Sleepen based on sleep data
    sleepen_manager = SleepenManager(SLEEPEN_DATA_FILE)
    sleepen = sleepen_manager.process_sleep_data(new_day_data)
    
    return jsonify({
        'success': True,
        'message': '睡眠データが保存されました！',
        'sleepen': {
            'level': sleepen.level,
            'exp': sleepen.exp,
            'adventure': sleepen.adventures[-1] if sleepen.adventures else None
        }
    })

@app.route('/api/save_reflection', methods=['POST'])
def save_reflection():
    """API endpoint to save sleep reflection data"""
    data = load_data()
    form_data = request.form
    
    morning_feeling = int(form_data.get('morning_feeling', 0))
    worked_well = form_data.get('worked_well', '')
    improve = form_data.get('improve', '')
    next_goal = form_data.get('next_goal', '')
    
    current_day = data['currentDay']
    
    # Find if data for this day already exists
    day_data = next((day for day in data['sleepData'] if day['day'] == current_day), None)
    
    reflection_data = {
        'morningFeeling': morning_feeling,
        'workedWell': worked_well,
        'improve': improve,
        'nextGoal': next_goal
    }
    
    if day_data:
        # Update existing data with reflection
        day_data['reflection'] = reflection_data
    else:
        # Create new day data with reflection only
        data['sleepData'].append({
            'day': current_day,
            'date': datetime.datetime.now().isoformat(),
            'reflection': reflection_data
        })
    
    save_data(data)
    
    return jsonify({'success': True, 'message': '睡眠の振り返りが保存されました！'})

@app.route('/api/save_goals', methods=['POST'])
def save_goals():
    """API endpoint to save sleep goals"""
    data = load_data()
    form_data = request.form
    
    data['settings']['sleepGoals'] = {
        'duration': float(form_data.get('duration', 8)),
        'bedtime': form_data.get('bedtime', '23:00'),
        'wakeTime': form_data.get('wake_time', '07:00')
    }
    
    save_data(data)
    
    return jsonify({'success': True, 'message': '睡眠目標が保存されました！'})

@app.route('/api/save_settings', methods=['POST'])
def save_settings():
    """API endpoint to save settings"""
    data = load_data()
    form_data = request.form
    
    data['settings']['idealSleepTime'] = float(form_data.get('ideal_sleep_time', 8))
    data['settings']['bedtimeReminder'] = form_data.get('bedtime_reminder', '22:00')
    
    # Handle start date setting
    start_date = form_data.get('start_date')
    if start_date:
        data['settings']['startDate'] = start_date
        # Recalculate current day based on start date
        data['currentDay'] = calculate_current_day(start_date)
    
    save_data(data)
    
    return jsonify({'success': True, 'message': '設定が保存されました。'})

@app.route('/api/advance_day', methods=['POST'])
def advance_day():
    """API endpoint to advance to the next day"""
    data = load_data()
    
    # No day limit - can advance indefinitely
    data['currentDay'] += 1
    save_data(data)
    
    # Rest Sleepen when advancing to next day
    sleepen_manager = SleepenManager(SLEEPEN_DATA_FILE)
    sleepen = sleepen_manager.get_sleepen()
    sleepen.rest()
    sleepen_manager.update_sleepen(sleepen)
    
    return jsonify({'success': True, 'message': f'Day {data["currentDay"]}に進みました。'})

@app.route('/api/reset_program', methods=['POST'])
def reset_program():
    """API endpoint to reset the program"""
    data = load_data()
    
    data['sleepData'] = []
    data['currentDay'] = 1
    
    save_data(data)
    
    return jsonify({'success': True, 'message': 'プログラムがリセットされました。Day 1から再開します。'})

@app.route('/api/view_day/<int:day>', methods=['GET'])
def view_day(day):
    """API endpoint to view data for a specific day"""
    data = load_data()
    
    day_data = next((d for d in data['sleepData'] if d['day'] == day), None)
    
    if day_data:
        return jsonify({'success': True, 'data': day_data})
    else:
        return jsonify({'success': False, 'message': f'Day {day} のデータはまだ記録されていません。'})

@app.route('/api/view_date/<date_str>', methods=['GET'])
def view_date(date_str):
    """API endpoint to view data for a specific date"""
    data = load_data()
    
    # Find data for the specified date
    day_data = next((d for d in data['sleepData'] if 'date' in d and d['date'].startswith(date_str)), None)
    
    if day_data:
        return jsonify({'success': True, 'data': day_data})
    else:
        return jsonify({'success': False, 'message': f'{date_str} のデータはまだ記録されていません。'})

@app.route('/api/analyze', methods=['GET'])
def analyze_sleep_patterns():
    """API endpoint to get advanced sleep pattern analysis"""
    try:
        data = load_data()
        sleep_data = data['sleepData']
        
        if not sleep_data:
            return jsonify({'success': False, 'message': 'データがありません。'})
        
        # Advanced analytics
        analysis = {
            'weekdayVsWeekend': analyze_weekday_vs_weekend(sleep_data),
            'sleepTrend': analyze_sleep_trend(sleep_data),
            'qualityFactors': analyze_quality_factors(sleep_data),
            'recommendations': generate_recommendations(sleep_data, data['settings'])
        }
        
        return jsonify({'success': True, 'analysis': analysis})
    except Exception as e:
        logger.error(f"Error analyzing sleep patterns: {str(e)}")
        return jsonify({'success': False, 'message': f'分析エラー: {str(e)}'})

def analyze_weekday_vs_weekend(sleep_data):
    """Analyze differences between weekday and weekend sleep patterns"""
    weekday_hours = []
    weekend_hours = []
    weekday_quality = []
    weekend_quality = []
    
    for day in sleep_data:
        if 'date' in day and day['date']:
            try:
                date = datetime.datetime.fromisoformat(day['date'])
                is_weekend = date.weekday() >= 5  # 5 = Saturday, 6 = Sunday
                
                if 'sleepHours' in day and day['sleepHours']:
                    if is_weekend:
                        weekend_hours.append(day['sleepHours'])
                    else:
                        weekday_hours.append(day['sleepHours'])
                
                if 'sleepQuality' in day and day['sleepQuality']:
                    if is_weekend:
                        weekend_quality.append(day['sleepQuality'])
                    else:
                        weekday_quality.append(day['sleepQuality'])
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

def analyze_sleep_trend(sleep_data):
    """Analyze sleep trend over time"""
    if len(sleep_data) < 3:
        return {'trend': 'insufficient_data'}
    
    # Sort data by day
    sorted_data = sorted(sleep_data, key=lambda x: x['day'])
    
    # Get sleep hours for each day
    sleep_hours = [day.get('sleepHours', 0) for day in sorted_data if 'sleepHours' in day]
    
    if len(sleep_hours) < 3:
        return {'trend': 'insufficient_data'}
    
    # Calculate trend (simple linear regression)
    n = len(sleep_hours)
    x = list(range(1, n + 1))
    
    # Calculate slope
    x_mean = sum(x) / n
    y_mean = sum(sleep_hours) / n
    
    numerator = sum((x[i] - x_mean) * (sleep_hours[i] - y_mean) for i in range(n))
    denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
    
    slope = numerator / denominator if denominator != 0 else 0
    
    # Determine trend
    if abs(slope) < 0.05:
        trend = 'stable'
    elif slope > 0:
        trend = 'improving'
    else:
        trend = 'declining'
    
    # Calculate recent average (last 3 days)
    recent_avg = sum(sleep_hours[-3:]) / 3 if len(sleep_hours) >= 3 else sum(sleep_hours) / len(sleep_hours)
    
    return {
        'trend': trend,
        'slope': round(slope, 3),
        'recentAvg': round(recent_avg, 1)
    }

def analyze_quality_factors(sleep_data):
    """Analyze factors affecting sleep quality"""
    factors = {
        'duration': {'correlation': 0, 'optimal': 0},
        'bedtime': {'early': {'count': 0, 'quality': 0}, 'late': {'count': 0, 'quality': 0}},
        'notes': []
    }
    
    # Analyze correlation between sleep duration and quality
    durations = []
    qualities = []
    
    for day in sleep_data:
        if 'sleepHours' in day and 'sleepQuality' in day and day['sleepQuality'] > 0:
            durations.append(day['sleepHours'])
            qualities.append(day['sleepQuality'])
            
            # Check bedtime
            if 'bedtime' in day and day['bedtime']:
                hour = int(day['bedtime'].split(':')[0])
                if hour < 22:  # Before 10 PM
                    factors['bedtime']['early']['count'] += 1
                    factors['bedtime']['early']['quality'] += day['sleepQuality']
                elif hour >= 23:  # After 11 PM
                    factors['bedtime']['late']['count'] += 1
                    factors['bedtime']['late']['quality'] += day['sleepQuality']
            
            # Extract keywords from notes
            if 'notes' in day and day['notes']:
                factors['notes'].append({
                    'day': day['day'],
                    'quality': day['sleepQuality'],
                    'notes': day['notes']
                })
    
    # Calculate average quality for early/late bedtime
    if factors['bedtime']['early']['count'] > 0:
        factors['bedtime']['early']['quality'] /= factors['bedtime']['early']['count']
    
    if factors['bedtime']['late']['count'] > 0:
        factors['bedtime']['late']['quality'] /= factors['bedtime']['late']['count']
    
    # Find optimal sleep duration
    if durations and qualities:
        # Group by duration rounded to nearest 0.5
        duration_groups = {}
        for i, duration in enumerate(durations):
            rounded = round(duration * 2) / 2  # Round to nearest 0.5
            if rounded not in duration_groups:
                duration_groups[rounded] = {'count': 0, 'quality': 0}
            duration_groups[rounded]['count'] += 1
            duration_groups[rounded]['quality'] += qualities[i]
        
        # Calculate average quality for each duration
        for duration, data in duration_groups.items():
            data['quality'] /= data['count']
        
        # Find duration with highest quality
        optimal_duration = max(duration_groups.items(), key=lambda x: x[1]['quality'])
        factors['duration']['optimal'] = optimal_duration[0]
    
    return factors

def generate_recommendations(sleep_data, settings):
    """Generate personalized sleep recommendations"""
    recommendations = []
    
    # Analyze recent sleep data (last 7 days or all if less)
    recent_data = sorted(sleep_data, key=lambda x: x['day'], reverse=True)[:7]
    
    # Check for sleep debt
    total_sleep = sum(day.get('sleepHours', 0) for day in recent_data)
    ideal_sleep = settings['idealSleepTime'] * len(recent_data)
    sleep_debt = max(0, ideal_sleep - total_sleep)
    
    if sleep_debt > 3:
        recommendations.append({
            'type': 'warning',
            'text': f'睡眠負債が{sleep_debt:.1f}時間あります。数日かけて少しずつ睡眠時間を増やしましょう。'
        })
    
    # Check for irregular sleep schedule
    bedtimes = [day.get('bedtime', '') for day in recent_data if 'bedtime' in day]
    wake_times = [day.get('wakeTime', '') for day in recent_data if 'wakeTime' in day]
    
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
    efficiencies = [day.get('sleepEfficiency', 0) for day in recent_data if 'sleepEfficiency' in day]
    avg_efficiency = sum(efficiencies) / len(efficiencies) if efficiencies else 0
    
    if avg_efficiency < 85:
        recommendations.append({
            'type': 'improvement',
            'text': f'睡眠効率が{avg_efficiency:.1f}%と低めです。ベッドで過ごす時間を睡眠に使う時間に近づけましょう。'
        })
    
    # Add positive reinforcement if doing well
    recent_qualities = [day.get('sleepQuality', 0) for day in recent_data if 'sleepQuality' in day]
    avg_quality = sum(recent_qualities) / len(recent_qualities) if recent_qualities else 0
    
    if avg_quality >= 4:
        recommendations.append({
            'type': 'positive',
            'text': '睡眠の質が高いです！現在の睡眠習慣を維持しましょう。'
        })
    
    return recommendations

@app.route('/api/sleepen', methods=['GET'])
def get_sleepen_data():
    """API endpoint to get Sleepen data"""
    sleepen_manager = SleepenManager(SLEEPEN_DATA_FILE)
    sleepen = sleepen_manager.get_sleepen()
    
    return jsonify({
        'success': True,
        'sleepen': sleepen.to_dict(),
        'recent_adventures': sleepen.adventures[-5:] if sleepen.adventures else []
    })

@app.route('/api/sleepen/name', methods=['POST'])
def set_sleepen_name():
    """API endpoint to set Sleepen name"""
    name = request.form.get('name', 'スリープン')
    
    sleepen_manager = SleepenManager(SLEEPEN_DATA_FILE)
    sleepen = sleepen_manager.get_sleepen()
    sleepen.name = name
    sleepen_manager.update_sleepen(sleepen)
    
    return jsonify({'success': True, 'message': f'スリープンの名前を「{name}」に変更しました！'})

@app.route('/api/sleepen/play', methods=['POST'])
def play_with_sleepen():
    """API endpoint to play with Sleepen"""
    sleepen_manager = SleepenManager(SLEEPEN_DATA_FILE)
    sleepen = sleepen_manager.get_sleepen()
    
    mood = sleepen.play()
    sleepen_manager.update_sleepen(sleepen)
    
    return jsonify({
        'success': True,
        'message': f'{sleepen.name}と遊びました！',
        'mood': mood,
        'energy': sleepen.energy
    })

@app.route('/api/sleepen/rest', methods=['POST'])
def rest_sleepen():
    """API endpoint to let Sleepen rest"""
    sleepen_manager = SleepenManager(SLEEPEN_DATA_FILE)
    sleepen = sleepen_manager.get_sleepen()
    
    energy = sleepen.rest()
    sleepen_manager.update_sleepen(sleepen)
    
    return jsonify({
        'success': True,
        'message': f'{sleepen.name}を休ませました！',
        'energy': energy
    })

@app.route('/api/sleepen/adventure', methods=['POST'])
def manual_adventure():
    """API endpoint to manually send Sleepen on an adventure"""
    sleep_quality = int(request.form.get('quality', 3))
    location = request.form.get('location', None)
    
    sleepen_manager = SleepenManager(SLEEPEN_DATA_FILE)
    sleepen = sleepen_manager.get_sleepen()
    
    # Check if Sleepen has enough energy
    if sleepen.energy < 30:
        return jsonify({
            'success': False,
            'message': f'{sleepen.name}は疲れています。先に休ませてください。'
        })
    
    # Check if location exists in sleepen's discovered locations
    if location and not any(loc["name"] == location for loc in sleepen.dream_locations):
        location = None
    
    adventure = sleepen.go_on_adventure(sleep_quality, location)
    sleepen_manager.update_sleepen(sleepen)
    
    return jsonify({
        'success': True,
        'message': f'{sleepen.name}が冒険に出かけました！',
        'adventure': adventure,
        'level': sleepen.level,
        'exp': sleepen.exp,
        'energy': sleepen.energy,
        'friendship': sleepen.friendship,
        'skills': sleepen.skills
    })

@app.route('/api/sleepen/train', methods=['POST'])
def train_sleepen():
    """API endpoint to train Sleepen's skills"""
    skill_name = request.form.get('skill', None)
    
    sleepen_manager = SleepenManager(SLEEPEN_DATA_FILE)
    sleepen = sleepen_manager.get_sleepen()
    
    # Check if Sleepen has any skills
    if not sleepen.skills:
        return jsonify({
            'success': False,
            'message': f'{sleepen.name}はまだスキルを習得していません。'
        })
    
    # Train the skill
    skill = sleepen.train(skill_name)
    sleepen_manager.update_sleepen(sleepen)
    
    return jsonify({
        'success': True,
        'message': f'{sleepen.name}が「{skill["name"]}」のトレーニングをしました！',
        'skill': skill,
        'energy': sleepen.energy,
        'friendship': sleepen.friendship
    })

@app.route('/api/sleepen/interpret_dream', methods=['POST'])
def interpret_dream():
    """API endpoint to interpret a dream"""
    dream_description = request.form.get('dream', '')
    
    if not dream_description:
        return jsonify({
            'success': False,
            'message': '夢の内容を入力してください。'
        })
    
    sleepen_manager = SleepenManager(SLEEPEN_DATA_FILE)
    sleepen = sleepen_manager.get_sleepen()
    
    # Check if Sleepen has the dream interpretation skill
    has_interpretation_skill = any(skill["name"] == "夢の解読" for skill in sleepen.skills)
    
    if not has_interpretation_skill:
        return jsonify({
            'success': False,
            'message': f'{sleepen.name}はまだ夢を解読するスキルを習得していません。'
        })
    
    # Interpret the dream
    interpretation = sleepen.interpret_dream(dream_description)
    sleepen_manager.update_sleepen(sleepen)
    
    return jsonify({
        'success': True,
        'interpretation': interpretation,
        'sleepen': {
            'friendship': sleepen.friendship,
            'exp': sleepen.exp,
            'level': sleepen.level
        }
    })

if __name__ == '__main__':
    app.run(debug=True)