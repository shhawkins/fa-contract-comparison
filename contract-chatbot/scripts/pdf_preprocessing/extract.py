"""
PDF extraction module for contract preprocessing
"""
import fitz  # PyMuPDF
import logging
from typing import List, Dict, Any, Tuple, Optional
from utils import clean_text

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TextBlock:
    """Represents a text block extracted from PDF"""
    def __init__(self, content: str, font_size: float, page_num: int, 
                 bbox: Tuple[float, float, float, float]):
        self.content = content
        self.font_size = font_size
        self.page_num = page_num
        self.bbox = bbox  # (x0, y0, x1, y1)


class PDFExtractor:
    """Main PDF extraction class using PyMuPDF"""
    
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.doc = None
        
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
    
    def extract_text_blocks(self) -> List[TextBlock]:
        """Extract text blocks with metadata from all pages"""
        text_blocks = []
        
        if not self.doc:
            raise ValueError("PDF document not opened")
        
        for page_num in range(self.doc.page_count):
            page = self.doc[page_num]
            page_blocks = self._extract_page_blocks(page, page_num + 1)
            text_blocks.extend(page_blocks)
            
        logger.info(f"Extracted {len(text_blocks)} text blocks")
        return text_blocks
    
    def _extract_page_blocks(self, page, page_num: int) -> List[TextBlock]:
        """Extract text blocks from a single page"""
        blocks = []
        
        try:
            # Get text blocks with font information
            text_dict = page.get_text("dict")
            
            for block in text_dict["blocks"]:
                if "lines" in block:  # Text block
                    block_content = []
                    avg_font_size = 0
                    font_sizes = []
                    
                    for line in block["lines"]:
                        line_text = ""
                        for span in line["spans"]:
                            span_text = span.get("text", "")
                            if span_text.strip():
                                line_text += span_text
                                font_sizes.append(span.get("size", 10))
                        
                        if line_text.strip():
                            block_content.append(line_text.strip())
                    
                    if block_content and font_sizes:
                        content = " ".join(block_content)
                        content = clean_text(content)
                        
                        if content:  # Only add non-empty content
                            avg_font_size = sum(font_sizes) / len(font_sizes)
                            bbox = (block["bbox"][0], block["bbox"][1], 
                                   block["bbox"][2], block["bbox"][3])
                            
                            text_block = TextBlock(
                                content=content,
                                font_size=avg_font_size,
                                page_num=page_num,
                                bbox=bbox
                            )
                            blocks.append(text_block)
        
        except Exception as e:
            logger.warning(f"Error extracting from page {page_num}: {e}")
            # Fallback to simple text extraction
            try:
                simple_text = page.get_text()
                if simple_text.strip():
                    content = clean_text(simple_text)
                    text_block = TextBlock(
                        content=content,
                        font_size=10.0,  # Default font size
                        page_num=page_num,
                        bbox=(0, 0, 0, 0)  # Default bbox
                    )
                    blocks.append(text_block)
            except Exception as fallback_error:
                logger.error(f"Fallback extraction failed for page {page_num}: {fallback_error}")
        
        return blocks
    
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
            "page_count": self.doc.page_count
        }


class PDFExtractorFallback:
    """Fallback PDF extractor using pdfminer.six"""
    
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
    
    def extract_text_blocks(self) -> List[TextBlock]:
        """Extract text using pdfminer.six as fallback"""
        try:
            from pdfminer.high_level import extract_text_to_fp
            from pdfminer.layout import LAParams
            import io
            
            logger.info(f"Using fallback extractor for {self.pdf_path}")
            
            laparams = LAParams(
                word_margin=0.1,
                char_margin=2.0,
                line_margin=0.5,
                boxes_flow=0.5
            )
            
            output_string = io.StringIO()
            
            with open(self.pdf_path, 'rb') as fp:
                extract_text_to_fp(fp, output_string, laparams=laparams)
            
            text = output_string.getvalue()
            text = clean_text(text)
            
            if text:
                # Split into paragraphs and create text blocks
                paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
                blocks = []
                
                for i, paragraph in enumerate(paragraphs):
                    text_block = TextBlock(
                        content=paragraph,
                        font_size=10.0,  # Default font size
                        page_num=1,  # Default page number
                        bbox=(0, 0, 0, 0)  # Default bbox
                    )
                    blocks.append(text_block)
                
                logger.info(f"Fallback extractor created {len(blocks)} text blocks")
                return blocks
            
        except ImportError:
            logger.error("pdfminer.six not available for fallback extraction")
        except Exception as e:
            logger.error(f"Fallback extraction failed: {e}")
        
        return []
    
    def get_document_metadata(self) -> Dict[str, Any]:
        """Return minimal metadata for fallback extractor"""
        return {
            "title": "",
            "page_count": 0,
            "extraction_method": "fallback"
        }


def extract_pdf_content(pdf_path: str) -> Tuple[List[TextBlock], Dict[str, Any]]:
    """
    Extract content from PDF using primary extractor with fallback
    
    Returns:
        Tuple of (text_blocks, metadata)
    """
    try:
        # Try primary extractor (PyMuPDF)
        with PDFExtractor(pdf_path) as extractor:
            text_blocks = extractor.extract_text_blocks()
            metadata = extractor.get_document_metadata()
            
            if text_blocks:
                logger.info(f"Successfully extracted content using PyMuPDF")
                return text_blocks, metadata
            else:
                logger.warning("PyMuPDF extracted no content, trying fallback")
                
    except Exception as e:
        logger.warning(f"PyMuPDF extraction failed: {e}, trying fallback")
    
    # Try fallback extractor
    try:
        fallback_extractor = PDFExtractorFallback(pdf_path)
        text_blocks = fallback_extractor.extract_text_blocks()
        metadata = fallback_extractor.get_document_metadata()
        
        if text_blocks:
            logger.info(f"Successfully extracted content using fallback method")
            return text_blocks, metadata
        else:
            logger.error("Both extractors failed to extract content")
            
    except Exception as e:
        logger.error(f"Fallback extraction also failed: {e}")
    
    # Return empty results if all methods fail
    return [], {"title": "", "page_count": 0, "extraction_method": "failed"} 