# INPUT:

<!-- Provide the following:
Branch name: feat/cage-availability-tracking
Target branch: dev (or main for hotfixes)
Summary of change: what you did and why
Key implementation details (for the How section)
Testing done:
Related issue(s): #18 -->

---

# INSTRUCTIONS:

1. Generate a PR title following the title rules below.
2. Generate the full PR body using the required sections below.
3. Recommend the appropriate label(s).
4. Generate a merge commit message to be used when squash-merging
   the PR into the target branch.

---

# RULES:

## PR Title

- Mirrors the commit subject line format: `<type>(<scope>): <subject>`
- Max 72 characters
- Imperative mood, no period at the end
- Must be specific enough to understand the change at a glance

## PR Body Sections

The project uses `.github/PULL_REQUEST_TEMPLATE.md` — GitHub will
pre-fill the body when you open a PR. Fill in each section:

### Summary

- One sentence covering both what and why
- Written for someone scanning a list of PRs

### What

- One sentence: what does this PR introduce or change?
- Focus on the outcome, not the implementation

### Why

- One sentence: what problem does this solve?
- This is the motivation — why this work was needed now

### How

- Bullet list of key implementation decisions and trade-offs
- This is the section that differs from a commit body:
  PRs include How because reviewers need implementation context
  before they can approve — commit bodies do not include How
  because the code already shows it
- Do not list every file changed — list decisions, not a file index

### Testing

- Describe how the change was verified
- Include manual steps, automated tests, or both
- Mention edge cases tested if relevant

### Related

- Fill in `Closes #<issue>` in the Linked Issue field
- Link related PRs in the body if applicable

## Labels

Use one or more:

- `feature` → new functionality
- `bug` → bug fix
- `hotfix` → urgent production fix
- `chore` → maintenance, dependencies, config
- `refactor` → structural change, no behavior change
- `docs` → documentation only
- `test` → test additions or changes
- `breaking` → includes a breaking change

## Merge Commit Message (for squash merge)

- Format: `<type>(<scope>): <subject> (#<PR number>)`
- Used when squash-merging to keep a clean linear history on `dev`/`main`
- The PR number links the merge commit back to the full discussion

## General Rules

- PRs must be atomic — one concern per PR
- Target `dev` for all regular work; `main` only for hotfixes
- Request at least one reviewer before merging
- Do not merge your own PR without a review except in emergencies

---

## OUTPUT FORMAT

```
## PR TITLE
feat(booking): add real-time cage availability tracking

## BASE BRANCH
dev

## COMPARE BRANCH
feat/cage-availability-tracking

## LABELS
feature

## PR BODY

## Summary

<!-- One sentence: what does this PR do? -->

## Type of Change

<!-- Check the one that applies -->

- [ ] `feat` — new feature
- [ ] `fix` — bug fix
- [ ] `refactor` — restructuring, no behavior change
- [ ] `test` — tests only
- [ ] `docs` — documentation
- [ ] `chore` — deps / config / CI
- [ ] `style` — formatting only

## Scope

<!-- Which area of the app is affected? e.g. auth, appointments, search -->

## Linked Issue

<!-- Required — every PR should close an issue -->

Closes #

## Sprint

<!-- e.g. Sprint 2 — Appointment Booking -->

## What Changed

<!-- Briefly list key files or components touched and why -->

-
-

## Screenshots / Demo

<!-- For UI changes, paste a screenshot or screen recording. Delete this section if not applicable. -->

---

## What

<!-- What does this PR introduce or change? -->

## Why

<!-- What problem does this solve? -->

## How

<!-- Key implementation decisions and trade-offs -->

## Testing

<!-- How was this verified? Include manual steps or automated tests -->

---

## Pre-Merge Checklist

- [ ] Synced with `dev` before opening this PR (`git fetch origin && git merge origin/dev`)
- [ ] All tests pass locally (`npm test` in both `client/` and `server/`)
- [ ] No `console.log` left in production code
- [ ] Self-reviewed my own diff before requesting review
- [ ] Added or updated tests for the changes made
- [ ] No new ESLint errors (`npm run lint`)

---

## Merge Commit Message (squash merge)

feat(booking): add real-time cage availability tracking (#42)
```
