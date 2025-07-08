"""Refactored Flask application for sleep tracking program."""
import datetime
import json
import logging
from flask import Flask, render_template, send_from_directory

# Import services and routes
from app.services.data_service import DataService
from app.services.sleep_analytics import SleepAnalytics
from app.services.content_service import ContentService
from app.routes.sleep_routes import sleep_bp
from app.routes.sleepen_routes import sleepen_bp
from sleepen import SleepenManager
from config.settings import SLEEPEN_DATA_FILE

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

# Register blueprints
app.register_blueprint(sleep_bp)
app.register_blueprint(sleepen_bp)


@app.route('/manifest.json')
def manifest():
    return send_from_directory('.', 'manifest.json')


@app.route('/service-worker.js')
def service_worker():
    return send_from_directory('.', 'service-worker.js')


@app.route('/favicon.ico')
def favicon():
    return send_from_directory('.', 'favicon.ico')


@app.route('/')
def index():
    """Main page route."""
    data_service = DataService()
    data = data_service.load_data()
    
    sleep_data_raw = data['sleepData']
    settings = data_service.initialize_settings(data['settings'])
    
    # Always recalculate current day based on start date
    calculated_day = data_service.calculate_current_day(settings['startDate'])
    if calculated_day != data['currentDay']:
        data['currentDay'] = calculated_day
        data['settings'] = settings
        data_service.save_data(data)
    
    current_day = data['currentDay']
    
    # Get sleep data collection
    sleep_collection = data_service.get_sleep_data_collection(data)
    
    # Get today's data if exists
    today = datetime.datetime.now()
    today_iso_date = today.strftime('%Y-%m-%d')
    today_data = sleep_collection.find_by_date(today_iso_date)
    
    # If no data for today, check by day number
    if not today_data:
        today_data = sleep_collection.find_by_day(current_day)
    
    # Calculate stats using analytics service
    analytics = SleepAnalytics(sleep_collection, settings)
    stats = analytics.calculate_stats()
    
    # Calculate goals progress
    goals_progress = analytics.calculate_goals_progress(settings['sleepGoals'])
    
    # Get daily tip and challenge
    daily_content = ContentService.get_daily_tip_and_challenge(current_day)
    
    # Get chart data
    chart_data = analytics.get_chart_data()
    
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
    sleep_data_dates = sleep_collection.get_all_dates()
    
    return render_template('index_tabbed.html',
                           current_day=current_day,
                           progress_percentage=progress_percentage,
                           current_date=current_date,
                           today_iso_date=today_iso_date,
                           stats=stats,
                           goals=settings['sleepGoals'],
                           goals_progress=goals_progress,
                           today_data=today_data.to_dict() if today_data else None,
                           daily_tip=daily_content['tip'],
                           daily_challenge=daily_content['challenge'],
                           settings=settings,
                           chart_data=json.dumps(chart_data),
                           sleep_data=sleep_data_raw,
                           sleep_data_dates=json.dumps(sleep_data_dates),
                           optimal_sleep_time=stats.get('optimalSleepTime', '8.0時間'),
                           optimal_bedtime=stats.get('optimalBedtime', '23:00'),
                           optimal_wake_time=stats.get('optimalWakeTime', '07:00'),
                           sleepen=sleepen,
                           sleepen_exp_percentage=sleepen_exp_percentage,
                           recent_adventures=recent_adventures)


if __name__ == '__main__':
    app.run(debug=True, port=5001)