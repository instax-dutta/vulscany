import ts from 'typescript';
import { validateGeneratedCode } from '../validators/code-validator';
import type { Vulnerability } from '../scanner';

export interface FixLadderContext {
    repoFiles: string[];
    rescan: (fixedCode: string) => Promise<Vulnerability[]>;
}

export interface FixLadderResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

export async function runFixLadder(fixedCode: string, ctx: FixLadderContext): Promise<FixLadderResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const basic = validateGeneratedCode(fixedCode, ctx.repoFiles);
    if (!basic.valid) {
        return { valid: false, errors: basic.errors, warnings: basic.warnings };
    }
    warnings.push(...basic.warnings);

    const transpile = ts.transpileModule(fixedCode, {
        reportDiagnostics: true,
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.React },
    });
    const syntaxErrors = (transpile.diagnostics ?? []).filter(d => d.category === ts.DiagnosticCategory.Error);
    if (syntaxErrors.length > 0) {
        return {
            valid: false,
            errors: syntaxErrors.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')),
            warnings,
        };
    }

    const remaining = await ctx.rescan(fixedCode);
    if (remaining.length > 0) {
        errors.push(`Rescan found ${remaining.length} high-severity issue(s) in the fixed code`);
    }

    return { valid: errors.length === 0, errors, warnings };
}
