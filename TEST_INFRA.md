# E2E Test Infra: CanisCalm

## Test Philosophy
- Opaque-box, requirement-driven end-to-end test suite for CanisCalm.
- Derived strictly from `ORIGINAL_REQUEST.md` specifications and `PROJECT.md` feature inventory.
- Independent of implementation design details.
- Standard 4-Tier Test Case Design Methodology:
  - Tier 1: Feature Coverage (≥5 test cases per feature for 15 features = 75+ tests)
  - Tier 2: Boundary & Corner Cases (≥5 test cases per feature = 75+ tests)
  - Tier 3: Cross-Feature Combinations (Pairwise interaction coverage = 15+ tests)
  - Tier 4: Real-World Application Scenarios (End-to-end reactive dog walk and training workflows = 8+ tests)

## Feature Inventory Mapping
| # | Feature | Tier 1 Tests | Tier 2 Tests | Tier 3 Tests | Tier 4 Tests |
|---|---------|--------------|--------------|--------------|--------------|
| 1 | Express Server & SQLite DB | 5 | 5 | ✓ | ✓ |
| 2 | Relational Schema & Seed Data | 5 | 5 | ✓ | ✓ |
| 3 | REST API Endpoints | 5 | 5 | ✓ | ✓ |
| 4 | React + Vite Setup | 5 | 5 | ✓ | ✓ |
| 5 | Calming Nature Visual Theme | 5 | 5 | ✓ | ✓ |
| 6 | 5-Tab Navigation System | 5 | 5 | ✓ | ✓ |
| 7 | Real-Time GPS Tracking | 5 | 5 | ✓ | ✓ |
| 8 | Dual Map Engine (Google + Leaflet) | 5 | 5 | ✓ | ✓ |
| 9 | 1-Tap Trigger Logging Drawer | 5 | 5 | ✓ | ✓ |
| 10| Intensity Color-Coded Markers | 5 | 5 | ✓ | ✓ |
| 11| Breed Encyclopedia & Filtering | 5 | 5 | ✓ | ✓ |
| 12| Pet Profile Management | 5 | 5 | ✓ | ✓ |
| 13| Desensitization Training Guides | 5 | 5 | ✓ | ✓ |
| 14| Analytics Dashboard | 5 | 5 | ✓ | ✓ |
| 15| Production Build Verification | 5 | 5 | ✓ | ✓ |

## Test Runner Architecture
- Node.js test runner harness using native `node --test` or custom runner script (`tests/run_e2e.js`).
- Evaluates Express REST API responses, database state integrity, Vite build output, and HTML/CSS UI structure rendering.
