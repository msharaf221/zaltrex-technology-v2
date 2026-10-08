# Full-Stack Web Audit, Testing & Refactoring Specification
> Generated and configured from MCP `prompts.chat` (`cmufuvrzp0004gm0acz72xb0x` & `cmuqptuc10007ox05qynkhc6s`)  
> Target Repository: **zaltrex-technology** (v0.2.0)  
> Stack: Next.js 16 (Turbopack + App Router), React 19, TypeScript, Tailwind CSS 4, Supabase (PostgreSQL + RLS), Upstash Redis, Google Gemini AI, Playwright

---

## 🎯 Role & Mission

Act as an elite multidisciplinary engineering team composed of:
- **Application Security Engineer (AppSec)**
- **Senior Software Architect**
- **QA Automation & Test Lead**
- **Performance & Frontend Engineer**
- **Database & Compliance Auditor**

Your mission is to perform a **deep, systematic, and verifiable audit, test suite verification, and code refactor** of the entire `zaltrex-technology` repository. You must identify, prioritize, fix, and document all bugs, vulnerabilities, test failures, and technical debt while preserving working functionality and strict security boundaries.

Work with **verifiable evidence**: every change must pass linting, typechecking, database RLS rules, AI rate-limit guards, end-to-end tests, and production build checks.

---

## 📋 Repository Context & Architectural Profile

- **System Name:** Zaltrex Technology Platform
- **Purpose:** Enterprise bilingual (Arabic/English) technology and AI consulting portal featuring interactive solutions, project estimation, security trust center, authenticated service requests, and Gemini-powered assistance with strict server-side rate limits.
- **Critical Components:**
  1. `src/app/api/chat/route.ts` & `src/lib/ai/*`: Google Gemini streaming/chat with in-memory & Upstash Redis fail-closed rate limiting and prompt injection defenses.
  2. `supabase/migrations/*` & `scripts/test-rls.mjs`: Strict Row Level Security policies across profiles, services, requests, messages, and site content.
  3. `src/components/*`: Server & Client components with Framer Motion / Motion DOM, RTL/LTR bidirectional support, and accessibility standards.
  4. `tests/site.spec.ts`: 41 comprehensive Playwright end-to-end tests covering responsive layout, i18n, keyboard navigation, mock AI outages, and security headers.

---

## 🗺️ 8-Phase Audit, Test & Refactor Workflow

### Phase 1: Reconnaissance & Environment Health
1. Verify package tree and binary integrity (`node_modules/@next/swc*`, `motion-dom`, `zod`).
2. Verify lockfile parity and dependencies: `npm ls`.
3. Check CPU/RAM resource limits and ensure memory-safe compilation options.

### Phase 2: Systematic Code Quality & Tech Debt Audit
Evaluate the codebase for:
1. **Dead Code:** Unused exports, functions, components, routes, styles, and unreferenced assets.
2. **Duplicate Logic:** Redundant validation schemas, duplicated translation keys, or repetitive API helpers.
3. **Overly Complex Code:** Excessive branching, unnecessary client components where server components suffice.
4. **Security Hardening:** Ensure headers (`X-Frame-Options`, `CSP`, `Permissions-Policy`), input sanitization (Zod), and fail-closed Redis rate limiting remain intact.
5. **State & i18n Coherence:** Ensure Arabic (`dir="rtl"`) and English (`dir="ltr"`) states remain consistent with zero layout shifts or horizontal overflow.

### Phase 3: Finding Prioritization Matrix
- **Critical (P0):** Security vulnerabilities (injection, auth bypass, RLS leaks, unbounded AI costs). Must fix immediately.
- **High (P1):** Build failures, type errors, broken routes, or unhandled exceptions.
- **Medium (P2):** Test timeouts, bundle size bloat, duplicate abstractions, accessibility gaps.
- **Low (P3):** Formatting, minor styling inconsistencies, dead comments.

### Phase 4: Safe Refactoring (TDD Workflow)
1. **Preserve Contracts:** Never break external schemas (Zod validators, Supabase RLS policies, Next.js route handlers).
2. **Smallest Atomic Changes:** Apply focused changes per file or module.
3. **Continuous Verification Loop:**
   ```bash
   npm run lint
   npm run typecheck
   npm run test:ai-security
   npm run test:db
   npm run build
   ```

### Phase 5: Testing Pyramid Execution
- **Unit / Isolation:** `npm run test:ai-security` (verifies in-memory/Redis fail-closed rate limits, spoofed header rejections, and quota resets).
- **Database / Integration:** `npm run test:db` (executes 85 isolated PostgreSQL RLS checks using PGlite).
- **End-to-End (E2E):** `npm run test:e2e` (executes 41 full-suite Playwright tests across RTL/LTR, mobile viewport, mock AI, and keyboard navigation).
- **Build Verification:** `npm run build` (Next.js 16 Turbopack production compilation).

### Phase 6: Verification Gates (Definition of Done)
- [x] Zero TypeScript compilation errors (`tsc --noEmit`).
- [x] Zero ESLint warnings or errors (`eslint .`).
- [x] 9/9 AI security rate limit guard tests pass.
- [x] 85/85 PostgreSQL RLS policies and migration tests pass.
- [x] 41/41 Playwright tests pass in Chromium.
- [x] `next build` compiles clean with Turbopack in production mode.

---

## 🛠️ Quick Reference Commands

```bash
# 1. Typecheck and Lint
npm run lint && npm run typecheck

# 2. Database & Security Tests
npm run test:ai-security
npm run test:db

# 3. Full E2E Test Suite
npm run test:e2e

# 4. Production Turbopack Build
npm run build
```
