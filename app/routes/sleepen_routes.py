"""Sleepen API routes."""
from flask import Blueprint, request, jsonify
from sleepen import SleepenManager
from config.settings import SLEEPEN_DATA_FILE

sleepen_bp = Blueprint('sleepen', __name__, url_prefix='/api/sleepen')


@sleepen_bp.route('/', methods=['GET'])
def get_sleepen_data():
    """API endpoint to get Sleepen data."""
    sleepen_manager = SleepenManager(SLEEPEN_DATA_FILE)
    sleepen = sleepen_manager.get_sleepen()
    
    return jsonify({
        'success': True,
        'sleepen': sleepen.to_dict(),
        'recent_adventures': sleepen.adventures[-5:] if sleepen.adventures else []
    })


@sleepen_bp.route('/name', methods=['POST'])
def set_sleepen_name():
    """API endpoint to set Sleepen name."""
    name = request.form.get('name', 'スリープン')
    
    sleepen_manager = SleepenManager(SLEEPEN_DATA_FILE)
    sleepen = sleepen_manager.get_sleepen()
    sleepen.name = name
    sleepen_manager.update_sleepen(sleepen)
    
    return jsonify({'success': True, 'message': f'スリープンの名前を「{name}」に変更しました！'})


@sleepen_bp.route('/play', methods=['POST'])
def play_with_sleepen():
    """API endpoint to play with Sleepen."""
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


@sleepen_bp.route('/rest', methods=['POST'])
def rest_sleepen():
    """API endpoint to let Sleepen rest."""
    sleepen_manager = SleepenManager(SLEEPEN_DATA_FILE)
    sleepen = sleepen_manager.get_sleepen()
    
    energy = sleepen.rest()
    sleepen_manager.update_sleepen(sleepen)
    
    return jsonify({
        'success': True,
        'message': f'{sleepen.name}を休ませました！',
        'energy': energy
    })


@sleepen_bp.route('/adventure', methods=['POST'])
def manual_adventure():
    """API endpoint to manually send Sleepen on an adventure."""
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


@sleepen_bp.route('/train', methods=['POST'])
def train_sleepen():
    """API endpoint to train Sleepen's skills."""
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


@sleepen_bp.route('/interpret_dream', methods=['POST'])
def interpret_dream():
    """API endpoint to interpret a dream."""
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