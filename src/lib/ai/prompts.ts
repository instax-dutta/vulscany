/**
 * AI Prompt Templates for Security Fixes
 */

export interface MasterFixPromptOptions {
    repoName: string;
    vulnerabilities: any[];
    techStack: {
        reactVersion: string;
        framework: string;
        isTypeScript: boolean;
    };
}

/**
 * Generates a master one-shot prompt for vibe coders to fix all vulnerabilities
 */
export function generateMasterFixPrompt(options: MasterFixPromptOptions): string {
    const { repoName, vulnerabilities, techStack } = options;

    const vulnerabilityList = vulnerabilities.map((v, i) => {
        const lang = techStack.isTypeScript ? 'tsx' : 'jsx';
        return `
### Issue ${i + 1}: ${v.title} (${v.severity.toUpperCase()})
- **File**: \`${v.file}\`
- **Line**: ${v.line || 'N/A'}
- **Description**: ${v.description}
- **Vulnerable Code Context**: 
\`\`\`${lang}
${v.snippet || '// Snippet not available for this issue'}
\`\`\`
- **Goal**: ${v.recommendation}
`;
    }).join('\n');

    return `
# VullScanny Master Security Fix Mission 🛡️

I am scanning the project **${repoName}** and I need you to fix the following security vulnerabilities in one shot. 
This project uses **${techStack.framework}** (${techStack.reactVersion}) with **${techStack.isTypeScript ? 'TypeScript' : 'JavaScript'}**.

## 🛠️ THE VULNERABILITIES:
${vulnerabilityList}

## 🎯 YOUR MISSION:
1. Provide a concise explanation for each fix.
2. Provide the EXACT code replacements for each file.
3. If dependencies need to be updated, specify the command (e.g., \`npm install react@latest\`).
4. Ensure all fixes are modern, secure, and follow best practices (e.g., using DOMPurify for HTML, rehype-sanitize for markdown, etc.).

## ⚡ ACTION PLAN FOR VIBE CODING:
- If you are an AI assistant (like Cursor or Windsurf), please go through the files and apply these changes immediately.
- Use the most efficient and standard security libraries.
- Keep the logic intact, only harden the security.

Let's secure this project! 🚀
`;
}

/**
 * Refines the individual high-quality fix prompt for "vibe coders"
 * This prompt is designed to be copy-pasted into an AI IDE like Cursor or Windsurf.
 */
export function generateSingleFixPrompt(vuln: any, techStack: any): string {
    const framework = techStack.hasNext ? 'Next.js' : 'React';
    const lang = techStack.hasTypeScript ? 'TypeScript' : 'JavaScript';

    return `
# 🛠️ SECURITY FIX REQUIRED: ${vuln.title}
Project Tech Stack: ${framework} (${lang})

## 📍 VULNERABILITY LOCATION
- **File**: \`${vuln.file}\`
- **Line**: ${vuln.line || 'N/A'}

## ⚠️ THE ISSUE
${vuln.description}

## 🔍 VULNERABLE CODE
\`\`\`${techStack.hasTypeScript ? 'tsx' : 'jsx'}
${vuln.snippet}
\`\`\`

## 🚀 YOUR MISSION (FOR AI ASSISTANT/VIBE CODER)
1. **Understand**: This code is vulnerable to ${vuln.title}.
2. **Action**: Replace the vulnerable snippet with a secure implementation.
3. **Best Practice**: ${vuln.recommendation}.
4. **Implementation**: 
   - Use standard security libraries like \`dompurify\` if needed.
   - If it's an SSR issue, ensure sanitization before returning props.
   - Maintain the original business logic but harden the implementation.

Please provide the corrected code block and briefly explain the improvement.
`;
}

