"""
JSON conversion module for hierarchical document structure
Task 4 implementation from pdf-parsing.md plan
"""
import logging
from typing import Dict, Any, List
from hierarchical_parser import HierarchyNode

logger = logging.getLogger(__name__)


def convert_node_to_json(node: HierarchyNode) -> Dict[str, Any]:
    """
    Convert a HierarchyNode to JSON dictionary structure.
    
    Args:
        node: HierarchyNode to convert
        
    Returns:
        Dictionary representation following the new hierarchical JSON schema
    """
    # Aggregate content text from all text blocks
    content_text = ""
    if node.content_text_blocks:
        content_parts = []
        for block in node.content_text_blocks:
            if isinstance(block, dict) and "text" in block:
                content_parts.append(block["text"])
            elif isinstance(block, str):
                content_parts.append(block)
        content_text = " ".join(content_parts).strip()
    
    # Convert children recursively
    children_json = []
    for child in node.children:
        child_json = convert_node_to_json(child)
        children_json.append(child_json)
    
    # Create base JSON structure
    json_node = {
        "id": node.id,
        "type": node.type,
        "identifier_text": node.identifier_text,
        "title_text": node.title_text,
        "content_text": content_text,
        "page_number_start": node.page_number_start,
        "page_number_end": node.page_number_end,
        "children": children_json
    }
    
    # Add metadata if available
    metadata = {}
    
    if node.font_characteristics_header:
        metadata["font_characteristics"] = node.font_characteristics_header
    
    if node.indentation_header is not None:
        metadata["indentation"] = node.indentation_header
    
    # Add content block metadata for advanced rendering
    if node.content_text_blocks:
        metadata["content_blocks"] = [
            {
                "page_number": block.get("page_number", 1),
                "bbox": block.get("bbox", [0, 0, 0, 0]),
                "font_size": block.get("avg_font_size", 10.0),
                "font_name": block.get("dominant_font_name", ""),
                "is_bold": block.get("is_bold", False),
                "is_italic": block.get("is_italic", False)
            }
            for block in node.content_text_blocks
            if isinstance(block, dict)
        ]
    
    if metadata:
        json_node["metadata"] = metadata
    
    return json_node


def convert_hierarchy_to_document_json(hierarchy_nodes: List[HierarchyNode], 
                                     document_id: str, 
                                     document_title: str,
                                     original_metadata: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Convert hierarchical nodes to complete document JSON structure.
    
    Args:
        hierarchy_nodes: List of top-level HierarchyNode objects
        document_id: Document identifier
        document_title: Document title
        original_metadata: Original PDF metadata
        
    Returns:
        Complete document JSON structure compatible with existing app
    """
    # Convert all nodes to JSON
    sections_json = []
    for node in hierarchy_nodes:
        node_json = convert_node_to_json(node)
        sections_json.append(node_json)
    
    # Create document structure
    document_json = {
        "id": document_id,
        "title": document_title,
        "sections": sections_json
    }
    
    # Add processing metadata
    if original_metadata:
        document_json["document_metadata"] = original_metadata
    
    # Add processing info
    document_json["processing_info"] = {
        "parser_version": "hierarchical_v1.0",
        "total_sections": len(sections_json),
        "parsing_method": "hierarchical_structure"
    }
    
    logger.info(f"Converted hierarchical structure to JSON: {len(sections_json)} top-level sections")
    return document_json


def flatten_hierarchy_for_compatibility(document_json: Dict[str, Any]) -> Dict[str, Any]:
    """
    Flatten hierarchical structure for compatibility with existing app components.
    This creates a flat list of sections while preserving hierarchical information.
    
    Args:
        document_json: Hierarchical document JSON
        
    Returns:
        Flattened document JSON compatible with existing app
    """
    flattened_sections = []
    
    def flatten_node(node: Dict[str, Any], level: int = 0, parent_path: str = "") -> None:
        """Recursively flatten a node and its children"""
        # Create section for current node
        section = {
            "id": node["id"],
            "type": _map_hierarchical_type_to_section_type(node["type"]),
            "content": _create_section_content(node),
            "originalPage": node["page_number_start"],
            "metadata": _create_section_metadata(node, level, parent_path)
        }
        
        # Add hierarchical information
        section["hierarchy"] = {
            "level": level,
            "type": node["type"],
            "identifier": node["identifier_text"],
            "title": node["title_text"],
            "parent_path": parent_path,
            "page_range": [node["page_number_start"], node["page_number_end"]],
            "has_children": len(node.get("children", [])) > 0
        }
        
        flattened_sections.append(section)
        
        # Flatten children
        current_path = _build_path(parent_path, node["identifier_text"], node["title_text"])
        for child in node.get("children", []):
            flatten_node(child, level + 1, current_path)
    
    # Flatten all top-level nodes
    for section in document_json.get("sections", []):
        flatten_node(section)
    
    # Create flattened document
    flattened_document = {
        "id": document_json["id"],
        "title": document_json["title"],
        "sections": flattened_sections
    }
    
    # Preserve metadata
    if "document_metadata" in document_json:
        flattened_document["document_metadata"] = document_json["document_metadata"]
    
    if "processing_info" in document_json:
        flattened_document["processing_info"] = document_json["processing_info"]
        flattened_document["processing_info"]["flattened"] = True
    
    logger.info(f"Flattened hierarchical structure: {len(flattened_sections)} total sections")
    return flattened_document


def _map_hierarchical_type_to_section_type(hierarchical_type: str) -> str:
    """Map hierarchical types to existing section types"""
    mapping = {
        "section": "heading",
        "loa": "heading", 
        "capital_letter_item": "heading",
        "number_item": "list",
        "lowercase_letter_item": "list",
        "paragraph": "paragraph"
    }
    return mapping.get(hierarchical_type, "paragraph")


def _create_section_content(node: Dict[str, Any]) -> str:
    """Create content string for section"""
    parts = []
    
    # Add title if available
    if node.get("title_text"):
        if node.get("identifier_text"):
            parts.append(f"{node['identifier_text']}. {node['title_text']}")
        else:
            parts.append(node["title_text"])
    elif node.get("identifier_text"):
        parts.append(node["identifier_text"])
    
    # Add content text
    if node.get("content_text"):
        parts.append(node["content_text"])
    
    return "\n".join(parts) if parts else ""


def _create_section_metadata(node: Dict[str, Any], level: int, parent_path: str) -> Dict[str, Any]:
    """Create metadata for flattened section"""
    metadata = {
        "category": _determine_category(node),
        "importance": _determine_importance(node, level),
        "glossaryTerms": [],
        "affects": ["all_flight_attendants"]
    }
    
    # Add hierarchical metadata
    metadata["hierarchy_level"] = level
    metadata["hierarchy_type"] = node["type"]
    metadata["parent_path"] = parent_path
    
    return metadata


def _determine_category(node: Dict[str, Any]) -> str:
    """Determine category based on content"""
    content = (node.get("content_text", "") + " " + 
              node.get("title_text", "")).lower()
    
    # Basic category detection - can be enhanced
    if any(term in content for term in ["schedule", "duty", "time", "hours", "shift"]):
        return "scheduling"
    elif any(term in content for term in ["pay", "wage", "salary", "compensation"]):
        return "pay"
    elif any(term in content for term in ["benefit", "insurance", "vacation", "sick"]):
        return "benefits"
    elif any(term in content for term in ["rule", "procedure", "conduct", "discipline"]):
        return "work_rules"
    else:
        return "general"


def _determine_importance(node: Dict[str, Any], level: int) -> str:
    """Determine importance based on hierarchy level and content"""
    if level == 0:  # Top-level sections
        return "high"
    elif level == 1:
        return "medium"
    else:
        return "low"


def _build_path(parent_path: str, identifier: str, title: str) -> str:
    """Build hierarchical path string"""
    current = identifier or title or "unknown"
    if parent_path:
        return f"{parent_path} > {current}"
    return current 