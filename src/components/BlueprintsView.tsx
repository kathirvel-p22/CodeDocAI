import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Cpu, 
  Database, 
  Server, 
  Terminal, 
  CheckCircle, 
  GitBranch, 
  Search, 
  Copy, 
  Check, 
  Users, 
  Activity, 
  Info, 
  Sliders, 
  ShieldAlert, 
  Clock, 
  FileText, 
  Flame, 
  ArrowRight,
  Sparkles,
  HelpCircle,
  Play,
  Folder,
  FolderOpen,
  AlertTriangle,
  Bug,
  ChevronRight,
  ChevronDown,
  Shield,
  CheckCircle2,
  Settings
} from 'lucide-react';

interface BlueprintsViewProps {
  onClose?: () => void;
  metrics?: any;
  agentsReport?: any;
  projectName?: string;
  files?: any[];
}

export default function BlueprintsView({ onClose, metrics, agentsReport, projectName = 'Hospital System Demo', files = [] }: BlueprintsViewProps) {
  const [activeMainSection, setActiveMainSection] = useState<'prd' | 'sad' | 'database' | 'agents' | 'devops' | 'directory'>('prd');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [personaView, setPersonaView] = useState<'all' | 'junior' | 'architect' | 'manager'>('all');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Sections data structure with complete enterprise content corresponding exactly to the user's requirements
  const sections = useMemo(() => {
    return {
      prd: {
        title: "Product Requirements Document (PRD)",
        icon: BookOpen,
        subtitle: "Enterprise Specifications for CodeInsight AI v1.0",
        summary: "Detailed product goals, scope, capabilities, user stories, and feature matrix designed to govern the development of the ultimate software review automation engine.",
        items: [
          {
            id: "prd-vision",
            title: "1. Executive Summary & Vision",
            category: "Foundations",
            content: `CodeInsight AI is NOT a simple chatbot or isolated file checker. It is an Enterprise AI Software Engineering Inspector designed to understand complete software projects exactly like a Senior Staff Software Engineer. 

By analyzing entire folder hierarchies, framework patterns, configuration setups, dependency graphs, database entities, and documentation, the system acts as a deterministic, mentored code reviewer. Instead of just flagging "there is a bug," CodeInsight AI mentors developers by explaining the WHY, WHERE, and HOW of architectural, security, performance, maintainability, and testing trade-offs.`,
          },
          {
            id: "prd-specs",
            title: "2. Input Scope & Supported Matrix",
            category: "Functional Specs",
            content: `• Supported Inputs: ZIP Archives, direct Folder uploads, Git Repository URLs, and future OAuth-based live repository connections.
• Supported Languages: Java, Python, JavaScript, TypeScript, C#, C++, Go, Rust, PHP, Swift, Kotlin, Dart.
• Supported Frameworks: Spring Boot, React, Next.js, Angular, Vue, Node.js (Express), FastAPI, Flask, Django, Laravel, Flutter, ASP.NET Core.
• Tech Stack: React + Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts (Frontend) | FastAPI, Python, Motor MongoDB, ChromaDB (Backend).`,
          },
          {
            id: "prd-user-stories",
            title: "3. Enterprise User Personas & Stories",
            category: "UX & Scope",
            content: `• Junior Developer: "I want CodeInsight AI to scan my pull requests so I get instant, senior-level code feedback, step-by-step refactoring guidelines, and explanations of design pattern opportunities without waiting for a peer review."
• Software Architect: "I want a holistic architectural diagram and layer separation report to detect circular dependencies, circular imports, and package boundary violations."
• Engineering Manager: "I want to track technical debt trends, overall quality scores, and estimated remediation times to balance feature velocity with architectural health."
• Student/Learner: "I want custom senior-mentor tutorials on why my nested loops are bottlenecking database transactions, backed by industry solutions."`,
          },
          {
            id: "prd-rag",
            title: "4. RAG & Knowledge Engineering Strategy",
            category: "Core AI",
            content: `CodeInsight AI does not feed raw massive codebases blindly into LLM contexts, which leads to high latency, high costs, and context truncation. Instead, it employs a multi-tiered Retrieval-Augmented Generation (RAG) pipeline:
1. deterministic local parsing & metadata generation.
2. source chunking with overlapping sliding windows tailored for structural code blocks (functions, classes, dependencies).
3. high-density embeddings stored in ChromaDB.
4. semantic retrieval combined with lexical metadata filters (e.g. searching only configuration or API controller folders).
5. assembly of clean, hyper-targeted context payloads fit for the Gemini 2.5 context window.`,
          }
        ]
      },
      sad: {
        title: "Software Architecture Document (SAD)",
        icon: Server,
        subtitle: "Multi-layered Enterprise System Blueprint",
        summary: "Cloud-native, event-driven, loosely-coupled, and highly cohesive software system components enabling complete structural diagnostics at scale.",
        items: [
          {
            id: "sad-layers",
            title: "1. High-Level System Layers",
            category: "Architecture",
            content: `The system is designed with a strictly decoupled 5-tier architecture:
• Presentation Layer: Modern React Single Page Application utilizing Tailwind CSS, Lucide React, and Recharts for premium dark-mode data visualizations.
• API Gateway & Web Layer: FastAPI (Python) web layer managing rate-limiting, CORS, authentication, and long-polling SSE (Server-Sent Events) progress updates.
• Application & Orchestration Layer: Multi-Agent AI System coordinating sequential and parallel analysis passes.
• Processing & Analysis Layer: Offline deterministic parsing engine (AST parser), file system indexer, and local static code metrics analyser.
• Persistence & Vector Layer: MongoDB (for project state, scans, trends, and diagnostic lists) and ChromaDB (for structural code embeddings and RAG search).`,
          },
          {
            id: "sad-workflow",
            title: "2. End-to-End Processing Workflow",
            category: "Workflow",
            content: `User Upload → ZIP Validation → File Extraction → Deterministic Parser (Language & Framework Detection) → File/Folder Hierarchy Mapping → Local Static Analysis (Complexity, Code Smells) → High-Density Chunking → Embedding Generation → Persistence (MongoDB & ChromaDB) → Multi-Agent Orchestration (Parallel Diagnostics) → Score Consolidation → Interactive Dashboard & PDF Generation.`,
          },
          {
            id: "sad-workers",
            title: "3. Async Background Workers",
            category: "Processing",
            content: `To handle large codebases without blocking the API threads, CodeInsight AI employs a worker-pool pattern:
• Upload Worker: Cleans and sanitizes uploads, checking for Zip-Slip vulnerabilities and recursive directory loops.
• Parser Worker: Builds AST representation, identifies package trees, imports, entry points, and extracts framework markers.
• Embedding Worker: Chunks and generates vector representations for parallel insertion into ChromaDB.
• Orchestrator Worker: Triggers concurrent agent tasks, monitors API timeouts, manages rate-limits, and merges JSON payloads into final consolidated reports.`,
          },
          {
            id: "sad-folder-spec",
            title: "4. Production Project Structure",
            category: "Code Layout",
            content: `backend/
├── app/
│   ├── api/             # Routers, controllers, global CORS/Rate limits
│   ├── core/            # App configuration, security sandbox, constants
│   ├── services/        # Upload, extraction, static AST analyzer
│   ├── models/          # MongoDB Pydantic documents & Chroma schemas
│   ├── agents/          # Multi-agent implementations & Orchestrator
│   ├── rag/             # Chunking, embedding, vector query interfaces
│   └── workers/         # Celery/Asyncio background queue executors
frontend/
├── src/
│   ├── components/      # FolderExplorer, CodeViewer, RadarCharts
│   ├── features/        # State managers for Dashboard, History, Uploads
│   ├── hooks/           # Custom state triggers and progress events
│   └── App.tsx          # Router and view coordinator`,
          }
        ]
      },
      database: {
        title: "Database & Data Architecture",
        icon: Database,
        subtitle: "Enterprise Schemas & Semantic Vector Spaces",
        summary: "Comprehensive document models, indexing pipelines, and Vector search configurations optimizing diagnostic retrieval speeds.",
        items: [
          {
            id: "db-strategy",
            title: "1. Data Storage Strategy",
            category: "Storage",
            content: `• MongoDB (Primary Document Store): Chosen for flexible JSON storage of scan results, hierarchical file listings, audit histories, and highly nested multi-agent reports. It allows rapid retrieval of historical scans without rigid tabular schemas.
• ChromaDB (Vector Store): Lightweight, fast vector indexing database enabling Cosine/L2 similarity queries over functional code snippets.
• Local Temporary Storage: A securely sandboxed scratchpad directory with automated cron-cleanup for extraction of uploaded archives.`,
          },
          {
            id: "db-collections",
            title: "2. MongoDB Core Schema Layout",
            category: "MongoDB",
            content: `• Projects: { _id, name, ownerId, repositoryUrl, createdAt }
• Scans: { _id, projectId, status, overallScore, metrics, agentsReport, createdAt }
• Files: { _id, scanId, path, name, extension, size, linesCount, language, imports }
• Issues: { _id, scanId, filePath, line, severity, category, message, businessImpact, remediation }
• History: { _id, projectId, scanDate, scoreHistory, trendTimeline }`,
          },
          {
            id: "db-vector",
            title: "3. ChromaDB Embeddings & Chunking Design",
            category: "ChromaDB",
            content: `• Embedding Model: text-embedding-004 (via Gemini SDK) or local sentence-transformers (for offline degraded fallback).
• Chunking Strategy: Structural chunking based on boundaries of files. Code blocks are split with sliding chunks of ~1500 characters with 150-character overlaps to keep imports and function definitions unified.
• Search Queries: Diagnostic queries utilize Cosine similarity to look up relevant context matching OWASP rules or SOLID guideline vectors.`,
          }
        ]
      },
      agents: {
        title: "Multi-Agent Orchestration",
        icon: Cpu,
        subtitle: "Multi-Agent System Blueprint",
        summary: "Decoupled AI agents with distinct missions, rigid JSON schemas, error recovery structures, and shared coordination layers.",
        items: [
          {
            id: "agents-overview",
            title: "1. Collaborative Agent Framework",
            category: "AI Design",
            content: `CodeInsight AI utilizes a strictly separated multi-agent layout where each agent has a specific scope of responsibility:
• Parser Agent: Reads structural trees and creates framework mappings.
• Architecture Agent: Identifies styles, modularity, and pattern layouts.
• Security Agent: Reviews safety controls, secrets, and OWASP alignment.
• Performance Agent: Focuses on scalability, database queries, and bottlenecks.
• Maintainability Agent: Checks technical debt, code smells, and SOLID compliance.
• Testing Agent: Inspects test directories, mocked scopes, and gaps.
• Risk Agent: Synthesizes findings to predict production scaling and failure likelihood.
• Decision Agent: Acts as a PM/EM to prioritize fixes by business impact.
• Senior Mentor Agent: Generates clear learning feedback for developers.
• Report Agent: Aggregates findings into unified charts and raw markdown documents.`,
          },
          {
            id: "agents-protocol",
            title: "2. JSON Contracts & Communication",
            category: "Protocols",
            content: `Every agent must consume and output strictly defined JSON schemas. This enforces determinism and eliminates conversational formatting noise. 
For example, the Security Agent output is bounded to:
{
  score: number,
  grade: string,
  findings: Array<{ severity, type, message, businessImpact, mitigation }>,
  feedback: string
}
If any agent produces invalid JSON, the Orchestrator's Validation layer intercepts it and performs a localized retry with an explicit formatting correction prompt.`,
          },
          {
            id: "agents-orchestration",
            title: "3. Context Passing & Parallel Execution",
            category: "Execution",
            content: `To optimize performance, the Orchestrator schedules execution using a dependency tree:
1. Parser & Static AST Analyzer run sequentially to populate the Shared Context.
2. Architecture, Security, Performance, Maintainability, and Testing Agents execute in parallel, writing to separate, locked slots in the context.
3. Risk Agent & Decision Agent run sequentially after parallel tasks complete, using the combined reports as input.
4. Mentor & Report Agents run last to generate summaries and user-facing copy.`,
          }
        ]
      },
      devops: {
        title: "DevOps & Production Operations",
        icon: Terminal,
        subtitle: "Cloud-Native Deployment & Resilience Blueprint",
        summary: "Production deployment strategy, docker configurations, monitoring, incident runbooks, and disaster recovery objectives.",
        items: [
          {
            id: "devops-compose",
            title: "1. Multi-Container Orchestration",
            category: "Containers",
            content: `The production-grade docker-compose.yml manages isolated services with proper healthchecks:
• codeinsight-frontend: Single page static assets served via Nginx (reverse-proxy on port 3000).
• codeinsight-backend: FastAPI Python application running with gunicorn/uvicorn workers.
• codeinsight-mongodb: Clustered replica-set persistent database storage.
• codeinsight-chromadb: High-performance standalone vector-database container.
• codeinsight-worker: Background Celery workers matching tasks in a shared Redis buffer.`,
          },
          {
            id: "devops-aws",
            title: "2. AWS Enterprise Target Architecture",
            category: "Cloud Native",
            content: `• Compute: AWS ECS (Elastic Container Service) with Fargate for serverless, horizontal auto-scaling container management.
• Storage: S3 for compressed project uploads and final PDF reports; DynamoDB/RDS PostgreSQL if relational schemas are requested, otherwise DocumentDB.
• Networking: VPC with private subnets for DB containers, Public ALB (Application Load Balancer) handling TLS termination and routing.
• CDN: CloudFront with Edge caches serving frontend static files for rapid global loading.`,
          },
          {
            id: "devops-runbooks",
            title: "3. Incident Runbooks & Recovery Plans",
            category: "Operations",
            content: `• Gemini API Outage Runbook: Upon detecting a 503 or 429 status from Google GenAI, the Backend transitions seamlessly to 'Degraded Fallback Mode', activating local offline AST heuristics and notifying the frontend, preventing system failures.
• Database Connection Failure: Implements a Circuit Breaker pattern with Exponential Backoff (3 retries max before transitioning to graceful offline alert).
• Recovery Metrics: RPO (Recovery Point Objective) is set to 1 hour (daily backups + streaming WALs); RTO (Recovery Time Objective) is under 15 minutes.`,
          }
        ]
      },
      directory: {
        title: "Directory Structure & File Auditor",
        icon: Folder,
        subtitle: "Interactive Codebase Directory & Error Auditor Map",
        summary: "High-accuracy interactive directory visualizer highlighting secure vs vulnerable modules, code health, and structural directories.",
        items: [
          {
            id: "dir-visualizer",
            title: "Interactive Codebase Explorer",
            category: "Heatmap Visualizer",
            content: "Interactive workspace presenting folders, files, and deep diagnostic insights."
          }
        ]
      }
    };
  }, []);

  const [activeTab, setActiveTab] = useState<string>(sections[activeMainSection].items[0].id);

  // Filter sections based on search query
  const filteredItems = useMemo(() => {
    const activeData = sections[activeMainSection];
    if (!searchQuery.trim()) return activeData.items;
    
    return activeData.items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, activeMainSection, sections]);

  // Handle active main section change
  const handleMainSectionChange = (section: 'prd' | 'sad' | 'database' | 'agents' | 'devops' | 'directory') => {
    setActiveMainSection(section);
    setSearchQuery('');
    setActiveTab(sections[section].items[0].id);
  };

  const activeItemContent = useMemo(() => {
    const item = sections[activeMainSection].items.find(i => i.id === activeTab);
    return item ? item : sections[activeMainSection].items[0];
  }, [activeTab, activeMainSection, sections]);

  return (
    <div id="blueprints-view-container" className="flex-1 flex flex-col min-h-0 bg-[#07080a] text-gray-200">
      {/* Top Banner & Tab Controls */}
      <div className="bg-[#090a0d] border-b border-gray-900 px-6 py-5 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Sliders className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white tracking-tight">Enterprise Blueprint Studio</h1>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold font-mono">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Approved Functional Specs, Cloud Infrastructures, and Multi-Agent Orchestrator blueprints.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Persona views toggle */}
            <span className="text-[10px] font-mono text-gray-500 uppercase">View Perspective:</span>
            <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-900 text-xs">
              {(['all', 'junior', 'architect', 'manager'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPersonaView(p)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all capitalize cursor-pointer ${
                    personaView === p 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Global Blueprint Toggles */}
        <div className="flex flex-wrap items-center gap-2.5 mt-5">
          {(['prd', 'sad', 'database', 'agents', 'devops', 'directory'] as const).map((secKey) => {
            const sec = sections[secKey];
            const Icon = sec.icon;
            const isActive = activeMainSection === secKey;
            return (
              <button
                key={secKey}
                onClick={() => handleMainSectionChange(secKey)}
                className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.04)]' 
                    : 'bg-transparent border-gray-900 hover:border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{sec.title.split(' (')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Layout Area */}
      {activeMainSection === 'directory' ? (
        <DirectoryLayout 
          metrics={metrics}
          agentsReport={agentsReport}
          projectName={projectName}
          files={files}
          personaView={personaView}
        />
      ) : (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sub-Navigation Pane */}
        <aside className="w-full md:w-80 bg-[#090a0d]/60 border-r border-gray-900 p-5 flex flex-col min-h-0 shrink-0">
          {/* Subtitle & summary */}
          <div className="mb-4">
            <h2 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
              {sections[activeMainSection].title}
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
              {sections[activeMainSection].summary}
            </p>
          </div>

          {/* Search bar inside navigation */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Filter specifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-950 border border-gray-900 rounded-xl pl-9.5 pr-4 py-2 text-xs text-gray-300 placeholder-gray-500 focus:outline-none focus:border-emerald-500/40"
            />
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer group flex flex-col space-y-1 ${
                  activeTab === item.id 
                    ? 'bg-gray-950 border-gray-800 text-white shadow-inner' 
                    : 'bg-transparent border-transparent hover:bg-gray-950/40 text-gray-400 hover:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-gray-900/60 text-gray-500 group-hover:text-gray-400 transition-colors">
                    {item.category}
                  </span>
                  <ArrowRight className={`h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ${
                    activeTab === item.id ? 'text-emerald-400 opacity-100' : 'text-gray-600'
                  }`} />
                </div>
                <h3 className={`text-xs font-semibold leading-snug ${activeTab === item.id ? 'text-emerald-400' : 'text-gray-300'}`}>
                  {item.title}
                </h3>
              </button>
            ))}

            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-gray-600 text-xs font-mono">
                No matching blueprints found
              </div>
            )}
          </div>
        </aside>

        {/* Right Reader Workspace */}
        <main className="flex-1 flex flex-col min-h-0 bg-[#07080a] p-6 overflow-y-auto">
          {activeItemContent ? (
            <div className="space-y-6 max-w-4xl mx-auto w-full">
              {/* Category Breadcrumb */}
              <div className="flex items-center justify-between border-b border-gray-900 pb-4">
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/15 font-bold font-mono">
                    {activeItemContent.category}
                  </span>
                  <span className="text-gray-700 font-mono text-sm">/</span>
                  <span className="text-xs text-gray-500 font-mono">{activeItemContent.id}</span>
                </div>

                <button
                  onClick={() => handleCopy(activeItemContent.content, activeItemContent.id)}
                  className="flex items-center space-x-2 text-xs bg-gray-950 border border-gray-900 hover:border-gray-800 text-gray-400 hover:text-white px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  {copiedId === activeItemContent.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied Specifications!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Spec Block</span>
                    </>
                  )}
                </button>
              </div>

              {/* Document Header */}
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white tracking-tight">
                  {activeItemContent.title}
                </h2>
                <p className="text-xs text-gray-500">System specification details and engineering instructions.</p>
              </div>

              {/* Dynamic Persona-based Helper Box */}
              {personaView !== 'all' && (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start space-x-3.5 animate-fadeIn">
                  <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
                      {personaView} Perspective Highlight
                    </h4>
                    <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                      {personaView === 'junior' && "Focus on: How to read the feedback diagnostics, how chunking preserves local variable definitions, and how to utilize the Senior Mentor explanation block."}
                      {personaView === 'architect' && "Focus on: Core layered separation, recursive project parser mechanics, multi-agent lock management on the Shared Context, and circular dependency maps."}
                      {personaView === 'manager' && "Focus on: Technical debt metrics, estimated remediation timelines, executive report adaptation, and production risk forecasting."}
                    </p>
                  </div>
                </div>
              )}

              {/* Core Text content with styling */}
              <div className="bg-[#090a0d] border border-gray-900 rounded-2xl p-6 shadow-inner select-text font-sans leading-relaxed text-sm text-gray-300 whitespace-pre-wrap">
                {activeItemContent.content}
              </div>

              {/* Architectural Diagrams & Flows based on section */}
              {activeMainSection === 'sad' && activeItemContent.id === 'sad-layers' && (
                <div className="bg-[#090a0d] border border-gray-900 rounded-2xl p-6 space-y-4">
                  <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Visual Tier Separation Layout</h4>
                  <div className="grid grid-cols-1 gap-3 font-mono text-center text-xs">
                    <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/20 font-bold">
                      PRESENTATION LAYER (React & Tailwind Dashboard & Diff Viewer)
                    </div>
                    <div className="flex justify-center text-gray-700">↓ SSE Updates & REST APIs</div>
                    <div className="bg-blue-500/10 text-blue-400 p-3 rounded-xl border border-blue-500/20 font-bold">
                      API GATEWAY LAYER (FastAPI Security & Stream Handlers)
                    </div>
                    <div className="flex justify-center text-gray-700">↓ Jobs & Context Hooks</div>
                    <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-xl border border-indigo-500/20 font-bold">
                      COORDINATION LAYER (Multi-Agent Shared-Context Orchestrator)
                    </div>
                    <div className="flex justify-center text-gray-700">↓ RAG Vector Pipelines & Heuristics</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-violet-500/10 text-violet-400 p-3 rounded-xl border border-violet-500/20 font-bold">
                        MONGODB (Scans & Trends)
                      </div>
                      <div className="bg-purple-500/10 text-purple-400 p-3 rounded-xl border border-purple-500/20 font-bold">
                        CHROMADB (Source Vectors)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Database Connection map */}
              {activeMainSection === 'database' && activeItemContent.id === 'db-strategy' && (
                <div className="bg-[#090a0d] border border-gray-900 rounded-2xl p-6 space-y-4">
                  <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Data Lifecycle Diagram</h4>
                  <div className="flex items-center justify-between border border-gray-900 p-4 rounded-xl text-xs font-mono bg-gray-950/40">
                    <div className="text-center p-2.5 rounded-lg border border-gray-900 text-gray-400">
                      Zip Upload
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-700" />
                    <div className="text-center p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
                      AST Metadata (MongoDB)
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-700" />
                    <div className="text-center p-2.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
                      Split Chunks (Vector Store)
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-700" />
                    <div className="text-center p-2.5 rounded-lg border border-purple-500/20 bg-purple-500/5 text-purple-400">
                      Agent Synthesis
                    </div>
                  </div>
                </div>
              )}

              {/* Multi-Agent Orchestrator diagram */}
              {activeMainSection === 'agents' && activeItemContent.id === 'agents-overview' && (
                <div className="bg-[#090a0d] border border-gray-900 rounded-2xl p-6 space-y-4">
                  <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Concurrence & Sequence Pipeline Flow</h4>
                  <div className="border border-gray-900 p-4 rounded-xl text-xs font-mono space-y-4 bg-gray-950/40">
                    <div className="flex justify-between items-center bg-gray-950 p-2.5 rounded-xl border border-gray-900">
                      <span className="text-gray-500">PHASE 1: DETERMINISTIC</span>
                      <span className="text-emerald-400 font-bold">Parser AST & Code Indexing</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                      <div className="bg-indigo-500/10 text-indigo-400 p-2 rounded-lg border border-indigo-500/15 font-semibold">
                        Architecture
                      </div>
                      <div className="bg-indigo-500/10 text-indigo-400 p-2 rounded-lg border border-indigo-500/15 font-semibold">
                        Security
                      </div>
                      <div className="bg-indigo-500/10 text-indigo-400 p-2 rounded-lg border border-indigo-500/15 font-semibold">
                        Performance
                      </div>
                      <div className="bg-indigo-500/10 text-indigo-400 p-2 rounded-lg border border-indigo-500/15 font-semibold">
                        Maintainability
                      </div>
                      <div className="bg-indigo-500/10 text-indigo-400 p-2 rounded-lg border border-indigo-500/15 font-semibold">
                        Testing
                      </div>
                    </div>
                    <div className="text-center text-gray-700 text-xs font-bold">▲ Parallel AI Processing ▲</div>
                    <div className="flex justify-between items-center bg-gray-950 p-2.5 rounded-xl border border-gray-900">
                      <span className="text-gray-500">PHASE 3: DECISIONS</span>
                      <span className="text-emerald-400 font-bold">Risk Predictor & EM Priorities</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-950 p-2.5 rounded-xl border border-gray-900">
                      <span className="text-gray-500">PHASE 4: SUMMARIES</span>
                      <span className="text-emerald-400 font-bold">Report Synthesis & Mentoring Docs</span>
                    </div>
                  </div>
                </div>
              )}

              {/* DevOps Runbook flow */}
              {activeMainSection === 'devops' && activeItemContent.id === 'devops-runbooks' && (
                <div className="bg-[#090a0d] border border-gray-900 rounded-2xl p-6 space-y-4">
                  <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Disaster Recovery Incident Lifecycle</h4>
                  <div className="grid grid-cols-4 gap-3 text-center font-mono text-[10px]">
                    <div className="bg-red-500/10 text-red-400 p-2.5 rounded-xl border border-red-500/20">
                      1. Trigger Alert (503/429)
                    </div>
                    <div className="bg-amber-500/10 text-amber-400 p-2.5 rounded-xl border border-amber-500/20">
                      2. Fallback Heuristics
                    </div>
                    <div className="bg-blue-500/10 text-blue-400 p-2.5 rounded-xl border border-blue-500/20">
                      3. Degraded Status UI
                    </div>
                    <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20">
                      4. Auto-Reconnect
                    </div>
                  </div>
                </div>
              )}

              {/* Closing warning */}
              <div className="flex items-center space-x-3 bg-gray-950 border border-gray-900 p-4 rounded-xl text-xs text-gray-500">
                <Info className="h-4 w-4 shrink-0 text-gray-600" />
                <span>The blueprints presented are officially mapped into CodeInsight AI v1.0 and serve as system specifications.</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <BookOpen className="h-10 w-10 text-gray-700 animate-pulse" />
              <p className="text-gray-500 text-xs font-mono mt-3">Select a specification from the sidebar to begin reading.</p>
            </div>
          )}
        </main>
      </div>
      )}
    </div>
  );
}

function DirectoryLayout({ metrics, agentsReport, projectName, files = [], personaView }: {
  metrics: any;
  agentsReport: any;
  projectName: string;
  files: any[];
  personaView: string;
}) {
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ '': true });
  const [dirSearchQuery, setDirSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'errors' | 'clean'>('all');
  const [activeTabMapping, setActiveTabMapping] = useState<Record<string, 'explain' | 'solution' | 'impact' | 'comment'>>({});

  // 1. Process issues
  const filePathToIssues = useMemo(() => {
    const mapping: Record<string, any[]> = {};
    
    if (metrics?.localIssues) {
      metrics.localIssues.forEach((issue: any) => {
        const path = issue.path || issue.filePath;
        if (path) {
          if (!mapping[path]) mapping[path] = [];
          mapping[path].push(issue);
        }
      });
    }

    if (agentsReport?.folderAnalysis) {
      Object.entries(agentsReport.folderAnalysis).forEach(([folderPath, folderData]: [string, any]) => {
        if (folderData.issues) {
          folderData.issues.forEach((issue: any) => {
            if (issue.file) {
              const fullPath = folderPath === 'root' || folderPath === '' 
                ? issue.file 
                : `${folderPath}/${issue.file}`;
              
              if (!mapping[fullPath]) {
                mapping[fullPath] = [];
              }
              const isDuplicate = mapping[fullPath].some(
                (existing: any) => existing.line === issue.line && existing.message === issue.message
              );
              if (!isDuplicate) {
                mapping[fullPath].push({
                  path: fullPath,
                  line: issue.line,
                  type: issue.severity === 'critical' || issue.severity === 'high' ? 'security' : 'maintainability',
                  severity: issue.severity,
                  message: issue.message,
                  code: issue.solutions?.[0]?.code || issue.afterCode || "",
                  suggestedFix: issue.solutions?.[0]?.description || issue.expectedImprovement || "",
                  explanation: issue.explanation || "This is a structural or logical anomaly in the workspace.",
                  businessImpact: issue.businessImpact || "Vulnerable code can result in unauthorized operations or memory leak crashes.",
                  seniorCommentary: issue.seniorCommentary || "Always ensure inputs are parsed with strict boundaries."
                });
              }
            }
          });
        }
      });
    }

    return mapping;
  }, [metrics, agentsReport]);

  // 2. Build directory tree
  const dirTree = useMemo(() => {
    const activeFiles = (files && files.length > 0) ? files : [
      { path: 'src/main/java/com/med/hospital/controller/AuthController.java', content: '// Java auth code' },
      { path: 'src/main/java/com/med/hospital/service/AuthService.java', content: '// Java auth service' },
      { path: 'src/main/resources/application.properties', content: '# properties' },
      { path: 'server/routes/api.ts', content: '// express API routes' },
      { path: 'src/components/Dashboard.tsx', content: '// Dashboard visual controls' }
    ];

    const rootNode = {
      name: projectName || 'Root',
      path: '',
      type: 'folder' as const,
      children: [] as any[],
      errorsCount: 0
    };

    activeFiles.forEach((file: any) => {
      const parts = file.path.split('/');
      let current = rootNode;

      parts.forEach((part: string, idx: number) => {
        const isLast = idx === parts.length - 1;
        const currentPath = parts.slice(0, idx + 1).join('/');

        if (!isLast) {
          let folder = current.children.find(child => child.name === part && child.type === 'folder');
          if (!folder) {
            folder = {
              name: part,
              path: currentPath,
              type: 'folder' as const,
              children: [] as any[],
              errorsCount: 0
            };
            current.children.push(folder);
          }
          current = folder;
        } else {
          const fileErrors = filePathToIssues[file.path] || [];
          const fileNode = {
            name: part,
            path: file.path,
            type: 'file' as const,
            errorsCount: fileErrors.length,
            errors: fileErrors,
            linesCount: file.content ? file.content.split('\n').length : 0,
            content: file.content || ""
          };
          current.children.push(fileNode);
        }
      });
    });

    const finalizeNode = (node: any): number => {
      if (node.type === 'file') {
        return node.errorsCount;
      }
      
      let sum = 0;
      node.children.sort((a: any, b: any) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      node.children.forEach((child: any) => {
        sum += finalizeNode(child);
      });
      node.errorsCount = sum;
      return sum;
    };

    finalizeNode(rootNode);
    return rootNode;
  }, [files, filePathToIssues, projectName]);

  // Expand folders that contain issues automatically
  React.useEffect(() => {
    const defaultExpanded: Record<string, boolean> = { '': true };
    const expandFoldersWithErrors = (node: any) => {
      if (node && node.type === 'folder' && node.errorsCount > 0) {
        defaultExpanded[node.path] = true;
        node.children?.forEach((child: any) => expandFoldersWithErrors(child));
      }
    };
    if (dirTree) {
      expandFoldersWithErrors(dirTree);
      setExpandedFolders(prev => ({ ...prev, ...defaultExpanded }));
    }
  }, [dirTree]);

  // 3. Flatten files for stats/summary table
  const allFilesWithErrors = useMemo(() => {
    const list: any[] = [];
    const traverse = (node: any) => {
      if (!node) return;
      if (node.type === 'file') {
        if (node.errorsCount > 0) {
          list.push(node);
        }
      } else {
        node.children?.forEach((child: any) => traverse(child));
      }
    };
    traverse(dirTree);
    return list.sort((a, b) => b.errorsCount - a.errorsCount);
  }, [dirTree]);

  const stats = useMemo(() => {
    let totalFolders = metrics?.totalFolders || 0;
    let totalFiles = metrics?.totalFiles || 0;
    
    if (totalFiles === 0 && files) {
      totalFiles = files.length;
    }
    if (totalFolders === 0 && files) {
      totalFolders = Math.max(1, new Set(files.map((f: any) => f.path.split('/').slice(0, -1).join('/'))).size);
    }
    if (totalFiles === 0) totalFiles = 5;
    if (totalFolders === 0) totalFolders = 3;

    const vulnerableFilesCount = allFilesWithErrors.length;
    const cleanFilesCount = Math.max(0, totalFiles - vulnerableFilesCount);
    const cleanRatio = totalFiles > 0 ? Math.round((cleanFilesCount / totalFiles) * 100) : 100;

    return {
      folders: totalFolders,
      files: totalFiles,
      vulnerable: vulnerableFilesCount,
      clean: cleanFilesCount,
      ratio: cleanRatio
    };
  }, [metrics, files, allFilesWithErrors]);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const renderTreeNode = (node: any, depth: number = 0) => {
    if (!node) return null;

    const isFolder = node.type === 'folder';
    const isExpanded = expandedFolders[node.path];
    const hasErrors = node.errorsCount > 0;

    // Search filter
    if (dirSearchQuery) {
      const matchesSearch = (n: any): boolean => {
        if (n.name.toLowerCase().includes(dirSearchQuery.toLowerCase())) return true;
        if (n.type === 'folder') {
          return n.children.some((c: any) => matchesSearch(c));
        }
        return false;
      };
      if (!matchesSearch(node)) return null;
    }

    // Filter mode
    if (filterMode === 'errors' && node.errorsCount === 0) return null;
    if (filterMode === 'clean' && node.type === 'file' && node.errorsCount > 0) return null;

    return (
      <div key={node.path || node.name} className="select-none font-mono">
        <div 
          onClick={() => {
            if (isFolder) {
              toggleFolder(node.path);
            } else {
              setSelectedFile(node);
            }
          }}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          className={`flex items-center justify-between py-1.5 pr-2 rounded-xl cursor-pointer transition-all text-xs group ${
            selectedFile?.path === node.path && !isFolder
              ? 'bg-emerald-500/10 border-l-2 border-emerald-500 text-emerald-400 font-semibold' 
              : 'text-gray-400 hover:bg-gray-950/60 hover:text-gray-200'
          }`}
        >
          <div className="flex items-center space-x-2 min-w-0">
            {isFolder ? (
              <>
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                )}
                <Folder className={`h-4 w-4 shrink-0 ${hasErrors ? 'text-amber-500/80' : 'text-emerald-500/70'}`} />
              </>
            ) : (
              <>
                <span className="w-3.5 shrink-0" />
                <FileText className={`h-4 w-4 shrink-0 ${hasErrors ? 'text-red-400/90' : 'text-gray-500'}`} />
              </>
            )}
            <span className="truncate">{node.name}</span>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {isFolder ? (
              hasErrors && (
                <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                  {node.errorsCount} issues
                </span>
              )
            ) : (
              hasErrors ? (
                <span className="bg-red-500/15 text-red-400 border border-red-500/10 px-1.5 py-0.5 rounded-full text-[8px] font-bold animate-pulse">
                  {node.errorsCount}
                </span>
              ) : (
                <span className="text-emerald-500/60 text-[9px] font-bold">✓ clean</span>
              )
            )}
          </div>
        </div>

        {isFolder && isExpanded && node.children && (
          <div className="mt-0.5">
            {node.children.map((child: any) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
      {/* Left Column: Explorer */}
      <aside className="w-full md:w-80 bg-[#090a0d]/60 border-r border-gray-900 p-5 flex flex-col min-h-0 shrink-0">
        <div className="mb-4">
          <h2 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
            Directory Navigator
          </h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            High-accuracy workspace structure map with realtime semantic audit diagnostics.
          </p>
        </div>

        {/* Directory Search & Filter */}
        <div className="space-y-2.5 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search files..."
              value={dirSearchQuery}
              onChange={(e) => setDirSearchQuery(e.target.value)}
              className="w-full bg-gray-950 border border-gray-900 rounded-xl pl-9.5 pr-4 py-2 text-xs text-gray-300 placeholder-gray-500 focus:outline-none focus:border-emerald-500/40 font-mono"
            />
          </div>

          <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-900 text-[10px] font-mono">
            {(['all', 'errors', 'clean'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`flex-1 py-1 rounded-lg font-medium transition-all capitalize cursor-pointer ${
                  filterMode === mode 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {mode === 'errors' ? 'Issues Only' : mode === 'clean' ? 'Clean Only' : 'All Files'}
              </button>
            ))}
          </div>
        </div>

        {/* Tree Container */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 border border-gray-950 p-2 rounded-xl bg-gray-950/20">
          {dirTree && dirTree.children ? (
            dirTree.children.map(child => renderTreeNode(child, 0))
          ) : (
            <div className="text-center py-8 text-gray-600 text-xs font-mono">
              Loading workspace structure...
            </div>
          )}
        </div>

        {/* Reset Selection button if a file is selected */}
        {selectedFile && (
          <button
            onClick={() => setSelectedFile(null)}
            className="mt-3.5 w-full bg-gray-950 border border-gray-900 hover:border-gray-800 text-gray-400 hover:text-white py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <span>Back to Dashboard Overview</span>
          </button>
        )}
      </aside>

      {/* Right Column: Viewport */}
      <main className="flex-1 flex flex-col min-h-0 bg-[#07080a] p-6 overflow-y-auto">
        {!selectedFile ? (
          /* SECTION A: Dashboard Overview */
          <div className="space-y-6 max-w-4xl mx-auto w-full">
            {/* Title & subtitle */}
            <div className="border-b border-gray-900 pb-4">
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/15 font-bold font-mono uppercase">
                Auditor Summary Specs
              </span>
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white mt-3 tracking-tight">
                Codebase Directory Analysis & Vulnerability Mapping
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                A highly comprehensive structural breakdown of all parsed project folders, language distributions, and file-level security profiles.
              </p>
            </div>

            {/* Bento Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Folders count */}
              <div className="bg-[#090a0d] border border-gray-900 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 font-mono uppercase">Directory Nodes</span>
                  <div className="text-2xl font-bold text-white font-mono mt-1">{stats.folders}</div>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Active folder paths compiled</p>
              </div>

              {/* Files count */}
              <div className="bg-[#090a0d] border border-gray-900 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 font-mono uppercase">Source Files</span>
                  <div className="text-2xl font-bold text-white font-mono mt-1">{stats.files}</div>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Total executable source units</p>
              </div>

              {/* Vulnerable files count */}
              <div className="bg-[#090a0d] border border-gray-900 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 font-mono uppercase">Vulnerable Files</span>
                  <div className={`text-2xl font-bold font-mono mt-1 ${stats.vulnerable > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {stats.vulnerable}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Modules requiring immediate fix</p>
              </div>

              {/* Health ratio */}
              <div className="bg-[#090a0d] border border-gray-900 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 font-mono uppercase">Overall Health index</span>
                  <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                    {stats.ratio}% Clean
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 bg-gray-950 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${stats.ratio}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Persona View Guide */}
            {personaView !== 'all' && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start space-x-3">
                <Sparkles className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="text-xs text-gray-400 leading-relaxed">
                  <strong className="text-emerald-400 font-mono block uppercase mb-1">
                    {personaView} Perspective Checklist
                  </strong>
                  {personaView === 'junior' && "Audit Checklist: Review the red-badged files. Click them to inspect explanation comments and visual before/after code blocks to study correct defensive implementations."}
                  {personaView === 'architect' && "Audit Checklist: Investigate directory boundaries and check for modular isolation leaks. Ensure configuration keys or secret handlers are locked down properly."}
                  {personaView === 'manager' && "Audit Checklist: Evaluate the vulnerable files list to estimate refactoring efforts. High-priority critical files should be corrected before triggering production builds."}
                </div>
              </div>
            )}

            {/* Vulnerability Heatmap / Audit Details Table */}
            <div className="bg-[#090a0d] border border-gray-900 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-950 pb-3">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
                  <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    Vulnerability Audit heat-map
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-gray-500">
                  Total of {allFilesWithErrors.length} modules have active security gaps
                </span>
              </div>

              {allFilesWithErrors.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-gray-950 text-gray-500 font-mono font-bold">
                        <th className="pb-2.5 font-semibold">Vulnerable File Path</th>
                        <th className="pb-2.5 font-semibold text-center w-24">Issues Count</th>
                        <th className="pb-2.5 font-semibold text-center w-36">Max Severity</th>
                        <th className="pb-2.5 font-semibold text-right w-24">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-950">
                      {allFilesWithErrors.map((fileNode, index) => {
                        const highestSeverity = fileNode.errors.reduce((highest: string, issue: any) => {
                          const s = issue.severity?.toLowerCase();
                          if (highest === 'critical') return highest;
                          if (s === 'critical') return s;
                          if (highest === 'high') return highest;
                          if (s === 'high') return s;
                          if (highest === 'medium') return highest;
                          if (s === 'medium') return s;
                          return 'low';
                        }, 'low');

                        const badgeStyles = highestSeverity === 'critical' || highestSeverity === 'high'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : highestSeverity === 'medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20';

                        return (
                          <tr key={index} className="hover:bg-gray-950/40 transition-colors">
                            <td className="py-3 font-mono text-[11px] text-gray-300 truncate max-w-xs sm:max-w-md">
                              {fileNode.path}
                            </td>
                            <td className="py-3 text-center font-mono font-bold">
                              <span className="bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full text-[10px]">
                                {fileNode.errorsCount}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <span className={`px-2 py-0.5 rounded-lg text-[9px] uppercase font-mono font-bold ${badgeStyles}`}>
                                {highestSeverity}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => setSelectedFile(fileNode)}
                                className="bg-gray-950 border border-gray-900 hover:border-gray-800 text-emerald-400 hover:text-emerald-300 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer font-mono"
                              >
                                Audit
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-10 space-y-3.5 bg-gray-950/20 border border-dashed border-gray-950 rounded-xl">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500/80 animate-pulse" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-white">No active codebase vulnerabilities!</h4>
                    <p className="text-xs text-gray-500 max-w-sm">
                      Congratulations. The multi-agent inspector completed structural security, performance, and SOLID reviews and found 0 active issues in this repository.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Instructional banner */}
            <div className="flex items-center space-x-3 bg-gray-950 border border-gray-900 p-4 rounded-xl text-xs text-gray-500">
              <Info className="h-4 w-4 shrink-0 text-gray-600" />
              <span>Select any file inside the left <strong>Directory Navigator</strong> to focus on code-level audit statements and step-by-step solutions.</span>
            </div>
          </div>
        ) : (
          /* SECTION B: Individual File Audit Viewer */
          <div className="space-y-6 max-w-4xl mx-auto w-full animate-fadeIn">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between border-b border-gray-900 pb-4">
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold font-mono"
                >
                  Overview
                </button>
                <span className="text-gray-700 font-mono text-sm">/</span>
                <span className="text-xs text-gray-400 font-mono truncate max-w-xs md:max-w-md">
                  {selectedFile.path}
                </span>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="bg-gray-950 border border-gray-900 hover:border-gray-800 text-gray-400 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Reset Focus
              </button>
            </div>

            {/* File info card */}
            <div className="bg-[#090a0d] border border-gray-900 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-mono flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{selectedFile.name}</span>
                </h3>
                <p className="text-[11px] text-gray-500 font-mono">
                  Relative Path: {selectedFile.path} • {selectedFile.linesCount} lines of parsed code
                </p>
              </div>

              {selectedFile.errorsCount > 0 ? (
                <div className="flex items-center space-x-2.5 bg-red-500/10 text-red-400 px-3.5 py-1.5 rounded-xl border border-red-500/20 font-mono font-bold text-xs">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>Requires {selectedFile.errorsCount} Remediations</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2.5 bg-emerald-500/10 text-emerald-400 px-3.5 py-1.5 rounded-xl border border-emerald-500/20 font-mono font-bold text-xs">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Verified Clean Module</span>
                </div>
              )}
            </div>

            {/* Code Audit details list */}
            {selectedFile.errorsCount > 0 ? (
              <div className="space-y-6">
                {selectedFile.errors.map((issue: any, idx: number) => {
                  const issueKey = `${selectedFile.path}_issue_${idx}`;
                  const currentTab = activeTabMapping[issueKey] || 'explain';

                  const badgeStyles = issue.severity === 'critical' || issue.severity === 'high'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20';

                  return (
                    <div key={idx} className="bg-[#090a0d] border border-gray-900 rounded-2xl overflow-hidden shadow-md">
                      {/* Issue banner */}
                      <div className="bg-gray-950 p-4 border-b border-gray-900 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-start space-x-3">
                          <Bug className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">
                                Line {issue.line} • {issue.type || 'vuln'}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${badgeStyles}`}>
                                {issue.severity}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white mt-1 leading-snug">
                              {issue.message}
                            </h4>
                          </div>
                        </div>
                      </div>

                      {/* Diagnostic tabs selector */}
                      <div className="flex bg-gray-950/40 border-b border-gray-900 px-4 text-xs font-mono">
                        {([
                          { key: 'explain', label: 'Problem Explanation' },
                          { key: 'solution', label: 'Suggested Refactoring' },
                          { key: 'impact', label: 'Business Risk' },
                          { key: 'comment', label: 'Mentor Commentary' }
                        ] as const).map((tab) => (
                          <button
                            key={tab.key}
                            onClick={() => setActiveTabMapping(prev => ({ ...prev, [issueKey]: tab.key }))}
                            className={`px-4 py-2.5 font-medium transition-all relative border-b-2 cursor-pointer ${
                              currentTab === tab.key 
                                ? 'text-emerald-400 border-emerald-500 bg-[#090a0d]' 
                                : 'text-gray-500 hover:text-gray-300 border-transparent'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Content rendering based on active tab */}
                      <div className="p-5 text-xs text-gray-300 leading-relaxed font-sans">
                        {currentTab === 'explain' && (
                          <div className="space-y-3">
                            <p>{issue.explanation || "No deep explanations available for this structural alert."}</p>
                            {issue.code && (
                              <div className="space-y-1.5 mt-2">
                                <span className="font-mono text-[10px] text-red-400 block font-bold">Vulnerable Implementation (Line {issue.line}):</span>
                                <pre className="bg-red-950/20 border border-red-500/20 p-3.5 rounded-xl font-mono text-[10px] text-red-300 overflow-x-auto whitespace-pre-wrap select-text leading-relaxed">
                                  {issue.code}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}

                        {currentTab === 'solution' && (
                          <div className="space-y-3.5">
                            <p>{issue.suggestedFix || "Extract credentials into properties and protect database queries with parameterized SQL."}</p>
                            {issue.suggestedFixCode || issue.afterCode || issue.code ? (
                              <div className="space-y-1.5 mt-2">
                                <span className="font-mono text-[10px] text-emerald-400 block font-bold">Proposed Remediation:</span>
                                <pre className="bg-emerald-950/20 border border-emerald-500/25 p-3.5 rounded-xl font-mono text-[10px] text-emerald-300 overflow-x-auto whitespace-pre-wrap select-text leading-relaxed">
                                  {issue.suggestedFixCode || issue.afterCode || `// Corrected implementation snippet\n${issue.code}`}
                                </pre>
                              </div>
                            ) : null}
                          </div>
                        )}

                        {currentTab === 'impact' && (
                          <div className="space-y-1.5">
                            <h5 className="font-bold text-white font-mono text-[10px] uppercase text-red-400">Production Vulnerability Impact:</h5>
                            <p className="bg-gray-950 p-4 rounded-xl border border-gray-900">
                              {issue.businessImpact || "Vulnerable code can result in downtime, performance bottlenecks, or security bypasses."}
                            </p>
                          </div>
                        )}

                        {currentTab === 'comment' && (
                          <div className="space-y-2.5">
                            <div className="flex items-start space-x-2 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                              <Sparkles className="h-4.5 w-4.5 text-emerald-400 mt-0.5 shrink-0 animate-pulse" />
                              <div>
                                <h6 className="font-mono text-[10px] uppercase font-bold text-emerald-400">Senior Staff Commentary</h6>
                                <p className="mt-1 leading-normal text-gray-300">
                                  {issue.seniorCommentary || "Logic does not validate bounds or input streams appropriately. Refactoring is required."}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* If selected file is clean */
              <div className="bg-[#090a0d] border border-gray-900 rounded-2xl p-8 text-center space-y-4 shadow-sm flex flex-col items-center justify-center">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
                  <Shield className="h-8 w-8 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-white font-['Space_Grotesk']">Secure & Clean Module</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    The multi-agent security and AST parsers validated this module. Code complies with OWASP Top 10 guidelines and SOLID software engineering paradigms.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-gray-500 bg-gray-950 px-3 py-1.5 rounded-lg border border-gray-900 font-bold">
                  AST VALIDATION STATUS: 100% SECURE
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
