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
## PR Title
feat(booking): add real-time cage availability tracking

## Base Branch
dev

## Compare Branch
feat/cage-availability-tracking

## Labels
feature

## PR Body
(fills .github/PULL_REQUEST_TEMPLATE.md)

Summary:
Adds real-time cage availability tracking to prevent overbooking
across both branches.

Type of Change: feat

Scope: booking

Linked Issue: Closes #18

Sprint: Sprint 3 — Hotel Boarding

---

### What
Adds live cage status checks to the hotel booking confirmation flow.

### Why
Receptionists had no way to check cage occupancy before confirming a
booking, which caused overbooking errors that required staff to
manually call clients and reschedule.

### How
- Added `cageStatus` field to the `Cage` model in Prisma schema
- Created `/api/cages/availability` endpoint in Express
- Updated the booking form in React to display live cage status
- Availability check is scoped by size category (S/M/L/XL) per branch

### Testing
- Manually tested simultaneous bookings at both Makati and Southwoods
- Verified overbooking prevention triggers when all cages are occupied
- Unit tested the availability endpoint with Vitest (6 cases)

Pre-Merge Checklist: all items checked

## Merge Commit Message (squash merge)
feat(booking): add real-time cage availability tracking (#42)
```
