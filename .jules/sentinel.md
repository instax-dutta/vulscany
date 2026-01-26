## 2025-05-23 - Input Validation for AI Prompts
**Vulnerability:** Unvalidated user input (code snippets) passed directly to AI prompts, allowing for potential DoS (massive payloads) and Prompt Injection (breaking out of code blocks).
**Learning:** Even "internal" API endpoints protected by auth need strict input validation. AI prompts are sensitive to special characters like backticks which can alter the model's instructions.
**Prevention:** Implement strict schema validation (e.g., Zod) for all API inputs and sanitize content (e.g., escaping backticks) before injecting into prompts.
