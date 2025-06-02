"""
Enrichment module for adding domain-specific metadata to contract sections
"""
import logging
from typing import Dict, Any, List
from utils import (
    categorize_section, determine_importance, 
    find_glossary_terms, determine_affects
)

logger = logging.getLogger(__name__)


class DocumentEnricher:
    """Adds aviation and flight attendant specific metadata to document sections"""
    
    def __init__(self):
        pass
    
    def enrich_document(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enrich document sections with domain-specific metadata
        
        Args:
            document: Structured document from structure.py
            
        Returns:
            Enhanced document with enriched metadata
        """
        if "sections" not in document:
            logger.warning(f"Document {document.get('id', 'unknown')} has no sections to enrich")
            return document
        
        enriched_sections = []
        
        for section in document["sections"]:
            enriched_section = self._enrich_section(section)
            enriched_sections.append(enriched_section)
        
        # Update document with enriched sections
        enriched_document = document.copy()
        enriched_document["sections"] = enriched_sections
        
        logger.info(f"Enriched {len(enriched_sections)} sections for document {document.get('id', 'unknown')}")
        return enriched_document
    
    def _enrich_section(self, section: Dict[str, Any]) -> Dict[str, Any]:
        """Enrich a single section with metadata"""
        content = section.get("content", "")
        section_type = section.get("type", "paragraph")
        
        # Create enriched section copy
        enriched_section = section.copy()
        
        # Ensure metadata exists
        if "metadata" not in enriched_section:
            enriched_section["metadata"] = {}
        
        metadata = enriched_section["metadata"]
        
        # Categorize section based on content
        category = categorize_section(content)
        metadata["category"] = category
        
        # Determine importance level
        importance = determine_importance(content)
        metadata["importance"] = importance
        
        # Find glossary terms
        glossary_terms = find_glossary_terms(content)
        metadata["glossaryTerms"] = glossary_terms
        
        # Determine affected groups
        affects = determine_affects(content, category)
        metadata["affects"] = affects
        
        # Add section-specific enhancements
        self._add_section_specific_metadata(enriched_section, content, section_type)
        
        return enriched_section
    
    def _add_section_specific_metadata(self, section: Dict[str, Any], 
                                     content: str, section_type: str) -> None:
        """Add section-type specific metadata"""
        metadata = section["metadata"]
        
        # Add keywords for better searchability
        keywords = self._extract_keywords(content)
        metadata["keywords"] = keywords
        
        # Add cross-references if this section references other parts
        cross_refs = self._find_cross_references(content)
        if cross_refs:
            metadata["crossReferences"] = cross_refs
        
        # For headings, mark as navigation landmarks
        if section_type == "heading":
            metadata["isNavigationLandmark"] = True
            metadata["headingLevel"] = self._determine_heading_level(content)
        
        # For lists and tables, add structural information
        if section_type == "list":
            metadata["listType"] = self._determine_list_type(content)
        elif section_type == "table":
            metadata["hasTabularData"] = True
        
        # Identify time-sensitive information
        if self._contains_deadlines_or_dates(content):
            metadata["containsDeadlines"] = True
        
        # Identify monetary information
        if self._contains_monetary_info(content):
            metadata["containsMonetaryInfo"] = True
    
    def _extract_keywords(self, content: str) -> List[str]:
        """Extract relevant keywords from content for search enhancement"""
        import re
        
        # Convert to lowercase for processing
        content_lower = content.lower()
        
        # Industry-specific keywords to look for
        aviation_keywords = [
            "flight", "aircraft", "passenger", "crew", "captain", "pilot",
            "departure", "arrival", "gate", "terminal", "boarding", "safety",
            "emergency", "evacuation", "turbulence", "weather", "delay",
            "maintenance", "inspection", "training", "recertification"
        ]
        
        labor_keywords = [
            "union", "grievance", "arbitration", "discipline", "termination",
            "seniority", "probation", "evaluation", "performance", "review",
            "contract", "agreement", "negotiation", "ratification", "vote"
        ]
        
        schedule_keywords = [
            "schedule", "roster", "assignment", "bid", "award", "trade",
            "pickup", "drop", "swap", "rotation", "sequence", "pairing",
            "minimum", "maximum", "consecutive", "days off", "weekend"
        ]
        
        all_keywords = aviation_keywords + labor_keywords + schedule_keywords
        found_keywords = []
        
        for keyword in all_keywords:
            if keyword in content_lower:
                found_keywords.append(keyword)
        
        # Also look for capitalized terms that might be important
        caps_pattern = r'\b[A-Z]{2,}\b'  # All caps words
        caps_matches = re.findall(caps_pattern, content)
        found_keywords.extend(caps_matches)
        
        # Remove duplicates and return
        return list(set(found_keywords))
    
    def _find_cross_references(self, content: str) -> List[str]:
        """Find references to other sections or documents"""
        import re
        
        cross_refs = []
        
        # Look for section references
        section_patterns = [
            r'(?:section|article|paragraph|appendix)\s+([A-Z0-9]+(?:\.[A-Z0-9]+)*)',
            r'(?:see|refer to|pursuant to)\s+(?:section|article|paragraph)\s+([A-Z0-9]+(?:\.[A-Z0-9]+)*)',
            r'\b([A-Z0-9]+(?:\.[A-Z0-9]+){1,3})\b'  # Pattern like 12.3.4
        ]
        
        for pattern in section_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            cross_refs.extend(matches)
        
        # Remove duplicates
        return list(set(cross_refs))
    
    def _determine_heading_level(self, content: str) -> int:
        """Determine heading level based on content"""
        import re
        
        # Article level (highest)
        if re.search(r'^\s*ARTICLE\s+\d+', content, re.IGNORECASE):
            return 1
        
        # Section level
        if re.search(r'^\s*SECTION\s+\d+', content, re.IGNORECASE):
            return 2
        
        # Subsection level
        if re.search(r'^\s*\d+\.\d+', content):
            return 3
        
        # Default heading level
        return 2
    
    def _determine_list_type(self, content: str) -> str:
        """Determine the type of list"""
        import re
        
        if re.search(r'^\s*\d+\.', content, re.MULTILINE):
            return "numbered"
        elif re.search(r'^\s*[a-zA-Z]\.', content, re.MULTILINE):
            return "lettered"
        elif re.search(r'^\s*[•\-\*]', content, re.MULTILINE):
            return "bulleted"
        else:
            return "unformatted"
    
    def _contains_deadlines_or_dates(self, content: str) -> bool:
        """Check if content contains deadline or date information"""
        import re
        
        date_patterns = [
            r'\b\d{1,2}/\d{1,2}/\d{2,4}\b',  # MM/DD/YYYY
            r'\b\d{1,2}-\d{1,2}-\d{2,4}\b',  # MM-DD-YYYY
            r'\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{2,4}\b',
            r'\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\.?\s+\d{1,2},?\s+\d{2,4}\b',
            r'\b\d{1,2}\s+(?:days?|weeks?|months?|years?)\b',
            r'\bwithin\s+\d+\s+(?:days?|weeks?|months?|years?)\b',
            r'\b(?:deadline|due date|expiration|expires|effective)\b'
        ]
        
        content_lower = content.lower()
        
        for pattern in date_patterns:
            if re.search(pattern, content_lower):
                return True
        
        return False
    
    def _contains_monetary_info(self, content: str) -> bool:
        """Check if content contains monetary or compensation information"""
        import re
        
        money_patterns = [
            r'\$\d+(?:,\d{3})*(?:\.\d{2})?',  # Dollar amounts
            r'\b\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:dollars?|cents?)\b',
            r'\b(?:salary|wage|pay|compensation|bonus|premium|allowance|per diem|expense)\b',
            r'\b(?:hourly|annual|monthly|weekly|daily)\s+(?:rate|pay|wage)\b',
            r'\b\d+(?:\.\d+)?\s*(?:percent|%)\b'  # Percentages
        ]
        
        content_lower = content.lower()
        
        for pattern in money_patterns:
            if re.search(pattern, content_lower):
                return True
        
        return False


def enrich_document_content(document: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convenience function to enrich document content
    
    Args:
        document: Structured document dictionary
        
    Returns:
        Document with enriched metadata
    """
    enricher = DocumentEnricher()
    return enricher.enrich_document(document) 