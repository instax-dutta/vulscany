# VullScanny

VullScanny is a public archive of a scrapped AI-assisted application security product.

We built this project all the way to the edge of launch and monetization, but the original moat we were aiming for weakened materially once aggressive open source alternatives started landing in the market. Rather than force a commercial rollout we no longer believed in, we chose to clean the repository up and publish it as an archive.

## Archive Status

- Product status: Scrapped before launch
- Repository status: Public archive
- Maintenance status: No active product roadmap
- Branding note: The original product name has been replaced with VullScanny throughout the codebase

## What This Repo Still Shows

- A Next.js application shell for a security-scanning product
- GitHub OAuth and dashboard workflows
- Scanner, validation, and AI-assisted remediation experiments
- Threat intel, onboarding, and UX work that was close to launch

## Publication Cleanup

Before opening this repository up, we removed or neutralized:

- Hardcoded credential defaults and live-looking OAuth fallbacks
- Production-specific cookie and CORS assumptions
- Launch, pricing, and monetization messaging that implied a live service
- Old brand references tied to the original product name

## Running It Locally

This codebase can still be explored locally, but it now expects you to provide your own environment variables and third-party service configuration explicitly.

```bash
npm install
cp env.example .env.local
npm run dev
```

## Why Keep It Public

The code still has value as:

- A reference implementation for productized security tooling UX
- A snapshot of our technical and design decisions before launch
- A record of a project that was commercially rational to stop

## License

No additional public-use guarantees are implied by the archive status alone. Review the repository license and any third-party dependencies before reusing the code.
