"""
Enhanced PDF extraction module with hierarchical parsing capabilities
Integrates the new hierarchical parsing system with existing extraction
"""
import fitz  # PyMuPDF
import logging
from typing import List, Dict, Any, Tuple, Optional
from utils import clean_text
from utils_layout import extract_page_text_blocks
from hierarchical_parser import HierarchicalParser
from hierarchical_json import convert_hierarchy_to_document_json, flatten_hierarchy_for_compatibility

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class HierarchicalPDFExtractor:
    """Enhanced PDF extractor with hierarchical parsing capabilities"""
    
    def __init__(self, pdf_path: str, use_hierarchical: bool = True):
        self.pdf_path = pdf_path
        self.doc = None
        self.use_hierarchical = use_hierarchical
        
    def __enter__(self):
        try:
            self.doc = fitz.open(self.pdf_path)
            logger.info(f"Opened PDF: {self.pdf_path} ({self.doc.page_count} pages)")
            return self
        except Exception as e:
            logger.error(f"Failed to open PDF {self.pdf_path}: {e}")
            raise
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.doc:
            self.doc.close()
    
    def extract_hierarchical_content(self, doc_id: str, title: str = "") -> Dict[str, Any]:
        """
        Extract content with hierarchical parsing and return structured JSON
        
        Args:
            doc_id: Document identifier
            title: Document title
            
        Returns:
            Structured document JSON
        """
        if not self.doc:
            raise ValueError("PDF document not opened")
        
        logger.info(f"Starting hierarchical extraction for {doc_id}")
        
        # Step 1: Extract detailed text blocks from all pages
        all_pages_blocks = []
        for page_num in range(self.doc.page_count):
            page = self.doc[page_num]
            page_blocks = extract_page_text_blocks(page, page_num + 1)
            all_pages_blocks.append(page_blocks)
            logger.debug(f"Extracted {len(page_blocks)} blocks from page {page_num + 1}")
        
        # Step 2: Parse hierarchical structure
        parser = HierarchicalParser()
        hierarchy_nodes = parser.parse_document(all_pages_blocks, title)
        
        # Step 3: Get document metadata
        metadata = self.get_document_metadata()
        
        # Step 4: Convert to JSON structure
        document_json = convert_hierarchy_to_document_json(
            hierarchy_nodes, doc_id, title or metadata.get("title", f"Document {doc_id}"), metadata
        )
        
        # Step 5: Flatten for compatibility with existing app
        flattened_json = flatten_hierarchy_for_compatibility(document_json)
        
        logger.info(f"Successfully processed {doc_id} with hierarchical parsing")
        return flattened_json
    
    def extract_legacy_content(self) -> Tuple[List[Any], Dict[str, Any]]:
        """
        Extract content using legacy method for compatibility
        
        Returns:
            Tuple of (text_blocks, metadata) in legacy format
        """
        from extract import PDFExtractor, TextBlock
        
        logger.info("Using legacy extraction method")
        
        # Use the original extraction logic
        with PDFExtractor(self.pdf_path) as extractor:
            text_blocks = extractor.extract_text_blocks()
            metadata = extractor.get_document_metadata()
            
        return text_blocks, metadata
    
    def get_document_metadata(self) -> Dict[str, Any]:
        """Extract document metadata"""
        if not self.doc:
            return {}
        
        metadata = self.doc.metadata
        return {
            "title": metadata.get("title", ""),
            "author": metadata.get("author", ""),
            "subject": metadata.get("subject", ""),
            "creator": metadata.get("creator", ""),
            "producer": metadata.get("producer", ""),
            "creation_date": metadata.get("creationDate", ""),
            "modification_date": metadata.get("modDate", ""),
            "page_count": self.doc.page_count,
            "extraction_method": "hierarchical_enhanced"
        }


def extract_pdf_content_hierarchical(pdf_path: str, doc_id: str, title: str = "", 
                                   use_hierarchical: bool = True) -> Dict[str, Any]:
    """
    Extract PDF content with optional hierarchical parsing
    
    Args:
        pdf_path: Path to PDF file
        doc_id: Document identifier
        title: Document title
        use_hierarchical: Whether to use hierarchical parsing
        
    Returns:
        Structured document JSON
    """
    try:
        with HierarchicalPDFExtractor(pdf_path, use_hierarchical) as extractor:
            if use_hierarchical:
                return extractor.extract_hierarchical_content(doc_id, title)
            else:
                # Use legacy method and convert to expected format
                text_blocks, metadata = extractor.extract_legacy_content()
                
                # Import existing structure function
                from structure import structure_pdf_content
                structured_doc = structure_pdf_content(doc_id, text_blocks, metadata, title)
                
                return structured_doc
                
    except Exception as e:
        logger.error(f"Hierarchical extraction failed for {pdf_path}: {e}")
        
        # Fallback to legacy extraction
        logger.info("Falling back to legacy extraction method")
        from extract import extract_pdf_content
        from structure import structure_pdf_content
        
        text_blocks, metadata = extract_pdf_content(pdf_path)
        if text_blocks:
            structured_doc = structure_pdf_content(doc_id, text_blocks, metadata, title)
            return structured_doc
        else:
            # Return empty document structure
            return {
                "id": doc_id,
                "title": title or f"Document {doc_id}",
                "sections": []
            }


def test_hierarchical_extraction(pdf_path: str, output_path: str = None) -> None:
    """
    Test function for hierarchical extraction
    
    Args:
        pdf_path: Path to PDF file to test
        output_path: Optional path to save test output
    """
    import json
    
    logger.info(f"Testing hierarchical extraction on {pdf_path}")
    
    doc_id = "test_doc"
    title = "Test Document"
    
    try:
        # Test hierarchical extraction
        result = extract_pdf_content_hierarchical(pdf_path, doc_id, title, use_hierarchical=True)
        
        print(f"\n=== HIERARCHICAL EXTRACTION TEST RESULTS ===")
        print(f"Document ID: {result.get('id')}")
        print(f"Title: {result.get('title')}")
        print(f"Total sections: {len(result.get('sections', []))}")
        
        # Print first few sections for inspection
        sections = result.get('sections', [])
        for i, section in enumerate(sections[:5]):
            print(f"\nSection {i+1}:")
            print(f"  ID: {section.get('id')}")
            print(f"  Type: {section.get('type')}")
            print(f"  Page: {section.get('originalPage')}")
            print(f"  Content preview: {section.get('content', '')[:100]}...")
            
            # Print hierarchical info if available
            hierarchy = section.get('hierarchy', {})
            if hierarchy:
                print(f"  Hierarchy: Level {hierarchy.get('level')}, Type: {hierarchy.get('type')}")
                print(f"  Identifier: {hierarchy.get('identifier')}")
                print(f"  Title: {hierarchy.get('title')}")
        
        # Save output if requested
        if output_path:
            with open(output_path, 'w') as f:
                json.dump(result, f, indent=2)
            print(f"\nTest output saved to: {output_path}")
        
        print(f"\n=== TEST COMPLETED SUCCESSFULLY ===")
        
    except Exception as e:
        logger.error(f"Test failed: {e}")
        raise 