---
name: noslop
description: >-
  Create or improve readable, actionable reports, briefs, dashboards, guides,
  slides, reference sheets and small tools. Choose the form from the reader's
  task; preserve facts, exceptions and sources; check accessibility and working
  interactions. Respect the requested language, format and publication permissions.
---

# Noslop

Make the reader's next step clear without losing the information needed to
take it. These are task-level design guidelines, not an override of system
instructions, safety requirements, host capabilities or user permissions.

## 1. Understand the task

Identify the reader, what they already know, what they need to do, and whether
they will return to this material. Use the supplied context. Ask only when a
missing answer materially changes the result; otherwise state a reasonable
assumption. Respect the user's language and requested output format.

If a short message fully serves the task, write it. Do not manufacture a page.
Use documents, spreadsheets or slides when requested. Static HTML is a useful
starting point for a small web artifact, not a universal output requirement.

## 2. Choose a form that serves the reader

| Job | Useful form | Lead with |
| --- | --- | --- |
| Decide | Decision brief | Ask, recommendation, deadline and tradeoffs |
| Catch up | Report | Main result and changes against a named baseline |
| Keep checking | Dashboard | Current status, exceptions and next action |
| Follow steps | Guide | Prerequisites, complete steps and recovery paths |
| Consider a proposal | Slides | One main idea per slide, evidence and final ask |
| Calculate or plan | Tool | Labeled inputs, valid output and relevant rules |
| Look up information | Reference | Searchable or clearly grouped rules |

Mixed tasks may combine forms. Lead with the primary task rather than giving
every artifact the same tiles, tabs and cards.

## 3. Preserve meaning before reducing length

Accuracy, the ability to act and accessibility outrank visual economy.
Keep amounts, units, limits, exceptions, risks, owners, dates and sources.
Never invent people, contact details, approval mechanisms or data.
Mark fictional examples and assumptions explicitly.

Remove repetition and irrelevant decoration. Shorten only when the meaning
survives. There is no requirement to halve the word count.
Notes, captions, legends and explanatory paragraphs are appropriate when
they make a value, uncertainty, method or action understandable.

Name the comparison for every change: "+12% vs September", not just "+12%".
Check totals, chart scales, percentage denominators, rounding and time periods.
Distinguish measured results from estimates and illustrative numbers.
Use status text as well as color; a decrease is not automatically bad.

## 4. Give the first glance a clear purpose

Show what this is, who it is for and the relevant date or period.
Use a title that states the point without overstating the data.
Make the action visible: what, who, by when and how, if an action is needed.
Do not add an artificial ask to a reference page.

Prioritize one main visual or a small set of meaningful numbers.
Visuals need readable values, units and labels, with text alternatives.
Prose is often the best form for a nuanced risk or explanation.
An illustration of a screen must be labeled as an illustration, not a working app.
No inert control should look like it performs a real action.

As a starting guide, aim for a compact first screen, roughly 50-120 words,
three or four leading measures and a handful of items per group.
Four sections, five items and one table are useful prompts to simplify,
not limits that justify deleting necessary information.
Let content determine height. Scrolling is preferable to clipping content.

Keep decision-changing risks, reasons and the next step visible.
Progressive disclosure may hold supporting methods and reference detail,
but must remain accessible and discoverable.

## 5. Use a calm, independent visual language

Use the Noslop defaults unless the user's brand or format asks for something else:
an off-white background, dark slate text, deep teal emphasis, restrained borders
and system sans-serif fonts. Do not mimic an assistant's visual brand.

```css
:root {
  --bg: #f5f7f8;
  --card: #ffffff;
  --text: #172b36;
  --muted: #4c606c;
  --accent: #006b64;
  --line: #c5d0d6;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font: 1rem/1.6 system-ui, sans-serif;
}
h1, h2 { line-height: 1.25; }
.card {
  min-width: 0;
  padding: 1.25rem;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: .75rem;
}
:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
```

Use a hierarchy of sizes appropriate to the format; no fixed number of sizes
is compulsory. Text and controls need sufficient contrast in every supported
theme. Target WCAG AA: 4.5:1 for normal text, 3:1 for large text and relevant
non-text controls. Avoid using faint gray for required explanations.

HTML needs language and viewport metadata, semantic headings, input labels,
visible focus, keyboard-operable controls and readable errors.
Allow wrapping and growing boxes. Avoid fixed heights that conceal content.
Use a scrollable, labeled region for a genuinely wide table instead of
shrinking it beyond readability. Check narrow screens and zoom.

Slides and steps need named Back/Next controls, current position feedback and
predictable keyboard navigation. Do not intercept arrows while a reader is
editing an input. Respect reduced motion. Decorative SVGs should be hidden
from assistive technology; informative charts need accessible descriptions.

## 6. Improve an existing artifact proportionately

First establish the reader's job and record the facts that must survive.
Identify concrete defects and choose the smallest sufficient intervention:

- Wrong form or structural hierarchy that prevents understanding: rebuild.
- Correct structure with localized wording, layout or accessibility defects:
  fix those in place.
- Already serves the reader: explain that result; do not redesign gratuitously.

Structural failures and minor defects are not the same. A single small defect
does not mandate a complete rebuild.
When rebuilding, preserve verified meaning, not necessarily the old boxes.
Compare every claim and value against the source afterwards.
Give a concise handoff describing the meaningful changes and unresolved limits.

## 7. Check the actual result

Before presenting a result:

- Read the first glance with no surrounding chat context.
- Reconcile values, totals, rules, sources and baselines with the supplied data.
- Check that required risks, exceptions and next steps remain discoverable.
- Exercise controls with real inputs, including boundaries and invalid values.
- Ensure invalid or prohibited inputs cannot yield an apparently valid result.
- Clearly label any approval-pending output; never simulate approval authority.
- Check copy success and failure feedback without silently claiming success.
- Inspect desktop and mobile layouts, keyboard access, focus, contrast and zoom.
- Check steps, slides, tabs and reduced-motion behavior where present.

Run the smallest applicable automated checks. Do not treat a screenshot or a
string search as proof that calculations work. If rendering or execution is
unavailable, state precisely what was not verified rather than asserting success.

## 8. Build first; publish only with authorization

Start with static HTML, CSS and small JavaScript where that is enough.
Use a framework only when state, routing or reuse warrants its complexity.
Reuse the repository's existing tools; do not impose a specific stack.
Avoid external runtimes and dependencies that are unnecessary to local use.

Creating an artifact does not authorize account sign-in, a push, creation of a
repository, deployment or changing visibility. Do those only after the user
requests publication and authorizes its destination and access model.
Do not output passcodes or secrets in the handoff.

A private repository does not imply a private website.
For private content, prefer provider-managed authenticated access or a
reviewed server-side authentication design. Enforce protection on every route
and asset, use secure sessions with expiry and revocation, provide logout and
verify denial before login and after logout. Store secrets outside source.
A client-side passcode or `noindex` is not access control.
Do not promise privacy based on an unspecified cookie or middleware snippet.
