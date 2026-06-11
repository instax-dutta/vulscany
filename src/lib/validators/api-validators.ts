import { z } from 'zod';

export const ExplainRequestSchema = z.object({
    fileName: z.string().max(255).min(1),
    codeSnippet: z.string().max(5000), // Limit payload size to prevent DoS
    issueType: z.string().max(100).min(1),
    vulnerableCode: z.string().max(5000).optional(),
    techStack: z.object({
        hasNext: z.boolean().optional(),
        hasTypeScript: z.boolean().optional(),
        framework: z.string().optional(),
        reactVersion: z.string().optional(),
        isTypeScript: z.boolean().optional()
    }).optional()
});

export type ExplainRequest = z.infer<typeof ExplainRequestSchema>;

/**
 * Sanitizes input to prevent prompt injection and markdown breaking.
 * Replaces backticks with single quotes to ensure code blocks in prompts aren't broken.
 */
export function sanitizeInput(input: string): string {
    if (!input) return '';
    // Replace triple backticks to prevent breaking out of code blocks
    return input.replace(/```/g, "'''");
}
