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

# Enhanced category mapping based on actual contract content analysis
CATEGORY_MAPPINGS = {
    "scheduling": [
        "schedule", "duty", "flight", "assignment", "rotation", "reserve", 
        "standby", "crew", "sequence", "pairing", "trip", "layover",
        "on call", "lineholder", "bid", "bidding", "turnaround", "trip trade",
        "open time", "makeup", "drafted", "deadhead", "deadheading",
        "duty time", "duty period", "flight duty period", "minimum rest",
        "crew rest", "block time", "flight time", "commute"
    ],
    "pay": [
        "pay", "salary", "wage", "compensation", "overtime", "premium", 
        "allowance", "per diem", "expense", "rate", "scale", "premium pay",
        "domestic per diem", "block time", "flight time"
    ],
    "benefits": [
        "benefit", "insurance", "health", "dental", "vision", "retirement", 
        "pension", "vacation", "sick", "leave", "holiday", "401k",
        "sick leave", "sick call", "bereavement", "jury duty", "maternity",
        "paternity"
    ],
    "work_rules": [
        "uniform", "grooming", "conduct", "discipline", "grievance", 
        "safety", "training", "qualification", "performance", "evaluation",
        "seniority", "base", "domicile", "home base", "sub-base",
        "domestic base", "international base", "union", "arbitration",
        "furlough", "recall", "probation", "no show", "crew member",
        "flight attendant", "recurrent"
    ]
}

# Importance level keywords - enhanced based on contract analysis
HIGH_IMPORTANCE_KEYWORDS = [
    "shall", "must", "required", "mandatory", "terminate", "disciplinary",
    "safety", "emergency", "violation", "grievance", "furlough", "recall",
    "seniority", "drafted", "discipline", "arbitration", "minimum rest",
    "crew rest", "no show", "overtime", "premium pay"
]

MEDIUM_IMPORTANCE_KEYWORDS = [
    "may", "should", "encourage", "prefer", "recommend", "guideline",
    "training", "qualification", "bid", "layover", "deadhead", "per diem",
    "vacation", "sick leave", "holiday", "uniform"
]

# Comprehensive glossary terms based on actual contract content
GLOSSARY_TERMS = [
    # Core terms found in contract
    "flight attendant", "crew member", "reserve", "standby", "on call",
    "lineholder", "bid", "seniority", "pairing", "sequence", "trip", "rotation",
    "layover", "turnaround", "assignment", "trip trade", "open time", "makeup",
    "drafted", "base", "domicile", "home base", "sub-base", "domestic base",
    "international base",
    
    # Duty and time terms
    "duty time", "duty period", "flight duty period", "minimum rest", "crew rest",
    "block time", "flight time", "deadhead", "deadheading", "ferry",
    
    # Pay and benefits
    "per diem", "domestic per diem", "overtime", "premium pay", "compensation",
    "sick leave", "sick call", "vacation", "holiday", "bereavement", "jury duty",
    
    # Equipment and operations
    "aircraft", "cabin", "galley", "jumpseat", "cabin jumpseat", "departure",
    "arrival", "gate", "terminal", "boarding", "delay", "maintenance",
    
    # Safety terms
    "safety", "emergency", "evacuation", "safety equipment",
    
    # Flight types
    "domestic flight", "international flight", "domestic flying", "international flying",
    
    # Training and qualifications
    "training", "qualification", "recurrent", "recurrent training",
    
    # Union and labor
    "union", "grievance", "arbitration", "discipline", "furlough", "recall",
    "probation", "no show", "uniform", "commute"
]

# Enhanced sections that affect different groups
AFFECTS_MAPPINGS = {
    "all_flight_attendants": ["general", "safety", "uniform", "training", "compensation"],
    "senior_only": ["seniority", "bid", "bidding", "senior"],
    "reserve_only": ["reserve", "standby", "on call", "availability"],
    "international_only": ["international", "customs", "passport", "international base"]
} 