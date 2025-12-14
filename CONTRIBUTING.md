# 🤝 Contributing to VulnScany

Thank you for your interest in contributing to VulnScany! This guide will help you get started.

---

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help maintain a welcoming environment

---

## How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Create a new issue** with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, Node version, browser)

### Suggesting Features

1. **Open a discussion** or issue
2. Describe the feature clearly
3. Explain the use case
4. Consider privacy implications

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages**
   ```bash
   git commit -m "feat: add vulnerability detection for X"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**

---

## Development Setup

See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.

Quick version:
```bash
npm install
./setup.sh
npm run dev
```

---

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
└── lib/              # Core business logic
    ├── ai/          # AI integrations
    ├── cache/       # Caching system
    ├── github/      # GitHub API
    └── scanner/     # Vulnerability scanner
```

---

## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Define proper types/interfaces
- Avoid `any` unless absolutely necessary

### React Components

- Use functional components
- Use hooks appropriately
- Keep components focused and reusable
- Add prop types

### Code Style

- Use meaningful variable names
- Comment complex logic
- Keep functions small and focused
- Follow existing patterns

### Privacy-First Principles

**CRITICAL**: All contributions must respect our privacy-first approach:

- ❌ Never store user source code
- ❌ Never log sensitive data
- ❌ Never persist GitHub tokens long-term
- ❌ Never send full files to AI providers
- ✅ Process data in memory only
- ✅ Discard data after use
- ✅ Minimize data sent to external APIs

---

## Testing

Before submitting:

1. **Test locally**
   ```bash
   npm run dev
   ```

2. **Test the build**
   ```bash
   npm run build
   npm run start
   ```

3. **Test key flows**:
   - GitHub OAuth login
   - Repository listing
   - Repository scanning
   - AI explanations
   - Logout

4. **Check for errors** in browser console

---

## Commit Message Format

Use conventional commits:

- `feat: add new feature`
- `fix: fix bug in scanner`
- `docs: update README`
- `style: format code`
- `refactor: restructure AI module`
- `test: add tests`
- `chore: update dependencies`

---

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows project style
- [ ] Tests pass locally
- [ ] Build succeeds
- [ ] No console errors
- [ ] Privacy principles respected
- [ ] Documentation updated if needed

### PR Description Should Include

- **What**: What does this PR do?
- **Why**: Why is this change needed?
- **How**: How does it work?
- **Testing**: How was it tested?
- **Screenshots**: If UI changes

---

## Areas for Contribution

### High Priority

- Additional vulnerability detection patterns
- Improved AI prompts for better explanations
- Performance optimizations
- Better error handling
- Accessibility improvements

### Medium Priority

- Additional UI components
- Documentation improvements
- Code refactoring
- Test coverage

### Nice to Have

- Support for other frameworks (Vue, Angular)
- Browser extension
- CLI version
- Additional AI providers

---

## Vulnerability Detection

Adding new vulnerability patterns:

1. Edit `src/lib/scanner/index.ts`
2. Add pattern detection in `scanFileContent()`
3. Define clear severity level
4. Provide beginner-friendly explanation
5. Suggest actionable fix

Example:
```typescript
if (line.includes('unsafePattern')) {
  vulnerabilities.push({
    id: `${filePath}-${lineNum}-pattern-name`,
    type: 'dangerous-api',
    severity: 'high',
    title: 'User-Friendly Title',
    description: 'Clear explanation of the risk',
    file: filePath,
    line: lineNum,
    snippet: extractSnippet(lines, i),
    recommendation: 'Step-by-step fix instructions'
  });
}
```

---

## AI Integration

When modifying AI integrations:

- Keep prompts beginner-friendly
- Limit context sent to AI (max 500 chars)
- Handle API failures gracefully
- Support key rotation
- Log only error types, never prompts

---

## Privacy Auditing

For any changes that touch data handling:

1. Ask: **Is any user data being stored?**
2. Ask: **Could this log sensitive information?**
3. Ask: **Is data properly discarded after use?**
4. Review against privacy policy

If unsure, flag it in your PR for review.

---

## Documentation

Update documentation for:

- New features
- Changed behavior
- New environment variables
- API changes
- Privacy implications

---

## Getting Help

- Open a **Discussion** for questions
- Join community channels (if available)
- Tag maintainers in issues/PRs

---

## Recognition

Contributors will be:

- Listed in README (with permission)
- Credited in release notes
- Recognized in the community

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to VulnScany!** 🛡️

Every contribution, no matter how small, helps make the web more secure for everyone.
