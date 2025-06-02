"""
Advanced PDF layout extraction utilities for hierarchical parsing
Task 2 implementation from pdf-parsing.md plan
"""
import fitz  # PyMuPDF
import logging
from typing import List, Dict, Any, Tuple

logger = logging.getLogger(__name__)


def extract_raw_page_data(page: fitz.Page) -> List[Dict]:
    """
    Extract detailed text block data including coordinates, font information, and line information.
    
    Args:
        page: PyMuPDF page object
        
    Returns:
        List of text block dictionaries with detailed layout and font information
    """
    try:
        # Get text dictionary with detailed formatting information
        text_dict = page.get_text("dict")
        raw_blocks = []
        
        for block in text_dict["blocks"]:
            if "lines" in block:  # Text block (not image)
                block_data = {
                    "block_bbox": block["bbox"],
                    "block_type": block.get("type", 0),
                    "lines": []
                }
                
                for line in block["lines"]:
                    line_data = {
                        "line_bbox": line["bbox"],
                        "spans": []
                    }
                    
                    for span in line["spans"]:
                        span_data = {
                            "text": span.get("text", ""),
                            "bbox": span.get("bbox", (0, 0, 0, 0)),
                            "origin": span.get("origin", (0, 0)),
                            "font_name": span.get("font", ""),
                            "font_size": span.get("size", 10.0),
                            "font_flags": span.get("flags", 0),
                            "color": span.get("color", 0)
                        }
                        line_data["spans"].append(span_data)
                    
                    block_data["lines"].append(line_data)
                
                raw_blocks.append(block_data)
        
        return raw_blocks
    
    except Exception as e:
        logger.error(f"Error extracting raw page data: {e}")
        return []


def parse_font_flags(flags: int) -> Dict[str, bool]:
    """
    Parse PyMuPDF font flags into readable properties.
    
    Args:
        flags: Font flags integer from PyMuPDF span data
        
    Returns:
        Dictionary with boolean flags for font properties
    """
    return {
        "is_superscript": bool(flags & 2**0),    # Bit 0
        "is_italic": bool(flags & 2**1),         # Bit 1
        "is_serif": bool(flags & 2**2),          # Bit 2
        "is_monospace": bool(flags & 2**3),      # Bit 3
        "is_bold": bool(flags & 2**4),           # Bit 4
        "is_subscript": bool(flags & 2**5),      # Bit 5
    }


def normalize_text_block_info(raw_block_data: Dict) -> Dict:
    """
    Convert raw block data into a normalized TextBlock structure for hierarchical parsing.
    
    Args:
        raw_block_data: Raw block data from extract_raw_page_data
        
    Returns:
        Normalized TextBlock dictionary ready for hierarchical parsing
    """
    try:
        # Collect all text and analyze properties
        all_text = []
        font_sizes = []
        font_names = []
        bold_spans = 0
        italic_spans = 0
        total_spans = 0
        
        for line in raw_block_data["lines"]:
            line_text = []
            for span in line["spans"]:
                text = span["text"]
                if text.strip():
                    all_text.append(text)
                    line_text.append(text)
                    
                    # Collect font properties
                    font_sizes.append(span["font_size"])
                    font_names.append(span["font_name"])
                    
                    # Parse font flags
                    font_props = parse_font_flags(span["font_flags"])
                    if font_props["is_bold"]:
                        bold_spans += 1
                    if font_props["is_italic"]:
                        italic_spans += 1
                    total_spans += 1
        
        if not all_text:
            return None
        
        # Calculate aggregate properties
        text = " ".join(all_text).strip()
        bbox = raw_block_data["block_bbox"]
        indentation_level = bbox[0]  # Left x-coordinate
        
        avg_font_size = sum(font_sizes) / len(font_sizes) if font_sizes else 10.0
        dominant_font_name = max(set(font_names), key=font_names.count) if font_names else ""
        
        is_bold_block = (bold_spans / total_spans) > 0.5 if total_spans > 0 else False
        is_italic_block = (italic_spans / total_spans) > 0.5 if total_spans > 0 else False
        
        return {
            "text": text,
            "bbox": bbox,
            "indentation_level": indentation_level,
            "avg_font_size": avg_font_size,
            "dominant_font_name": dominant_font_name,
            "is_bold": is_bold_block,
            "is_italic": is_italic_block,
            "span_count": total_spans,
            "raw_spans": [
                {
                    "text": span["text"],
                    "font_size": span["font_size"],
                    "font_name": span["font_name"],
                    "font_props": parse_font_flags(span["font_flags"])
                }
                for line in raw_block_data["lines"]
                for span in line["spans"]
                if span["text"].strip()
            ]
        }
    
    except Exception as e:
        logger.error(f"Error normalizing text block: {e}")
        return None


def extract_page_text_blocks(page: fitz.Page, page_number: int) -> List[Dict]:
    """
    Extract normalized text blocks from a page for hierarchical parsing.
    
    Args:
        page: PyMuPDF page object
        page_number: Page number (1-indexed)
        
    Returns:
        List of normalized TextBlock dictionaries
    """
    try:
        raw_blocks = extract_raw_page_data(page)
        normalized_blocks = []
        
        for raw_block in raw_blocks:
            normalized_block = normalize_text_block_info(raw_block)
            if normalized_block:
                normalized_block["page_number"] = page_number
                normalized_blocks.append(normalized_block)
        
        logger.debug(f"Extracted {len(normalized_blocks)} normalized blocks from page {page_number}")
        return normalized_blocks
    
    except Exception as e:
        logger.error(f"Error extracting text blocks from page {page_number}: {e}")
        return [] 