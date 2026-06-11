# Graph Report - vulscany  (2026-06-11)

## Corpus Check
- 94 files · ~103,400 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 541 nodes · 884 edges · 37 communities (27 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f74348ac`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 35|Community 35]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `POST()` - 15 edges
3. `setCachedThreatData()` - 15 edges
4. `getCachedThreatData()` - 14 edges
5. `cn()` - 13 edges
6. `rateLimit()` - 10 edges
7. `detectStack()` - 9 edges
8. `scanRepository()` - 9 edges
9. `generateThreatIntelligence()` - 9 edges
10. `scripts` - 8 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `generateSingleFixPrompt()`  [INFERRED]
  src/app/api/ai/explain/route.ts → src/lib/ai/prompts.ts
- `POST()` --calls--> `addScanRecord()`  [INFERRED]
  src/app/api/scan/route.ts → src/lib/local-store.ts
- `POST()` --calls--> `updateLastScan()`  [INFERRED]
  src/app/api/scan/route.ts → src/lib/local-store.ts
- `POST()` --calls--> `analyzeRepositoryThreats()`  [INFERRED]
  src/app/api/scan/route.ts → src/lib/threat-intel/index.ts
- `ScanResult` --references--> `WebAppProjectInfo`  [EXTRACTED]
  src/app/dashboard/page.tsx → src/lib/github/stack-detector.ts

## Import Cycles
- None detected.

## Communities (37 total, 10 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (62): dependencies, ai, @ai-sdk/mistral, autoprefixer, class-variance-authority, clsx, cmdk, date-fns (+54 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (25): HERO_COMBOS, metadata, FeaturesSection(), Footer(), FoundersSection(), GitHubAuthButton(), Hero(), Navbar() (+17 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (37): BatchScanRequest, POST(), cacheScanResult(), generateScanCacheKey(), getCachedScanResult(), invalidateScanCache(), memoryCache, sanitizeScanResult() (+29 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (38): cacheAIResponse(), CachedAIResponse, generateCacheKey(), getAICacheStats(), getCachedAIResponse(), prewarmAICache(), fetchCVEsByPackage(), fetchReactCVEs() (+30 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (33): applyPatternFix(), buildFixPrompt(), callMistralForFix(), FixResult, generateBatchFixes(), generateCodeFix(), generateDiff(), buildContextString() (+25 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (23): determineRiskLevel(), explainVulnerability(), extractRecommendations(), generateFixSuggestion(), getMistralRotator(), VulnerabilityExplanation, explainVulnerability(), extractRecommendations() (+15 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (35): description, devDependencies, autoprefixer, eslint, eslint-config-next, jsdom, msw, postcss (+27 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (16): GET(), GET(), addScanRecord(), DATA_DIR, DATA_FILE, defaultData(), exportUserData(), getScanHistory() (+8 more)

### Community 9 - "Community 9"
Cohesion: 0.13
Nodes (14): CommunityPatternsPanel(), EducationPanel(), SecurityTipBanner(), MasterFixDrawer(), MasterFixDrawerProps, RemediationBlock(), THEME_COLORS, ThreatIntelligence (+6 more)

### Community 10 - "Community 10"
Cohesion: 0.17
Nodes (15): AchievementsPanel(), AchievementsPanelProps, CommunityPatternsPanelProps, EducationPanelProps, SecurityScoreWidget(), SecurityScoreWidgetProps, CATEGORY_LABELS, CommunityPattern (+7 more)

### Community 11 - "Community 11"
Cohesion: 0.23
Nodes (9): generateMasterFixPrompt(), generateSingleFixPrompt(), MasterFixPromptOptions, POST(), POST(), withTimeout(), ExplainRequest, ExplainRequestSchema (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.19
Nodes (12): Achievement, ACHIEVEMENTS, calculateScore(), checkAchievements(), getDefaultStats(), loadUserStats(), loadUserStatsFromCloud(), saveUserStats() (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.27
Nodes (8): DEFAULT_PATTERNS, getPatternsByCategory(), getPatternsByFramework(), getTopPatterns(), loadCommunityPatterns(), saveCommunityPatterns(), submitPattern(), voteForPattern()

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (10): Deploy to Vercel, Documentation, Features, Prerequisites, Production Build, Project Structure, Quick Start, Tech Stack (+2 more)

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (4): inter, jetbrainsMono, metadata, SmoothScrollProps

### Community 16 - "Community 16"
Cohesion: 0.25
Nodes (3): DashboardErrorBoundary, Props, State

### Community 17 - "Community 17"
Cohesion: 0.29
Nodes (5): Toast, ToastNotificationProps, ToastNotifications(), toastStyles, ToastType

### Community 18 - "Community 18"
Cohesion: 0.29
Nodes (5): EDUCATIONAL_CONTENT, EducationalContent, getEducation(), getRandomTip(), SECURITY_TIPS

### Community 19 - "Community 19"
Cohesion: 0.33
Nodes (3): modalAnimation, OnboardingProps, tourTransition

### Community 21 - "Community 21"
Cohesion: 0.40
Nodes (3): FixFeedCardProps, severityStyles, Vulnerability

## Knowledge Gaps
- **188 isolated node(s):** `enabled`, `eslintConfig`, `nextConfig`, `name`, `version` (+183 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `POST()` connect `Community 2` to `Community 8`, `Community 3`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **Why does `rateLimit()` connect `Community 2` to `Community 11`, `Community 4`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 0` to `Community 6`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `POST()` (e.g. with `cacheScanResult()` and `getCachedScanResult()`) actually correct?**
  _`POST()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `enabled`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _188 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.03225806451612903 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.0784313725490196 - nodes in this community are weakly interconnected._