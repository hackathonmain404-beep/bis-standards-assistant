"""
Hindi Localization Strings & Response Templates — BIS Intelligent Assistant Multilingual Module
Authoritative Hindi templates for clarification, domain refusal, insufficient evidence,
and grounded response synthesis while preserving all technical BIS nomenclature.
Follows docs/ai/AI_PIPELINE.md and docs/ai/PROMPT_INTEGRATION.md.
"""

from __future__ import annotations

from typing import List


class HindiLocalization:
    """Central repository for Hindi user-facing text and regulatory templates."""

    # 1. Clarification Needed Flow
    CLARIFICATION_PREVIEW = (
        "आपके उत्पाद के लिए लागू भारतीय मानक (IS) और प्रमाणन आवश्यकताओं की सटीक जानकारी देने के लिए, "
        "मुझे आपके उत्पाद या उपयोग के बारे में कुछ और विवरण चाहिए।"
    )

    CLARIFICATION_QUESTIONS: List[str] = [
        "आपके उत्पाद का विशिष्ट प्रकार या उपयोग क्या है (जैसे: पैकेज्ड ड्रिंकिंग वॉटर, इलेक्ट्रिक स्टीम आयरन)?",
        "क्या यह उत्पाद घरेलू, वाणिज्यिक या औद्योगिक उपयोग के लिए है?",
    ]

    CLARIFICATION_FOLLOW_UPS: List[str] = [
        "मैं घरेलू बिजली के उपकरण बनाता हूँ",
        "मैं पैकेज्ड ड्रिंकिंग वॉटर का उत्पादन करता हूँ",
        "BIS की अनिवार्य प्रमाणन योजनाएं (Scheme-I) क्या हैं?",
    ]

    # 2. Out-of-Scope Domain Refusal
    OUT_OF_SCOPE_PREVIEW = (
        "मैं BIS इंटेलिजेंट असिस्टेंट हूँ, जो भारतीय मानकों (IS), उत्पाद प्रमाणन (ISI Mark), "
        "परीक्षण प्रक्रियाओं, हॉलमार्किंग और Quality Control Orders (QCOs) में विशेषज्ञता रखता हूँ। "
        "मैं भारतीय मानक ब्यूरो (BIS) के अधिकार क्षेत्र से बाहर के प्रश्नों में सहायता नहीं कर सकता।"
    )

    OUT_OF_SCOPE_FOLLOW_UPS: List[str] = [
        "बिजली के उपकरणों पर कौन से भारतीय मानक लागू होते हैं?",
        "BIS ISI Mark प्रमाणन प्रक्रिया कैसे काम करती है?",
        "Quality Control Orders (QCOs) के तहत कौन से उत्पाद अनिवार्य हैं?",
    ]

    # 3. Insufficient Evidence Fallback
    INSUFFICIENT_EVIDENCE_MESSAGE = (
        "मुझे ज्ञानकोष में इस विषय पर कोई सत्यापित BIS (Bureau of Indian Standards) जानकारी नहीं मिली। "
        "कृपया अपने प्रश्न के विवरण की जांच करें अथवा आधिकारिक BIS पोर्टल manakonline.in पर जाएं।"
    )

    INSUFFICIENT_EVIDENCE_FOLLOW_UPS: List[str] = [
        "पैकेज्ड ड्रिंकिंग वॉटर के लिए कौन सा मानक लागू होता है (IS 14543)?",
        "इलेक्ट्रिक आयरन के लिए कौन सा मानक लागू होता है (IS 302-2-3)?",
        "आधिकारिक BIS Product Manuals कहाँ मिल सकते हैं?",
    ]

    # 4. Follow-up Suggestions for Grounded Responses
    DEFAULT_GROUNDED_FOLLOW_UPS: List[str] = [
        "इस मानक के तहत आवश्यक प्रमुख प्रयोगशाला परीक्षण क्या हैं?",
        "क्या इस उत्पाद के लिए BIS प्रमाणन (ISI Mark) अनिवार्य है?",
        "Scheme-I के तहत आवेदन करने की प्रक्रिया क्या है?",
    ]
