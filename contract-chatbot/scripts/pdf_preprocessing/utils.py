"""
Utility functions for PDF preprocessing pipeline
"""
import re
import hashlib
import json
from typing import Any, Dict, List


def clean_text(text: str) -> str:
    """Clean and normalize extracted text"""
    if not text:
        return ""
    
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove non-printable characters except newlines and tabs
    text = re.sub(r'[^\x20-\x7E\n\t]', '', text)
    
    # Normalize quotes
    text = text.replace('"', '"').replace('"', '"')
    text = text.replace(''', "'").replace(''', "'")
    
    return text.strip()


def generate_section_id(content: str, doc_id: str, section_index: int) -> str:
    """Generate a unique ID for a section"""
    # Create a hash of the content for uniqueness
    content_hash = hashlib.md5(content.encode()).hexdigest()[:8]
    return f"{doc_id}_section_{section_index:03d}_{content_hash}"


def is_heading(text: str, font_size: float, heading_threshold: float) -> bool:
    """Determine if text block is a heading based on content and font size"""
    from config import HEADING_PATTERNS
    
    # Check font size
    if font_size >= heading_threshold:
        return True
    
    # Check for heading patterns
    for pattern in HEADING_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    
    return False


def categorize_section(content: str) -> str:
    """Categorize a section based on its content"""
    from config import CATEGORY_MAPPINGS
    
    content_lower = content.lower()
    category_scores = {}
    
    for category, keywords in CATEGORY_MAPPINGS.items():
        score = sum(1 for keyword in keywords if keyword in content_lower)
        if score > 0:
            category_scores[category] = score
    
    # Return category with highest score, default to 'general'
    if category_scores:
        return max(category_scores, key=category_scores.get)
    return "general"


def determine_importance(content: str) -> str:
    """Determine importance level of a section"""
    from config import HIGH_IMPORTANCE_KEYWORDS, MEDIUM_IMPORTANCE_KEYWORDS
    
    content_lower = content.lower()
    
    # Check for high importance keywords
    for keyword in HIGH_IMPORTANCE_KEYWORDS:
        if keyword in content_lower:
            return "high"
    
    # Check for medium importance keywords
    for keyword in MEDIUM_IMPORTANCE_KEYWORDS:
        if keyword in content_lower:
            return "medium"
    
    return "low"


def find_glossary_terms(content: str) -> List[str]:
    """Find glossary terms in content"""
    from config import GLOSSARY_TERMS
    
    content_lower = content.lower()
    found_terms = []
    
    for term in GLOSSARY_TERMS:
        if term.lower() in content_lower:
            found_terms.append(term)
    
    return found_terms


def determine_affects(content: str, category: str) -> List[str]:
    """Determine which groups this section affects"""
    from config import AFFECTS_MAPPINGS
    
    content_lower = content.lower()
    affects = ["all_flight_attendants"]  # Default
    
    for group, keywords in AFFECTS_MAPPINGS.items():
        if group == "all_flight_attendants":
            continue
        
        for keyword in keywords:
            if keyword in content_lower or keyword in category:
                if group not in affects:
                    affects.append(group)
                break
    
    return affects


def validate_processed_document(doc_data: Dict[str, Any]) -> List[str]:
    """Validate processed document structure and return any errors"""
    errors = []
    
    # Check required fields
    required_fields = ["id", "title", "sections"]
    for field in required_fields:
        if field not in doc_data:
            errors.append(f"Missing required field: {field}")
    
    # Validate sections
    if "sections" in doc_data:
        for i, section in enumerate(doc_data["sections"]):
            section_errors = validate_section(section, i)
            errors.extend(section_errors)
    
    return errors


def validate_section(section: Dict[str, Any], index: int) -> List[str]:
    """Validate a single section and return any errors"""
    errors = []
    
    # Check required fields
    required_fields = ["id", "type", "content"]
    for field in required_fields:
        if field not in section:
            errors.append(f"Section {index}: Missing required field: {field}")
    
    # Validate section type
    valid_types = ["heading", "paragraph", "table", "list"]
    if "type" in section and section["type"] not in valid_types:
        errors.append(f"Section {index}: Invalid type: {section['type']}")
    
    # Validate metadata structure
    if "metadata" in section:
        metadata = section["metadata"]
        if not isinstance(metadata, dict):
            errors.append(f"Section {index}: metadata must be a dictionary")
        else:
            # Check category
            valid_categories = ["scheduling", "pay", "benefits", "work_rules", "general"]
            if "category" in metadata and metadata["category"] not in valid_categories:
                errors.append(f"Section {index}: Invalid category: {metadata['category']}")
            
            # Check importance
            valid_importance = ["high", "medium", "low"]
            if "importance" in metadata and metadata["importance"] not in valid_importance:
                errors.append(f"Section {index}: Invalid importance: {metadata['importance']}")
    
    return errors


def save_json(data: Dict[str, Any], filepath: str) -> None:
    """Save data to JSON file with proper formatting"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def load_json(filepath: str) -> Dict[str, Any]:
    """Load data from JSON file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f) 