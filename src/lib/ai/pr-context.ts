/**
 * PR Context Utilities
 * Gathers comprehensive project context for AI-generated fixes
 */

interface ProjectContext {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    typescript: {
        strict: boolean;
        target: string;
        module: string;
    };
    framework: {
        name: string;
        version: string;
        isAppRouter: boolean;
    };
    fileImports: string[];
    fileExports: string[];
}

/**
 * Extract imports from a TypeScript/JavaScript file
 */
export function extractFileImports(fileContent: string): string[] {
    const imports: string[] = [];

    // Match: import ... from '...'
    const importRegex = /import\s+(?:(?:\{[^}]*\})|(?:\*\s+as\s+\w+)|(?:\w+))\s+from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(fileContent)) !== null) {
        imports.push(match[1]);
    }

    // Match: import '...'
    const sideEffectImportRegex = /import\s+['"]([^'"]+)['"]/g;
    while ((match = sideEffectImportRegex.exec(fileContent)) !== null) {
        if (!imports.includes(match[1])) {
            imports.push(match[1]);
        }
    }

    return imports;
}

/**
 * Extract exports from a file
 */
export function extractFileExports(fileContent: string): string[] {
    const exports: string[] = [];

    // Match: export function/const/class
    const exportRegex = /export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class|interface|type)\s+(\w+)/g;
    let match;

    while ((match = exportRegex.exec(fileContent)) !== null) {
        exports.push(match[1]);
    }

    return exports;
}

/**
 * Get comprehensive project context
 */
export async function getProjectContext(
    accessToken: string,
    owner: string,
    repo: string,
    fileContent: string
): Promise<ProjectContext> {
    const octokit = await import('@octokit/rest').then(m => new m.Octokit({ auth: accessToken }));

    // Fetch package.json
    let packageJson: any = {};
    try {
        const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: 'package.json'
        });

        if ('content' in data && data.content) {
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            packageJson = JSON.parse(content);
        }
    } catch (error) {
        console.warn('Could not fetch package.json:', error);
    }

    // Fetch tsconfig.json
    let tsConfig: any = {};
    try {
        const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: 'tsconfig.json'
        });

        if ('content' in data && data.content) {
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            tsConfig = JSON.parse(content);
        }
    } catch (error) {
        console.warn('Could not fetch tsconfig.json:', error);
    }

    // Extract framework info
    const deps = packageJson.dependencies || {};
    const devDeps = packageJson.devDependencies || {};
    const hasNextJs = !!deps.next || !!devDeps.next;
    const nextVersion = deps.next || devDeps.next || 'unknown';
    const isAppRouter = nextVersion.startsWith('14') || nextVersion.startsWith('15');

    return {
        dependencies: deps,
        devDependencies: devDeps,
        typescript: {
            strict: tsConfig.compilerOptions?.strict ?? true,
            target: tsConfig.compilerOptions?.target ?? 'ES2020',
            module: tsConfig.compilerOptions?.module ?? 'ESNext'
        },
        framework: {
            name: hasNextJs ? 'Next.js' : 'React',
            version: nextVersion,
            isAppRouter
        },
        fileImports: extractFileImports(fileContent),
        fileExports: extractFileExports(fileContent)
    };
}

/**
 * Build context string for AI prompt
 */
export function buildContextString(context: ProjectContext): string {
    return `
## PROJECT CONTEXT

### Framework
- ${context.framework.name} ${context.framework.version}
${context.framework.isAppRouter ? '- Using App Router (Server Components by default)' : ''}

### Key Dependencies
${Object.entries(context.dependencies).slice(0, 10).map(([pkg, ver]) => `- ${pkg}: ${ver}`).join('\n')}

### TypeScript Configuration
- Strict Mode: ${context.typescript.strict ? 'ENABLED' : 'disabled'}
- Target: ${context.typescript.target}
- Module: ${context.typescript.module}

### Current File Imports
${context.fileImports.length > 0 ? context.fileImports.map(imp => `- ${imp}`).join('\n') : '- No existing imports'}

### Current File Exports  
${context.fileExports.length > 0 ? context.fileExports.map(exp => `- ${exp}`).join('\n') : '- No exports detected'}

## CRITICAL RULES

1. **NEVER REMOVE EXISTING IMPORTS** - Only add new ones if needed
2. **MAINTAIN TypeScript STRICT MODE** - No \`any\` types unless absolutely necessary
3. **PRESERVE EXISTING EXPORTS** - Do not change function signatures
4. **ADD PROPER ERROR HANDLING** - Use try/catch where appropriate
5. **USE MODERN SYNTAX** - Follow ES2020+ standards
6. **NO BREAKING CHANGES** - Code must remain functionally identical except for the security fix
`.trim();
}
