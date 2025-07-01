"""Content service for tips and challenges."""
from typing import Dict
from config.settings import SLEEP_TIPS, SLEEP_CHALLENGES


class ContentService:
    """Service for managing sleep tips and challenges."""
    
    @staticmethod
    def get_daily_tip_and_challenge(current_day: int) -> Dict[str, Dict[str, str]]:
        """Get daily tip and challenge based on current day."""
        tip_index = (current_day - 1) % len(SLEEP_TIPS)
        challenge_index = (current_day - 1) % len(SLEEP_CHALLENGES)
        
        return {
            'tip': SLEEP_TIPS[tip_index],
            'challenge': SLEEP_CHALLENGES[challenge_index]
        }