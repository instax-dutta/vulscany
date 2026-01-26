# PLAN: SEO Optimization & Compliance Content Update

## 1. Goal
Integrate specific high-value SEO keywords into the documentation and technical pages (Terms, Privacy) while reinforcing Aeglyn's core values (GDPR, Zero-Log, Built for Vibe Coders). Ensure AI bot accessibility for maximum scrapability and reach.

## 2. Target Keywords
- **Informational:**
  - `zero-log AI vulnerability scanner 2026`
  - `GDPR compliant AI vulnerability detection`
  - `zero-knowledge AI app sec pipeline`
- **Commercial:**
  - `real-time AI code security no logging`
  - `privacy-first SAST AI tool`
  - `fast developer AI security scanner no slowdown`
  - `offline AI code scanner no data upload`
  - `instant AI security feedback IDE plugin 2026`

## 3. Implementation Steps

### 3.1 Metadata & Global SEO (`src/app/layout.tsx`)
- Update `keywords` array to include the new 2026 specific keywords.
- Refine `description` and `title` to mention "real-time" and "GDPR compliant" more prominently.
- Ensure `robots` property explicitly allows extended indexing.

### 3.2 Bot Accessibility (`public/robots.txt`)
- Confirm `Allow: /` for all `User-agent: *`.
- Add specific `User-agent` rules if needed for experimental AI bots (e.g., `GPTBot`, `Claude-Enterprise`).

### 3.3 Terms of Service (`src/app/terms/page.tsx`)
- Inject keywords into metadata and section headings.
- Add a new "SEO & Data Policy" or update the "Service Description" to include:
  - "Built for vibe coders"
  - "Real-time AI code security with zero logging"
  - "GDPR compliant AI vulnerability detection"

### 3.4 Privacy Policy (`src/app/privacy/page.tsx`)
- Reinforce "Zero-Log AI vulnerability scanner 2026" branding.
- Explicitly mention "Offline AI code scanner capabilities with no data upload" to satisfy the privacy USP.
- Highlight "Zero-knowledge AI app sec pipeline" in the technical details section.

### 3.5 Components & UI Integration
- (Self-Check) Ensure all landing page sections (Why, Features) utilize these reinforced mottos.

## 4. Verification
- Run `python .agent/skills/seo-fundamentals/scripts/seo_checker.py src/app/layout.tsx`
- Run `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .` to ensure compliance claims don't conflict with current codebase logic.

## 5. Timeline
- Planning: Completed.
- Phase 2 Implementation: Will take ~15 minutes to update 4 core files.
