"""
Multilingual Hindi & Technical Term Preservation Subsystem — BIS Intelligent Assistant
"""

from ai.src.multilingual.detector import LanguageDetector
from ai.src.multilingual.preserver import TermPreserver
from ai.src.multilingual.translator import QueryTranslator
from ai.src.multilingual.localization import HindiLocalization

__all__ = [
    "LanguageDetector",
    "TermPreserver",
    "QueryTranslator",
    "HindiLocalization",
]
