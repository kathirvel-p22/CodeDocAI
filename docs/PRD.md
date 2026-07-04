# Product Requirements Document (PRD)
## CodeInsight AI - Enterprise AI Software Engineering Inspector
**Version**: 1.0  
**Category**: AI Developer Productivity Platform  
**Target Audience**: Junior Developers, Software Engineers, Tech Leads, Engineering Managers, Architects

---

## 1. Product Vision & Goals
CodeInsight AI is not a chatbot or single-file linter. It is an **Enterprise AI Software Engineering Inspector** that analyzes entire codebases to understand structural trees, frameworks, database mappings, and dependencies. It operates exactly like an experienced Senior Staff Software Engineer, providing educational, actionable engineering feedback.

### Core Objectives:
1. **Holistic Project Scanning**: Parse entire multi-language projects to understand system architecture, dependencies, and risk models.
2. **Multi-Agent Diagnostics**: Employ specialized AI agents to inspect specific dimensions: Architecture, Security, Performance, Maintainability, Testing, and Production Risk.
3. **Actionable Mentorship**: Don't just flag errors—explain *why*, *where*, and *how* to implement optimal and alternative solutions with their respective trade-offs.
4. **Offline Resilience**: Transition seamlessly to local AST heuristics when the cloud model API returns 503/429 limits, maintaining business continuity.

---

## 2. Functional Requirements
### 2.1 Codebase Uploading & Extraction
- Support ZIP archives, direct directory folder uploads, and Git repository URLs.
- Prevent path traversal, zip slip, and memory overloading during extraction.
- Create static file metadata and language/framework confidence ratings deterministically.

### 2.2 Interactive Review Dashboards
- Display an **Executive Health Score** along with secondary indicators for Modularity, Security, Performance, Maintainability, and Testing.
- Interactive File System browser showcasing highlighted vulnerabilities mapped to specific line numbers.
- Integrated AI Q&A panel providing contextual code explanations and real-time mentoring queries.

### 2.3 Comprehensive Report Generator
- Aggregate all specialized agent diagnostics into unified markdown summaries.
- Allow exports to production-grade PDF formats with dynamic radar charts.

---

## 3. Supported Languages & Technologies
- **Languages**: Java, Python, JavaScript, TypeScript, C#, C++, Go, Rust, PHP, Swift, Kotlin, Dart.
- **Frameworks**: Spring Boot, React, Next.js, Angular, Vue, Express, Node, FastAPI, Flask, Django, Laravel, Flutter, ASP.NET Core.
- **Dependency Managers**: npm, yarn, pnpm, pip, Poetry, Maven, Gradle, Cargo, Composer.
