# Enhanced PDF Pre-processing Plan for Hierarchical Structure

**Version:** 1.1
**Date:** June 3, 2025
**Objective:** To upgrade the PDF pre-processing pipeline to accurately parse and structure contract documents with multi-level hierarchies (Sections > Capital Letters > Numbers > Lowercase Letters, and LOAs), resulting in a richer JSON output that reflects this detailed structure. This plan emphasizes robust handling of diverse PDF structures and edge cases.

This plan outlines the steps derived from Phase 7, Part 1 of the main development plan.

## Part 1: Advanced Hierarchical PDF Parsing & Structuring

### Task 1: In-depth Analysis of Contract Structure (Conceptual Prerequisite)

*   **Status:** Conceptually completed.
*   **Action:** While direct analysis by the AI is not feasible for local files, the development team should internally perform/review a thorough examination of `current-contract.pdf` (and `proposed-contract.pdf` eventually) to:
    1.  **Map Hierarchical Patterns:**
        *   Identify markers for Sections (e.g., `SECTION 1`, `ARTICLE IV`), Capital Letter items (`A.`, `(B)`), Numbered items (`1.`, `(2)`), and Lowercase Letter items (`a.`, `(b)`).
        *   Document typical indentation levels for each hierarchy.
        *   Note font characteristics (size, weight, style) associated with each level's headings.
        *   Analyze the structure of Letters of Agreement (LOAs), including how they are introduced and structured.
    2.  **Document Edge Cases & Inconsistencies:** 
        *   Explicitly list variations in numbering (e.g., `1.`, `(1)`, `i)`), indentation, font usage (e.g., bolding inconsistencies for similar levels), and any ambiguous structures.
        *   Identify scenarios like lists embedded within paragraphs, multi-line headers, and sections that might not strictly follow the primary hierarchical pattern.
        *   Pay special attention to how LOAs or appendices might deviate from main body formatting.
*   **Output:** An internal document or shared understanding of the contract's structural conventions, exceptions, and specific edge cases. This informs all subsequent tasks and the design of a robust parsing logic.

### Task 2: Implement Advanced PDF Library Feature Extraction

*   **Objective:** Extract detailed text block coordinates, font information, and line information using PyMuPDF.
*   **Location:** Python scripts within `scripts/pdf_preprocessing/`.
*   **Steps:**
    1.  **Confirm PyMuPDF Installation:** Ensure `PyMuPDF` (fitz) is in the project's Python environment.
    2.  **Create/Update Utility Script (e.g., `utils_layout.py`):**
        *   **Function `extract_raw_page_data(page: fitz.Page) -> list[dict]`:**
            *   Utilize `page.get_text("dict")` or `page.get_text("rawdict")` from PyMuPDF.
            *   For each text *span* within each *line* within each *block*, extract:
                *   `text: str`
                *   `bbox: tuple (x0, y0, x1, y1)` (span's bounding box)
                *   `origin: tuple (x,y)` (span's origin)
                *   `font_name: str` (e.g., "Helvetica-BoldMT")
                *   `font_size: float`
                *   `font_flags: int` (raw flags from PyMuPDF)
                *   `color: int` (text color)
            *   Also, capture `bbox` for each `line` and `block`.
        *   **Function `parse_font_flags(flags: int) -> dict`:**
            *   Input: `font_flags` from span data.
            *   Output: A dictionary like `{'is_bold': bool, 'is_italic': bool, 'is_superscript': bool, ...}`.
            *   Reference PyMuPDF documentation for flag meanings (e.g., bit 1 for italic, bit 4 for bold).
        *   **Function `normalize_text_block_info(raw_block_data: dict, page_number: int) -> dict`:**
            *   Input: A block's data from `page.get_text("dict")`, `page_number`.
            *   Process spans to determine overall block properties:
                *   Concatenated `text` from spans.
                *   Overall `bbox` for the block.
                *   `indentation_level: float` (typically `block['bbox'][0]`).
                *   `avg_font_size: float`.
                *   `dominant_font_name: str`.
                *   `is_bold_block: bool` (e.g., if majority of text is bold).
                *   `is_italic_block: bool`.
                *   `page_number: int` (add page number to each block for context)
            *   This function will structure data into a list of clean `TextBlock` dictionaries, ready for parsing. Each `TextBlock` should represent a semantically grouped piece of text with its style and position attributes.
    3.  **Testing:**
        *   Write a test script that loads `current-contract.pdf`, iterates through a few sample pages, calls these utility functions, and prints the extracted, structured information.
        *   Verify coordinates, font details, and derived properties (bold, italic, indentation) against manual inspection of the PDF.

### Task 3: Develop Hierarchical Parsing Logic & Algorithms

*   **Objective:** To build the core parsing engine that uses the data from Task 2 to construct a nested hierarchical representation of the PDF content.
*   **Location:** New Python script, e.g., `hierarchical_parser.py` in `scripts/pdf_preprocessing/`.
*   **Steps:**
    1.  **Define Core Data Structures:**
        *   **`TextBlock` (as produced by `normalize_text_block_info` in Task 2):**
            ```python
            # Conceptual TextBlock structure
            # {
            #     'text': str,
            #     'bbox': tuple[float, float, float, float],
            #     'indentation_level': float,
            #     'avg_font_size': float,
            #     'dominant_font_name': str,
            #     'is_bold': bool, # Simplified from span details
            #     'is_italic': bool, # Simplified from span details
            #     'page_number': int
            # }
            ```
        *   **`HierarchyNode`:**
            ```python
            # Conceptual HierarchyNode structure
            # {
            #     'id': str, # Unique ID
            #     'type': str, # e.g., "document", "section", "loa", "capital_letter_item", "number_item", "lowercase_letter_item", "paragraph"
            #     'identifier_text': str | None, # e.g., "1", "A", "LOA 1"
            #     'title_text': str | None, # Captured title line of the section/item
            #     'content_text_blocks': list[TextBlock], # TextBlocks forming direct content
            #     'page_number_start': int,
            #     'page_number_end': int,
            #     'children': list[HierarchyNode], # Nested child nodes
            #     # Optional: 'font_characteristics_header': dict (font info of the header line)
            #     # Optional: 'indentation_header': float (indentation of the header line)
            # }
            ```
    2.  **Implement `HierarchicalParser` Class:**
        *   **Initialization (`__init__`):** Takes configuration (regex patterns, indentation thresholds - potentially loadable from a config file).
        *   **Main Method (`parse_document(pages_text_blocks: list[list[TextBlock]]) -> list[HierarchyNode]`):**
            *   Input: A list of pages, where each page is a list of `TextBlock` objects (output from Task 2, aggregated per page).
            *   Maintain a parsing state: `current_hierarchy_stack: list[HierarchyNode]`.
            *   Iterate through `TextBlock` objects page by page, block by block.
    3.  **Implement Tiered Identification Logic (methods within `HierarchicalParser`):**
        *   **Tier 0: Paragraph Coalescing & Line Merging (Pre-step):**
            *   Before attempting to identify headers, merge vertically adjacent `TextBlock`s that likely form a single paragraph or a multi-line header. 
            *   Conditions for merging: similar indentation, small vertical gap, consistent font (or expected font transition for multi-line headers), and logical text flow. This step is crucial for handling headers that span multiple lines or paragraphs broken across blocks by PyMuPDF.
        *   **Detecting Headers (Section, LOA, A, 1, a):**
            *   For each `TextBlock`, attempt to match it as a header for each tier, from highest (Section) to lowest (lowercase letter).
            *   **`is_section_header(block: TextBlock) -> tuple[bool, str, str]`:** Returns (match, identifier, title).
                *   Uses regex (e.g., `r"^\s*SECTION\s+([IVXLCDM\d]+)\s*[:.]?\s*(.*)"`).
                *   Checks font size/weight (e.g., significantly larger/bolder than typical body text).
                *   Checks indentation (e.g., close to left margin).
            *   **`is_capital_letter_header(block: TextBlock, parent_indent: float) -> tuple[bool, str, str]`:**
                *   Regex: `r"^\s*([A-Z])\s*[.)]\s*(.*)"` (Consider variations like `(A)`).
                *   Indentation: Greater than `parent_indent` but within expected range for this level.
            *   **`is_number_header(block: TextBlock, parent_indent: float) -> tuple[bool, str, str]`:**
                *   Regex: `r"^\s*(\d+)\s*[.)]\s*(.*)"` (Consider variations like `(1)`).
                *   Indentation: Greater than `parent_indent`.
            *   **`is_lowercase_letter_header(block: TextBlock, parent_indent: float) -> tuple[bool, str, str]`:**
                *   Regex: `r"^\s*([a-z])\s*[.)]\s*(.*)"` (Consider variations like `(a)`).
                *   Indentation: Greater than `parent_indent`.
            *   **`is_loa_header(block: TextBlock) -> tuple[bool, str, str]`:**
                *   Regex for LOA titles (e.g., `r"^\s*LETTER OF AGREEMENT\s*#?\s*(\w+).*"`). Adapt based on observed LOA naming.
                *   Usually at a low indentation level, similar to Sections.
        *   **Managing Hierarchy Stack:**
            *   When a header is identified:
                1.  "Close" any open nodes in the `current_hierarchy_stack` that are at the same or lower level than the new header.
                2.  Remove them from the stack.
                3.  Create a new `HierarchyNode` for the identified header.
                4.  Add it as a child to the node now at the top of the stack (its parent).
                5.  Push the new node onto the stack.
            *   If a `TextBlock` is not a header:
                1.  It's content. Append it to the `content_text_blocks` of the `HierarchyNode` currently at the top of the stack.
                2.  Update `page_number_end` of the current node.
        *   **Indentation-Based Level Changes:** If a `TextBlock` that is not a header has significantly *less* indentation than the header of the current node at the top of the stack, it might signal the end of the current item's scope. Pop nodes from the stack until the parent node's indentation level is less than or equal to the current block's indentation. This needs to be robust against minor indentation variations within a paragraph's content.
    4.  **Content Aggregation:** Ensure all text content, including multi-line paragraphs, is correctly assigned to its parent node in the `content_text_blocks` list.
    5.  **Cross-Page Continuity:** The parser should naturally handle this if it processes blocks sequentially across pages, as the `current_hierarchy_stack` maintains context. Ensure logic correctly re-establishes context if a new page starts mid-section.
    6.  **Handling Ambiguity and Fallbacks:**
        *   If a block doesn't match any header type but isn't clearly content of the current node (e.g., unexpected indentation), classify it as a general "paragraph" or "content block" associated with the current parent, but log a warning for review.
        *   Implement a strategy for "dangling content" – text that doesn't seem to belong to any recognized hierarchy. It might be appended to the last known valid node or a special "unclassified" node, with logging.
    7.  **Final Output:** The `parse_document` method should return a list of top-level `HierarchyNode` objects (typically Sections and LOAs).

### Task 4: Refine JSON Output Structure

*   **Objective:** Modify the existing JSON generation script to produce output conforming to the new hierarchical schema.
*   **Location:** Update the main PDF pre-processing script (e.g., `scripts/pdf_preprocessing/preprocess.py`).
*   **Steps:**
    1.  **Define JSON Schema:** Formalize the target JSON structure. Each node should include:
        *   `id: str` (unique identifier)
        *   `type: str` (e.g., "section", "capital_letter_item", "number_item", "lowercase_letter_item", "loa_section", "paragraph_chunk")
        *   `identifier_text: str | None` (e.g., "1", "A", "LOA 1")
        *   `title_text: str | None` (captured title line)
        *   `content_text: str` (aggregated textual content belonging *directly* to this element, before any sub-elements; formed by joining `text` from its `content_text_blocks`)
        *   `page_number_start: int`
        *   `page_number_end: int`
        *   `children: list[dict]` (array of child node objects, following the same schema recursively)
        *   `metadata: dict` (optional, for original font styles, exact bboxes of content, etc., if needed for advanced rendering)
    2.  **Implement `convert_node_to_json(node: HierarchyNode) -> dict`:**
        *   A recursive function that takes a `HierarchyNode` and converts it and its children into the defined JSON dictionary structure.
        *   For `content_text`, concatenate the `text` fields from the `node.content_text_blocks`.
    3.  **Update Main Script:**
        *   Call the `HierarchicalParser` to get the structured data.
        *   Use `convert_node_to_json` to generate the final JSON output for `contractA.json` and `contractB.json`.

### Task 5: Testing and Iteration (PDF Parsing)

*   **Objective:** Thoroughly test and refine the entire hierarchical parsing pipeline.
*   **Steps:**
    1.  **Unit Tests:**
        *   For `utils_layout.py`: Test font flag parsing, coordinate extraction.
        *   For `hierarchical_parser.py`: Test individual header detection methods with sample `TextBlock` inputs. Test stack management logic.
    2.  **Integration Tests:**
        *   Process `current-contract.pdf` (and later `proposed-contract.pdf`).
        *   Manually inspect the output JSON for selected sections/pages:
            *   Is the hierarchy depth correct?
            *   Are items correctly nested?
            *   Is all text content captured and assigned to the right node?
            *   Are page numbers accurate for each node?
            *   Are LOAs handled correctly?
    3.  **Iterative Refinement:**
        *   Based on test results, adjust:
            *   Regex patterns for headers (make them more flexible to account for variations found in Task 1).
            *   Indentation thresholds (perhaps define ranges or relative changes rather than fixed values).
            *   Font characteristic criteria (allow for variations in boldness/size).
            *   Logic for handling specific edge cases identified in Task 1 and during testing (e.g., by adding special rules or pre-processing steps for known problematic patterns).
        *   This will likely be the most time-consuming part, requiring multiple cycles of coding, testing, and adjustment. Maintain a log of challenging cases and how they were addressed.

### Task 6: Update Validation Scripts

*   **Objective:** Enhance `scripts/pdf_preprocessing/validate_json.py` to check the new hierarchical structure.
*   **Steps:**
    1.  Add checks to validate the new `type` fields.
    2.  Implement recursive checks to ensure `children` arrays are correctly formatted.
    3.  Verify that `page_number_start` and `page_number_end` are logical (e.g., end >= start, children's page ranges are within parent's).
    4.  Check for orphaned text or incorrectly nested items if possible (though full semantic validation is hard).

### Task 7: Documentation

*   **Objective:** Update all relevant internal documentation.
*   **Steps:**
    1.  Document the new Python scripts (`utils_layout.py`, `hierarchical_parser.py`).
    2.  Update the main `preprocess.py` documentation.
    3.  Detail the new JSON schema.
    4.  Explain any new configuration options for the parsing (e.g., if thresholds are configurable).

## Potential Challenges & Mitigation (Reiteration from Main Plan)

*   **Inconsistent PDF Formatting:**
    *   **Mitigation:** Design the parser with flexibility in mind. Use configurable thresholds (e.g., for indentation differences, font size variations). Implement robust logging for ambiguous structures or parsing decisions to flag them for manual review or rule refinement. The detailed edge case analysis from Task 1 is key here. Develop a set of heuristic rules that can be adjusted.
*   **Complex Layouts (Tables, Multi-column text, Images):**
    *   **Mitigation:** For the initial implementation, the primary focus is on the main hierarchical text flow. Advanced analysis for tables/figures might be deferred or handled by identifying their bounding boxes and treating them as opaque content blocks within the hierarchy. If tables heavily disrupt flow, specific pre-processing rules might be needed to "isolate" or "skip over" table blocks during hierarchical parsing, or to extract tabular data separately if required by future features.
*   **OCR Errors (if text-based PDFs are not always available):**
    *   **Mitigation:** Current plan assumes text-based PDFs. If OCR is introduced, ensure highest quality OCR. Parsing logic will be more susceptible to OCR errors.

This plan provides a detailed roadmap for enhancing the PDF pre-processing pipeline. Successful execution, with a strong focus on handling variability and edge cases, will significantly improve the application's ability to understand and utilize the detailed structure of the contract documents. 