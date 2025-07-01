"""Sleep data API routes."""
import datetime
from flask import Blueprint, request, jsonify
from app.services.data_service import DataService
from app.models.sleep_data import SleepData
from sleepen import SleepenManager
from config.settings import SLEEPEN_DATA_FILE

sleep_bp = Blueprint('sleep', __name__, url_prefix='/api')


@sleep_bp.route('/save_sleep_data', methods=['POST'])
def save_sleep_data():
    """API endpoint to save sleep data."""
    data_service = DataService()
    data = data_service.load_data()
    form_data = request.form
    
    # Get selected date from form
    selected_date = form_data.get('selected_date')
    if not selected_date:
        selected_date = datetime.datetime.now().strftime('%Y-%m-%d')
    
    # Create sleep data object
    sleep_data = SleepData(
        day=data['currentDay'],
        date=selected_date + 'T00:00:00',
        bed_in_time=form_data.get('bed_in_time'),
        bed_out_time=form_data.get('bed_out_time'),
        bedtime=form_data.get('bedtime'),
        wake_time=form_data.get('wake_time'),
        sleep_quality=int(form_data.get('sleep_quality', 0)),
        notes=form_data.get('notes', ''),
        challenge_completed=form_data.get('challenge_completed') == 'on'
    )
    
    # Add reflection data if provided
    if 'morning_feeling' in form_data:
        sleep_data.reflection = {
            'morningFeeling': int(form_data.get('morning_feeling', 0)),
            'workedWell': form_data.get('worked_well', ''),
            'improve': form_data.get('improve', ''),
            'nextGoal': form_data.get('next_goal', '')
        }
    
    # Update data collection
    sleep_collection = data_service.get_sleep_data_collection(data)
    sleep_collection.add_or_update(sleep_data)
    data['sleepData'] = sleep_collection.to_dict_list()
    
    data_service.save_data(data)
    
    # Update Sleepen based on sleep data
    sleepen_manager = SleepenManager(SLEEPEN_DATA_FILE)
    sleepen = sleepen_manager.process_sleep_data(sleep_data.to_dict())
    
    return jsonify({
        'success': True,
        'message': '睡眠データが保存されました！',
        'sleepen': {
            'level': sleepen.level,
            'exp': sleepen.exp,
            'adventure': sleepen.adventures[-1] if sleepen.adventures else None
        }
    })


@sleep_bp.route('/save_reflection', methods=['POST'])
def save_reflection():
    """API endpoint to save sleep reflection data."""
    data_service = DataService()
    data = data_service.load_data()
    form_data = request.form
    
    current_day = data['currentDay']
    
    # Find existing data or create new
    sleep_collection = data_service.get_sleep_data_collection(data)
    existing_data = sleep_collection.find_by_day(current_day)
    
    reflection_data = {
        'morningFeeling': int(form_data.get('morning_feeling', 0)),
        'workedWell': form_data.get('worked_well', ''),
        'improve': form_data.get('improve', ''),
        'nextGoal': form_data.get('next_goal', '')
    }
    
    if existing_data:
        existing_data.reflection = reflection_data
        sleep_collection.add_or_update(existing_data)
    else:
        # Create new data with reflection only
        sleep_data = SleepData(
            day=current_day,
            date=datetime.datetime.now().isoformat(),
            reflection=reflection_data
        )
        sleep_collection.add_or_update(sleep_data)
    
    data['sleepData'] = sleep_collection.to_dict_list()
    data_service.save_data(data)
    
    return jsonify({'success': True, 'message': '睡眠の振り返りが保存されました！'})


@sleep_bp.route('/save_goals', methods=['POST'])
def save_goals():
    """API endpoint to save sleep goals."""
    data_service = DataService()
    data = data_service.load_data()
    form_data = request.form
    
    data['settings']['sleepGoals'] = {
        'duration': float(form_data.get('duration', 8)),
        'bedtime': form_data.get('bedtime', '23:00'),
        'wakeTime': form_data.get('wake_time', '07:00')
    }
    
    data_service.save_data(data)
    
    return jsonify({'success': True, 'message': '睡眠目標が保存されました！'})


@sleep_bp.route('/save_settings', methods=['POST'])
def save_settings():
    """API endpoint to save settings."""
    data_service = DataService()
    data = data_service.load_data()
    form_data = request.form
    
    data['settings']['idealSleepTime'] = float(form_data.get('ideal_sleep_time', 8))
    data['settings']['bedtimeReminder'] = form_data.get('bedtime_reminder', '22:00')
    
    # Handle start date setting
    start_date = form_data.get('start_date')
    if start_date:
        data['settings']['startDate'] = start_date
        # Recalculate current day based on start date
        data['currentDay'] = data_service.calculate_current_day(start_date)
    
    data_service.save_data(data)
    
    return jsonify({'success': True, 'message': '設定が保存されました。'})


@sleep_bp.route('/view_day/<int:day>', methods=['GET'])
def view_day(day):
    """API endpoint to view data for a specific day."""
    data_service = DataService()
    data = data_service.load_data()
    
    sleep_collection = data_service.get_sleep_data_collection(data)
    day_data = sleep_collection.find_by_day(day)
    
    if day_data:
        return jsonify({'success': True, 'data': day_data.to_dict()})
    else:
        return jsonify({'success': False, 'message': f'Day {day} のデータはまだ記録されていません。'})


@sleep_bp.route('/view_date/<date_str>', methods=['GET'])
def view_date(date_str):
    """API endpoint to view data for a specific date."""
    data_service = DataService()
    data = data_service.load_data()
    
    sleep_collection = data_service.get_sleep_data_collection(data)
    day_data = sleep_collection.find_by_date(date_str)
    
    if day_data:
        return jsonify({'success': True, 'data': day_data.to_dict()})
    else:
        return jsonify({'success': False, 'message': f'{date_str} のデータはまだ記録されていません。'})


@sleep_bp.route('/advance_day', methods=['POST'])
def advance_day():
    """API endpoint to advance to the next day."""
    data_service = DataService()
    data = data_service.advance_day()
    
    # Rest Sleepen when advancing to next day
    sleepen_manager = SleepenManager(SLEEPEN_DATA_FILE)
    sleepen = sleepen_manager.get_sleepen()
    sleepen.rest()
    sleepen_manager.update_sleepen(sleepen)
    
    return jsonify({'success': True, 'message': f'Day {data["currentDay"]}に進みました。'})


@sleep_bp.route('/reset_program', methods=['POST'])
def reset_program():
    """API endpoint to reset the program."""
    data_service = DataService()
    data_service.reset_program()
    
    return jsonify({'success': True, 'message': 'プログラムがリセットされました。Day 1から再開します。'})


@sleep_bp.route('/sync', methods=['POST'])
def sync_data():
    """API endpoint to synchronize offline data with server data."""
    try:
        offline_data = request.json
        
        if not offline_data:
            return jsonify({'success': False, 'message': 'No data provided'})
        
        data_service = DataService()
        merged_data = data_service.merge_offline_data(offline_data)
        
        return jsonify({
            'success': True,
            'message': 'データが同期されました。',
            'data': merged_data
        })
    except Exception as e:
        return jsonify({'success': False, 'message': f'同期エラー: {str(e)}'})


@sleep_bp.route('/analyze', methods=['GET'])
def analyze_sleep_patterns():
    """API endpoint to get advanced sleep pattern analysis."""
    try:
        data_service = DataService()
        data = data_service.load_data()
        
        sleep_collection = data_service.get_sleep_data_collection(data)
        
        if not sleep_collection.data:
            return jsonify({'success': False, 'message': 'データがありません。'})
        
        from app.services.sleep_analytics import SleepAnalytics
        analytics = SleepAnalytics(sleep_collection, data['settings'])
        
        # Advanced analytics
        analysis = {
            'weekdayVsWeekend': analytics.analyze_weekday_vs_weekend(),
            'recommendations': analytics.generate_recommendations()
        }
        
        return jsonify({'success': True, 'analysis': analysis})
    except Exception as e:
        return jsonify({'success': False, 'message': f'分析エラー: {str(e)}'})