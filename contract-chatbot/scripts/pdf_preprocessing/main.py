"""
Main orchestrator for PDF preprocessing pipeline
"""
import os
import sys
import logging
from typing import Dict, Any, List
from pathlib import Path

# Add the current directory to Python path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import DOCUMENT_MAPPINGS, INPUT_PDF_DIR, OUTPUT_JSON_DIR
from extract import extract_pdf_content
from structure import structure_pdf_content
from enrich import enrich_document_content
from utils import validate_processed_document, save_json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class PDFPreprocessor:
    """Main class for orchestrating the PDF preprocessing pipeline"""
    
    def __init__(self):
        self.input_dir = Path(INPUT_PDF_DIR)
        self.output_dir = Path(OUTPUT_JSON_DIR)
        
        # Ensure directories exist
        self.input_dir.mkdir(parents=True, exist_ok=True)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def process_all_documents(self) -> Dict[str, bool]:
        """
        Process all configured documents
        
        Returns:
            Dictionary mapping document names to success status
        """
        results = {}
        
        logger.info("Starting PDF preprocessing pipeline")
        logger.info(f"Input directory: {self.input_dir}")
        logger.info(f"Output directory: {self.output_dir}")
        
        for pdf_filename, json_filename in DOCUMENT_MAPPINGS.items():
            logger.info(f"\n{'='*50}")
            logger.info(f"Processing: {pdf_filename} -> {json_filename}")
            logger.info(f"{'='*50}")
            
            success = self.process_single_document(pdf_filename, json_filename)
            results[pdf_filename] = success
            
            if success:
                logger.info(f"✅ Successfully processed {pdf_filename}")
            else:
                logger.error(f"❌ Failed to process {pdf_filename}")
        
        # Print summary
        self._print_summary(results)
        return results
    
    def process_single_document(self, pdf_filename: str, json_filename: str) -> bool:
        """
        Process a single PDF document through the pipeline
        
        Args:
            pdf_filename: Name of the PDF file to process
            json_filename: Name of the output JSON file
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Step 1: Check if input file exists
            pdf_path = self.input_dir / pdf_filename
            if not pdf_path.exists():
                logger.error(f"Input file not found: {pdf_path}")
                return False
            
            # Step 2: Extract content from PDF
            logger.info("Step 1: Extracting content from PDF...")
            text_blocks, metadata = extract_pdf_content(str(pdf_path))
            
            if not text_blocks:
                logger.error("No content extracted from PDF")
                return False
            
            logger.info(f"Extracted {len(text_blocks)} text blocks")
            
            # Step 3: Structure the content
            logger.info("Step 2: Structuring content...")
            doc_id = json_filename.replace('.json', '')
            
            # Use PDF title if available, otherwise use filename
            title = metadata.get('title', '') or pdf_filename.replace('.pdf', '')
            
            structured_doc = structure_pdf_content(doc_id, text_blocks, metadata, title)
            
            if not structured_doc.get('sections'):
                logger.error("No sections created during structuring")
                return False
            
            logger.info(f"Created {len(structured_doc['sections'])} sections")
            
            # Step 4: Enrich with metadata
            logger.info("Step 3: Enriching with domain metadata...")
            enriched_doc = enrich_document_content(structured_doc)
            
            # Step 5: Validate the result
            logger.info("Step 4: Validating processed document...")
            validation_errors = validate_processed_document(enriched_doc)
            
            if validation_errors:
                logger.warning("Validation warnings found:")
                for error in validation_errors:
                    logger.warning(f"  - {error}")
            
            # Step 6: Save to JSON
            logger.info("Step 5: Saving to JSON...")
            output_path = self.output_dir / json_filename
            save_json(enriched_doc, str(output_path))
            
            logger.info(f"Saved processed document to: {output_path}")
            
            # Step 7: Print processing statistics
            self._print_document_stats(enriched_doc, pdf_filename)
            
            return True
            
        except Exception as e:
            logger.error(f"Error processing {pdf_filename}: {e}")
            logger.exception("Full traceback:")
            return False
    
    def _print_document_stats(self, document: Dict[str, Any], pdf_filename: str) -> None:
        """Print statistics about the processed document"""
        sections = document.get('sections', [])
        
        # Count sections by type
        type_counts = {}
        category_counts = {}
        importance_counts = {}
        
        for section in sections:
            section_type = section.get('type', 'unknown')
            type_counts[section_type] = type_counts.get(section_type, 0) + 1
            
            metadata = section.get('metadata', {})
            category = metadata.get('category', 'unknown')
            importance = metadata.get('importance', 'unknown')
            
            category_counts[category] = category_counts.get(category, 0) + 1
            importance_counts[importance] = importance_counts.get(importance, 0) + 1
        
        logger.info(f"\n📊 Document Statistics for {pdf_filename}:")
        logger.info(f"   Total sections: {len(sections)}")
        logger.info(f"   Section types: {dict(type_counts)}")
        logger.info(f"   Categories: {dict(category_counts)}")
        logger.info(f"   Importance levels: {dict(importance_counts)}")
    
    def _print_summary(self, results: Dict[str, bool]) -> None:
        """Print summary of all processing results"""
        successful = sum(1 for success in results.values() if success)
        total = len(results)
        
        logger.info(f"\n{'='*50}")
        logger.info(f"PROCESSING SUMMARY")
        logger.info(f"{'='*50}")
        logger.info(f"Total documents: {total}")
        logger.info(f"Successful: {successful}")
        logger.info(f"Failed: {total - successful}")
        
        if successful == total:
            logger.info("🎉 All documents processed successfully!")
        elif successful > 0:
            logger.warning(f"⚠️ {successful}/{total} documents processed successfully")
        else:
            logger.error("❌ No documents processed successfully")


def main():
    """Main entry point for the preprocessing pipeline"""
    try:
        processor = PDFPreprocessor()
        results = processor.process_all_documents()
        
        # Exit with appropriate code
        if all(results.values()):
            sys.exit(0)  # Success
        else:
            sys.exit(1)  # Some failures
            
    except KeyboardInterrupt:
        logger.info("Processing interrupted by user")
        sys.exit(130)
    except Exception as e:
        logger.error(f"Unexpected error in main: {e}")
        logger.exception("Full traceback:")
        sys.exit(1)


if __name__ == "__main__":
    main() 