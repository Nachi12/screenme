# ScreenMe Scoring Methodology

**Version:** `scoring-v1.0.0` | **Analysis Version:** `analysis-v1.0.0`

## Core Separation Principle
ScreenMe never merges ATS Compatibility, Job Match, and HR Screening Verdict into an unexplained single "employability score". Each is evaluated independently with transparent criteria.

## 1. ATS Compatibility Score (0–100, Deterministic)
Computed strictly by rule-based checks in `atsAnalyzer.service.ts` (zero LLM involvement).

| Check | Max Points | Evaluation |
| :--- | :---: | :--- |
| Text Extractability | 20 | Verifies non-empty, readable UTF-8 text (detects image-only PDFs) |
| File Format & Size | 10 | Valid PDF/DOCX under configured limit |
| Contact Information Visibility | 15 | Email, phone, and optional LinkedIn/GitHub present in extractable text |
| Standard Section Headings | 20 | Recognizable headings (Education, Skills, Projects/Experience) |
| Chronology & Structure Clarity | 15 | Date patterns, bullet structure, readable line length |
| Relevant JD Terminology Density | 10 | Canonical overlap of core domain terms (not keyword stuffing) |
| Reading-Order Reliability | 10 | Multi-column/fragmentation heuristic; returns `not_evaluated` (excluded from denominator) if inconclusive |

**Honesty Rule**: Checks requiring rendered layout inspection (e.g., exact font kerning, visual table overlaps on complex PDFs) return `not_evaluated` and are excluded from penalties. Every report displays:
> *"This score estimates compatibility using ScreenMe's documented checks. It does not represent the score assigned by any employer's ATS."*

## 2. Job Match Score (0–100, Deterministic from Validated Evidence)
The LLM classifies evidence; the backend computes all numerical scores.

### Base Category Weights
- Mandatory technical requirements (`must_have`): **40%**
- Relevant projects & practical experience: **25%**
- Core responsibilities alignment: **15%**
- Education & eligibility alignment: **10%**
- Preferred skills (`preferred`): **10%**

*(If a category has no applicable requirements in the JD, its weight is normalized proportionally across the remaining active categories.)*

### Evidence Status Multipliers
| Match Status | Credit Multiplier |
| :--- | :---: |
| `explicitly_demonstrated` (skill + project/work evidence) | `1.00` |
| `partially_demonstrated` (partial depth or adjacent scope) | `0.60` |
| `mentioned_without_evidence` (listed in Skills section only) | `0.30` |
| `not_found` | `0.00` |
| `unable_to_determine` | Excluded from denominator |

### Fresher-Specific Mode (`student`, `fresher`, `0_1_year`, `internship`)
- Academic projects, personal projects, internships, hackathons, open-source PRs, and coursework receive full eligibility in the **Relevant projects & practical experience (25%)** category instead of penalizing absence of multi-year employment.

## 3. HR Screening Verdict (Categorical, Non-Predictive)
Valid verdicts: `Strong Match`, `Potential Match`, `Needs Improvement`, `Significant Gaps`.
ScreenMe never outputs "Selected" or "Rejected" predictions.

