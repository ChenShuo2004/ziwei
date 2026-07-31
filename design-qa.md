# Design QA

## Comparison target

- User-provided navigation reference: `C:/Users/ADMINI~1/AppData/Local/Temp/codex-clipboard-4238525d-849a-4678-90e9-2cbdeae93266.png`.
- Visual and structural source of truth: the product's existing `命格总览`, captured at `artifacts/design-qa/overview-original-ui-desktop.png`.
- Desktop implementation: `artifacts/design-qa/career-rich-topic-desktop.png`.
- Focused desktop body state: `artifacts/design-qa/career-rich-topic-body.png`.
- Mobile implementation: `artifacts/design-qa/career-rich-topic-mobile.png`.
- Combined source/implementation comparison: `artifacts/design-qa/overview-vs-career-rich-topic.png`.

## Capture normalization

- User crop: 926 × 58 image px; used only to confirm topic order and active-tab treatment.
- Overview source and career implementation: 1440 × 900 CSS px, 1440 × 900 image px, device scale factor 1, light theme, same chart and time state.
- Combined comparison: 1440 × 1800 image px; overview is stacked above career without rescaling.
- Mobile implementation: 390 × 844 CSS px and image px, device scale factor 1.

## State and interactions tested

- Loaded the same 1992-11-18 Beijing chart in the Codex in-app browser.
- Compared the original overview with the upgraded career topic.
- Verified the final topic in the strip, `父母长辈`, renders its own diagnostic questions and action priorities.
- Verified inline `**...**` emphasis renders as semantic bold text instead of raw Markdown.
- Verified the existing topic navigation, report export, copy, chart, and time controls remain unchanged.
- Checked the browser console: no errors.

## Full-view comparison evidence

`artifacts/design-qa/overview-vs-career-rich-topic.png` shows that career now follows the same overview hierarchy:

1. Existing topic tab and title.
2. Existing ancient-pattern entry.
3. Four chart fact pills.
4. Topic-specific six-axis radar.
5. Three chart-specific conclusion cards.
6. Long-form report using the same heading, paragraph, list, divider, and fold styles.

The WARMTH shell, navigation, navy/cream/gold tokens, typography, borders, radii, and controls are unchanged.

## Focused-region evidence

- `artifacts/design-qa/career-rich-topic-body.png` verifies the richer report hierarchy: opening diagnosis, one-line verdict, three key questions, core diagnosis, strength conversion, imbalance risk, chart deduction, linked palaces, current decade, transformations, personalized judgment, action priorities, evidence, classics, risks, and practical advice.
- `artifacts/design-qa/career-rich-topic-mobile.png` verifies the existing mobile navigation and topic summary remain readable at 390 px without adding controls.

## Findings

- No actionable P0/P1/P2 findings remain.
- Typography: the existing WARMTH font stack, heading scale, body line-height, and weight hierarchy are preserved; inline emphasis now renders correctly.
- Spacing and layout: topics reuse the same overview rhythm and responsive card collapse. No horizontal overflow or overlapping content was observed.
- Colors and tokens: no new visual system was introduced. Existing navy, cream, gold, neutral borders, and card surfaces remain unchanged.
- Image quality: there are no new raster assets; the existing chart and radar rendering remain sharp and consistent.
- Copy and content: every topic now has three topic questions, a dedicated palace linkage path, topic-specific opportunity/risk analysis, and three ordered actions.
- Controls and icons: no new navigation or action buttons were added. The existing ancient-pattern control is reused consistently.

## Comparison history

1. Initial P1: the 12 non-overview topics used a generic short report, so their information density and chapter hierarchy were visibly weaker than `命格总览`.
2. Fix: added an exhaustive topic-depth configuration for all 13 topics, upgraded the shared report builder to the full overview hierarchy, enriched cards with actual transformations and lucky/malefic stars, and rendered inline emphasis correctly.
3. Post-fix evidence: `artifacts/design-qa/overview-vs-career-rich-topic.png`, `artifacts/design-qa/career-rich-topic-body.png`, and `artifacts/design-qa/career-rich-topic-mobile.png`.
4. Post-fix result: the topic pages retain distinct content while matching the overview's information density and presentation system.

## Follow-up polish

- P3: future topic-specific classical citations can be expanded as the verified knowledge base grows.

final result: passed
