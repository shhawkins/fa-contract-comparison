"""
Structure module for transforming raw PDF text blocks into ProcessedDocumentType
"""
import logging
from typing import List, Dict, Any
from extract import TextBlock
from utils import generate_section_id, is_heading
from config import HEADING_FONT_SIZE_THRESHOLD, SUBHEADING_FONT_SIZE_THRESHOLD

logger = logging.getLogger(__name__)


class DocumentStructurer:
    """Transforms text blocks into structured document format"""
    
    def __init__(self, doc_id: str, title: str = ""):
        self.doc_id = doc_id
        self.title = title
        
    def structure_document(self, text_blocks: List[TextBlock], metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform text blocks into ProcessedDocumentType structure
        
        Args:
            text_blocks: List of TextBlock objects from PDF extraction
            metadata: Document metadata from PDF
            
        Returns:
            Dictionary representing ProcessedDocumentType
        """
        if not text_blocks:
            logger.warning(f"No text blocks provided for document {self.doc_id}")
            return self._create_empty_document()
        
        # Merge consecutive blocks that belong together
        merged_blocks = self._merge_consecutive_blocks(text_blocks)
        
        # Identify sections based on content and formatting
        sections = self._identify_sections(merged_blocks)
        
        # Create the structured document
        structured_doc = {
            "id": self.doc_id,
            "title": self.title or metadata.get("title", f"Document {self.doc_id}"),
            "sections": sections
        }
        
        logger.info(f"Structured document {self.doc_id} with {len(sections)} sections")
        return structured_doc
    
    def _create_empty_document(self) -> Dict[str, Any]:
        """Create empty document structure"""
        return {
            "id": self.doc_id,
            "title": self.title or f"Document {self.doc_id}",
            "sections": []
        }
    
    def _merge_consecutive_blocks(self, text_blocks: List[TextBlock]) -> List[TextBlock]:
        """Merge consecutive text blocks that likely belong together"""
        if not text_blocks:
            return []
        
        merged = []
        current_block = text_blocks[0]
        
        for i in range(1, len(text_blocks)):
            next_block = text_blocks[i]
            
            # Check if blocks should be merged
            if self._should_merge_blocks(current_block, next_block):
                # Merge the blocks
                merged_content = current_block.content + " " + next_block.content
                current_block = TextBlock(
                    content=merged_content,
                    font_size=current_block.font_size,  # Keep original font size
                    page_num=current_block.page_num,
                    bbox=current_block.bbox
                )
            else:
                # Start new block
                merged.append(current_block)
                current_block = next_block
        
        # Add the last block
        merged.append(current_block)
        
        logger.info(f"Merged {len(text_blocks)} blocks into {len(merged)} blocks")
        return merged
    
    def _should_merge_blocks(self, block1: TextBlock, block2: TextBlock) -> bool:
        """Determine if two consecutive blocks should be merged"""
        # Don't merge if font sizes are very different (likely different sections)
        font_diff = abs(block1.font_size - block2.font_size)
        if font_diff > 2.0:
            return False
        
        # Don't merge if either block looks like a heading
        if (is_heading(block1.content, block1.font_size, SUBHEADING_FONT_SIZE_THRESHOLD) or
            is_heading(block2.content, block2.font_size, SUBHEADING_FONT_SIZE_THRESHOLD)):
            return False
        
        # Don't merge if blocks are on different pages and content is substantial
        if (block1.page_num != block2.page_num and 
            (len(block1.content) > 50 or len(block2.content) > 50)):
            return False
        
        # Merge if blocks are short and likely continuation of same paragraph
        if len(block1.content) < 100 and len(block2.content) < 100:
            return True
        
        # Don't merge long blocks by default
        return False
    
    def _identify_sections(self, text_blocks: List[TextBlock]) -> List[Dict[str, Any]]:
        """Identify and create sections from text blocks"""
        sections = []
        
        for i, block in enumerate(text_blocks):
            section = self._create_section(block, i)
            sections.append(section)
        
        return sections
    
    def _create_section(self, block: TextBlock, index: int) -> Dict[str, Any]:
        """Create a section from a text block"""
        # Determine section type
        section_type = self._determine_section_type(block)
        
        # Generate unique section ID
        section_id = generate_section_id(block.content, self.doc_id, index)
        
        # Create basic section structure
        section = {
            "id": section_id,
            "type": section_type,
            "content": block.content,
            "originalPage": block.page_num,
            "metadata": {
                "category": "general",  # Will be enriched later
                "importance": "low",    # Will be enriched later
                "glossaryTerms": [],    # Will be enriched later
                "affects": ["all_flight_attendants"]  # Will be enriched later
            }
        }
        
        return section
    
    def _determine_section_type(self, block: TextBlock) -> str:
        """Determine the type of section based on content and formatting"""
        content = block.content.strip()
        
        # Check if it's a heading based on font size and content
        if is_heading(content, block.font_size, HEADING_FONT_SIZE_THRESHOLD):
            return "heading"
        
        # Check for list patterns
        if self._is_list_content(content):
            return "list"
        
        # Check for table patterns (basic detection)
        if self._is_table_content(content):
            return "table"
        
        # Default to paragraph
        return "paragraph"
    
    def _is_list_content(self, content: str) -> bool:
        """Check if content appears to be a list"""
        lines = content.split('\n')
        
        # Check for bullet points or numbered lists
        list_patterns = [
            r'^\s*•',           # Bullet points
            r'^\s*\d+\.',       # Numbered list (1., 2., etc.)
            r'^\s*\d+\)',       # Numbered list (1), 2), etc.)
            r'^\s*[a-zA-Z]\.',  # Lettered list (a., b., etc.)
            r'^\s*[a-zA-Z]\)',  # Lettered list (a), b), etc.)
            r'^\s*-\s+',        # Dash bullets
        ]
        
        import re
        list_line_count = 0
        
        for line in lines:
            for pattern in list_patterns:
                if re.match(pattern, line):
                    list_line_count += 1
                    break
        
        # If more than half the lines look like list items, consider it a list
        return len(lines) > 1 and list_line_count > len(lines) * 0.5
    
    def _is_table_content(self, content: str) -> bool:
        """Check if content appears to be a table"""
        lines = content.split('\n')
        
        # Look for table-like patterns
        # This is a basic implementation - could be enhanced
        
        # Check for consistent column separators
        separator_patterns = ['\t', '  ', ' | ', '|']
        
        for separator in separator_patterns:
            separated_lines = [line.split(separator) for line in lines if line.strip()]
            
            if len(separated_lines) > 2:  # At least 3 rows
                # Check if rows have consistent number of columns
                column_counts = [len(row) for row in separated_lines]
                if len(set(column_counts)) == 1 and column_counts[0] > 1:
                    return True
        
        return False


def structure_pdf_content(doc_id: str, text_blocks: List[TextBlock], 
                         metadata: Dict[str, Any], title: str = "") -> Dict[str, Any]:
    """
    Convenience function to structure PDF content
    
    Args:
        doc_id: Document identifier
        text_blocks: List of extracted text blocks
        metadata: Document metadata
        title: Optional document title
        
    Returns:
        Structured document dictionary
    """
    structurer = DocumentStructurer(doc_id, title)
    return structurer.structure_document(text_blocks, metadata) 