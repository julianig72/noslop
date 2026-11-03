# Noslop

Clear information. Useful decisions. No template for every task.

Noslop is a small, agent-neutral guide for making reports, decision briefs,
dashboards, tools and reference material that readers can understand and use.
It prioritizes correct facts, visible next steps and accessible presentation,
not a particular assistant or a compulsory word count.

## Use it

Give your assistant the source material, intended reader and desired outcome.
Use the [Noslop skill](plugins/noslop/skills/noslop/SKILL.md) as the design guide.
Specify your language and output format; documents and slides are welcome.
For a small interactive page, start with static HTML.

Example:

> Prepare a decision brief for our operations lead from these notes.
> Write in Spanish. Keep the costs, risks, sources and deadline.
> Follow the Noslop guide at https://github.com/julianig72/noslop.

For an existing artifact:

> Improve this dashboard with Noslop. Preserve the data and its meaning.
> Fix readability and keyboard access. Rebuild only if its structure prevents
> the reader from doing their job.

The full agent instructions live in the skill, rather than a second copy here.

## Install the plugin

In Claude Code, add this repository's marketplace and install its plugin:

```text
/plugin marketplace add julianig72/noslop
/plugin install noslop@noslop
```

Invoke `/noslop` with the material and the task. The `.claude-plugin` files
provide compatibility with that host; the guide itself is not Claude-specific.
For other assistants, supply the linked skill directly; do not assume they
support Claude Code's plugin commands.

## Explore the examples

These are fictional demos, not company policies, customer records or evidence
of real performance. Open the HTML files locally in a modern browser; keep the
adjacent CSS and JavaScript files with them. No export host or server is needed.
The links below point to repository files, not an advertised GitHub Pages site.

| Task | Example |
| --- | --- |
| Decide | [Decision brief](examples/decision-page.html) |
| Catch up | [Monthly report](examples/monthly-report.html) |
| Track work | [Hiring dashboard](examples/hiring-dashboard.html) |
| Follow a process | [Expense guide](examples/expense-guide.html) |
| Present a proposal | [Pitch slides](examples/pitch-slides.html) |
| Calculate | [Deal pricer](examples/deal-pricer.html) |
| Look up a rule | [Support reference](examples/support-cheat-sheet.html) |
| Compare a redesign | [Before](examples/sloppy-dashboard.html) / [After](examples/fixed-dashboard.html) |

The deal pricer is a demonstration, not an approval system. Extra discounts up
to and including 10% need no demo approval; above 10% through 20% produce only
an approval-pending draft that cannot be copied as a client quote. Above 20%
is prohibited. Invalid inputs do not produce a usable quote.

## Creation is not publication

Creating a file does not authorize a push, a new repository or a deployment.
Publish only when the user requests it and agrees to the destination and
visibility. A private source repository does not make its deployed site private.

For sensitive content, use a hosting provider's authenticated access controls
or a properly designed server-side authentication system. It must protect all
pages and assets, manage session expiry and logout, and keep secrets outside
source code. Test access without a session and after logout.
`noindex` is a search-engine hint, **not access control**.

## Checks

Node.js 22.12 or newer is sufficient for dependency-free logic and repository checks:

```text
npm test
```

Browser checks use Playwright and axe-core only as development dependencies:

```text
npm ci
npx playwright install chromium
npm run test:browser
```

They exercise the calculator, keyboard navigation, automated light/dark contrast
checks and responsive overflow at desktop and mobile widths. The deliberately
flawed "before" dashboard is excluded from accessibility checks so the contrast
with the redesign remains intact. Automation does not replace human accessibility
review. No application build or deployment is required.
The same checks run in GitHub Actions.

## Maintenance and legal notices

Maintained in [julianig72/noslop](https://github.com/julianig72/noslop).
Use that repository's issues for maintenance questions; no personal contact
address is supplied.

Noslop is distributed under the [MIT license](LICENSE).
Original copyright notices and honest provenance are preserved in
[ATTRIBUTIONS.md](ATTRIBUTIONS.md). Noslop is an independently maintained fork,
not an assertion that the upstream work was authored here.
