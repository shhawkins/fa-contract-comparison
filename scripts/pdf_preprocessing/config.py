"""
Configuration for PDF preprocessing pipeline
"""
import os

# Paths
INPUT_PDF_DIR = "scripts/input_pdfs"
OUTPUT_JSON_DIR = "public/documents"

# Document mappings
DOCUMENT_MAPPINGS = {
    "current-contract.pdf": "contractA.json",
    "proposed-contract.pdf": "contractB.json"
}

# Section identification rules based on font properties and keywords
HEADING_PATTERNS = [
    r"ARTICLE\s+\d+",
    r"SECTION\s+\d+",
    r"APPENDIX\s+[A-Z]",
    r"CHAPTER\s+\d+",
]

# Font size thresholds for identifying headings
HEADING_FONT_SIZE_THRESHOLD = 12.0
SUBHEADING_FONT_SIZE_THRESHOLD = 10.5

# Category mapping based on section titles and keywords
CATEGORY_MAPPINGS = {
    "scheduling": [
        "schedule", "duty", "flight", "assignment", "rotation", "reserve", 
        "standby", "crew", "sequence", "pairing", "trip", "layover"
    ],
    "pay": [
        "pay", "salary", "wage", "compensation", "overtime", "premium", 
        "allowance", "per diem", "expense", "rate", "scale"
    ],
    "benefits": [
        "benefit", "insurance", "health", "dental", "vision", "retirement", 
        "pension", "vacation", "sick", "leave", "holiday", "401k"
    ],
    "work_rules": [
        "uniform", "grooming", "conduct", "discipline", "grievance", 
        "safety", "training", "qualification", "performance", "evaluation"
    ]
}

# Importance level keywords
HIGH_IMPORTANCE_KEYWORDS = [
    "shall", "must", "required", "mandatory", "terminate", "disciplinary",
    "safety", "emergency", "violation", "grievance"
]

MEDIUM_IMPORTANCE_KEYWORDS = [
    "may", "should", "encourage", "prefer", "recommend", "guideline"
]

# Known glossary terms for automatic linking
GLOSSARY_TERMS = [
    "per diem", "deadhead", "layover", "turnaround", "crew rest", 
    "minimum rest", "duty period", "flight duty period", "reserve", 
    "standby", "on call", "base", "domicile", "bid", "seniority",
    "trip trade", "open time", "makeup", "sick call", "no show"
]

# Sections that affect different groups
AFFECTS_MAPPINGS = {
    "all_flight_attendants": ["general", "safety", "uniform"],
    "senior_only": ["seniority", "bid"],
    "reserve_only": ["reserve", "standby", "on call"],
    "international_only": ["international", "customs", "passport"]
} 