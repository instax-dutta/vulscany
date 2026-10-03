# Security Policy

## Reporting a Vulnerability

If you find a security vulnerability in vulscany itself, report it privately through GitHub Security Advisories on this repository, rather than as a public issue.

Include:

- What the vulnerability allows an attacker to do
- Steps to reproduce, ideally with a minimal repository or snippet
- The affected version or commit
- Any suggested mitigation

You can expect an acknowledgement within a few days and an assessment shortly after. Please give maintainers reasonable time to ship a fix before public disclosure.

## What counts as a vulnerability

In scope:

- RCE, command injection, or path traversal in the scanner or CLI
- Unauthenticated access to scan results, GitHub tokens, or user data
- SSRF through repository or dependency metadata
- A detection rule that silently fails open on a class of vulnerability
- Leaking a stored GitHub access token through logs, errors, or exports

Out of scope:

- Findings in a repository that vulscany scanned (report those to that project's maintainers)
- Vulnerabilities in npm dependencies with no exploitable path through vulscany
- Denial of service from scanning an extremely large repository, unless it is cheap to trigger
- Missing hardening headers with no demonstrated impact

## Supported Versions

vulscany is pre-1.0 and has no tagged release yet. Fixes land on `main`.

| Version | Supported |
|---------|-----------|
| `main` | Yes |
| Commit before the latest security fix | No, update to `main` |

## Disclosure

Please do not open a public issue, pull request, or discussion for an unreported vulnerability. Public channels are indexed by search engines and AI crawlers, which publishes the issue before a fix exists.

vulscany follows coordinated disclosure: fix first, then credit the reporter in the release notes unless anonymity is requested.

## Scanning your own deployment

vulscany stores scan results in `.vulscany/data.json` on the machine that runs it and holds a GitHub access token in an HTTP-only session cookie. Treat both as secrets:

- Keep `.vulscany/` out of version control and off shared storage
- Terminate TLS in front of the app; the session cookie only sets `secure` in production
- Rotate the GitHub OAuth credentials if they are ever exposed
- Scope the OAuth app to the minimum repositories you need