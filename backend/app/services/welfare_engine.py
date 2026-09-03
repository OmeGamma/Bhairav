"""
BHAIRAV Welfare Analytics Engine.

Real, deterministic analysis of welfare check-ins using:
  * Mood self-rating (GOOD/FAIR/POOR/CRISIS)
  * Keyword-based distress scoring on notes
  * Frequency / recency / trend analysis from MongoDB check-in history
  * Simple rules to recommend status (NORMAL/ATTENTION/SUPPORT/URGENT)

This is NOT an ML model. The 'trend' is a real diff over the last N
check-ins pulled from the database.
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from collections import Counter

from motor.motor_asyncio import AsyncIOMotorDatabase


DISTRESS_KEYWORDS = [
    "tired", "exhausted", "stressed", "overwhelmed", "anxious", "anxiety",
    "depressed", "hopeless", "lonely", "isolated", "burnt out", "burnout",
    "sleepless", "insomnia", "panic", "scared", "afraid", "angry", "frustrated",
    "no energy", "no motivation", "can't cope", "breaking down", "cry", "crying",
    "help", "stuck", "pressure", "deadline", "too much", "exhausted", "drained",
    "sick", "pain", "headache", "chest pain", "panic",
]
CRISIS_KEYWORDS = [
    "suicide", "suicidal", "self-harm", "self harm", "kill myself", "end it all",
    "end my life", "die", "no point", "give up", "hopeless", "worthless",
    "harm myself", "hurt myself",
]

MOOD_RANK = {"GOOD": 0, "FAIR": 1, "POOR": 2, "CRISIS": 3}


def _score_text(text: str) -> Dict[str, int]:
    """Return keyword counts."""
    if not text:
        return {"distress": 0, "crisis": 0}
    t = text.lower()
    distress = sum(1 for kw in DISTRESS_KEYWORDS if kw in t)
    crisis = sum(1 for kw in CRISIS_KEYWORDS if kw in t)
    return {"distress": distress, "crisis": crisis}


def _classify(mood: str, distress: int, crisis: int, recent_moods: List[str]) -> str:
    if crisis > 0 or mood.upper() == "CRISIS":
        return "URGENT HUMAN REVIEW"
    if mood.upper() == "POOR" or distress >= 3:
        return "SUPPORT RECOMMENDED"
    if mood.upper() == "FAIR" or distress >= 1 or (recent_moods and recent_moods[-1] in ("POOR", "CRISIS")):
        return "ATTENTION"
    return "NORMAL"


def _trend(recent_moods: List[str]) -> str:
    if len(recent_moods) < 2:
        return "insufficient_data"
    ranks = [MOOD_RANK.get(m.upper(), 0) for m in recent_moods[-5:]]
    if len(ranks) >= 2 and ranks[-1] > ranks[0]:
        return "worsening"
    if len(ranks) >= 2 and ranks[-1] < ranks[0]:
        return "improving"
    return "stable"


async def analyze(
    db: AsyncIOMotorDatabase,
    personnel_id: str,
    mood: str,
    notes: str,
) -> Dict[str, Any]:
    """
    Run welfare analysis. Pulls last 10 check-ins from MongoDB to compute trend.
    """
    notes = notes or ""
    keywords = _score_text(notes)

    recent_cursor = (
        db.welfare_check_ins.find({"personnel_id": personnel_id})
        .sort("timestamp", -1)
        .limit(10)
    )
    recent: List[Dict[str, Any]] = []
    async for d in recent_cursor:
        recent.append(d)
    recent_moods = [d.get("mood", "GOOD") for d in recent]

    status = _classify(mood, keywords["distress"], keywords["crisis"], recent_moods)
    trend = _trend(recent_moods + [mood])

    indicators: List[Dict[str, Any]] = [
        {
            "metric": "mood_self_rating",
            "value": mood.upper(),
            "rank": MOOD_RANK.get(mood.upper(), 0),
        },
        {
            "metric": "distress_keyword_count",
            "value": keywords["distress"],
        },
        {
            "metric": "crisis_keyword_count",
            "value": keywords["crisis"],
        },
        {
            "metric": "check_in_trend",
            "value": trend,
            "history_size": len(recent_moods) + 1,
        },
    ]

    recommendations: List[str] = []
    if status == "URGENT HUMAN REVIEW":
        recommendations.append("Connect with welfare officer within 24h.")
        recommendations.append("Confidential one-on-one session required.")
    elif status == "SUPPORT RECOMMENDED":
        recommendations.append("Schedule welfare check-in this week.")
        recommendations.append("Consider workload review with supervisor.")
    elif status == "ATTENTION":
        recommendations.append("Monitor next 2-3 check-ins.")
    else:
        recommendations.append("Continue routine check-ins.")

    return {
        "personnel_id": personnel_id,
        "status": status,
        "indicators": indicators,
        "recommendations": recommendations,
        "summary": {
            "mood": mood.upper(),
            "distress_score": keywords["distress"],
            "crisis_score": keywords["crisis"],
            "trend": trend,
            "check_ins_analysed": len(recent_moods) + 1,
        },
        "model_info": {
            "engine": "BHAIRAV Welfare Engine (rule-based + MongoDB history)",
            "method": "keyword_scoring_plus_trend",
            "version": "1.0",
            "processing_mode": "rule_based",
            "distress_keywords_count": len(DISTRESS_KEYWORDS),
            "crisis_keywords_count": len(CRISIS_KEYWORDS),
            "notes": "Heuristic, not a clinical model. Use as a triage signal, not a diagnosis.",
        },
    }
