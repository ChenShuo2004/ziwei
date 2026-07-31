# Design QA

## Visual target

- Reference: `C:\Users\ADMINI~1\AppData\Local\Temp\codex-clipboard-79b7f6aa-d2f2-4428-bb7f-8781f5468c18.png`
- Implementation: `artifacts/design-qa/final-1864x876.png`
- Stacked comparison: `artifacts/design-qa/comparison-stacked.png`
- Viewport: `1864 × 876`, DPR `1`
- Route: `/chart?y=1992&m=11&d=18&u=0&p=北京市&c=北京&lo=116.4&g=m`

## Checks

| Area | Result | Notes |
| --- | --- | --- |
| Top toolbar | Passed | Back navigation, six time dimensions, upgrade, school, export, history and feedback align with the reference. |
| Desktop split | Passed | Left pane is 500px; right content begins at x=516 after the inner gutter. Both panes scroll independently. |
| Chart board | Passed | Board begins at y=53, measures 470 × 656, and uses the dense red/blue vertical star layout. |
| Overview header | Passed | Signature, title and subtitle match the supplied content and vertical positions. |
| Radar overview | Passed | Six axes, star subtitles, note and three diagnosis cards match the reference hierarchy. |
| Long report | Passed | Verification row, five-pattern trigger, report sections, evidence, classics and auxiliary diagnosis are present. |
| Fold interactions | Passed | Evidence, classics and auxiliary diagnosis open and close correctly with synchronized labels. |
| Runtime | Passed | TypeScript and ESLint complete with no errors; browser shows no current runtime error. |

## Residual differences

- Minor font rasterization differences remain because the reference browser and local browser render Chinese glyphs slightly differently.
- The generated chart uses the project’s structured star data, so a few auxiliary-star brightness marks can differ by one character from the screenshot while preserving the same layout and density.

## Final result

Passed.
