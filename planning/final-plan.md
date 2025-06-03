# Focused Development Plan: Post-Setback Reorganization

**Date:** June 3, 2025 (Revised)
**Objective:** To outline a clear path forward after a development setback, focusing on stabilizing the environment, implementing advanced hierarchical PDF preprocessing, and enhancing the UI to present this hierarchical data effectively. This plan supersedes previous `final-plan.md` versions and aligns immediate efforts with core project goals.

---

## Phase 1: Stabilization & Foundation Audit (Immediate Priority)

**Goal:** Ensure a stable development environment and verify the integrity of foundational components. This phase incorporates critical tasks from the previous "Phase T".

**Tasks:**

1.  **1.1: Resolve Directory Structure & Execution (High Priority)**
    *   **Description:** Fix the issue requiring the dev server to run from a nested directory. Enable execution from the root `contract-chatbot/` directory.
    *   **Reference:** `unified-plan.md` (Task T1), `SPEC_SHEET.md` (Technical Debt).
    *   **Success Criteria:** `npm run dev` (once implemented) and build commands execute successfully from the project root.

2.  **1.2: Implement `npm run dev` Script (High Priority)**
    *   **Description:** Add the `npm run dev` script (e.g., `"dev": "next dev"`) to `package.json`.
    *   **Reference:** `unified-plan.md` (Task T2), `SPEC_SHEET.md` (Technical Debt).
    *   **Success Criteria:** `npm run dev` successfully starts the Next.js development server from the corrected root directory.

3.  **1.3: Verify/Re-implement Frame-Specific Scrolling (High Priority UI)**
    *   **Description:** Ensure each contract panel scrolls independently, preventing whole-page scrolling. This was previously marked complete in Phase 7.5 but needs verification or re-implementation due to data loss.
    *   **Reference:** `unified-plan.md` (Task T3), `SPEC_SHEET.md` (Phase 7 UI/UX Refinements).
    *   **Success Criteria:** Contract content panels scroll independently without affecting the main application layout.

4.  **1.4: Update File Structure Documentation (Medium Priority)**
    *   **Description:** Review and update the "Architecture and File Structure" section in `planning/SPEC_SHEET.md` to accurately reflect the current project state, especially after Phase 6 components and any foundational elements that survived.
    *   **Reference:** `unified-plan.md` (Task T4).
    *   **Success Criteria:** `planning/SPEC_SHEET.md` accurately documents the project's file structure.

---

## Phase 2: Advanced Hierarchical PDF Preprocessing (Core Priority)

**Goal:** Implement the enhanced PDF pre-processing pipeline to accurately parse and structure contracts with multi-level hierarchies, producing a rich, nested JSON output. This phase is based on the detailed plan in `planning/pdf-parsing.md`.

**Tasks (Summarized from `planning/pdf-parsing.md`):**

1.  **2.1: Review Contract Structure Analysis (Prerequisite)**
    *   **Description:** Internally re-confirm the understanding of hierarchical patterns, edge cases, and inconsistencies in `current-contract.pdf` and `proposed-contract.pdf`.
    *   **Reference:** `pdf-parsing.md` (Task 1).

2.  **2.2: Implement PDF Library Feature Extraction (Python)**
    *   **Description:** Develop/Refine `utils_layout.py` to extract detailed text block coordinates, font information, and line information using PyMuPDF.
    *   **Reference:** `pdf-parsing.md` (Task 2).

3.  **2.3: Develop Hierarchical Parsing Logic & Algorithms (Python)**
    *   **Description:** Develop/Refine `hierarchical_parser.py` to use extracted data (from 2.2) to construct a nested hierarchical representation of PDF content.
    *   **Reference:** `pdf-parsing.md` (Task 3).

4.  **2.4: Refine JSON Output Structure**
    *   **Description:** Update JSON generation scripts to produce output conforming to the new hierarchical schema, including `id`, `type`, `identifier_text`, `title_text`, `content_text`, page numbers, and `children`.
    *   **Reference:** `pdf-parsing.md` (Task 4).

5.  **2.5: Thorough Testing & Iteration**
    *   **Description:** Conduct unit and integration tests on the parsing pipeline, iteratively refining logic, regex, and thresholds.
    *   **Reference:** `pdf-parsing.md` (Task 5).

6.  **2.6: Update Validation Scripts**
    *   **Description:** Enhance `validate_json.py` to check the new hierarchical structure, types, and logical consistency (e.g., page ranges).
    *   **Reference:** `pdf-parsing.md` (Task 6).

---

## Phase 3: Hierarchical Data Presentation - Core UI Implementation (Core Priority)

**Goal:** Enhance the user interface to effectively display and allow interaction with the new hierarchically structured contract data.

**Tasks:**

1.  **3.1: Design & Implement `HierarchicalSection.tsx` (React Component)**
    *   **Description:** Create or refine a React component to render individual hierarchical sections. Features: distinct styling per level, collapsible content (keeping header/metadata visible), chevron icons, display of hierarchy type, parent path, etc.
    *   **Reference:** `SPEC_SHEET.md` (Phase 7 UI/UX Refinements, `HierarchicalSection.tsx` details), `unified-plan.md` (Task 7B.1).
    *   **Success Criteria:** A functional and visually clear component for rendering nested sections.

2.  **3.2: Integrate `HierarchicalSection.tsx` into Document Display**
    *   **Description:** Update `DocumentViewer.tsx` and its `SectionRenderer.tsx` to utilize `HierarchicalSection.tsx` for displaying the new structured data. Ensure backward compatibility or a clear fallback for non-hierarchical data if necessary.
    *   **Success Criteria:** Documents are rendered using the new hierarchical view.

3.  **3.3: Enhance `DocumentOutline.tsx` for Hierarchy**
    *   **Description:** Update the document outline component to support hierarchical navigation (e.g., tree view with expand/collapse for outline items). Filter to show major sections initially.
    *   **Reference:** `SPEC_SHEET.md` (Phase 7 Frontend Integration: DocumentOutline Navigation).
    *   **Success Criteria:** Outline allows intuitive navigation of the hierarchical structure.

4.  **3.4: Verify/Re-implement Panel Collapse Behavior**
    *   **Description:** Ensure major UI panels (Current Contract, Proposed Contract, Analysis Tools sidebar, Document Outline) are independently collapsible and that titles/chevrons behave as previously specified (e.g., rotated text for collapsed sidebars, chevrons to the left of headings). This was part of Phase 7/7.5.
    *   **Reference:** `SPEC_SHEET.md` (Phase 7 & 7.5 features).
    *   **Success Criteria:** Panel collapse/expand UIs are functional and intuitive.

---

## Future Considerations (Post-Core Priorities)

Once the above phases are substantially complete and stable, development can revisit:

*   Advanced Template Features & Export Enhancements.
*   Enhanced cross-reference navigation (leveraging hierarchy).
*   Performance optimizations for the new data structures.
*   Mobile-first navigation improvements for hierarchical data.
*   Advanced search and filtering leveraging hierarchy.
*   Other UI/UX refinements from previous plans.

This revised plan aims to provide a focused approach to recovery and progress on key features. 