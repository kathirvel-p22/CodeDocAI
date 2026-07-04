# Software Architecture Document (SAD)
## CodeInsight AI - Enterprise AI Software Engineering Inspector
**Version**: 1.0  

---

## 1. System Layers & High-Level Components
CodeInsight AI is structured with clean, decoupled layers to ensure high scalability and easy maintenance:

```
+-------------------------------------------------------------+
|                     Presentation Layer                      |
|            React SPA + Tailwind CSS + Recharts UI           |
+------------------------------+------------------------------+
                               | REST APIs / SSE Progress
+------------------------------v------------------------------+
|                    Application & API Layer                   |
|          FastAPI Gateway + Long-polling Job Managers         |
+------------------------------+------------------------------+
                               | Background Job Queues
+------------------------------v------------------------------+
|                     Orchestration Layer                     |
|           Multi-Agent AI Shared Context Coordinator         |
+---------------+--------------+--------------+---------------+
                |              |              |
+---------------v--+    +------v-------+    +-v---------------+
| Parser Engine    |    | RAG Pipeline |    | Analysis Agents |
| Local AST parser |    | ChromaDB     |    | Gemini LLM /    |
| Framework detect |    | embeddings   |    | Heuristics      |
+------------------+    +--------------+    +-----------------+
```

---

## 2. Multi-Agent Orchestration Blueprint
Diagnostics are executed by specialized, decoupled AI Agents coordinated by a central workflow manager.

### 2.1 Execution Sequencing
1. **Parser & Static AST Analyzer**: Processes the uploaded files to establish the structural map, dependency tree, and codebase lines/metrics. Writes directly to the `Shared Context`.
2. **Parallel Agent Execution**:
   - **Architecture Agent**: Evaluates package separation, modularity, and circular structures.
   - **Security Agent**: Matches against OWASP guidelines, hardcoded keys, and validation gaps.
   - **Performance Agent**: Evaluates connection pools, CPU limits, nested loops, and memory usage.
   - **Maintainability Agent**: Inspects code duplication, cyclomatic complexity, and SOLID patterns.
   - **Testing Agent**: Maps out test files, mocks, and coverage gaps.
3. **Risk Prediction Agent**: Consumes Parallel Agent outputs to model downtime likelihood and scaling issues.
4. **Engineering Decision Agent**: Prioritizes issues based on technical severity and estimated developer hours, creating the prioritized Sprint roadmap.
5. **Senior Mentor Agent**: Translates technical outputs into educational code tutorials for developer growth.
6. **Engineering Report Agent**: Synthesizes final JSON documents, preparing visualizations and markdown reports.

---

## 3. RAG & Prompt Engineering Strategy
Instead of blindly appending large directories, CodeInsight AI uses a structured retrieval pipeline:
1. **Functional Chunks**: Code files are parsed into functions, classes, and configuration modules.
2. **Context Compression**: Embeddings are queried semantically, filtering for only high-relevance source code files to fit perfectly within the token budget.
3. **Prompt Decomposition**: Sub-agents use targeted prompts with strict JSON schemas, preventing model drift and conversational noise.
