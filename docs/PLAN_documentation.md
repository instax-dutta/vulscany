# PLAN: Aeglyn Project Doctrine (Enhanced TOON)

## 📋 Objective
Create a "Super-TOON" file that acts as a single-source-of-truth doctrine for the entire **vulscany** project lifecycle. This document will be optimized for organizational LLMs to enable deep reasoning about future features and maintenance.

## 🔍 Deep Discovery (Explorer Agent)
- **Source Mapping**: Map every file in `src/` to its functional role.
- **Logic Extraction**: Document core algorithms (Score calculation, Pattern matching regexes, Rate limit buckets).
- **Dependency Graph**: Interaction between GitHub Client, Redis Cache, and Scan Engine.

## 🛠️ TOON Doctrine Schema

### 1. Project DNA
- Identity, High-Level Vision, Brand Guidelines.

### 2. Engineering Doctrine (Backend)
- **API Registry**: Detailed endpoint signatures, request/response schemas.
- **Middleware Chain**: Auth -> Security Headers -> Rate Limiting -> Error Handling.
- **AI Orchestration**: The "Ollama-First" fallback logic and specific system prompts.

### 3. Architecture & Data Flow
- **Lifecycle of a Scan**: Input -> Validation -> Github Call -> Scanner -> Redis Store -> UI Render.
- **Achievement Engine**: Logic for mapping stats to badges.

### 4. Implementation Details (The "Tit-bits")
- **Patterns**: Exhaustive list of current security regex patterns.
- **Sanitization**: How and where different data types (HTML, Markdown, Source) are escaped.
- **State Management**: Dashboard local state structure and sync logic with user stats.

### 5. Deployment & Reliability
- Cloudflare Tunnel / Vercel Edge configuration.
- Redis configuration (Upstash REST vs ioredis).

## 🚀 Execution Strategy (Implementation Phase)
- **Agent 1: explorer-agent**: Perform a `view_file` on all core `lib/` and `app/api/` files.
- **Agent 2: backend-specialist**: Document the rate-limit and auth implementation.
- **Agent 3: documentation-writer**: Structure the final `vulscany.toon` with maximum information density.

## 🧪 Verification
- Review the final `.toon` for any missing logic (e.g., the recent horizontal widget fix).
