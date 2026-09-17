# tiQtoQ Software Developer Interview Challenge [![CI](https://github.com/Gideon877/tiQtoQ-Dev-Interview-Challenge/actions/workflows/ci.yml/badge.svg)](https://github.com/Gideon877/tiQtoQ-Dev-Interview-Challenge/actions/workflows/ci.yml)

Build a **Change Risk Analyser**: a small application that helps a development team understand the testing risk associated with a proposed software change.

## Scenario

We build platforms that help software teams integrate AI throughout the Software Development Lifecycle.

Your challenge is to add a small feature to an existing Next.js application that helps a development team understand the **testing risk associated with a software change**.

You should aim to spend approximately **1–2 hours** on the challenge.

---

## Start here: Fork this repository

All activity for this challenge **MUST** happen in a fork of this public repository on your own GitHub account.

1. Fork this repository to your own GitHub account using the **Fork** button on GitHub.
2. Clone your fork locally and make all changes and commits in that fork.
3. Do not commit directly to the original repository. The original repository should only be used as the source for your fork with your final submission being a pull request on your forked repository.

Use your own fork URL in the commands below:

```powershell
git clone https://github.com/<your-github-user>/tiQtoQ-Dev-Interview-Challenge.git
Set-Location tiQtoQ-Dev-Interview-Challenge
git remote add upstream https://github.com/tiQtoQ-UK/tiQtoQ-Dev-Interview-Challenge.git
```

The `upstream` remote is optional, but can be used to retrieve updates from the original repository if needed. Push your work to `origin`, which must be your fork.

## The Feature

Build a **Change Risk Analyser**.

A user should be able to enter a description of a proposed software change, for example:

> Add the ability for administrators to reset another user's MFA configuration.

Your application should analyse the change and present useful information back to the development team.

At a minimum, display:

- **Risk Level:** Low / Medium / High
- **Areas potentially impacted**
- **Recommended testing activities**

For example:

### Risk
**High**

### Impacted Areas
- Authentication
- User permissions
- Audit logging
- Security

### Recommended Testing
- Verify only authorised administrators can reset MFA.
- Verify existing MFA users continue to authenticate successfully.
- Verify the reset action is recorded in the audit log.
- Verify users cannot reset another user's MFA through the API without permission.

---

# Requirements

## Required

Your solution should:

- Use **TypeScript**
- Use **Next.js**
- Accept a description of a software change
- Analyse the change
- Present the result clearly to the user
- Be structured in a way that could reasonably be extended in a production application

The analysis mechanism is deliberately left open to you.

You may use:

- deterministic application logic
- an AI model
- a combination of both

We are more interested in your engineering decisions than the visual design of the application.

---

# Things We Value

There isn't one correct implementation.

We will particularly look at the following areas.

## Software Design

We'd like to see code that demonstrates:

- clear separation of concerns
- sensible abstractions
- readable TypeScript
- appropriate error handling
- components/classes/functions with clear responsibilities

Avoid unnecessary complexity — this is a small feature.

---

## Get started

### Prerequisites

- [Node.js 22 LTS](https://nodejs.org/) or later
- Git

The repository pins its `pnpm` version. Corepack, included with supported Node.js releases, will use it automatically.

```powershell
corepack enable
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The Change Risk Analyser page is the UI integration point for your work.

## Workspace layout

```
ui/       Next.js TypeScript UI starter
api/      TypeScript API workspace — choose and add your own framework
shared/   Empty TypeScript workspace for contracts or reusable code you choose to share
```

`api` intentionally has no source files, HTTP framework, routes, or dependencies. `shared` intentionally has no contracts or validation. Define those boundaries as part of your solution; do not use Next.js API routes for the backend.

## The challenge

Spend approximately **1–2 hours** adding a feature that accepts a description of a proposed software change and presents a useful analysis to the development team.

For example:

> Add the ability for administrators to reset another user's MFA configuration.

At a minimum, display:

- a risk level: Low, Medium, or High;
- areas potentially impacted; and
- recommended testing activities.

Your solution must use TypeScript, Next.js, and a standalone TypeScript API. The analysis may use deterministic logic, an AI model, or both. AI is optional.

The supplied UI is static on purpose: connect its action to your API and replace the empty assessment states with your result. It is not a partial solution to the challenge.

## Useful commands

```powershell
pnpm dev        # start the Next.js UI
pnpm typecheck  # type-check the UI
pnpm lint       # lint the UI
pnpm build      # create a production UI build
```

Add API and shared-package commands as your design requires. Update the root commands if your finished solution needs to run the UI and API together.

## What we value

We assess engineering judgement more than feature quantity. Prioritise clear TypeScript, separation of concerns, appropriate error handling, and highly testable business logic. A small, well-tested solution is preferable to a large feature that is hard to understand or verify.

AI is not required. If you use it, treat it as an external, non-deterministic dependency: make the provider replaceable, validate its output before use, and handle malformed responses or failures deliberately.

---

# Bonus Ideas

If you have time, you could implement one or more of the following:

- Generate suggested test cases using AI
- Categorise tests as Unit / Integration / API / UI
- Identify security or accessibility concerns
- Allow the user to regenerate recommendations
- Show why the change was given its risk rating
- Return structured AI output rather than free-form text
- Add observability around AI requests
- Add an abstraction allowing different AI models to be selected
- Deploy the application to Azure
- Add Aspire support (https://aspire.dev) to allow easy local deployment

These are deliberately optional.

**Do not sacrifice code quality to implement bonus functionality.**

---

## Submission

Push your completed source code and commits to your fork, then open a pull request **on your forked repository**. Add `@chrisusher-tt` as the reviewer.

Please document running instructions, assumptions, and a short note on what you would improve with more time. 

Be ready to discuss your architecture, testing approach, AI usage (if any), and time-based trade-offs.




# Solution

## Overview

Implements the Change Risk Analyser described above. A user submits a
description of a proposed software change (for example, *"Add the ability
for administrators to reset another user's MFA configuration"*) and the
app returns a risk level, the areas likely impacted, and recommended
testing activities.

The analysis is a deterministic rule engine — no AI in the hot path. See
[AI usage](#ai-usage) for the reasoning.

The project is a pnpm monorepo with three packages:

- `api` — Express/Node service exposing `POST /api/analyze`
- `ui` — Next.js front-end that calls the API
- `shared` — TypeScript types shared between `api` and `ui`

## Running locally

Requirements: Node >= 22, pnpm 12.

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs the API and UI in parallel. The UI expects the API on
`http://localhost:4000`.

### Option A — plain pnpm

```bash
pnpm --filter @dev-interview-challenge/api dev   # API on :4000
pnpm --filter @dev-interview-challenge/ui dev    # UI on :3000
```

### Option B — Aspire (recommended)

Aspire starts both services together, wires service discovery, and gives
you a dashboard with logs, traces, and health.

```bash
aspire run
```

Open the dashboard URL printed in the terminal. Both `api` and `ui` should
appear as healthy resources.

### Tests

```bash
pnpm --filter @dev-interview-challenge/api test
```

## How the analyzer works

`analyzeChangeRisk` is a pure function. It takes a change description and
matches it against a declarative table of rules. Each rule has a set of
keywords, a risk level, an impacted area, and testing activities.

Matching is normalized: the input is lowercased and any run of
non-alphanumeric characters is collapsed to a single space, then each
keyword is matched as a whole token. This avoids the classic `\b` problem
around punctuation like `ci/cd` and `third-party`.

The overall risk is the highest risk among triggered rules
(High > Medium > Low). Impacted areas and testing activities are
de-duplicated across rules.

## Architecture

- **Pure core, thin edges.** The rule engine is a pure function with no
  I/O, no framework, and no time dependency. The API layer only parses
  input and serializes output. This makes the core trivially testable and
  means an AI provider can be added later without touching the rules.
- **Shared types.** `AnalyzeRiskRequest` and `AnalyzeRiskResponse` live
  in `shared` and are imported by both `api` and `ui`. There is one
  source of truth for the contract.
- **Deterministic by default.** The analyzer does not call an LLM. Given
  the same input, it always returns the same output. That's deliberate —
  see [AI usage](#ai-usage) below.

## Testing approach

Unit tests cover the pure function end-to-end:

- empty and whitespace-only input
- unmatched input
- each risk level individually
- escalation when rules of different levels match together
- multi-word and punctuated keywords (`ci/cd`, `third-party`, `credit card`)
- de-duplication of impacted areas and testing activities

The tests are fast, deterministic, and have no network or filesystem
dependencies. CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests,
and build on every push and PR.

## AI usage

None in the shipped code. The analyzer is rule-based on purpose:

- the assessment is short and the domain is narrow enough that rules are
  sufficient
- deterministic output is easier to review, test, and defend than a
  prompt-shaped response
- an LLM in the hot path would add latency, cost, and a dependency on an
  external service for a problem that doesn't need one

If AI were added later, I'd treat it as an external, non-deterministic
dependency:

- put it behind a small provider interface alongside the rule engine
- validate its output against a schema before returning it
- fall back to the rule engine on malformed responses, timeouts, or
  provider errors
- keep the rule engine as the authoritative baseline so behaviour doesn't
  drift silently

## Assumptions

- Change descriptions are short, free-text, and in English.
- A single description maps to a single risk assessment. There is no
  notion of "changes that depend on other changes".
- Risk level is a coarse three-value enum (`Low`, `Medium`, `High`).
  Adding `Critical` should be a small change.
- The rules are indicative, not exhaustive. They're designed to be easy
  to edit and extend as a team's vocabulary evolves.

## With more time

1. **Fix remaining matching edge cases.** The normalizer handles the
   known cases, but there are still gaps around plurals (`token` vs
   `tokens`) and stemmed forms (`encrypt` vs `encrypted`). A simple
   stemming step or an explicit `aliases` field per rule would close
   most of it.
2. **Configuration over code.** Move `RULES` into a JSON or YAML file
   loaded at startup. That lets non-engineers tune the vocabulary, and
   makes the engine trivial to test against fixtures.
3. **Risk rationale in the response.** Return *why* a rating was chosen
   (which rules fired, which keywords matched). Reviewers often want to
   know whether an assessment is trustworthy, not just what it says.
4. **Larger test corpus.** Add a table-driven test that reads real
   change descriptions and asserts on the expected output. That catches
   regressions in rule changes and becomes the spec.
5. **Observability.** Add request IDs and a simple counter/histogram for
   analyze calls. Useful if this ever gets exposed to a wider audience.
6. **Second UI surface.** A "what changed?" panel that shows the
   triggered rules would make the tool feel less like a black box
   without adding meaningful complexity.