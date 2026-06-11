# vulscany

vulscany is a public archive of a scrapped AI-assisted application security product.

We built this project to the edge of launch, but the moat we were working toward weakened materially once aggressive open source alternatives started landing in the market. Rather than push a commercialization story we no longer believed in, we cleaned the repository up and kept it as a proof-of-concept archive.

## Archive Status

- Product status: Scrapped before launch
- Repository status: Public archive
- Maintenance status: No active product roadmap or launch plan
- Branding note: The original product name has been replaced with vulscany throughout the codebase

## What This Repo Preserves

- A Next.js application shell for a security-scanning product
- Dashboard, onboarding, and scanning UX experiments
- Scanner, validation, and AI-assisted remediation experiments
- Architecture and implementation ideas that were close to launch

## Publication Cleanup

Before opening this repository up, we removed or neutralized:

- Hardcoded credential defaults and live-looking OAuth fallbacks
- Production-specific cookie and CORS assumptions
- Launch, pricing, and monetization messaging that implied a live service
- SEO and app-distribution metadata that made the project look production-ready
- Turnkey setup, deployment, and payment configuration guides
- Old brand references tied to the original product name

## What Was Intentionally Not Preserved

- A ready-to-deploy environment template
- Vercel or payment onboarding instructions
- Search-engine-facing metadata, sitemap, or manifest packaging
- Any promise that this repository is maintained as a reusable starter

## License

No additional public-use guarantees are implied by the archive status alone. Review the repository license and any third-party dependencies before reusing the code.
