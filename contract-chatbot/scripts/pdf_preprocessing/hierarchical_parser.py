"""
Hierarchical PDF parsing engine for contract documents
Task 3 implementation from pdf-parsing.md plan
"""
import re
import logging
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class HierarchyNode:
    """Represents a node in the hierarchical document structure"""
    id: str
    type: str  # "document", "section", "loa", "capital_letter_item", "number_item", "lowercase_letter_item", "paragraph"
    identifier_text: Optional[str] = None  # e.g., "1", "A", "LOA 1"
    title_text: Optional[str] = None  # Captured title line
    content_text_blocks: List[Dict] = field(default_factory=list)  # Direct content TextBlocks
    page_number_start: int = 1
    page_number_end: int = 1
    children: List['HierarchyNode'] = field(default_factory=list)  # Nested child nodes
    font_characteristics_header: Optional[Dict] = None  # Font info of header line
    indentation_header: Optional[float] = None  # Indentation of header line


class HierarchicalParser:
    """Main hierarchical parsing engine for contract documents"""
    
    def __init__(self, config: Optional[Dict] = None):
        """
        Initialize parser with configuration.
        
        Args:
            config: Optional configuration dictionary for parsing parameters
        """
        self.config = config or {}
        
        # Configuration parameters with defaults
        self.section_font_threshold = self.config.get("section_font_threshold", 14.0)
        self.heading_font_threshold = self.config.get("heading_font_threshold", 12.0)
        self.indentation_tolerance = self.config.get("indentation_tolerance", 5.0)
        self.base_left_margin = self.config.get("base_left_margin", 72.0)  # Typical 1 inch margin
        
        # Hierarchy tracking
        self.current_hierarchy_stack: List[HierarchyNode] = []
        self.next_node_id = 1
    
    def parse_document(self, pages_text_blocks: List[List[Dict]], document_title: str = "") -> List[HierarchyNode]:
        """
        Parse document into hierarchical structure.
        
        Args:
            pages_text_blocks: List of pages, each containing list of normalized TextBlock dictionaries
            document_title: Optional document title
            
        Returns:
            List of top-level HierarchyNode objects
        """
        logger.info(f"Starting hierarchical parsing of document with {len(pages_text_blocks)} pages")
        
        # Initialize with document root
        self.current_hierarchy_stack = []
        self.next_node_id = 1
        root_nodes = []
        
        # Process all text blocks sequentially
        for page_num, page_blocks in enumerate(pages_text_blocks, 1):
            logger.debug(f"Processing page {page_num} with {len(page_blocks)} blocks")
            
            for block in page_blocks:
                self._process_text_block(block, root_nodes)
        
        # Close any remaining open nodes
        self._close_all_nodes()
        
        logger.info(f"Hierarchical parsing complete. Created {len(root_nodes)} top-level nodes")
        return root_nodes
    
    def _process_text_block(self, block: Dict, root_nodes: List[HierarchyNode]) -> None:
        """Process a single text block and update hierarchy"""
        try:
            # Try to identify as header (from highest level to lowest)
            header_info = self._identify_header(block)
            
            if header_info:
                header_type, identifier, title = header_info
                self._handle_header(block, header_type, identifier, title, root_nodes)
            else:
                # It's content - add to current node
                self._handle_content(block)
                
        except Exception as e:
            logger.error(f"Error processing text block: {e}")
            # Add as content to current node as fallback
            self._handle_content(block)
    
    def _identify_header(self, block: Dict) -> Optional[Tuple[str, str, str]]:
        """
        Identify if a block is a header and return its type and identifiers.
        
        Returns:
            Tuple of (header_type, identifier, title) or None if not a header
        """
        text = block["text"].strip()
        font_size = block["avg_font_size"]
        is_bold = block["is_bold"]
        indentation = block["indentation_level"]
        
        # Try each header type from highest to lowest level
        
        # Section headers (highest level)
        section_match = self._is_section_header(text, font_size, is_bold, indentation)
        if section_match:
            return ("section", section_match[0], section_match[1])
        
        # LOA headers
        loa_match = self._is_loa_header(text, font_size, is_bold, indentation)
        if loa_match:
            return ("loa", loa_match[0], loa_match[1])
        
        # Get parent indentation for nested items
        parent_indent = self._get_current_parent_indentation()
        
        # Capital letter items
        capital_match = self._is_capital_letter_header(text, indentation, parent_indent)
        if capital_match:
            return ("capital_letter_item", capital_match[0], capital_match[1])
        
        # Number items
        number_match = self._is_number_header(text, indentation, parent_indent)
        if number_match:
            return ("number_item", number_match[0], number_match[1])
        
        # Lowercase letter items
        lowercase_match = self._is_lowercase_letter_header(text, indentation, parent_indent)
        if lowercase_match:
            return ("lowercase_letter_item", lowercase_match[0], lowercase_match[1])
        
        return None
    
    def _is_section_header(self, text: str, font_size: float, is_bold: bool, indentation: float) -> Optional[Tuple[str, str]]:
        """Check if text is a section header"""
        # Look for patterns like "SECTION 1", "SECTION IV", "ARTICLE 1", etc.
        patterns = [
            r"^\s*SECTION\s+([IVXLCDM\d]+)\s*[:.]?\s*(.*)",
            r"^\s*ARTICLE\s+([IVXLCDM\d]+)\s*[:.]?\s*(.*)",
            r"^\s*PART\s+([IVXLCDM\d]+)\s*[:.]?\s*(.*)",
            r"^\s*([IVXLCDM]{1,4})\.\s+(.+)",  # Roman numeral with period
        ]
        
        for pattern in patterns:
            match = re.match(pattern, text, re.IGNORECASE)
            if match:
                # Additional validation: should be near left margin and/or large font
                if (indentation < self.base_left_margin + 20 or 
                    font_size >= self.section_font_threshold or is_bold):
                    return (match.group(1), match.group(2).strip())
        
        return None
    
    def _is_loa_header(self, text: str, font_size: float, is_bold: bool, indentation: float) -> Optional[Tuple[str, str]]:
        """Check if text is a Letter of Agreement header"""
        patterns = [
            r"^\s*LETTER\s+OF\s+AGREEMENT\s*[#]?\s*(\d+|[IVXLCDM]+)\s*[:.]?\s*(.*)",
            r"^\s*LOA\s*[#]?\s*(\d+|[IVXLCDM]+)\s*[:.]?\s*(.*)",
            r"^\s*APPENDIX\s+([A-Z]+|\d+)\s*[:.]?\s*(.*)",
        ]
        
        for pattern in patterns:
            match = re.match(pattern, text, re.IGNORECASE)
            if match:
                # Should be near left margin and/or emphasized
                if (indentation < self.base_left_margin + 20 or 
                    font_size >= self.heading_font_threshold or is_bold):
                    return (match.group(1), match.group(2).strip())
        
        return None
    
    def _is_capital_letter_header(self, text: str, indentation: float, parent_indent: float) -> Optional[Tuple[str, str]]:
        """Check if text is a capital letter item header"""
        patterns = [
            r"^\s*([A-Z])\s*[.)]\s*(.*)",
            r"^\s*\(([A-Z])\)\s*(.*)",
        ]
        
        for pattern in patterns:
            match = re.match(pattern, text)
            if match:
                # Should be indented relative to parent
                if indentation > parent_indent + self.indentation_tolerance:
                    return (match.group(1), match.group(2).strip())
        
        return None
    
    def _is_number_header(self, text: str, indentation: float, parent_indent: float) -> Optional[Tuple[str, str]]:
        """Check if text is a numbered item header"""
        patterns = [
            r"^\s*(\d+)\s*[.)]\s*(.*)",
            r"^\s*\((\d+)\)\s*(.*)",
        ]
        
        for pattern in patterns:
            match = re.match(pattern, text)
            if match:
                # Should be indented relative to parent
                if indentation > parent_indent + self.indentation_tolerance:
                    return (match.group(1), match.group(2).strip())
        
        return None
    
    def _is_lowercase_letter_header(self, text: str, indentation: float, parent_indent: float) -> Optional[Tuple[str, str]]:
        """Check if text is a lowercase letter item header"""
        patterns = [
            r"^\s*([a-z])\s*[.)]\s*(.*)",
            r"^\s*\(([a-z])\)\s*(.*)",
        ]
        
        for pattern in patterns:
            match = re.match(pattern, text)
            if match:
                # Should be indented relative to parent
                if indentation > parent_indent + self.indentation_tolerance:
                    return (match.group(1), match.group(2).strip())
        
        return None
    
    def _get_current_parent_indentation(self) -> float:
        """Get indentation level of current parent node"""
        if self.current_hierarchy_stack:
            return self.current_hierarchy_stack[-1].indentation_header or self.base_left_margin
        return self.base_left_margin
    
    def _handle_header(self, block: Dict, header_type: str, identifier: str, title: str, root_nodes: List[HierarchyNode]) -> None:
        """Handle identification of a header block"""
        # Close nodes at same or lower level
        self._close_nodes_for_level(header_type)
        
        # Create new node
        node = HierarchyNode(
            id=self._generate_node_id(),
            type=header_type,
            identifier_text=identifier,
            title_text=title,
            page_number_start=block["page_number"],
            page_number_end=block["page_number"],
            font_characteristics_header={
                "font_size": block["avg_font_size"],
                "font_name": block["dominant_font_name"],
                "is_bold": block["is_bold"],
                "is_italic": block["is_italic"]
            },
            indentation_header=block["indentation_level"]
        )
        
        # Add to appropriate parent
        if self.current_hierarchy_stack:
            self.current_hierarchy_stack[-1].children.append(node)
        else:
            root_nodes.append(node)
        
        # Push to stack
        self.current_hierarchy_stack.append(node)
        
        logger.debug(f"Created {header_type} node: {identifier} - {title}")
    
    def _handle_content(self, block: Dict) -> None:
        """Handle content block (non-header)"""
        if self.current_hierarchy_stack:
            # Add to current node's content
            current_node = self.current_hierarchy_stack[-1]
            current_node.content_text_blocks.append(block)
            current_node.page_number_end = block["page_number"]
        else:
            # No current node - create a paragraph node
            logger.warning(f"Content block without parent node on page {block['page_number']}")
    
    def _close_nodes_for_level(self, new_header_type: str) -> None:
        """Close nodes that should be closed when a new header of given type is encountered"""
        # Define hierarchy levels (lower number = higher level)
        hierarchy_levels = {
            "section": 1,
            "loa": 1,
            "capital_letter_item": 2,
            "number_item": 3,
            "lowercase_letter_item": 4,
            "paragraph": 5
        }
        
        new_level = hierarchy_levels.get(new_header_type, 5)
        
        # Pop nodes from stack that are at same or lower level
        while (self.current_hierarchy_stack and 
               hierarchy_levels.get(self.current_hierarchy_stack[-1].type, 5) >= new_level):
            self.current_hierarchy_stack.pop()
    
    def _close_all_nodes(self) -> None:
        """Close all remaining open nodes"""
        self.current_hierarchy_stack.clear()
    
    def _generate_node_id(self) -> str:
        """Generate unique node ID"""
        node_id = f"node_{self.next_node_id:06d}"
        self.next_node_id += 1
        return node_id 