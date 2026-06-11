/**
 * AI Prompt Templates for Security Fixes
 */

export interface MasterFixPromptOptions {
    repoName: string;
    vulnerabilities: any[];
    threatIntelligence?: {
        riskLevel: string;
        riskScore: number;
        cveCount: number;
        advisoryCount: number;
        criticalThreats: number;
        recommendations: string[];
    };
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
    const { repoName, vulnerabilities, techStack, threatIntelligence } = options;

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

    let threatSection = '';
    if (threatIntelligence && (threatIntelligence.riskLevel === 'HIGH' || threatIntelligence.riskLevel === 'CRITICAL')) {
        threatSection = `
## 🚨 SUPPLY CHAIN RISKS (CRITICAL PERIMETER)
- **Risk Level**: ${threatIntelligence.riskLevel} (${threatIntelligence.riskScore}/100)
- **CVE Findings**: ${threatIntelligence.cveCount}
- **Security Advisories**: ${threatIntelligence.advisoryCount}
- **Critical Threats**: ${threatIntelligence.criticalThreats}
- **Immediate Requirements**:
${threatIntelligence.recommendations.map(r => `  - ${r}`).join('\n')}
`;
    }

    const missionPrompt = vulnerabilities.length > 0
        ? `I am scanning the project **${repoName}** and I need you to fix the following security vulnerabilities in one shot.`
        : `I am scanning the project **${repoName}**. No source code vulnerabilities were found, but there are **CRITICAL SUPPLY CHAIN RISKS** that need immediate remediation.`;

    return `
# vulscany Master Security Fix Mission

${missionPrompt}
This project uses **${techStack.framework}** (${techStack.reactVersion}) with **${techStack.isTypeScript ? 'TypeScript' : 'JavaScript'}**.

${vulnerabilityList}
${threatSection}

## 🎯 YOUR MISSION:
1. Provide a concise explanation for each fix.
2. Provide the EXACT code replacements for each file.
3. **CRITICAL**: Suggest the exact commands to fix dependency issues (e.g., \`npm install package@secure-version\` or \`npm audit fix --force\`).
4. Ensure all fixes are modern, secure, and follow best practices.

## ⚡ ACTION PLAN FOR VIBE CODING:
- If you are an AI assistant (like Cursor or Windsurf), please apply these changes and run the suggested dependency updates.
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
