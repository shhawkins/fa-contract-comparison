# Unified Development Plan: Phase T & 7 Kick-off

**Date:** June 3, 2025
**Objective:** This plan synthesizes insights from `gemini-plan-2.md` and consultant feedback (`planning/feedback/03-sonnet-4-consultant-feedback.md`) to provide a clear, actionable roadmap for the immediate next phases of development. It focuses on foundational stabilization (Phase T) and core enhancements for Phase 7 (PDF Parsing and initial UX adaptations).

---

## Phase T: Foundation Stabilization (Immediate Priority)

**Goal:** Stabilize the development environment, resolve critical UX issues, and ensure documentation accuracy. This phase directly addresses the most pressing technical debt.

**Tasks:**

1.  **T1: Resolve Directory Structure Issue (High Priority)**
    *   **Description:** Fix the issue requiring the dev server to run from `/contract-chatbot/contract-chatbot/`. Enable execution from the root `contract-chatbot/` directory.
    *   **Corresponds to:** `gemini-plan-2.md` (Task T1), Sonnet Feedback (Critical Issue 1, Phase T.1).
    *   **Success Criteria:** `npm run dev` and build commands execute successfully from the root directory.

2.  **T2: Implement `npm run dev` Script (High Priority)**
    *   **Description:** Add the `npm run dev` script (e.g., `"dev": "next dev"`) to `package.json`.
    *   **Corresponds to:** `gemini-plan-2.md` (Task T2), Sonnet Feedback (part of "Development Workflow Optimization").
    *   **Success Criteria:** `npm run dev` successfully starts the development server from the corrected root directory.

3.  **T3: Implement Frame-Specific Scrolling (High Priority UI Fix)**
    *   **Description:** Fix scrolling so each contract panel scrolls independently, not the whole page.
    *   **Corresponds to:** `gemini-plan-2.md` (Task 7.B.1), Sonnet Feedback (Critical Issue 2, Phase T.2).
    *   **Actionable Steps Ref:** See `gemini-plan-2.md` (Task 7.B.1) for detailed steps (identify containers, apply CSS, refactor navigation).
    *   **Success Criteria:** Contract panels scroll independently.

4.  **T4: Update File Structure Documentation (Medium Priority)**
    *   **Description:** Update the "File Structure" section in `planning/SPEC_SHEET.md` to reflect the current project state and components from Phase 6/7.
    *   **Corresponds to:** `gemini-plan-2.md` (Task T3), Sonnet Feedback (Phase T.3).
    *   **Success Criteria:** `planning/SPEC_SHEET.md` accurately reflects the project's file structure.

5.  **T5: Review Development Workflow (Medium Priority)**
    *   **Description:** Assess and implement initial improvements for overall development workflow beyond just the `npm run dev` script, based on Sonnet's "Development Workflow Optimization" feedback. This may include reviewing build processes, linting setup, or other developer experience aspects.
    *   **Corresponds to:** Sonnet Feedback (Critical Issue 3).
    *   **Success Criteria:** Identified and implemented initial workflow enhancements.

---

## Phase 7A: Core PDF & Data Enhancement (Short-Term Priority)

**Goal:** Significantly enhance the PDF pre-processing pipeline to understand and represent hierarchical document structures, and begin leveraging this for improved data handling.

**Tasks:**

1.  **7A.1: Advanced Hierarchical PDF Parsing & Structuring (High Priority)**
    *   **Description:** Enhance the PDF pre-processing pipeline to accurately parse and structure contracts with multi-level hierarchies (e.g., Sections > Capital Letters > Numbers > Lowercase Letters, LOAs). This involves detailed analysis, advanced library feature extraction, new parsing logic, and JSON output refinement.
    *   **Detailed Plan:** Refer to `planning/pdf-parsing.md` for the comprehensive, step-by-step implementation plan. This includes handling edge cases and ensuring robustness.
    *   **Corresponds to:** `gemini-plan-2.md` (Task 7.A), Sonnet Feedback (Phase 7A.1 "PDF processing edge case handling").
    *   **Success Criteria (Initial):** Successful extraction and identification of multi-level hierarchical elements from sample PDF pages, producing a more granular and accurately nested JSON output.

2.  **7A.2: Enhance Cross-Reference Navigation (Medium Priority)**
    *   **Description:** Investigate and implement improvements to cross-reference navigation, potentially leveraging the new hierarchical data structure.
    *   **Corresponds to:** Sonnet Feedback (Phase 7A.2).
    *   **Success Criteria:** Improved ability for users or the system to navigate related sections within/across documents.

3.  **7A.3: Initial Performance Optimizations (Medium Priority)**
    *   **Description:** Review and implement initial performance optimizations related to loading, processing, and displaying the new, more granular contract data.
    *   **Corresponds to:** Sonnet Feedback (Phase 7A.3).
    *   **Success Criteria:** Maintain or improve application responsiveness with the new data structures.

---

## Phase 7B: User Experience with New Hierarchy (Medium-Term Priority)

**Goal:** Adapt and enhance the user interface and experience to effectively present and interact with the new hierarchically structured contract data.

**Tasks:**

1.  **7B.1: Improve Hierarchical Nesting Display (High Priority, dependent on 7A.1)**
    *   **Description:** Design and implement UI enhancements to visually represent and allow user interaction with the hierarchically structured content (e.g., collapsible sections, indentation, clear visual cues for depth).
    *   **Corresponds to:** `gemini-plan-2.md` (Task 7.B.2), Sonnet Feedback (Phase 7B.1 "Enhanced panel collapse behavior").
    *   **Actionable Steps Ref:** See `gemini-plan-2.md` (Task 7.B.2) for initial design and prototype steps for `HierarchicalSection.tsx`.
    *   **Success Criteria:** Intuitive and clear presentation and navigation of nested contract items.

2.  **7B.2: Mobile-First Navigation Improvements (Medium Priority)**
    *   **Description:** Review and implement targeted improvements to mobile navigation patterns, ensuring a seamless experience with potentially more complex data views.
    *   **Corresponds to:** Sonnet Feedback (Phase 7B.2).
    *   **Success Criteria:** Enhanced usability and navigation on mobile devices.

3.  **7B.3: Advanced Search and Filtering (Leveraging Hierarchy) (Medium Priority)**
    *   **Description:** Explore and implement enhancements to search and filtering capabilities that leverage the new hierarchical structure (e.g., search within a specific section and its children, filter by hierarchy level).
    *   **Corresponds to:** Sonnet Feedback (Phase 7B.3).
    *   **Success Criteria:** More powerful and context-aware search and filtering.

4.  **7B.4: Address General UI Improvements (Low Priority / Opportunistic)**
    *   **Description:** Implement other smaller UI tweaks based on existing feedback (e.g., from `debrief.md`, consultant feedback) and best practices that are not covered by the above.
    *   **Corresponds to:** `gemini-plan-2.md` (Task 7.B.3).
    *   **Success Criteria:** Tangible improvements to the overall look and feel.

---

## Future Phases (Beyond Immediate Scope of this Unified Plan)

Following the completion of Phases T, 7A, and 7B, development will proceed to address further enhancements as outlined in `planning/final-plan.md` and consultant feedback, including:

*   **Phase 7C / Early Phase 8: Advanced Template Features & Export Enhancements** (from original Phase 7 scope in `final-plan.md` and `debrief.md`)
*   **Phase 8 (Sonnet):** Further development of Template Automation, Community sharing, User Account Features, Enterprise features.

This unified plan will be the primary guide for near-term development efforts. 