/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisProgressEmitter } from './lib/progress';
import {
  Folder,
  FileCode,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  Terminal,
  Cpu,
  Bug,
  Download,
  Copy,
  Play,
  ArrowRight,
  Layers,
  TrendingUp,
  HelpCircle,
  Code,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  UploadCloud,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Gauge,
  X,
  BookOpen,
  Settings,
  ChevronUp,
  History,
  Trash2,
  Eye,
  Search,
  Sliders,
  Menu,
  Sun,
  Moon,
  Network,
  Command,
  XCircle,
  Shield,
  Wrench,
  TestTube,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line
} from 'recharts';

// Syntax Highlighting Imports
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';

import BlueprintsView from './components/BlueprintsView';
import TestingCoverageView from './components/TestingCoverageView';
import DigitalTwinPanel from './components/DigitalTwinPanel';
import WhatIfSimulator from './components/WhatIfSimulator';
import FolderStructureView from './components/FolderStructureView';
import type { KnowledgeGraph } from './types/knowledgeGraph';

interface CodeFile {
  path: string;
  content: string;
  size: number;
}

interface LocalIssue {
  path: string;
  line: number;
  type: 'security' | 'performance' | 'maintainability' | 'testing';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  code: string;
  suggestedFix: string;
}

interface MetricReport {
  totalFiles: number;
  totalFolders: number;
  totalLines: number;
  languageCounts: Record<string, number>;
  folderMetrics: Record<string, { files: number; lines: number; errors: number }>;
  localIssues: LocalIssue[];
}

interface HistoryItem {
  id: string;
  projectName: string;
  timestamp: number;
  overallScore: number;
  totalFiles: number;
  totalLines: number;
  totalErrors: number;
  metrics: MetricReport;
  agentsReport: AgentsReport;
  isDemo: boolean;
}

interface SolutionOption {
  title: string;
  code: string;
  description: string;
  tradeOffs: string;
}

interface FolderIssue {
  file: string;
  line: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  type?: string;
  seniorCommentary: string;
  beforeCode: string;
  afterCode: string;
  expectedImprovement: string;
  explanation?: string;
  businessImpact?: string;
  solutions?: SolutionOption[];
  educationalInsight?: string;
}

interface FolderAnalysis {
  errorsCount: number;
  summary: string;
  issues: FolderIssue[];
}

interface AgentsReport {
  overallScore: number;
  isAiDegraded?: boolean;
  architecture: {
    pattern: string;
    description: string;
    modules: string[];
    grade: string;
    feedback: string;
  };
  security: {
    score: number;
    grade: string;
    findings: Array<{ severity: 'critical' | 'high' | 'medium' | 'low'; type: string; message: string }>;
    feedback: string;
  };
  performance: {
    score: number;
    grade: string;
    feedback: string;
  };
  maintainability: {
    score: number;
    grade: string;
    feedback: string;
  };
  testing: {
    score: number;
    grade: string;
    feedback: string;
  };
  risk: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    scaling: string;
    recommendations: string[];
  };
  folderAnalysis: Record<string, FolderAnalysis>;
}

interface CustomRule {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'security' | 'performance' | 'maintainability' | 'testing';
  message: string;
  pattern: string;
  description?: string;
  suggestedFix?: string;
}

interface CustomRulePack {
  name: string;
  description?: string;
  rules: CustomRule[];
}

export default function App() {
  const [screen, setScreen] = useState<'upload' | 'scanning' | 'dashboard'>('upload');
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [loadingLog, setLoadingLog] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  // Scanned Results
  const [metrics, setMetrics] = useState<MetricReport | null>(null);
  const [agentsReport, setAgentsReport] = useState<AgentsReport | null>(null);
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeGraph | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [currentProjectName, setCurrentProjectName] = useState<string>('Hospital System Demo');

  // Active Tab in Dashboard
  const [activeTab, setActiveTab] = useState<'dashboard' | 'folders' | 'architecture' | 'risks' | 'report' | 'history' | 'blueprints' | 'twin' | 'whatif'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [commandSearch, setCommandSearch] = useState<string>('');
  const [commandFocusIndex, setCommandFocusIndex] = useState<number>(0);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Code Display Toggles
  const [issueCodeTab, setIssueCodeTab] = useState<Record<string, 'diff' | 'side' | 'original' | 'refactored'>>({});

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<number>(0);
  const [pdfStep, setPdfStep] = useState<string>('');
  const [badgeTab, setBadgeTab] = useState<'markdown' | 'svg' | 'html'>('markdown');
  const [badgeThreshold, setBadgeThreshold] = useState<number>(70);

  // Custom Rules State
  const [customRulePack, setCustomRulePack] = useState<CustomRulePack | null>(() => {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(localStorage.getItem('codedocai-custom-rules') || 'null'); } catch { return null; }
  });
  const [isRuleUploaderOpen, setIsRuleUploaderOpen] = useState<boolean>(false);
  const [ruleUploadError, setRuleUploadError] = useState<string>('');
  const [isDraggingRules, setIsDraggingRules] = useState<boolean>(false);

  const handleRuleFileUpload = (file: File) => {
    setRuleUploadError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!json.rules || !Array.isArray(json.rules) || json.rules.length === 0) {
          setRuleUploadError('Invalid rule pack: must have a "rules" array with at least one rule.');
          return;
        }
        for (const rule of json.rules) {
          if (!rule.id || !rule.pattern || !rule.severity || !rule.type || !rule.message) {
            setRuleUploadError(`Rule "${rule.id || 'unknown'}" is missing required fields: id, pattern, severity, type, message.`);
            return;
          }
          new RegExp(rule.pattern); // validate regex
        }
        const pack: CustomRulePack = { name: json.name || file.name, description: json.description, rules: json.rules };
        setCustomRulePack(pack);
        try { localStorage.setItem('codedocai-custom-rules', JSON.stringify(pack)); } catch { /* no-op */ }
        showToast('success', `Loaded ${json.rules.length} custom rule${json.rules.length !== 1 ? 's' : ''} from "${pack.name}".`);
        setIsRuleUploaderOpen(false);
      } catch (err) {
        setRuleUploadError(`Failed to parse JSON: ${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
  };

  const clearCustomRules = () => {
    setCustomRulePack(null);
    try { localStorage.removeItem('codedocai-custom-rules'); } catch { /* no-op */ }
    showToast('info', 'Custom rules cleared.');
  };

  // Toast Notification State
  interface ToastItem { id: number; type: 'success' | 'error' | 'info'; message: string; }
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);
  const showToast = (type: ToastItem['type'], message: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  };
  const dismissToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Theme State: 'light' | 'dark' | 'system'
  type ThemeMode = 'light' | 'dark' | 'system';
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system';
    const stored = localStorage.getItem('codedocai-theme');
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  });
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen for OS theme changes (only relevant when themeMode === 'system')
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleThemeChange);
    } else {
      mediaQuery.addEventListener('change', handleThemeChange);
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleThemeChange);
      } else {
        mediaQuery.removeEventListener('change', handleThemeChange);
      }
    };
  }, []);

  // Compute the effective theme and apply it to <html>, persisting the user's choice.
  React.useEffect(() => {
    const effective: 'light' | 'dark' = themeMode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : themeMode;
    if (effective === 'light') {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark-mode');
    } else {
      document.documentElement.classList.add('dark-mode');
      document.documentElement.classList.remove('light-mode');
    }
    document.documentElement.setAttribute('data-theme-mode', themeMode);
    document.documentElement.setAttribute('data-theme-effective', effective);
    try { localStorage.setItem('codedocai-theme', themeMode); } catch { /* no-op */ }
  }, [themeMode, systemPrefersDark]);

  const effectiveTheme: 'light' | 'dark' = themeMode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : themeMode;
  const cycleTheme = () => {
    setThemeMode((prev) => (prev === 'system' ? 'light' : prev === 'light' ? 'dark' : 'system'));
  };

  const THEME_OPTIONS: { value: ThemeMode; label: string; description: string; icon: any; shortcut: string }[] = [
    { value: 'light',  label: 'Light',  description: 'Always use the light palette.',     icon: Sun,     shortcut: 'L' },
    { value: 'dark',   label: 'Dark',   description: 'Always use the dark palette.',      icon: Moon,    shortcut: 'D' },
    { value: 'system', label: 'System', description: 'Follow your operating system theme.', icon: Sliders, shortcut: 'S' },
  ];
  const [themeFocusIndex, setThemeFocusIndex] = React.useState<number>(() => {
    const idx = THEME_OPTIONS.findIndex((o) => o.value === themeMode);
    return idx >= 0 ? idx : 2;
  });

  // Reset focus when the menu opens
  React.useEffect(() => {
    if (isThemeMenuOpen) {
      const idx = THEME_OPTIONS.findIndex((o) => o.value === themeMode);
      setThemeFocusIndex(idx >= 0 ? idx : 2);
    }
  }, [isThemeMenuOpen]);

  // Close the theme dropdown when clicking outside it, and handle keyboard navigation
  React.useEffect(() => {
    if (!isThemeMenuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsThemeMenuOpen(false);
        return;
      }
      // Letter shortcuts to pick a mode quickly while the menu is open
      const letter = e.key.toLowerCase();
      const byLetter = THEME_OPTIONS.find((o) => o.shortcut.toLowerCase() === letter);
      if (byLetter) {
        e.preventDefault();
        setThemeMode(byLetter.value);
        setIsThemeMenuOpen(false);
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setThemeFocusIndex((idx) => {
          const dir = e.key === 'ArrowDown' ? 1 : -1;
          const next = (idx + dir + THEME_OPTIONS.length) % THEME_OPTIONS.length;
          return next;
        });
      } else if (e.key === 'Home') {
        e.preventDefault();
        setThemeFocusIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setThemeFocusIndex(THEME_OPTIONS.length - 1);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const opt = THEME_OPTIONS[themeFocusIndex];
        if (opt) {
          setThemeMode(opt.value);
          setIsThemeMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isThemeMenuOpen, themeFocusIndex]);

  // ── Command Palette ──────────────────────────────────────────────
  type Command = {
    id: string;
    label: string;
    category: string;
    icon: any;
    shortcut?: string;
    action: () => void;
  };

  const COMMANDS: Command[] = [
    // Navigation
    { id: 'nav-dashboard',     label: 'Go to Executive Health',         category: 'Navigate', icon: Gauge,        action: () => { setActiveTab('dashboard');     setScreen('dashboard'); setIsCommandPaletteOpen(false); } },
    { id: 'nav-twin',          label: 'Go to Digital Twin & AI CTO',     category: 'Navigate', icon: Network,      action: () => { setActiveTab('twin');           setScreen('dashboard'); setIsCommandPaletteOpen(false); } },
    { id: 'nav-whatif',        label: 'Go to What-If Simulator',         category: 'Navigate', icon: Sparkles,     action: () => { setActiveTab('whatif');         setScreen('dashboard'); setIsCommandPaletteOpen(false); } },
    { id: 'nav-folders',       label: 'Go to Folder Analysis',           category: 'Navigate', icon: Folder,       action: () => { setActiveTab('folders');        setScreen('dashboard'); setIsCommandPaletteOpen(false); } },
    { id: 'nav-architecture',  label: 'Go to Architecture',             category: 'Navigate', icon: Layers,       action: () => { setActiveTab('architecture');   setScreen('dashboard'); setIsCommandPaletteOpen(false); } },
    { id: 'nav-risks',         label: 'Go to Risk Assessment',          category: 'Navigate', icon: ShieldAlert,  action: () => { setActiveTab('risks');          setScreen('dashboard'); setIsCommandPaletteOpen(false); } },
    { id: 'nav-report',        label: 'Go to Analysis Report',           category: 'Navigate', icon: BookOpen,     action: () => { setActiveTab('report');         setScreen('dashboard'); setIsCommandPaletteOpen(false); } },
    { id: 'nav-history',       label: 'Go to Scan History',             category: 'Navigate', icon: History,      action: () => { setActiveTab('history');       setScreen('dashboard'); setIsCommandPaletteOpen(false); } },
    { id: 'nav-blueprints',   label: 'Go to Blueprints',               category: 'Navigate', icon: FileCode,     action: () => { setActiveTab('blueprints');     setScreen('dashboard'); setIsCommandPaletteOpen(false); } },
    // Analysis
    { id: 'start-analysis',    label: 'Start New Codebase Analysis',     category: 'Analysis',  icon: UploadCloud,  shortcut: 'N', action: () => { setScreen('upload'); setFiles([]); setMetrics(null); setAgentsReport(null); setIsCommandPaletteOpen(false); } },
    { id: 'run-last',          label: 'Re-run Last Analysis',            category: 'Analysis',  icon: RefreshCw,     action: () => { setIsCommandPaletteOpen(false); } },
    // Export
    { id: 'export-pdf',       label: 'Download PDF Report',             category: 'Export',   icon: Download,     action: () => { if (metrics) { exportReportToPDF(); } setIsCommandPaletteOpen(false); } },
    { id: 'export-md',        label: 'Download Markdown Report',        category: 'Export',   icon: FileText,     action: () => { downloadMarkdownReport(); setIsCommandPaletteOpen(false); } },
    { id: 'copy-md',          label: 'Copy Report to Clipboard',        category: 'Export',   icon: Copy,         action: () => { copyToClipboard(buildMarkdownReport()); setIsCommandPaletteOpen(false); } },
    { id: 'ci-badge',         label: 'Open CI Badge Generator',         category: 'Export',   icon: ShieldCheck,  action: () => { setActiveTab('report'); setScreen('dashboard'); setIsCommandPaletteOpen(false); } },
    // Settings
    { id: 'theme-light',      label: 'Switch to Light Theme',           category: 'Settings', icon: Sun,          action: () => { setThemeMode('light');    setIsCommandPaletteOpen(false); } },
    { id: 'theme-dark',       label: 'Switch to Dark Theme',            category: 'Settings', icon: Moon,         action: () => { setThemeMode('dark');     setIsCommandPaletteOpen(false); } },
    { id: 'theme-system',     label: 'Switch to System Theme',          category: 'Settings', icon: Sliders,      action: () => { setThemeMode('system');   setIsCommandPaletteOpen(false); } },
    { id: 'custom-rules',     label: `${customRulePack ? `Manage Custom Rules (${customRulePack.rules.length})` : 'Add Custom Rules'}`, category: 'Settings', icon: ShieldCheck, action: () => { setScreen('upload'); setIsRuleUploaderOpen(true); setIsCommandPaletteOpen(false); } },
  ];

  const filteredCommands = commandSearch.trim()
    ? COMMANDS.filter((c) =>
        c.label.toLowerCase().includes(commandSearch.toLowerCase()) ||
        c.category.toLowerCase().includes(commandSearch.toLowerCase())
      )
    : COMMANDS;

  // Global Ctrl+K / Cmd+K listener to open the palette
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((v) => !v);
        setCommandSearch('');
        setCommandFocusIndex(0);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Reset focus index when filtered list changes
  React.useEffect(() => { setCommandFocusIndex(0); }, [commandSearch]);

  // Palette keyboard handler (↑↓ Enter Esc)
  React.useEffect(() => {
    if (!isCommandPaletteOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsCommandPaletteOpen(false); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCommandFocusIndex((i) => (i + 1) % Math.max(filteredCommands.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCommandFocusIndex((i) => (i - 1 + Math.max(filteredCommands.length, 1)) % Math.max(filteredCommands.length, 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const cmd = filteredCommands[commandFocusIndex];
        if (cmd) cmd.action();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isCommandPaletteOpen, commandFocusIndex, filteredCommands]);

  // Load history on mount
  React.useEffect(() => {
    try {
      const historyJson = localStorage.getItem('softdocai_history');
      if (historyJson) {
        setHistory(JSON.parse(historyJson));
      }
    } catch (e) {
      console.error('Failed to load scan history:', e);
    }
  }, []);
  
  // Selected Folder in Folder Analysis Tab
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [folderSearchQuery, setFolderSearchQuery] = useState<string>('');
  const [foldersSubTab, setFoldersSubTab] = useState<'inspector' | 'testing'>('inspector');
  const [expandedIssueIndex, setExpandedIssueIndex] = useState<number | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'security' | 'performance' | 'maintainability' | 'testing'>('all');
  const [issueSortBy, setIssueSortBy] = useState<'severity' | 'filePath'>('severity');
  const [modalFile, setModalFile] = useState<{ path: string; line: number } | null>(null);

  const downloadAllIssuesAsZIP = async (folderPath: string, issues: FolderIssue[]) => {
    try {
      if (!issues || issues.length === 0) {
        alert("No issues found in this folder to download.");
        return;
      }
      const zip = new JSZip();
      
      // Generate comprehensive Markdown report
      let markdownReport = `# 🐛 Bug Detection Report - ${currentProjectName}\n\n`;
      markdownReport += `**Generated by SoftDocAI** - AI Software Engineering Inspector\n\n`;
      markdownReport += `**Date:** ${new Date().toLocaleString()}\n`;
      markdownReport += `**Folder:** ${folderPath}\n`;
      markdownReport += `**Total Issues Found:** ${issues.length}\n\n`;
      markdownReport += `---\n\n`;
      
      // Summary by severity
      const critical = issues.filter(i => i.severity === 'critical').length;
      const high = issues.filter(i => i.severity === 'high').length;
      const medium = issues.filter(i => i.severity === 'medium').length;
      const low = issues.filter(i => i.severity === 'low').length;
      
      markdownReport += `## 📊 Issue Summary\n\n`;
      markdownReport += `| Severity | Count |\n`;
      markdownReport += `|----------|-------|\n`;
      markdownReport += `| 🔴 CRITICAL | ${critical} |\n`;
      markdownReport += `| 🟠 HIGH | ${high} |\n`;
      markdownReport += `| 🟡 MEDIUM | ${medium} |\n`;
      markdownReport += `| 🟢 LOW | ${low} |\n\n`;
      markdownReport += `---\n\n`;
      
      // Detailed issues
      markdownReport += `## 🔍 Detailed Bug Analysis\n\n`;
      
      issues.forEach((issue, index) => {
        const severityEmoji = issue.severity === 'critical' ? '🔴' :
                             issue.severity === 'high' ? '🟠' :
                             issue.severity === 'medium' ? '🟡' : '🟢';
        
        markdownReport += `### ${index + 1}. ${severityEmoji} ${issue.severity.toUpperCase()}: ${issue.message}\n\n`;
        markdownReport += `**File:** \`${issue.file}\`  \n`;
        markdownReport += `**Line:** ${issue.line}  \n`;
        markdownReport += `**Type:** ${issue.type || 'General'}  \n\n`;
        
        markdownReport += `#### 📝 Problem Description\n`;
        markdownReport += `${issue.explanation || "The audit indicates potential risks in dynamic execution boundaries inside this module."}\n\n`;
        
        markdownReport += `#### 💰 Business Impact\n`;
        markdownReport += `${issue.businessImpact || "Vulnerable code can result in downtime, performance bottlenecks, or security bypasses."}\n\n`;
        
        if (issue.beforeCode) {
          markdownReport += `#### ❌ Current Code (Problem)\n`;
          markdownReport += `\`\`\`javascript\n${issue.beforeCode}\n\`\`\`\n\n`;
        }
        
        markdownReport += `#### ✅ Recommended Solutions\n\n`;
        
        if (issue.solutions && issue.solutions.length > 0) {
          issue.solutions.forEach((solution, sIndex) => {
            markdownReport += `**Option ${sIndex + 1}: ${solution.title}**\n\n`;
            markdownReport += `${solution.description}\n\n`;
            if (solution.code) {
              markdownReport += `\`\`\`javascript\n${solution.code}\n\`\`\`\n\n`;
            }
            markdownReport += `**Trade-offs:** ${solution.tradeOffs}\n\n`;
          });
        } else if (issue.afterCode) {
          markdownReport += `\`\`\`javascript\n${issue.afterCode}\n\`\`\`\n\n`;
          markdownReport += `**Expected Improvement:** ${issue.expectedImprovement || "Mitigates risks and improves code quality"}\n\n`;
        }
        
        markdownReport += `#### 🎓 Educational Insight\n`;
        markdownReport += `${issue.educationalInsight || "In secure systems engineering, all execution scopes must adhere to the principle of least privilege."}\n\n`;
        
        markdownReport += `#### 💬 Senior Developer Commentary\n`;
        markdownReport += `${issue.seniorCommentary || "Logic does not validate bounds or input streams appropriately. Refactoring is required."}\n\n`;
        
        markdownReport += `---\n\n`;
        
        // Also save individual JSON files
        const issueDetails = {
          title: `[SoftDocAI] ${issue.severity.toUpperCase()}: ${issue.message}`,
          severity: issue.severity,
          folder: folderPath,
          file: issue.file,
          line: issue.line,
          message: issue.message,
          type: issue.type,
          explanation: issue.explanation || "The audit indicates potential risks in dynamic execution boundaries inside this module.",
          businessImpact: issue.businessImpact || "Vulnerable code can result in downtime, performance bottlenecks, or security bypasses.",
          seniorCommentary: issue.seniorCommentary || "Logic does not validate bounds or input streams appropriately. Refactoring is required.",
          educationalInsight: issue.educationalInsight || "In secure systems engineering, all execution scopes must adhere to the principle of least privilege.",
          suggestedSolutions: issue.solutions || [
            {
              title: "Suggested Refactoring",
              description: "Apply standard security and performance bounds.",
              code: issue.afterCode,
              tradeOffs: issue.expectedImprovement || "Mitigates injection risks and reduces runtime resource waste."
            }
          ],
          exportedAt: new Date().toISOString()
        };
        const safeFilename = `${index + 1}_${issue.severity}_${issue.file.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_issue.json`;
        zip.file(`issues/${safeFilename}`, JSON.stringify(issueDetails, null, 2));
      });
      
      // Add recommendations section
      markdownReport += `## 💡 Recommendations\n\n`;
      markdownReport += `### Priority Actions\n\n`;
      if (critical > 0) {
        markdownReport += `1. **🔴 CRITICAL (${critical} issues):** Fix immediately before deployment\n`;
      }
      if (high > 0) {
        markdownReport += `${critical > 0 ? '2' : '1'}. **🟠 HIGH (${high} issues):** Address before next release\n`;
      }
      if (medium > 0) {
        markdownReport += `${(critical > 0 ? 1 : 0) + (high > 0 ? 1 : 0) + 1}. **🟡 MEDIUM (${medium} issues):** Schedule for upcoming sprint\n`;
      }
      markdownReport += `\n`;
      
      markdownReport += `### Best Practices Summary\n\n`;
      markdownReport += `- Use environment variables for secrets\n`;
      markdownReport += `- Implement parameterized queries for SQL\n`;
      markdownReport += `- Store tokens in HttpOnly cookies, not localStorage\n`;
      markdownReport += `- Optimize algorithms (avoid O(n²) loops)\n`;
      markdownReport += `- Use async operations, not sync (fs.readFile vs readFileSync)\n`;
      markdownReport += `- Remove console.log statements before production\n`;
      markdownReport += `- Add test coverage with Vitest/Jest\n\n`;
      
      markdownReport += `---\n\n`;
      markdownReport += `**Report generated by SoftDocAI** - https://softdocai.com\n`;
      markdownReport += `*AI-powered bug detection that teaches best practices*\n`;
      
      // Add the comprehensive report to ZIP
      zip.file('BUG_REPORT.md', markdownReport);
      zip.file('BUG_REPORT.txt', markdownReport.replace(/[#*`]/g, '').replace(/\n\n+/g, '\n\n'));
      
      const content = await zip.generateAsync({ type: 'blob' });
      const downloadAnchor = document.createElement('a');
      const url = URL.createObjectURL(content);
      downloadAnchor.setAttribute('href', url);
      const safeFolderName = folderPath.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'folder';
      downloadAnchor.setAttribute('download', `SoftDocAI_Bug_Report_${safeFolderName}_${Date.now()}.zip`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export all issues as ZIP", err);
      alert("Failed to export issues as a ZIP file.");
    }
  };

  const downloadIssueAsJSON = (issue: FolderIssue, folderPath: string) => {
    try {
      const issueDetails = {
        title: `[SoftDocAI] ${issue.severity.toUpperCase()}: ${issue.message}`,
        severity: issue.severity,
        folder: folderPath,
        file: issue.file,
        line: issue.line,
        message: issue.message,
        explanation: issue.explanation || "The audit indicates potential risks in dynamic execution boundaries inside this module.",
        businessImpact: issue.businessImpact || "Vulnerable code can result in downtime, performance bottlenecks, or security bypasses.",
        seniorCommentary: issue.seniorCommentary || "Logic does not validate bounds or input streams appropriately. Refactoring is required.",
        educationalInsight: issue.educationalInsight || "In secure systems engineering, all execution scopes must adhere to the principle of least privilege.",
        suggestedSolutions: issue.solutions || [
          {
            title: "Suggested Refactoring",
            description: "Apply standard security and performance bounds.",
            code: issue.afterCode,
            tradeOffs: issue.expectedImprovement || "Mitigates injection risks and reduces runtime resource waste."
          }
        ],
        exportedAt: new Date().toISOString()
      };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(issueDetails, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      const safeFilename = `${issue.severity}_${issue.file.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_issue.json`;
      downloadAnchor.setAttribute('download', safeFilename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Failed to export issue details as JSON", err);
      alert("Failed to export issue as JSON file.");
    }
  };

  // Save scan report to local storage history list
  const saveReportToHistory = (projectName: string, m: MetricReport, r: AgentsReport, demo: boolean) => {
    try {
      const historyJson = localStorage.getItem('softdocai_history');
      const historyList: HistoryItem[] = historyJson ? JSON.parse(historyJson) : [];
      
      const totalErrors = Object.values(r.folderAnalysis || {}).reduce((acc: number, f: any) => acc + f.errorsCount, 0);
      
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        projectName: projectName,
        timestamp: Date.now(),
        overallScore: r.overallScore,
        totalFiles: m.totalFiles,
        totalLines: m.totalLines,
        totalErrors: totalErrors,
        metrics: m,
        agentsReport: r,
        isDemo: demo
      };
      
      const updatedList = [newItem, ...historyList].slice(0, 20);
      localStorage.setItem('softdocai_history', JSON.stringify(updatedList));
      setHistory(updatedList);
    } catch (e) {
      console.error('Error saving to local storage history:', e);
    }
  };

  // Load a previously saved report back into focus
  const loadHistoryItem = (item: HistoryItem) => {
    setMetrics(item.metrics);
    setAgentsReport(item.agentsReport);
    setIsDemo(item.isDemo);
    setCurrentProjectName(item.projectName);
    
    if (item.isDemo) {
      const match = SAMPLE_PROJECTS.find(p => p.name === item.projectName);
      if (match) {
        setFiles(match.files);
      }
    }
    
    // Select first folder with issues or key folder
    const folders = Object.keys(item.agentsReport?.folderAnalysis || {});
    if (folders.length > 0) {
      setSelectedFolder(folders[0]);
    } else {
      setSelectedFolder('root');
    }
    
    setScreen('dashboard');
    setActiveTab('dashboard');
  };

  // Delete a single history item
  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering loadHistoryItem
    try {
      const updatedList = history.filter(item => item.id !== id);
      localStorage.setItem('softdocai_history', JSON.stringify(updatedList));
      setHistory(updatedList);
    } catch (e) {
      console.error('Error deleting history item:', e);
    }
  };

  // Clear all saved histories
  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your entire analysis history? This cannot be undone.')) {
      try {
        localStorage.removeItem('softdocai_history');
        setHistory([]);
      } catch (e) {
        console.error('Error clearing history:', e);
      }
    }
  };

  // Export active report to A4 PDF — branded cover + capture + page numbers
  const exportReportToPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setPdfProgress(0);
    setPdfStep('Initialising...');

    const previousTab = activeTab;
    setActiveTab('report');
    await new Promise((resolve) => setTimeout(resolve, 350));

    try {
      setPdfStep('Drawing cover page...');
      setPdfProgress(10);

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = 210;
      const H = 297;
      const MARGIN = 18;
      const CONTENT_W = W - MARGIN * 2;

      // ── Cover Page ────────────────────────────────────────────────
      // Background
      pdf.setFillColor(7, 8, 11);
      pdf.rect(0, 0, W, H, 'F');

      // Top gradient strip
      pdf.setFillColor(16, 185, 129);
      pdf.rect(0, 0, W, 6, 'F');

      // Left accent bar
      pdf.setFillColor(16, 185, 129);
      pdf.rect(0, 0, 4, H, 'F');

      // App logo circle
      pdf.setFillColor(16, 185, 129);
      pdf.circle(MARGIN + 10, 36, 10, 'F');

      // CPU icon approximation — four small lines inside circle
      pdf.setDrawColor(0);
      pdf.setLineWidth(0.6);
      pdf.line(MARGIN + 10, 31, MARGIN + 10, 41);
      pdf.line(MARGIN + 5, 36, MARGIN + 15, 36);

      // App name
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.setTextColor(16, 185, 129);
      pdf.text('SoftDoc', MARGIN + 26, 34);
      pdf.setTextColor(20, 184, 166);
      pdf.text('AI', MARGIN + 26 + 38, 34);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text('SOFTWARE ENGINEERING INSPECTOR', MARGIN, 41);

      // Divider
      pdf.setDrawColor(16, 185, 129);
      pdf.setLineWidth(0.4);
      pdf.line(MARGIN, 48, W - MARGIN, 48);

      // Report title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(241, 242, 246);
      const title = currentProjectName ? `Analysis Report: ${currentProjectName}` : 'Codebase Analysis Report';
      const titleLines = pdf.splitTextToSize(title, CONTENT_W);
      pdf.text(titleLines, MARGIN, 62);

      let y = 62 + titleLines.length * 6 + 8;

      // Date
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      pdf.text(`Generated: ${dateStr} at ${timeStr}`, MARGIN, y);
      y += 6;
      pdf.text(`Engine: SoftDocAI Inspector v2.5  |  PDF Export`, MARGIN, y);
      y += 14;

      // ── Summary Stats ─────────────────────────────────────────────
      if (metrics) {
        const critical = metrics.localIssues.filter((i) => i.severity === 'critical').length;
        const high = metrics.localIssues.filter((i) => i.severity === 'high').length;
        const medium = metrics.localIssues.filter((i) => i.severity === 'medium').length;
        const low = metrics.localIssues.filter((i) => i.severity === 'low').length;

        const stats = [
          { label: 'Files Scanned', value: metrics.totalFiles.toString(), color: [241, 242, 246] },
          { label: 'Lines of Code', value: metrics.totalLines.toString(), color: [241, 242, 246] },
          { label: 'Folders', value: metrics.totalFolders.toString(), color: [241, 242, 246] },
          { label: 'Issues Found', value: metrics.localIssues.length.toString(), color: [16, 185, 129] },
          { label: 'Critical', value: critical.toString(), color: [239, 68, 68] },
          { label: 'High', value: high.toString(), color: [249, 115, 22] },
        ];

        const CARD_W = (CONTENT_W - 5 * 4) / 3;
        const CARD_H = 22;
        const COLS = 3;

        stats.forEach((stat, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const cx = MARGIN + col * (CARD_W + 4);
          const cy = y + row * (CARD_H + 4);

          pdf.setFillColor(13, 14, 18);
          pdf.roundedRect(cx, cy, CARD_W, CARD_H, 2, 2, 'F');
          pdf.setDrawColor(40, 40, 50);
          pdf.setLineWidth(0.3);
          pdf.roundedRect(cx, cy, CARD_W, CARD_H, 2, 2, 'S');

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(13);
          pdf.setTextColor(...(stat.color as [number, number, number]));
          pdf.text(stat.value, cx + 6, cy + 10);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7);
          pdf.setTextColor(100, 116, 139);
          pdf.text(stat.label, cx + 6, cy + 17);
        });

        y += Math.ceil(stats.length / COLS) * (CARD_H + 4) + 10;
      }

      // ── Severity Bar ──────────────────────────────────────────────
      if (metrics && metrics.localIssues.length > 0) {
        const critical = metrics.localIssues.filter((i) => i.severity === 'critical').length;
        const high = metrics.localIssues.filter((i) => i.severity === 'high').length;
        const medium = metrics.localIssues.filter((i) => i.severity === 'medium').length;
        const low = metrics.localIssues.filter((i) => i.severity === 'low').length;
        const total = metrics.localIssues.length;

        const barY = y;
        const barH = 8;
        const BAR_W = CONTENT_W;
        let barX = MARGIN;

        const drawSeg = (frac: number, r: number, g: number, b: number) => {
          const segW = BAR_W * frac;
          pdf.setFillColor(r, g, b);
          pdf.rect(barX, barY, segW, barH, 'F');
          barX += segW;
        };

        if (total > 0) {
          drawSeg(critical / total, 239, 68, 68);
          drawSeg(high / total, 249, 115, 22);
          drawSeg(medium / total, 234, 179, 8);
          drawSeg(low / total, 16, 185, 129);
        }

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        y = barY + barH + 5;

        const segs = [
          { label: 'Critical', count: critical, color: [239, 68, 68] },
          { label: 'High', count: high, color: [249, 115, 22] },
          { label: 'Medium', count: medium, color: [234, 179, 8] },
          { label: 'Low', count: low, color: [16, 185, 129] },
        ];
        segs.forEach((seg, i) => {
          const sx = MARGIN + i * 50;
          pdf.setFillColor(...(seg.color as [number, number, number]));
          pdf.rect(sx, y, 4, 4, 'F');
          pdf.setTextColor(150, 150, 150);
          pdf.text(`${seg.label} ${seg.count}`, sx + 6, y + 3.5);
        });
        y += 14;
      }

      // ── Cover footer ──────────────────────────────────────────────
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(60, 60, 80);
      pdf.text('Confidential — SoftDocAI Generated Document', MARGIN, H - 12);
      pdf.setTextColor(16, 185, 129);
      pdf.text('codedocai.app', W - MARGIN, H - 12, { align: 'right' });

      // ── Report Content Pages ────────────────────────────────────────
      setPdfStep('Capturing report content...');
      setPdfProgress(25);

      const element = document.getElementById('dashboard-content-panel');
      if (!element) throw new Error('Capture target #dashboard-content-panel not found.');

      const prevH = element.style.height;
      const prevMaxH = element.style.maxHeight;
      const prevOverflow = element.style.overflow;
      element.style.height = 'auto';
      element.style.maxHeight = 'none';
      element.style.overflow = 'visible';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#07080a',
        logging: false,
        allowTaint: true,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.getElementById('dashboard-content-panel');
          if (clonedEl) {
            (clonedEl as HTMLElement).style.height = 'auto';
            (clonedEl as HTMLElement).style.maxHeight = 'none';
            (clonedEl as HTMLElement).style.overflow = 'visible';
          }
        },
      });

      element.style.height = prevH;
      element.style.maxHeight = prevMaxH;
      element.style.overflow = prevOverflow;

      setPdfStep('Adding pages...');
      setPdfProgress(60);

      const imgData = canvas.toDataURL('image/png');
      const imgW = 210;
      const imgH = (canvas.height * imgW) / canvas.width;
      const pageH = 297;
      const headerH = 10;
      const footerH = 10;

      const usableH = pageH - headerH - footerH;
      const totalPages = Math.ceil(imgH / usableH);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();

        // Header bar
        pdf.setFillColor(7, 8, 11);
        pdf.rect(0, 0, W, headerH, 'F');
        pdf.setFillColor(16, 185, 129);
        pdf.rect(0, 0, W, 1.5, 'F');
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(100, 116, 139);
        pdf.text('SoftDocAI — Codebase Analysis Report', MARGIN, 6.5);
        pdf.text(`Page ${page + 1} of ${totalPages + 1}`, W - MARGIN, 6.5, { align: 'right' });

        // Content slice
        const srcY = page * usableH;
        const sliceH = Math.min(usableH, imgH - srcY);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.round((sliceH / imgH) * canvas.height);
        const ctx = sliceCanvas.getContext('2d')!;
        ctx.drawImage(canvas, 0, Math.round((srcY / imgH) * canvas.height), sliceCanvas.width, sliceCanvas.height, 0, 0, sliceCanvas.width, sliceCanvas.height);
        const sliceData = sliceCanvas.toDataURL('image/png');
        const sliceW = 210;
        const sliceDisplayH = (sliceCanvas.height * sliceW) / sliceCanvas.width;

        pdf.addImage(sliceData, 'PNG', 0, headerH, sliceW, sliceDisplayH);

        // Footer bar
        const footerY = pageH - footerH;
        pdf.setFillColor(7, 8, 11);
        pdf.rect(0, footerY, W, footerH, 'F');
        pdf.setFillColor(16, 185, 129);
        pdf.rect(0, footerY, W, 1.5, 'F');
        pdf.setFontSize(6.5);
        pdf.setTextColor(60, 60, 80);
        const ts = now.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
        pdf.text(`Generated ${ts} by SoftDocAI Inspector`, MARGIN, footerY + 6.5);
      }

      setPdfStep('Finalising...');
      setPdfProgress(90);

      const formattedName = (currentProjectName || 'Workspace').replace(/[^a-zA-Z0-9]/g, '_');
      const timestamp = now.toISOString().slice(0, 10);
      pdf.save(`SoftDocAI_Report_${formattedName}_${timestamp}.pdf`);

      setPdfProgress(100);
      setPdfStep('Done!');
      setTimeout(() => {
        setIsExporting(false);
        setPdfProgress(0);
        setPdfStep('');
      }, 1200);

      showToast('success', 'PDF report downloaded successfully!');
    } catch (err) {
      console.error('Failed to generate PDF Report:', err);
      setIsExporting(false);
      setPdfProgress(0);
      setPdfStep('');
      showToast('error', `PDF export failed: ${(err as Error).message}`);
    } finally {
      setActiveTab(previousTab);
      if (isExporting) {
        setIsExporting(false);
        setPdfProgress(0);
        setPdfStep('');
      }
    }
  };

  // ── CI Badge Generator ───────────────────────────────────────────
  type BadgeStatus = 'passed' | 'failed' | 'warning';
  const computeBadgeStatus = (): BadgeStatus => {
    if (!metrics) return 'warning';
    const critical = metrics.localIssues.filter(i => i.severity === 'critical').length;
    const high = metrics.localIssues.filter(i => i.severity === 'high').length;
    const totalIssues = metrics.localIssues.length;
    const score = agentsReport?.architecture?.grade
      ? (agentsReport.architecture.grade.charCodeAt(0) - 64) * 10
      : 0;
    if (critical > 0 || score < badgeThreshold) return 'failed';
    if (high > 0 || totalIssues > 5) return 'warning';
    return 'passed';
  };

  const badgeStatus = computeBadgeStatus();
  const statusLabel = badgeStatus === 'passed' ? 'PASSED' : badgeStatus === 'failed' ? 'FAILED' : 'WARNING';
  const statusColor = badgeStatus === 'passed' ? { bg: '#16a34a', fg: '#ffffff', rgb: [22,163,74] }
    : badgeStatus === 'failed' ? { bg: '#dc2626', fg: '#ffffff', rgb: [220,38,38] }
    : { bg: '#d97706', fg: '#ffffff', rgb: [217,119,6] };

  const projectSlug = (currentProjectName || 'CodeDocAI').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

  const BADGE_MARKDOWN = `[![CodeDocAI](https://img.shields.io/badge/CodeDocAI-${statusLabel}-${encodeURIComponent(statusColor.bg)}?style=flat-square)](https://codedocai.app)`;

  const BADGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="128" height="20" role="img" aria-label="CodeDocAI ${statusLabel}">
  <title>CodeDocAI: ${statusLabel}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="${statusColor.bg}" stop-opacity=".9"/>
    <stop offset="1" stop-color="${statusColor.bg}" stop-opacity=".6"/>
  </linearGradient>
  <maskGroup id="m">
    <rect width="100" height="20" rx="4" fill="#fff"/>
  </maskGroup>
  <g mask="url(#m)">
    <rect width="86" height="20" fill="${statusColor.bg}"/>
    <rect x="86" width="44" height="20" fill="url(#s)"/>
    <rect width="20" height="20" fill="#111" fill-opacity=".3"/>
  </g>
  <g fill="${statusColor.fg}" text-anchor="middle" font-family="Verdana,DejaVu Sans,sans-serif" font-size="11">
    <text x="43" y="14" fill="${statusColor.fg}">CodeDocAI</text>
    <text x="108" y="14" fill="${statusColor.fg}">${statusLabel}</text>
  </g>
</svg>`;

  const BADGE_HTML = `<a href="https://codedocai.app" target="_blank" rel="noopener noreferrer">
  <img
    src="https://img.shields.io/badge/CodeDocAI-${statusLabel}-${encodeURIComponent(statusColor.bg)}?style=flat-square"
    alt="CodeDocAI ${statusLabel}"
  />
</a>`;

  const currentBadge = badgeTab === 'markdown' ? BADGE_MARKDOWN
    : badgeTab === 'svg' ? BADGE_SVG
    : BADGE_HTML;

  // ── Diff Engine ─────────────────────────────────────────────────
  type DiffLineType = 'add' | 'del' | 'context';
  type DiffLine = { type: DiffLineType; text: string; oldLine: number | null; newLine: number | null };
  type Hunk = { oldStart: number; newStart: number; lines: DiffLine[] };

  const computeLineDiff = (a: string[], b: string[]): DiffLine[] => {
    const m = a.length, n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
    const backtrack = (i: number, j: number, out: DiffLine[]): void => {
      if (i === 0 && j === 0) return;
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
        backtrack(i - 1, j - 1, out);
        out.push({ type: 'context', text: a[i - 1], oldLine: i, newLine: j });
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        backtrack(i, j - 1, out);
        out.push({ type: 'add', text: b[j - 1], oldLine: null, newLine: j });
      } else {
        backtrack(i - 1, j, out);
        out.push({ type: 'del', text: a[i - 1], oldLine: i, newLine: null });
      }
    };
    const result: DiffLine[] = [];
    backtrack(m, n, result);
    return result;
  };

  const splitIntoHunks = (lines: DiffLine[], context = 3): Hunk[] => {
    const hunks: Hunk[] = [];
    let i = 0;
    while (i < lines.length) {
      if (lines[i].type !== 'context') {
        const start = Math.max(0, i - context);
        const end = Math.min(lines.length - 1, i + context - 1 + lines.slice(i).findIndex(l => l.type === 'context' || l === lines[lines.length - 1]));
        let j = end;
        while (j + 1 < lines.length && lines[j + 1].type === 'context') j++;
        const hunkLines = lines.slice(start, j + 1);
        const oldLines = hunkLines.filter(l => l.oldLine !== null);
        const newLines = hunkLines.filter(l => l.newLine !== null);
        hunks.push({
          oldStart: oldLines.length > 0 ? oldLines[0].oldLine! : 0,
          newStart: newLines.length > 0 ? newLines[0].newLine! : 0,
          lines: hunkLines,
        });
        i = j + 1;
      } else { i++; }
    }
    return hunks;
  };

  // Word-level diff for inline highlighting within side-by-side cells
  type WordSeg = { text: string; type: DiffLineType };
  const computeWordDiff = (a: string, b: string): WordSeg[] => {
    const wa = a.trim().split(/\s+/);
    const wb = b.trim().split(/\s+/);
    const diff = computeLineDiff(wa, wb);
    return diff.map(l => ({ text: l.text, type: (l.type === 'add' ? 'add' : l.type === 'del' ? 'del' : 'context') as DiffLineType }));
  };

  // Apply Prism syntax highlighting to a code string and return HTML
  const highlightCode = (code: string, lang: string): string => {
    try {
      const grammar = Prism.languages[lang] || Prism.languages['javascript'] || Prism.languages['markup'];
      if (grammar) {
        const highlighted = Prism.highlight(code, grammar, lang);
        return highlighted;
      }
    } catch { /* no-op */ }
    return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  const detectLang = (code: string): string => {
    if (code.includes('function') || code.includes('const ') || code.includes('=>') || code.includes('let ')) return 'javascript';
    if (code.includes('def ') || code.includes('import ') && code.includes(':')) return 'python';
    if (code.includes('interface ') || code.includes(': string') || code.includes(': number')) return 'typescript';
    if (code.includes('<') && code.includes('>') && (code.includes('/') || code.includes('</'))) return 'markup';
    if (code.includes('{') && code.includes(':') && !code.includes('function')) return 'javascript';
    return 'javascript';
  };

  const DiffBadge = ({ type }: { type: DiffLineType }) => {
    if (type === 'add') return <span className="text-emerald-400 font-bold select-none w-5 text-center flex-shrink-0">+</span>;
    if (type === 'del') return <span className="text-red-400 font-bold select-none w-5 text-center flex-shrink-0">−</span>;
    return <span className="text-gray-600 select-none w-5 text-center flex-shrink-0">&nbsp;</span>;
  };

  // ── Unified Diff Renderer ────────────────────────────────────────
  const renderUnifiedDiff = (before: string, after: string) => {
    const aLines = before.trim().split('\n');
    const bLines = after.trim().split('\n');
    const diff = computeLineDiff(aLines, bLines);
    const hunks = splitIntoHunks(diff);
    const lang = detectLang(before);
    const hasChanges = diff.some(l => l.type !== 'context');

    if (!hasChanges) {
      return (
        <div className="font-mono text-xs bg-[#030406] border border-gray-800 rounded-xl p-6 text-center text-gray-500">
          No line-level differences detected.
        </div>
      );
    }

    const totalAdds = diff.filter(l => l.type === 'add').length;
    const totalDels = diff.filter(l => l.type === 'del').length;

    return (
      <div className="font-mono text-xs bg-[#030406] border border-gray-900 rounded-xl overflow-hidden leading-relaxed text-left">
        <div className="bg-gray-950 px-4 py-2.5 border-b border-gray-900/50 flex justify-between items-center">
          <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Unified Suggested Diff</span>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="text-red-400">−{totalDels}</span>
            <span className="text-emerald-400">+{totalAdds}</span>
            <span className="text-gray-600">{hunks.length} hunk{hunks.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          {hunks.map((hunk, hi) => (
            <div key={hi} className="border-t border-gray-900 first:border-t-0">
              {/* Hunk header */}
              <div className="bg-gray-900/50 px-4 py-1.5 text-[10px] text-blue-400 font-bold">
                {`@@ -${hunk.oldStart}, +${hunk.newStart} @@`}
              </div>
              {hunk.lines.map((line, li) => {
                const segs = line.type === 'context'
                  ? [{ text: line.text, type: 'context' as DiffLineType }]
                  : line.type === 'add'
                  ? [{ text: line.text, type: 'add' as DiffLineType }]
                  : [{ text: line.text, type: 'del' as DiffLineType }];

                return (
                  <div
                    key={li}
                    className={`flex hover:bg-white/3 transition-colors ${
                      line.type === 'add' ? 'bg-emerald-950/20' :
                      line.type === 'del' ? 'bg-red-950/15' : ''
                    }`}
                  >
                    {/* Old line number */}
                    <span className={`w-12 flex-shrink-0 text-right pr-2 py-0.5 text-[10px] select-none border-r border-gray-900 ${
                      line.type === 'del' ? 'text-red-500/60' : 'text-gray-600'
                    }`}>
                      {line.oldLine ?? ''}
                    </span>
                    {/* New line number */}
                    <span className={`w-12 flex-shrink-0 text-right pr-2 py-0.5 text-[10px] select-none border-r border-gray-900 ${
                      line.type === 'add' ? 'text-emerald-500/60' : 'text-gray-600'
                    }`}>
                      {line.newLine ?? ''}
                    </span>
                    {/* +/- badge */}
                    <DiffBadge type={line.type} />
                    {/* Code content */}
                    <div
                      className={`flex-1 px-3 py-0.5 overflow-x-auto whitespace-pre ${
                        line.type === 'add' ? 'text-emerald-300' :
                        line.type === 'del' ? 'text-red-300 line-through opacity-70' :
                        'text-gray-300'
                      }`}
                      dangerouslySetInnerHTML={{ __html: highlightCode(line.text || ' ', lang) }}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-900/50 text-[10px] text-gray-600 font-mono">
          <span><span className="text-red-400">−</span> removed</span>
          <span><span className="text-emerald-400">+</span> added</span>
          <span className="text-gray-600">context</span>
        </div>
      </div>
    );
  };

  // ── Enhanced Side-by-Side Diff Renderer ────────────────────────
  const renderSideBySideDiff = (before: string, after: string) => {
    const aLines = before.trim().split('\n');
    const bLines = after.trim().split('\n');
    const lineDiff = computeLineDiff(aLines, bLines);
    const lang = detectLang(before);

    const leftLines: { type: DiffLineType; text: string; wordSegs?: WordSeg[] }[] = [];
    const rightLines: { type: DiffLineType; text: string; wordSegs?: WordSeg[] }[] = [];

    let ai = 0, bi = 0;
    for (const dl of lineDiff) {
      if (dl.type === 'context') {
        leftLines.push({ type: 'context', text: dl.text });
        rightLines.push({ type: 'context', text: dl.text });
      } else if (dl.type === 'del') {
        // Peek at corresponding "add" line for word diff
        const nextAdd = lineDiff.find((l, idx) => {
          const currentIdx = lineDiff.indexOf(dl);
          return idx > currentIdx && l.type === 'add';
        });
        if (nextAdd) {
          const segs = computeWordDiff(dl.text, nextAdd.text);
          leftLines.push({ type: 'del', text: dl.text, wordSegs: segs });
          rightLines.push({ type: 'add', text: nextAdd.text, wordSegs: segs });
        } else {
          leftLines.push({ type: 'del', text: dl.text });
          rightLines.push({ type: 'add', text: '' });
        }
      }
    }

    // Rebuild from raw lines for simplicity when pairing gets complex
    const left: { type: DiffLineType; text: string; wordSegs?: WordSeg[] }[] = aLines.map((l, i) => ({ type: 'context' as DiffLineType, text: l }));
    const right: { type: DiffLineType; text: string; wordSegs?: WordSeg[] }[] = bLines.map((l, i) => ({ type: 'context' as DiffLineType, text: l }));

    for (const dl of lineDiff) {
      if (dl.type === 'add') {
        right.push({ type: 'add', text: dl.text });
      } else if (dl.type === 'del') {
        left.push({ type: 'del', text: dl.text });
      }
    }

    const renderCell = (line: { type: DiffLineType; text: string; wordSegs?: WordSeg[] }, isLeft: boolean) => {
      const bgClass = line.type === 'add'
        ? 'bg-emerald-950/20'
        : line.type === 'del'
        ? 'bg-red-950/15'
        : '';
      const textClass = line.type === 'add'
        ? 'text-emerald-300'
        : line.type === 'del'
        ? 'text-red-300'
        : 'text-gray-300';

      if (line.wordSegs) {
        return (
          <div className={`flex ${bgClass} min-h-[1.7rem]`}>
            {isLeft
              ? line.wordSegs.filter(s => s.type !== 'add').map((s, i) => (
                  <span key={i} className={s.type === 'del' ? 'bg-red-500/30 text-red-200 rounded px-0.5' : 'text-gray-300'}>
                    {s.text}
                  </span>
                ))
              : line.wordSegs.filter(s => s.type !== 'context' || true).map((s, i) => (
                  <span key={i} className={s.type === 'add' ? 'bg-emerald-500/30 text-emerald-200 rounded px-0.5' : 'text-gray-300'}>
                    {s.text}
                  </span>
                ))
            }
          </div>
        );
      }

      if (line.text === '') {
        return <div className={`flex ${bgClass} min-h-[1.7rem]`} />;
      }

      return (
        <div
          className={`${bgClass} ${textClass} overflow-x-auto whitespace-pre px-3 py-0.5 min-h-[1.7rem] flex items-start`}
          dangerouslySetInnerHTML={{ __html: highlightCode(line.text, lang) }}
        />
      );
    };

    const maxRows = Math.max(left.length, right.length);
    const addedCount = right.filter(l => l.type === 'add').length;
    const removedCount = left.filter(l => l.type === 'del').length;

    return (
      <div className="font-mono text-xs bg-[#030406] border border-gray-900 rounded-xl overflow-hidden leading-relaxed text-left">
        <div className="bg-gray-950 px-4 py-2 border-b border-gray-900/50 flex justify-between items-center">
          <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Side-by-Side Diff</span>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="text-red-400">−{removedCount} removed</span>
            <span className="text-emerald-400">+{addedCount} added</span>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          {/* Column headers */}
          <div className="grid grid-cols-2 border-b border-gray-900 sticky top-0 z-10 bg-[#07080b]">
            <div className="px-3 py-1.5 text-[10px] text-red-400 font-bold border-r border-gray-900 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>ORIGINAL
            </div>
            <div className="px-3 py-1.5 text-[10px] text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>REFACTORED
            </div>
          </div>
          {Array.from({ length: maxRows }, (_, i) => {
            const l = left[i];
            const r = right[i];
            return (
              <div key={i} className="grid grid-cols-2 border-t border-gray-900/50 hover:bg-white/[0.02]">
                <div className="border-r border-gray-900/50">
                  {l ? renderCell(l, true) : <div className="min-h-[1.7rem]" />}
                </div>
                <div>
                  {r ? renderCell(r, false) : <div className="min-h-[1.7rem]" />}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-900/50 text-[10px] text-gray-600 font-mono">
          <span><span className="text-red-400 bg-red-500/20 px-1 rounded">changed</span> word-level diff</span>
          <span className="text-gray-700">·</span>
          <span className="text-emerald-400 bg-emerald-500/10 px-1 rounded">added</span>
          <span className="text-gray-700">·</span>
          <span className="text-red-400 bg-red-500/10 px-1 rounded">removed</span>
        </div>
      </div>
    );
  };
  
  // Key Input Modal / Setup
  const [apiKeySet, setApiKeySet] = useState<boolean>(true); // Assume auto injected backend or server side API key
  const [showConfigHint, setShowConfigHint] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Sample Projects
  const SAMPLE_PROJECTS = [
    {
      name: 'Spring Boot Hospital System',
      description: 'Java 17, Spring Boot, Spring Security, Hibernate ORM, MySQL',
      filesCount: 18,
      lang: 'java',
      files: [
        {
          path: 'src/main/java/com/med/hospital/controller/AuthController.java',
          content: `package com.med.hospital.controller;

import org.springframework.web.bind.annotation.*;
import com.med.hospital.dto.LoginRequest;
import com.med.hospital.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final AuthService authService;
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    @PostMapping("/login")
    public String login(@RequestBody LoginRequest req) {
        // Plain text credentials validation is unsecure
        if (req.getUsername().equals("admin") && req.getPassword().equals("SuperSecretAdminPassword123")) {
            return "JWT-TOKEN-ROOT-SESSION";
        }
        return authService.authenticate(req);
    }
}`,
          size: 710
        },
        {
          path: 'src/main/java/com/med/hospital/service/AppointmentService.java',
          content: `package com.med.hospital.service;

import org.springframework.stereotype.Service;
import com.med.hospital.repository.AppointmentRepository;
import com.med.hospital.model.Appointment;
import java.util.List;

@Service
public class AppointmentService {
    
    private final AppointmentRepository repo;
    
    public AppointmentService(AppointmentRepository repo) {
        this.repo = repo;
    }
    
    public List<Appointment> getAppointmentsForPatient(Long patientId) {
        List<Appointment> all = repo.findAll();
        // O(n^2) filter complexity in business service layer instead of indexed queries
        for (int i = 0; i < all.size(); i++) {
            for (int j = i + 1; j < all.size(); j++) {
                if (all.get(i).getPatientId().equals(all.get(j).getPatientId())) {
                     // Simulated loop nested issue
                }
            }
        }
        return repo.findByPatientId(patientId);
    }
}`,
          size: 890
        },
        {
          path: 'src/main/resources/application.properties',
          content: `spring.datasource.url=jdbc:mysql://localhost:3306/hospital_db?useSSL=false
spring.datasource.username=root
spring.datasource.password=admin_root_pass_dont_change
spring.jpa.hibernate.ddl-auto=update
jwt.secret=9Y3kZ8mPqW1sX5vT2cR7bN4nU6vY2xZ5qR8m
server.port=8080`,
          size: 245
        },
        {
          path: 'src/main/java/com/med/hospital/controller/AuthControllerTest.java',
          content: `package com.med.hospital.controller;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class AuthControllerTest {
    @Test
    public void testLoginWithUnsecureCredentials() {
        AuthController controller = new AuthController(null);
    }
}`,
          size: 320
        },
        {
          path: 'src/main/java/com/med/hospital/service/AppointmentServiceTest.java',
          content: `package com.med.hospital.service;

import org.junit.jupiter.api.Test;

public class AppointmentServiceTest {
    @Test
    public void testGetAppointmentsForPatient() {
    }
}`,
          size: 280
        }
      ]
    },
    {
      name: 'Netflix Clone Dashboard',
      description: 'React 19, TypeScript, Express Node.js Backend, Local Storage Auth',
      filesCount: 14,
      lang: 'javascript',
      files: [
        {
          path: 'server/routes/movies.js',
          content: `const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/search', async (req, res) => {
  const query = req.query.q;
  // SQL Injection risk: raw string concatenation
  const sql = "SELECT * FROM movies WHERE title = '" + query + "' AND active = 1";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.log("Database fetch failed", err);
      return res.status(500).json(err);
    }
    res.json(results);
  });
});

module.exports = router;`,
          size: 450
        },
        {
          path: 'src/components/Navbar.tsx',
          content: `import React from 'react';

export default function Navbar() {
  const handleLogout = () => {
    // Session stored insecurely in localStorage
    localStorage.setItem('session_token', '');
    localStorage.setItem('auth_user_details', '');
    window.location.href = '/login';
  };
  
  return (
    <nav className="flex items-center justify-between p-4 bg-black text-white">
      <h1>Netflix Clone</h1>
      <button onClick={handleLogout} className="px-4 py-2 bg-red-600 rounded">Logout</button>
    </nav>
  );
}`,
          size: 480
        },
        {
          path: 'server/routes/movies.test.js',
          content: `const request = require('supertest');
const router = require('./movies');

describe('Movies API endpoints', () => {
  test('GET /search retrieves active movies', () => {
  });
});`,
          size: 210
        },
        {
          path: 'src/components/Navbar.spec.tsx',
          content: `import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';

describe('Navbar UI Component', () => {
  it('renders navbar brand logo', () => {
  });
});`,
          size: 340
        }
      ]
    },
    {
      name: 'Task Manager Micro-API',
      description: 'Python 3.12, Flask, SQLite, Simple JWT Token verification',
      filesCount: 9,
      lang: 'python',
      files: [
        {
          path: 'app/api/tasks.py',
          content: `import os
from flask import Blueprint, request, jsonify
from app.db import get_db

bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')

@bp.route('/delete', methods=['POST'])
def delete_task():
    task_id = request.form.get('id')
    # SQL injection vulnerability via dynamic query construction
    query = f"DELETE FROM tasks WHERE id = {task_id}"
    db = get_db()
    db.execute(query)
    db.commit()
    return jsonify({"status": "deleted"}), 200`,
          size: 430
        },
        {
          path: 'app/utils/security.py',
          content: `import jwt

SECRET_KEY = "SUPER_SECURE_TOKEN_DEVELOPER_KEY_XYZ"

def verify_token(token):
    # Insecure decoding without signature validation
    return jwt.decode(token, options={"verify_signature": False})`,
          size: 210
        },
        {
          path: 'app/api/tasks_test.py',
          content: `import unittest
from app.api.tasks import delete_task

class TasksApiTest(unittest.TestCase):
    def test_delete_task_vulnerabilities(self):
        # Assert database execution constructs
        pass`,
          size: 200
        },
        {
          path: 'app/utils/security_test.py',
          content: `import pytest
from app.utils.security import verify_token

def test_verify_token_weaknesses():
    # Assert jwt options bypass signatures
    pass`,
          size: 170
        }
      ]
    }
  ];

  const triggerStepProgress = async (uploadedFiles: CodeFile[], nameOption?: string) => {
    setFiles(uploadedFiles);
    setScreen('scanning');
    setLoadingLog([]);
    setLoadingStep(0);

    // Instantiate our Dedicated Event-Listener progress system
    const emitter = new AnalysisProgressEmitter();

    // Wire up our Event-Listener subscribers for real-time UI logging and step status
    emitter.addEventListener('log', (e: any) => {
      setLoadingLog((prev) => [...prev, e.detail]);
    });

    emitter.addEventListener('progress', (e: any) => {
      const { percent, statusText } = e.detail;
      if (statusText) {
        setLoadingLog((prev) => [...prev, `[WORKER] ${statusText} (${percent}%)`]);
      }
    });

    emitter.addEventListener('step', (e: any) => {
      const { stepIndex, text } = e.detail;
      setLoadingStep(stepIndex);
      setLoadingLog((prev) => [...prev, `[PROCESS] ${text}`]);
    });

    try {
      emitter.log('[SYSTEM] Initializing dedicated Web Worker thread for file processing...');

      // Spawn worker using module type for native Vite bundle support
      const worker = new Worker(
        new URL('./workers/analysis.worker.ts', import.meta.url),
        { type: 'module' }
      );

      emitter.log('[SYSTEM] Web Worker spawned successfully. Offloading static analysis & metric parsing...');

      // Wait for background worker to perform heavy static checks and count files
      const localMetrics = await new Promise<MetricReport>((resolve, reject) => {
        worker.onmessage = (event) => {
          const { type, data, error } = event.data;
          if (type === 'progress') {
            emitter.progress(data.percent, data.statusText, data.filename);
          } else if (type === 'complete') {
            resolve(data);
            worker.terminate();
          } else if (type === 'error') {
            reject(new Error(error));
            worker.terminate();
          }
        };
        worker.onerror = (err) => {
          reject(err);
          worker.terminate();
        };
        // Send payload to worker thread
        worker.postMessage({ files: uploadedFiles, customRules: customRulePack?.rules || [] });
      });

      emitter.log(`[SUCCESS] Web Worker parsing complete. Analyzed ${localMetrics.totalFiles} files (${localMetrics.totalLines} lines of code).`);
      setMetrics(localMetrics);

      // Transition through AI Multi-Agent orchestration phases
      const steps = [
        { text: '🤖 Bootstrapping SoftDocAI Multi-Agent Orchestrator...', delay: 100 },
        { text: '🧠 Instantiating Architecture Agent (Evaluating patterns)...', delay: 100 },
        { text: '🔒 Instantiating Security Agent (Analyzing data sanitization & injection)...', delay: 100 },
        { text: '⚡ Instantiating Performance Agent (Calculating database scaling parameters)...', delay: 100 },
        { text: '📈 Running Predictive Production Risk Simulator...', delay: 120 },
        { text: '✍️ Compiling Senior Developer Mentor Report...', delay: 100 }
      ];

      for (let i = 0; i < steps.length; i++) {
        // Steps 5 to 10 are the AI agents
        emitter.step(i + 5, steps[i].text);
        await new Promise((res) => setTimeout(res, steps[i].delay));
      }

      // Invoke server-side Gemini Multi-Agent analysis
      emitter.log('[API] Invoking server-side Gemini Code Audit Agents...');
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: uploadedFiles, customRules: customRulePack?.rules || [] }),
      });

      if (!res.ok) {
        throw new Error('API analysis request returned error state.');
      }

      const data = await res.json();
      setMetrics(data.metrics);
      setAgentsReport(data.agentsReport);
      setKnowledgeGraph(data.knowledgeGraph || null);
      setIsDemo(data.demo || false);
      
      // Log knowledge graph stats if available
      if (data.knowledgeGraph) {
        emitter.log(`[GRAPH] Knowledge Graph built: ${data.knowledgeGraph.statistics?.totalNodes || 0} nodes, ${data.knowledgeGraph.statistics?.totalEdges || 0} edges`);
        emitter.log(`[GRAPH] Modules detected: ${data.knowledgeGraph.modules?.length || 0}`);
      }

      // Select first folder with issues or key folder
      const folders = Object.keys(data.agentsReport?.folderAnalysis || {});
      if (folders.length > 0) {
        setSelectedFolder(folders[0]);
      } else {
        setSelectedFolder('root');
      }

      const projName = nameOption || currentProjectName || 'Custom Repository Audit';
      saveReportToHistory(projName, data.metrics, data.agentsReport, data.demo || false);

      emitter.log('[SUCCESS] AI Engineering multi-agent report consolidated successfully.');
      setTimeout(() => {
        setScreen('dashboard');
        setActiveTab('dashboard');
      }, 500);

    } catch (err: any) {
      emitter.log(`[ERROR] Scanning pipeline failed: ${err.message}`);
      emitter.log('[FALLBACK] Initializing Sandbox Pre-compiled Inspector Report.');
      await new Promise((r) => setTimeout(r, 1000));

      const fallbackMetrics = mockMetricsForFiles(uploadedFiles);
      const fallbackReport = mockAgentsReportForFiles(uploadedFiles);
      setMetrics(fallbackMetrics);
      setAgentsReport(fallbackReport);
      setIsDemo(true);
      setSelectedFolder(Object.keys(fallbackReport.folderAnalysis)[0] || 'root');

      const projName = nameOption || currentProjectName || 'Custom Repository Audit';
      saveReportToHistory(projName, fallbackMetrics, fallbackReport, true);

      setScreen('dashboard');
      setActiveTab('dashboard');
    }
  };

  const mockMetricsForFiles = (uploadedFiles: CodeFile[]): MetricReport => {
    return {
      totalFiles: uploadedFiles.length,
      totalFolders: Math.max(1, new Set(uploadedFiles.map(f => f.path.split('/').slice(0, -1).join('/'))).size),
      totalLines: uploadedFiles.reduce((acc, f) => acc + f.content.split('\n').length, 0),
      languageCounts: { java: 3, ts: 1, js: 1, py: 1 },
      folderMetrics: {
        'src/main/java/com/med/hospital/controller': { files: 1, lines: 35, errors: 1 },
        'src/main/java/com/med/hospital/service': { files: 1, lines: 45, errors: 1 },
        'src/main/resources': { files: 1, lines: 10, errors: 1 },
        'server/routes': { files: 1, lines: 25, errors: 1 },
        'src/components': { files: 1, lines: 20, errors: 1 }
      },
      localIssues: []
    };
  };

  const mockAgentsReportForFiles = (uploadedFiles: CodeFile[]): AgentsReport => {
    return {
      overallScore: 78,
      architecture: {
        pattern: 'Layered MVC with Client-Server architecture',
        description: 'Detected a heterogeneous mixed repository containing Spring Boot service nodes combined with JavaScript presentation controls.',
        modules: ['Hospital Admin Module', 'Insecure Authentication Provider', 'Local Storage Handler'],
        grade: '★★★★☆',
        feedback: 'Architectural separation of API and Core endpoints is excellent. However, avoid blending distinct backend runtimes inside the same folder root.'
      },
      security: {
        score: 64,
        grade: '★★★☆☆',
        findings: [
          { severity: 'critical', type: 'Plaintext Hardcoded Admin Passwords', message: 'Credentials "SuperSecretAdminPassword123" is written inside AuthController.java.' },
          { severity: 'high', type: 'SQL Injection Dynamic Formatting', message: 'Insecure string concatenations are used within sql execute parameters inside movie routing tables.' }
        ],
        feedback: 'Extract all raw passwords and API secrets into environment-level variables. Use parameterized queries.'
      },
      performance: {
        score: 75,
        grade: '★★★★☆',
        feedback: 'Service components carry nested loops representing O(n^2) filter latency risks on high traffic.'
      },
      maintainability: {
        score: 82,
        grade: '★★★★☆',
        feedback: 'Standard language conventions are followed. Variable identifiers are self-descriptive.'
      },
      testing: {
        score: 30,
        grade: '★☆☆☆☆',
        feedback: 'No visible test directories or mock verification libraries found in scope.'
      },
      risk: {
        level: 'HIGH',
        scaling: 'Under 10,000 peak concurrent users, nested algorithms will consume massive thread overhead leading to connection dropouts.',
        recommendations: [
          'Replace nested Java nested loops with a HashSet search lookup.',
          'Inject Database parameter bindings to eliminate SQL inject channels.',
          'Transition credentials storage to JWT safe signatures with active secrets verification.'
        ]
      },
      folderAnalysis: {
        'src/main/java/com/med/hospital/controller': {
          errorsCount: 1,
          summary: 'Handles Authentication and user entry endpoints. Contains high risk hardcoded validation statements.',
          issues: [
            {
              file: 'AuthController.java',
              line: 18,
              severity: 'critical',
              message: 'Hardcoded password comparison string matches literal "SuperSecretAdminPassword123".',
              seniorCommentary: 'Comparing input credentials directly with plaintext hardcoded secrets inside compiled bytecode lets any class decompiler easily compromise administrative control.',
              beforeCode: 'if (req.getUsername().equals("admin") && req.getPassword().equals("SuperSecretAdminPassword123")) { \n    return "JWT-TOKEN-ROOT-SESSION"; \n}',
              afterCode: '// Use bcrypt password encoder mapping to load values securely from config\nif (authService.verifyCredentials(req.getUsername(), req.getPassword())) {\n    return authService.generateSecuredToken(req.getUsername());\n}',
              expectedImprovement: 'Eliminates codebase decompiler passwords leakage vector. Restores standard cryptographical protection.'
            }
          ]
        },
        'src/main/java/com/med/hospital/service': {
          errorsCount: 1,
          summary: 'Handles Core appointment services. Contains poorly structured algorithm processing.',
          issues: [
            {
              file: 'AppointmentService.java',
              line: 20,
              severity: 'medium',
              message: 'O(n^2) nested loop over complete database list queries.',
              seniorCommentary: 'This algorithm executes a nested for-loop over patient directories to match ids. If patient registration expands, page loading latency increases quadratic-wise.',
              beforeCode: 'for (int i = 0; i < all.size(); i++) {\n    for (int j = i + 1; j < all.size(); j++) {\n        if (all.get(i).getPatientId().equals(all.get(j).getPatientId())) { ... }\n    }\n}',
              afterCode: '// Use an indexed Map lookup with single iteration O(N) complexity\nSet<Long> patientIdSet = all.stream().map(Appointment::getPatientId).collect(Collectors.toSet());',
              expectedImprovement: 'Scales linearly instead of quadratically. Speeds up iteration processes by 98% under peak workloads.'
            }
          ]
        },
        'server/routes': {
          errorsCount: 1,
          summary: 'Defines Express routing table queries. Vulnerable to injection vectors.',
          issues: [
            {
              file: 'movies.js',
              line: 9,
              severity: 'high',
              message: 'Dynamic database formatting parameter binds input query without sanitization.',
              seniorCommentary: 'Concatenating raw HTTP request query properties directly onto standard database queries permits attackers to execute SQL command escapes.',
              beforeCode: 'const sql = "SELECT * FROM movies WHERE title = \'" + query + "\' AND active = 1";',
              afterCode: '// Utilize binding parameters for secure queries mapping\nconst sql = "SELECT * FROM movies WHERE title = ? AND active = 1";\ndb.query(sql, [query], (err, results) => { ... });',
              expectedImprovement: 'Protects the database engine from SQL injection attacks.'
            }
          ]
        }
      }
    };
  };

  // HTML5 folder upload parser
  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setScreen('scanning');
    setLoadingLog(['[SYSTEM] Initializing Folder ingestion parser...']);
    const loadedFiles: CodeFile[] = [];

    const total = fileList.length;
    for (let i = 0; i < total; i++) {
      const file = fileList[i];
      const filePath = file.webkitRelativePath || file.name;
      
      // Skip heavy standard files or lockfiles to preserve server buffer size
      if (
        filePath.includes('node_modules') ||
        filePath.includes('.git') ||
        filePath.includes('dist') ||
        filePath.includes('build') ||
        file.name.endsWith('.png') ||
        file.name.endsWith('.jpg') ||
        file.name.endsWith('.jpeg') ||
        file.name.endsWith('.gif') ||
        file.name.endsWith('.ico') ||
        file.name.endsWith('package-lock.json') ||
        file.name.endsWith('yarn.lock')
      ) {
        continue;
      }

      setUploadProgress(Math.round((i / total) * 100));
      const content = await file.text();
      loadedFiles.push({
        path: filePath,
        content: content,
        size: file.size
      });
    }

    if (loadedFiles.length === 0) {
      setScreen('upload');
      alert('No compatible code files found in selected folder tree.');
      return;
    }

    const folderName = fileList[0].webkitRelativePath ? fileList[0].webkitRelativePath.split('/')[0] : 'Workspace Folder';
    setCurrentProjectName(folderName);
    triggerStepProgress(loadedFiles, folderName);
  };

  // ZIP File Extraction using JSZip
  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    setScreen('scanning');
    setLoadingLog(['[SYSTEM] Extracting compressed .zip workspace files...', `[SYSTEM] Processing: ${file.name}`]);
    
    try {
      const zip = await JSZip.loadAsync(file);
      const loadedFiles: CodeFile[] = [];
      const keys = Object.keys(zip.files);
      const total = keys.length;

      let processed = 0;
      for (const relativePath of keys) {
        processed++;
        setUploadProgress(Math.round((processed / total) * 100));
        const zipEntry = zip.files[relativePath];
        
        if (zipEntry.dir) continue;
        
        // Filter out binaries
        if (
          relativePath.includes('node_modules') ||
          relativePath.includes('.git') ||
          relativePath.includes('dist') ||
          relativePath.includes('build') ||
          relativePath.endsWith('.png') ||
          relativePath.endsWith('.jpg') ||
          relativePath.endsWith('.jpeg') ||
          relativePath.endsWith('.gif') ||
          relativePath.endsWith('.ico') ||
          relativePath.endsWith('package-lock.json') ||
          relativePath.endsWith('yarn.lock')
        ) {
          continue;
        }

        const content = await zipEntry.async('string');
        loadedFiles.push({
          path: relativePath,
          content: content,
          size: (await zipEntry.async('uint8array')).length
        });
      }

      if (loadedFiles.length === 0) {
        setScreen('upload');
        alert('Empty ZIP file or no compatible text codebases found inside.');
        return;
      }

      const zipName = file.name.replace(/\.zip$/i, '') || 'Workspace ZIP';
      setCurrentProjectName(zipName);
      triggerStepProgress(loadedFiles, zipName);

    } catch (err: any) {
      console.error(err);
      setScreen('upload');
      alert(`ZIP extraction failed: ${err.message}`);
    }
  };

  const loadSampleProject = (project: typeof SAMPLE_PROJECTS[0]) => {
    const filesFormatted = project.files.map((f) => ({
      path: f.path,
      content: f.content,
      size: f.size
    }));
    setCurrentProjectName(project.name);
    triggerStepProgress(filesFormatted, project.name);
  };

  // Calculations for charts
  const getLanguageData = () => {
    if (!metrics) return [];
    return Object.entries(metrics.languageCounts).map(([lang, val]) => ({
      name: lang.toUpperCase(),
      files: val
    }));
  };

  const getScoreData = () => {
    if (!agentsReport) return [];
    return [
      { subject: 'Architecture', A: (agentsReport.architecture?.grade || '').includes('★★★★★') ? 100 : 80 },
      { subject: 'Security', A: agentsReport.security?.score ?? 0 },
      { subject: 'Performance', A: agentsReport.performance?.score ?? 0 },
      { subject: 'Maintainability', A: agentsReport.maintainability?.score ?? 0 },
      { subject: 'Testing', A: agentsReport.testing?.score ?? 0 },
    ];
  };

  const getTrendData = () => {
    if (!history || history.length === 0) return [];
    return [...history]
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((item) => {
        const d = new Date(item.timestamp);
        return {
          name: item.projectName,
          score: item.overallScore,
          date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }),
          dateFull: d.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        };
      });
  };

  // Build markdown export
  const buildMarkdownReport = () => {
    if (!agentsReport || !metrics) return '';
    let md = `# SoftDocAI - Software Engineering Inspector Report\n`;
    md += `**Tagline**: Analyze. Review. Predict. Improve.\n`;
    md += `**Overall Score**: ${agentsReport.overallScore ?? 0}/100\n\n`;
    
    md += `## 📊 Project Metrics\n`;
    md += `- Total Files: ${metrics.totalFiles}\n`;
    md += `- Total Folders: ${metrics.totalFolders}\n`;
    md += `- Total Lines of Code: ${metrics.totalLines}\n\n`;

    md += `## 📐 Architecture Review\n`;
    md += `**Pattern**: ${agentsReport.architecture?.pattern || 'N/A'}\n`;
    md += `**Grade**: ${agentsReport.architecture?.grade || 'N/A'}\n`;
    md += `${agentsReport.architecture?.description || 'N/A'}\n\n`;

    md += `## 🔒 Security Audit\n`;
    md += `**Score**: ${agentsReport.security?.score ?? 0}/100 | Grade: ${agentsReport.security?.grade || 'N/A'}\n`;
    (agentsReport.security?.findings || []).forEach(f => {
      md += `- [${(f.severity || '').toUpperCase()}] ${f.type || 'Finding'}: ${f.message || ''}\n`;
    });
    md += `\n**Feedback**: ${agentsReport.security?.feedback || 'N/A'}\n\n`;

    md += `## ⚡ Performance Profiling\n`;
    md += `**Score**: ${agentsReport.performance?.score ?? 0}/100 | Grade: ${agentsReport.performance?.grade || 'N/A'}\n`;
    md += `${agentsReport.performance?.feedback || 'N/A'}\n\n`;

    md += `## 📈 Production Risks\n`;
    md += `**Risk Level**: ${agentsReport.risk?.level || 'N/A'}\n`;
    md += `**Scaling Report**: ${agentsReport.risk?.scaling || 'N/A'}\n\n`;
    md += `**Prioritized Recommendations**:\n`;
    (agentsReport.risk?.recommendations || []).forEach((r, idx) => {
      md += `${idx + 1}. ${r}\n`;
    });

    return md;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const downloadMarkdownReport = () => {
    try {
      const content = buildMarkdownReport();
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', url);
      const formattedName = currentProjectName.replace(/[^a-zA-Z0-9]/g, '_');
      downloadAnchor.setAttribute('download', `SoftDocAI_Report_${formattedName || 'Workspace'}.md`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download Markdown Report:', err);
      alert('Failed to generate Markdown file.');
    }
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-[#f1f2f6] flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Dynamic Header / Navigation */}
      <header className="sticky top-0 z-40 bg-[#07080b]/90 backdrop-blur-md border-b border-emerald-500/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-2.5 rounded-xl shadow-lg shadow-emerald-500/10">
            <Cpu className="h-6 w-6 text-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold font-['Space_Grotesk'] tracking-tight">SoftDoc<span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">AI</span></span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">INSPECTOR v2.5</span>
            </div>
            <p className="text-xs text-gray-500">Analyze. Review. Predict. Improve.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Mode Switcher (Light / Dark / System) */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setIsThemeMenuOpen((v) => !v)}
              className={`flex items-center p-2 rounded-lg border transition-all cursor-pointer ${
                isThemeMenuOpen
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30'
              }`}
              title={`Theme: ${themeMode === 'system' ? `System (${effectiveTheme})` : themeMode} — click to change`}
              aria-haspopup="listbox"
              aria-expanded={isThemeMenuOpen}
              aria-label="Select theme"
            >
              {effectiveTheme === 'dark' ? (
                <Moon className="h-4 w-4 text-emerald-400" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500" />
              )}
              <span className="hidden md:inline ml-2 text-xs font-mono font-medium text-gray-400">
                {themeMode === 'system' ? `SYSTEM (${effectiveTheme.toUpperCase()})` : themeMode.toUpperCase()}
              </span>
            </button>
            {isThemeMenuOpen && (
              <div
                role="listbox"
                aria-label="Theme selection"
                className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-800 bg-[#090a0d] shadow-2xl shadow-black/60 overflow-hidden z-50"
              >
                <div className="px-3 pt-2.5 pb-1.5 border-b border-gray-800">
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Select Theme</p>
                </div>
                <div className="py-1.5">
                  {THEME_OPTIONS.map((opt, i) => {
                    const Icon = opt.icon;
                    const active = themeMode === opt.value;
                    const focused = themeFocusIndex === i;
                    return (
                      <button
                        key={opt.value}
                        role="option"
                        aria-selected={active}
                        tabIndex={focused ? 0 : -1}
                        onClick={() => { setThemeMode(opt.value); setIsThemeMenuOpen(false); }}
                        onMouseEnter={() => setThemeFocusIndex(i)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-xs transition-all ${
                          active
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : focused
                            ? 'bg-gray-800/60 text-white'
                            : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                        }`}
                      >
                        <div className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
                          active
                            ? 'bg-emerald-500/20'
                            : 'bg-gray-800'
                        }`}>
                          <Icon className={`h-3.5 w-3.5 ${active ? 'text-emerald-400' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[13px]">{opt.label}</span>
                            {active && (
                              <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">ACTIVE</span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{opt.description}</p>
                        </div>
                        <kbd className="flex-shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded border border-gray-700 text-gray-500 bg-gray-900">{opt.shortcut}</kbd>
                      </button>
                    );
                  })}
                </div>
                <div className="px-3 pb-2.5 pt-1 border-t border-gray-800">
                  <p className="text-[9px] text-gray-600 font-mono leading-relaxed">
                    ↑↓ Navigate &nbsp;·&nbsp; L/D/S Quick pick &nbsp;·&nbsp; Esc Close
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Command Palette Trigger */}
          <button
            onClick={() => { setIsCommandPaletteOpen(true); setCommandSearch(''); setCommandFocusIndex(0); }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer"
            title="Command Palette (Ctrl+K)"
            aria-label="Open command palette"
            aria-keyshortcuts="Control+K"
          >
            <Command className="h-3.5 w-3.5" />
            <span className="hidden lg:inline text-[11px] font-mono">⌘K</span>
          </button>

          {screen === 'dashboard' && (
            <>
              <button
                onClick={() => {
                  setScreen('upload');
                  setFiles([]);
                  setMetrics(null);
                  setAgentsReport(null);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-gray-900 border border-gray-800 hover:border-emerald-500/30 text-xs md:text-sm hover:text-white transition-all cursor-pointer"
                title="Inspect New Codebase"
              >
                <RefreshCw className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Inspect New Codebase</span>
              </button>

              {/* Hamburger Button for Mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex md:hidden items-center justify-center p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5 text-emerald-400" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Mobile Drawer Slide-out Overlay */}
      {screen === 'dashboard' && metrics && agentsReport && (
        <div
          className={`fixed inset-0 z-40 md:hidden bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className={`absolute top-0 bottom-0 left-0 w-72 max-w-[80vw] bg-[#090a0d] border-r border-gray-900 p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-900 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-1.5 rounded-lg">
                    <Cpu className="h-4 w-4 text-black" />
                  </div>
                  <span className="font-bold font-['Space_Grotesk'] tracking-tight text-white text-base">SoftDoc<span className="text-emerald-400">AI</span></span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-gray-950 border border-gray-900 text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">Navigation Panel</span>
                <div className="mt-3 space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                      activeTab === 'dashboard'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-gray-950 border border-transparent'
                    }`}
                  >
                    <Gauge className="h-4.5 w-4.5" />
                    <span>Executive Health</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('twin');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                      activeTab === 'twin'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-gray-950 border border-transparent'
                    }`}
                  >
                    <Network className="h-4.5 w-4.5 text-emerald-400" />
                    <span className="flex items-center space-x-1.5">
                      <span>Digital Twin & AI CTO</span>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/25 font-bold uppercase font-mono animate-pulse">new</span>
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('whatif');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                      activeTab === 'whatif'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-gray-950 border border-transparent'
                    }`}
                  >
                    <Sparkles className="h-4.5 w-4.5 text-purple-400" />
                    <span className="flex items-center space-x-1.5">
                      <span>What-If Simulator</span>
                      <span className="text-[9px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded-full border border-purple-500/25 font-bold uppercase font-mono animate-pulse">new</span>
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('folders');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                      activeTab === 'folders'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-gray-950 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Folder className="h-4.5 w-4.5" />
                      <span>Folder reviews</span>
                    </div>
                    <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 font-bold font-mono">
                      {(Object.values(agentsReport.folderAnalysis || {}) as FolderAnalysis[]).reduce((acc, f) => acc + f.errorsCount, 0)}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('architecture');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                      activeTab === 'architecture'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-gray-950 border border-transparent'
                    }`}
                  >
                    <Layers className="h-4.5 w-4.5" />
                    <span>Architecture review</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('risks');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                      activeTab === 'risks'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-gray-950 border border-transparent'
                    }`}
                  >
                    <TrendingUp className="h-4.5 w-4.5" />
                    <span>Predictive risks</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('report');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                      activeTab === 'report'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-gray-950 border border-transparent'
                    }`}
                  >
                    <FileText className="h-4.5 w-4.5" />
                    <span>Engineering report</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('history');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                      activeTab === 'history'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-gray-950 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <History className="h-4.5 w-4.5" />
                      <span>Scan History</span>
                    </div>
                    {history.length > 0 && (
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold font-mono">
                        {history.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('blueprints');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                      activeTab === 'blueprints'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-gray-950 border border-transparent'
                    }`}
                  >
                    <Sliders className="h-4.5 w-4.5" />
                    <span>Enterprise Specs</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-900 pt-5 space-y-4">
                <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">Workspace Metrics</span>
                <div className="grid grid-cols-2 gap-3 font-mono text-center">
                  <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-900">
                    <div className="text-lg font-bold text-gray-300">{metrics.totalFiles}</div>
                    <div className="text-[9px] text-gray-500 uppercase">Files</div>
                  </div>
                  <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-900">
                    <div className="text-lg font-bold text-gray-300">{metrics.totalLines}</div>
                    <div className="text-[9px] text-gray-500 uppercase">Lines</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="mt-8 border-t border-gray-900 pt-5 space-y-3.5">
              {isDemo && (
                <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 space-y-1">
                  <div className="flex items-center space-x-1.5 text-[10px] font-bold text-amber-400 font-mono">
                    <AlertTriangle className="h-3 w-3" />
                    <span>DEMO SANDBOX ACTIVE</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                <span>Engine:</span>
                <span className="text-emerald-400 font-bold">{agentsReport.isAiDegraded ? 'Local' : 'Gemini 3.5'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 flex flex-col">
        {/* Upload Screen */}
        {screen === 'upload' && (
          <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 flex flex-col justify-center">
            {/* Hero Vision Section */}
            <div className="text-center mb-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs mb-4 font-medium tracking-wide">
                <Sparkles className="h-3.5 w-3.5" />
                <span>PROJECT-LEVEL DEEP REASONING AUDIT</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-['Space_Grotesk'] mb-4 text-white">
                AI Software Engineering Inspector
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed">
                Unlike simple single-file reviewers, SoftDocAI inspects your complete directory structure, maps dependencies, compiles static code metrics, and orchestrates specialized agents to deliver a comprehensive roadmap.
              </p>
            </div>

            {/* Core Upload Zone Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left 2 Columns: File upload components */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-[#0b0c11] border-2 border-dashed border-gray-800 hover:border-emerald-500/30 rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <UploadCloud className="h-14 w-14 text-emerald-400/80 mb-4 group-hover:scale-110 transition-transform" />
                  
                  <h3 className="text-lg font-semibold text-white mb-2">Upload complete directory or ZIP</h3>
                  <p className="text-sm text-gray-500 max-w-md mb-6 leading-relaxed">
                    Select your local engineering folders directly or load a packaged <code className="text-emerald-400 font-mono">.zip</code> of your codebase. All contents are read in real-time.
                  </p>

                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    {/* Folder selector */}
                    <button
                      onClick={() => folderInputRef.current?.click()}
                      className="flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
                    >
                      <Folder className="h-4.5 w-4.5" />
                      <span>Select Local Folder</span>
                    </button>

                    {/* Zip selector */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center space-x-2 bg-gray-900 border border-gray-800 hover:border-gray-700 hover:bg-gray-800 text-gray-300 font-medium px-6 py-3 rounded-xl transition-all cursor-pointer"
                    >
                      <FileCode className="h-4.5 w-4.5" />
                      <span>Upload ZIP File</span>
                    </button>
                  </div>

                  {/* Hidden standard file pickers */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleZipUpload}
                    accept=".zip"
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={folderInputRef}
                    onChange={handleFolderUpload}
                    webkitdirectory=""
                    directory=""
                    multiple
                    className="hidden"
                  />
                </div>

                <div className="p-4 bg-[#0c0d12] border border-gray-900 rounded-xl flex items-start space-x-3 text-xs text-gray-500 leading-normal">
                  <Terminal className="h-4 w-4 text-emerald-500/70 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-400">Security Guard Compliance</span>: Files are read directly in the local browser via JSZip and parsed into structural representations. Only text-based source modules are fed securely into our server-side API proxy to keep API keys perfectly hidden.
                  </div>
                </div>
              </div>

              {/* Right Column: Pre-loaded Sandboxes */}
              <div className="space-y-6">
                <div className="bg-[#0b0c11] border border-gray-900 rounded-2xl p-6 shadow-xl flex flex-col h-full">
                  <div className="flex items-center space-x-2 text-sm font-semibold tracking-wide uppercase text-gray-400 mb-4">
                    <BookOpen className="h-4 w-4 text-emerald-400" />
                    <span>Instant Sandbox Demo</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    No code repository ready? Select one of our complete, pre-configured realistic codebases containing hidden bugs, security holes, and poor architectures to test the multi-agent inspector:
                  </p>

                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {SAMPLE_PROJECTS.map((proj, idx) => (
                      <div
                        key={idx}
                        onClick={() => loadSampleProject(proj)}
                        className="bg-gray-950 hover:bg-emerald-500/5 hover:border-emerald-500/20 border border-gray-900 p-3.5 rounded-xl text-left cursor-pointer transition-all group"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-gray-300 group-hover:text-emerald-400 transition-colors">
                            {proj.name}
                          </span>
                          <span className="text-[10px] bg-gray-900 text-gray-500 px-2 py-0.5 rounded uppercase font-mono">
                            {proj.lang}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2.5">
                          {proj.description}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-emerald-400/80 font-medium font-mono">
                          <span>{proj.filesCount} modules</span>
                          <span className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Analyze</span>
                            <Play className="h-2.5 w-2.5 fill-emerald-400 text-emerald-400" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Custom Rules Pack Manager */}
                  <div className="bg-[#0b0c11] border border-gray-900 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-white">Custom Rules</span>
                        {customRulePack && (
                          <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                            {customRulePack.rules.length} rule{customRulePack.rules.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setIsRuleUploaderOpen((v) => !v)}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono transition-colors cursor-pointer"
                      >
                        {customRulePack ? 'Manage' : 'Add Rules'}
                      </button>
                    </div>

                    {isRuleUploaderOpen && (
                      <div className="space-y-3">
                        {customRulePack && (
                          <div className="bg-gray-950 rounded-xl p-3 space-y-1.5 border border-gray-800">
                            <p className="text-[10px] font-mono text-emerald-400 font-semibold">{customRulePack.name}</p>
                            {customRulePack.rules.map((rule, i) => (
                              <div key={i} className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                  rule.severity === 'critical' ? 'bg-red-500' :
                                  rule.severity === 'high' ? 'bg-orange-500' :
                                  rule.severity === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'
                                }`} />
                                <span className="font-semibold text-gray-400">[{rule.id}]</span>
                                <span>{rule.message.length > 40 ? rule.message.slice(0, 40) + '…' : rule.message}</span>
                              </div>
                            ))}
                            <button
                              onClick={clearCustomRules}
                              className="mt-1 text-[10px] text-red-400 hover:text-red-300 font-mono transition-colors cursor-pointer"
                            >
                              Remove rules
                            </button>
                          </div>
                        )}

                        {/* Drag & drop zone */}
                        <div
                          onDragOver={(e) => { e.preventDefault(); setIsDraggingRules(true); }}
                          onDragLeave={() => setIsDraggingRules(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingRules(false);
                            const file = e.dataTransfer.files[0];
                            if (file) handleRuleFileUpload(file);
                          }}
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.json';
                            input.onchange = (ev) => {
                              const f = (ev.target as HTMLInputElement).files?.[0];
                              if (f) handleRuleFileUpload(f);
                            };
                            input.click();
                          }}
                          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                            isDraggingRules
                              ? 'border-emerald-500 bg-emerald-500/5'
                              : 'border-gray-800 hover:border-emerald-500/30 hover:bg-gray-950'
                          }`}
                        >
                          <UploadCloud className="h-5 w-5 text-gray-500 mx-auto mb-1.5" />
                          <p className="text-[11px] text-gray-400 font-medium">
                            {isDraggingRules ? 'Drop JSON file here' : 'Drop a .json rule pack here or click to browse'}
                          </p>
                        </div>

                        {ruleUploadError && (
                          <div className="bg-red-950/20 border border-red-500/20 rounded-lg px-3 py-2">
                            <p className="text-[10px] text-red-400 font-mono">{ruleUploadError}</p>
                          </div>
                        )}

                        {/* Example format hint */}
                        <details className="group">
                          <summary className="text-[10px] text-gray-600 font-mono cursor-pointer hover:text-gray-400 transition-colors list-none">
                            Show example rule pack format
                          </summary>
                          <pre className="mt-2 bg-[#030406] border border-gray-900 rounded-xl p-3 text-[10px] font-mono text-gray-500 overflow-x-auto leading-relaxed">{`{
  "name": "My Security Rules",
  "description": "Team security policies",
  "rules": [{
    "id": "MY-001",
    "severity": "critical",
    "type": "security",
    "message": "Hardcoded secret detected",
    "pattern": "password\\s*=\\s*['\\"]{1,3}[^'\\"]{8,}['\\"]{1,3}",
    "suggestedFix": "Use process.env.SECRET instead"
  }]
}`}</pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scanning screen with steps and progress logs */}
        {screen === 'scanning' && (
          <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-16 flex flex-col justify-center">
            <div className="bg-[#0b0c11] border border-gray-900 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300" style={{ width: `${uploadProgress || (loadingStep * 9)}%` }}></div>
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="h-6 w-6 text-emerald-400 animate-spin" />
                  <div>
                    <h2 className="text-xl font-bold font-['Space_Grotesk']">Orchestrating Software Agents</h2>
                    <p className="text-xs text-gray-500">Evaluating codebase characteristics recursively...</p>
                  </div>
                </div>
                <span className="text-sm font-mono font-bold text-emerald-400">{uploadProgress || Math.round((loadingStep / 11) * 100)}%</span>
              </div>

              {/* Progress Stepper */}
              <div className="space-y-4 mb-8">
                {[
                  'Unzipping & Parsing directory files...',
                  'Compiling local metrics & file language counts...',
                  'Running local rules linting & vulnerability check...',
                  'Asynchronously querying Multi-Agent Gemini orchestrator...'
                ].map((stepText, idx) => {
                  const isDone = (idx < 3 && loadingStep > 3) || (idx === 0 && loadingStep > 1) || (idx === 1 && loadingStep > 2) || (idx === 2 && loadingStep > 4);
                  const isCurrent = (idx === 0 && loadingStep <= 1) || (idx === 1 && loadingStep === 2) || (idx === 2 && loadingStep > 2 && loadingStep <= 4) || (idx === 3 && loadingStep > 4);
                  
                  return (
                    <div key={idx} className={`flex items-start space-x-3 transition-opacity ${isDone ? 'opacity-100' : isCurrent ? 'opacity-100' : 'opacity-40'}`}>
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : isCurrent ? (
                        <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-emerald-400 animate-spin shrink-0 mt-0.5"></div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-800 shrink-0 mt-0.5"></div>
                      )}
                      <div>
                        <span className={`text-sm font-semibold ${isCurrent ? 'text-emerald-400' : isDone ? 'text-gray-300' : 'text-gray-500'}`}>
                          {stepText}
                        </span>
                        {isCurrent && (
                          <span className="block text-[11px] text-gray-500 mt-1 font-mono animate-pulse">
                            Processing deep files index in backend environment...
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Log output console */}
              <div className="bg-black/80 rounded-xl border border-gray-900 p-4 font-mono text-[11px] text-gray-400 h-52 overflow-y-auto space-y-1">
                <div className="text-emerald-400/70 border-b border-gray-900 pb-2 mb-2 flex items-center justify-between">
                  <span>SOFTDOCAI OPERATIONAL LINT SYSTEM LOG</span>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono">LIVE</span>
                </div>
                {loadingLog.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span> {log}
                  </div>
                ))}
                <div className="text-emerald-400 animate-pulse font-bold mt-1">&gt; Orchestration process active...</div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard layout */}
        {screen === 'dashboard' && metrics && agentsReport && (
          <div className="flex-1 flex flex-col md:flex-row">
            {/* Sidebar Controls */}
            <aside className="hidden md:flex md:flex-col w-64 bg-[#090a0d] border-r border-gray-900 p-5 justify-between shrink-0">
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">Navigation Panel</span>
                  <div className="mt-3 space-y-1">
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                        activeTab === 'dashboard'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-950 border border-transparent'
                      }`}
                    >
                      <Gauge className="h-4.5 w-4.5" />
                      <span>Executive Health</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('twin')}
                      className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                        activeTab === 'twin'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-950 border border-transparent'
                      }`}
                    >
                      <Network className="h-4.5 w-4.5 text-emerald-400" />
                      <span className="flex items-center space-x-1.5">
                        <span>Digital Twin & AI CTO</span>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/25 font-bold uppercase font-mono animate-pulse">new</span>
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('folders')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                        activeTab === 'folders'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-950 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Folder className="h-4.5 w-4.5" />
                        <span>Folder reviews</span>
                      </div>
                      <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 font-bold font-mono">
                        {(Object.values(agentsReport.folderAnalysis || {}) as FolderAnalysis[]).reduce((acc, f) => acc + f.errorsCount, 0)}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('architecture')}
                      className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                        activeTab === 'architecture'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-950 border border-transparent'
                      }`}
                    >
                      <Layers className="h-4.5 w-4.5" />
                      <span>Architecture review</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('risks')}
                      className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                        activeTab === 'risks'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-950 border border-transparent'
                      }`}
                    >
                      <TrendingUp className="h-4.5 w-4.5" />
                      <span>Predictive risks</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('report')}
                      className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                        activeTab === 'report'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-950 border border-transparent'
                      }`}
                    >
                      <FileText className="h-4.5 w-4.5" />
                      <span>Engineering report</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('history')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                        activeTab === 'history'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-950 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <History className="h-4.5 w-4.5" />
                        <span>Scan History</span>
                      </div>
                      {history.length > 0 && (
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold font-mono">
                          {history.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveTab('blueprints')}
                      className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                        activeTab === 'blueprints'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-950 border border-transparent'
                      }`}
                    >
                      <Sliders className="h-4.5 w-4.5" />
                      <span>Enterprise Specs</span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-900 pt-5 space-y-4">
                  <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">Workspace Metrics</span>
                  <div className="grid grid-cols-2 gap-3 font-mono text-center">
                    <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-900">
                      <div className="text-lg font-bold text-gray-300">{metrics.totalFiles}</div>
                      <div className="text-[9px] text-gray-500 uppercase">Files</div>
                    </div>
                    <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-900">
                      <div className="text-lg font-bold text-gray-300">{metrics.totalLines}</div>
                      <div className="text-[9px] text-gray-500 uppercase">Lines</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="mt-8 border-t border-gray-900 pt-5 space-y-3.5">
                {isDemo && (
                  <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 space-y-1">
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-amber-400 font-mono">
                      <AlertTriangle className="h-3 w-3" />
                      <span>DEMO SANDBOX ACTIVE</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      Server API key missing. Code Insight is operating with structured fallback templates.
                    </p>
                  </div>
                )}

                {agentsReport.isAiDegraded && (
                  <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 space-y-1 animate-pulse">
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-amber-400 font-mono">
                      <AlertTriangle className="h-3 w-3" />
                      <span>AI DEGRADED MODE</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      Gemini API offline. Falling back to local offline heuristic scanner engine.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                  <span>Engine:</span>
                  <span className="text-emerald-400 font-bold">{agentsReport.isAiDegraded ? 'Local Heuristic Engine' : 'Gemini 3.5 Flash'}</span>
                </div>
              </div>
            </aside>

            {/* Dashboard Content Panel */}
            {activeTab === 'blueprints' ? (
              <BlueprintsView 
                metrics={metrics}
                agentsReport={agentsReport}
                projectName={currentProjectName}
                files={files}
              />
            ) : (
              <div id="dashboard-content-panel" className="flex-1 bg-[#07080a] p-6 md:p-8 overflow-y-auto max-w-6xl">
              
              {/* Executive Health Score Overview */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  {/* Dashboard Metrics Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div>
                      <h2 className="text-2xl font-bold font-['Space_Grotesk'] tracking-tight">Executive Dashboard</h2>
                      <p className="text-sm text-gray-500 mt-1">Multi-agent synthesized health audit scoring indices.</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-gray-500">Inspector Score Card:</span>
                      <div className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20 font-mono font-bold text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Overall Score: {agentsReport.overallScore}%</span>
                      </div>
                    </div>
                  </div>

                  {agentsReport.isAiDegraded && (
                    <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex items-start space-x-3.5">
                      <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-amber-400 font-['Space_Grotesk']">Offline Rules-Based Fallback Active</h4>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                          The Gemini model is currently experiencing high demand and returned a temporary unavailable status (503). 
                          We have completed a comprehensive local static scan of your files and mapped real security vulnerabilities, 
                          nested loop performance bottlenecks, and resource access patterns. Full generative AI suggestions will be restored automatically once model demand normalizes.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Overall score radial widget and statistics */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Gauge score container */}
                    <div className="bg-[#0b0c11] border border-gray-900 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-mono">Overall Engineering Health</span>
                        <div className="flex items-baseline mt-2.5">
                          <span className="text-6xl font-extrabold font-['Space_Grotesk'] text-white">
                            {agentsReport.overallScore}
                          </span>
                          <span className="text-2xl text-gray-500 font-bold font-mono">/100</span>
                        </div>
                      </div>

                      {/* Health bars */}
                      <div className="mt-8 space-y-3.5">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Architecture Quality</span>
                            <span className="font-mono text-emerald-400">{agentsReport.architecture?.grade || 'N/A'}</span>
                          </div>
                          <div className="h-1.5 bg-gray-950 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: (agentsReport.architecture?.grade || '').includes('★★★★★') ? '100%' : '80%' }}></div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Security Defense Index</span>
                            <span className="font-mono text-emerald-400">{agentsReport.security?.score ?? 0}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-950 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${agentsReport.security?.score ?? 0}%` }}></div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Performance Latency Index</span>
                            <span className="font-mono text-emerald-400">{agentsReport.performance?.score ?? 0}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-950 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${agentsReport.performance?.score ?? 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chart visualizers */}
                    <div className="bg-[#0b0c11] border border-gray-900 rounded-2xl p-6 shadow-xl lg:col-span-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-mono block mb-4">Engineering Balance Index</span>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getScoreData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#12131a" />
                            <XAxis dataKey="subject" stroke="#525360" fontSize={11} tickLine={false} />
                            <YAxis stroke="#525360" fontSize={11} tickLine={false} domain={[0, 100]} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#0b0c11', borderColor: '#22232a', color: '#fff', borderRadius: '12px' }}
                              cursor={{ fill: '#0e0f16' }}
                            />
                            <Bar dataKey="A" name="Category Score" fill="url(#barGradient)" radius={[8, 8, 0, 0]} barSize={40} />
                            <defs>
                              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Historical overall score progression trends */}
                  <div className="bg-[#0b0c11] border border-gray-900 rounded-2xl p-6 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                      <div className="flex items-center space-x-2.5">
                        <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                          <TrendingUp className="h-4.5 w-4.5 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Historical Score Evolution</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Overall Quality Score progression across historical scans</p>
                        </div>
                      </div>
                      {history.length > 0 && (
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-mono font-bold border border-emerald-500/10">
                          {history.length} Scan{history.length > 1 ? 's' : ''} Recorded
                        </span>
                      )}
                    </div>

                    <div className="h-72">
                      {getTrendData().length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={getTrendData()} margin={{ top: 10, right: 25, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#12131a" vertical={false} />
                            <XAxis
                              dataKey="date"
                              stroke="#525360"
                              fontSize={10}
                              tickLine={false}
                              axisLine={false}
                              dy={10}
                            />
                            <YAxis
                              stroke="#525360"
                              fontSize={10}
                              tickLine={false}
                              axisLine={false}
                              domain={[0, 100]}
                              dx={-5}
                            />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-[#0b0c11] border border-gray-900 p-3.5 rounded-xl shadow-2xl border-emerald-500/10">
                                      <p className="text-xs font-bold text-white mb-1">{data.name}</p>
                                      <div className="flex items-center space-x-2 mt-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                                        <p className="text-xs text-gray-300">
                                          Overall Score: <span className="font-mono font-bold text-emerald-400 text-sm">{data.score}%</span>
                                        </p>
                                      </div>
                                      <p className="text-[10px] text-gray-500 font-mono mt-2 border-t border-gray-900/50 pt-1.5">{data.dateFull}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="score"
                              name="Overall Score"
                              stroke="#10b981"
                              strokeWidth={3}
                              dot={{ fill: '#07080b', stroke: '#10b981', strokeWidth: 2, r: 4 }}
                              activeDot={{ fill: '#10b981', stroke: '#fff', strokeWidth: 2, r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-black/20 rounded-xl border border-gray-900/50">
                          <TrendingUp className="h-10 w-10 text-gray-600 mb-2.5" />
                          <h4 className="text-sm font-semibold text-gray-400">No historical trends recorded yet</h4>
                          <p className="text-xs text-gray-500 mt-1 max-w-md">
                            Upload multiple project files or run multiple scans of different codebases to compile historical score data.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vision Statement Difference */}
                  <div className="p-6 bg-gradient-to-r from-emerald-950/20 to-teal-950/10 border border-emerald-500/10 rounded-2xl space-y-4">
                    <div className="flex items-center space-x-2 text-sm font-bold text-emerald-400 font-['Space_Grotesk'] uppercase tracking-wider">
                      <Sparkles className="h-5 w-5" />
                      <span>SoftDocAI Vision Difference</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm leading-normal">
                      <div className="space-y-1 bg-black/30 p-4 rounded-xl border border-gray-900/50">
                        <span className="text-xs text-gray-500 uppercase font-mono">Traditional Linters say:</span>
                        <p className="text-gray-300 font-medium">"Your codebase has basic bugs on lines 12 and 18."</p>
                      </div>
                      <div className="space-y-1 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                        <span className="text-xs text-emerald-400 uppercase font-mono">SoftDocAI answers:</span>
                        <p className="text-emerald-200 font-medium">
                          "Your project follows a {agentsReport.architecture?.pattern || 'MVC/Layered Framework layout'}, with potential database bottleneck risks under high concurrent scaling. Here is a mentored engineering repair playbook."
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Prioritized engineering roadmap recommendation section */}
                  <div className="bg-[#0b0c11] border border-gray-900 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center space-x-2.5">
                        <div className="bg-teal-500/10 p-2 rounded-lg border border-teal-500/20">
                          <Cpu className="h-4.5 w-4.5 text-teal-400" />
                        </div>
                        <h3 className="text-base font-bold text-white">Prioritized Engineering Roadmap</h3>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500">MAPPED BY REPORT AGENT</span>
                    </div>

                    <div className="space-y-3.5">
                      {(agentsReport.risk?.recommendations || []).map((rec, idx) => (
                        <div key={idx} className="flex items-start space-x-3.5 bg-gray-950/50 hover:bg-gray-950 border border-gray-900 p-4 rounded-xl transition-all">
                          <div className="bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-emerald-500/20 mt-0.5">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-200">{rec}</p>
                            <span className="text-[10px] text-gray-500 block mt-1 font-mono uppercase tracking-wide">Severity: Immediate action recommended</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Folder-by-Folder Inspector */}
              {activeTab === 'folders' && (
                <div className="space-y-8">
                  {/* Project Structure Visualization (NEW!) */}
                  <FolderStructureView
                    files={files}
                    folderAnalysis={agentsReport.folderAnalysis}
                    localIssues={metrics?.localIssues || []}
                  />

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-900 pb-5">
                    <div>
                      <h2 className="text-2xl font-bold font-['Space_Grotesk'] tracking-tight text-white">Folder Reviews & Code Inspector</h2>
                      <p className="text-sm text-gray-500 mt-1">Real-time localized diagnostics and senior engineering mentor commentary.</p>
                    </div>
                    {/* Folder sub-tabs */}
                    <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-900 text-xs shrink-0 self-start sm:self-auto">
                      <button
                        onClick={() => setFoldersSubTab('inspector')}
                        className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                          foldersSubTab === 'inspector'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Folder className="h-3.5 w-3.5" />
                        <span>Code Inspector</span>
                      </button>
                      <button
                        onClick={() => {
                          setFoldersSubTab('testing');
                          // If selectedFolder is empty, default to first folder
                          if (!selectedFolder && agentsReport && Object.keys(agentsReport.folderAnalysis || {}).length > 0) {
                            setSelectedFolder(Object.keys(agentsReport.folderAnalysis)[0]);
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                          foldersSubTab === 'testing'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>Testing Coverage</span>
                      </button>
                    </div>
                  </div>

                  {foldersSubTab === 'testing' ? (
                    <TestingCoverageView
                      files={files}
                      selectedFolder={selectedFolder}
                      setSelectedFolder={setSelectedFolder}
                    />
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Folder tree selection */}
                    <div className="lg:col-span-4 bg-[#0b0c11] border border-gray-900 rounded-2xl p-5 shadow-xl space-y-4">
                      <span className="text-xs text-gray-500 font-mono uppercase tracking-wider block">Project Directories</span>
                      
                      <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
                        {(Object.entries(agentsReport.folderAnalysis || {}) as [string, FolderAnalysis][]).map(([folderPath, fAnalysis]) => {
                          const isSelected = selectedFolder === folderPath;
                          return (
                            <button
                              key={folderPath}
                              onClick={() => {
                                setSelectedFolder(folderPath);
                                setExpandedIssueIndex(null);
                                setFolderSearchQuery('');
                              }}
                              className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between border cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                  : 'bg-gray-950/50 hover:bg-gray-950 border-gray-900 hover:border-gray-800 text-gray-400'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5 truncate">
                                <Folder className={`h-4.5 w-4.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-gray-500'}`} />
                                <span className="text-xs font-semibold truncate font-mono">{folderPath}</span>
                              </div>
                              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                                fAnalysis.errorsCount > 0 
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {fAnalysis.errorsCount} issues
                              </span>
                            </button>
                          );
                        })}

                        {Object.keys(agentsReport.folderAnalysis || {}).length === 0 && (
                          <div className="text-center py-10 text-xs text-gray-500">
                            No active localized folders identified with code issues.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Folder Analysis & Mentorship Issues list */}
                    <div className="lg:col-span-8 space-y-6">
                      {selectedFolder && agentsReport.folderAnalysis[selectedFolder] ? (
                        (() => {
                          const folderData = agentsReport.folderAnalysis[selectedFolder];
                          const issues = folderData.issues || [];
                          const securityCount = issues.filter(i => i.type === 'security' || (i as any).type === 'security').length;
                          const performanceCount = issues.filter(i => i.type === 'performance' || (i as any).type === 'performance').length;
                          const maintainabilityCount = issues.filter(i => i.type === 'maintainability' || (i as any).type === 'maintainability').length;
                          const bugsCount = issues.length - (securityCount + performanceCount + maintainabilityCount);

                          return (
                            <div className="space-y-6">
                              {/* Folder Overview Banner */}
                              <div className="bg-[#0b0c11] border border-gray-900 rounded-2xl p-6 shadow-xl space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-900 pb-3">
                                  <div className="flex items-center space-x-2.5">
                                    <Folder className="h-5 w-5 text-emerald-400" />
                                    <h3 className="text-base font-bold text-white font-mono">{selectedFolder}</h3>
                                  </div>
                                  <div className="flex items-center space-x-2 shrink-0">
                                    <span className="text-xs bg-red-500/10 text-red-400 px-3 py-1 rounded-full font-mono font-bold border border-red-500/10">
                                      {folderData.errorsCount} Debug Targets
                                    </span>
                                    <button
                                      onClick={() => downloadAllIssuesAsZIP(selectedFolder, issues)}
                                      className="text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-black px-3.5 py-1.5 rounded-full font-sans transition-all flex items-center space-x-1.5 shadow-md shadow-emerald-500/10 cursor-pointer"
                                      title="Download all issues in this folder as a ZIP file"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                      <span>Download All Issues</span>
                                    </button>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed font-sans bg-black/40 p-3.5 rounded-xl border border-gray-900/50">
                                  {folderData.summary}
                                </p>

                                {/* Folder Categorization Breakdown */}
                                <div className="space-y-3 pt-2">
                                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Issue Classifications</span>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                    <div className="bg-red-950/10 border border-red-900/30 p-2.5 rounded-xl text-center">
                                      <div className="text-sm font-bold text-red-400">{securityCount}</div>
                                      <div className="text-[9px] text-gray-500 font-mono uppercase">Security</div>
                                    </div>
                                    <div className="bg-amber-950/10 border border-amber-900/30 p-2.5 rounded-xl text-center">
                                      <div className="text-sm font-bold text-amber-400">{performanceCount}</div>
                                      <div className="text-[9px] text-gray-500 font-mono uppercase">Performance</div>
                                    </div>
                                    <div className="bg-blue-950/10 border border-blue-900/30 p-2.5 rounded-xl text-center">
                                      <div className="text-sm font-bold text-blue-400">{maintainabilityCount}</div>
                                      <div className="text-[9px] text-gray-500 font-mono uppercase">Code Quality</div>
                                    </div>
                                    <div className="bg-gray-950/30 border border-gray-900 p-2.5 rounded-xl text-center">
                                      <div className="text-sm font-bold text-gray-400">{bugsCount}</div>
                                      <div className="text-[9px] text-gray-500 font-mono uppercase">Bugs & Others</div>
                                    </div>
                                  </div>
                                </div>

                                {/* Specific, context-aware suggestions for fixing them within that folder */}
                                <div className="bg-gray-950/40 border border-gray-900/60 rounded-xl p-4 space-y-2.5">
                                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400 font-mono uppercase">
                                    <Cpu className="h-3.5 w-3.5" />
                                    <span>Folder Refactoring Strategy</span>
                                  </div>
                                  <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1.5 leading-relaxed">
                                    {securityCount > 0 && (
                                      <li>Secure dynamic query formats and move raw keys in this directory into safe secrets maps to avoid XSS/injection.</li>
                                    )}
                                    {performanceCount > 0 && (
                                      <li>Identify blocking operations or O(N²) iterations inside these files and refactor to use O(1) hashing maps or streams.</li>
                                    )}
                                    {maintainabilityCount > 0 && (
                                      <li>Purge old runtime console tracing statements and apply strict lint rules to maintain consistent code layout.</li>
                                    )}
                                    {bugsCount > 0 && (
                                      <li>Verify edge cases, return contracts, and add basic mock testing coverage to secure runtime stability.</li>
                                    )}
                                    {issues.length === 0 && (
                                      <li>This folder has a clean bill of health! Maintain current code structures and run routine regression audits.</li>
                                    )}
                                  </ul>
                                </div>
                              </div>

                              {/* Advanced Filtering & Search Toolbar */}
                              <div className="bg-[#0b0c11] border border-gray-900 rounded-2xl overflow-hidden shadow-xl">
                                {/* Top row: search + controls */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4">
                                  {/* Search */}
                                  <div className="relative flex-1 w-full">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <Search className="h-3.5 w-3.5 text-gray-500" />
                                    </div>
                                    <input
                                      type="text"
                                      placeholder="Search issues, files, messages..."
                                      value={folderSearchQuery}
                                      onChange={(e) => {
                                        setFolderSearchQuery(e.target.value);
                                        setExpandedIssueIndex(null);
                                      }}
                                      className="w-full bg-gray-950 border border-gray-800 hover:border-gray-700 text-xs text-gray-300 rounded-xl pl-9 pr-8 py-2.5 outline-none focus:border-emerald-500/40 transition-all placeholder:text-gray-600"
                                    />
                                    {folderSearchQuery && (
                                      <button
                                        onClick={() => { setFolderSearchQuery(''); setExpandedIssueIndex(null); }}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white cursor-pointer"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>

                                  {/* Type filter chips */}
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {([
                                      { value: 'all',             label: 'All',            icon: Bug,         color: 'text-gray-400',      bg: 'bg-gray-900' },
                                      { value: 'security',         label: 'Security',       icon: Shield,      color: 'text-red-400',       bg: 'bg-red-500/10' },
                                      { value: 'performance',      label: 'Performance',    icon: Gauge,       color: 'text-amber-400',     bg: 'bg-amber-500/10' },
                                      { value: 'maintainability',  label: 'Maintainability',icon: Wrench,      color: 'text-blue-400',      bg: 'bg-blue-500/10' },
                                      { value: 'testing',          label: 'Testing',        icon: TestTube,    color: 'text-purple-400',    bg: 'bg-purple-500/10' },
                                    ] as { value: string; label: string; icon: any; color: string; bg: string }[]).map((opt) => {
                                      const Icon = opt.icon;
                                      const active = typeFilter === opt.value;
                                      return (
                                        <button
                                          key={opt.value}
                                          onClick={() => { setTypeFilter(opt.value as any); setExpandedIssueIndex(null); }}
                                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                                            active
                                              ? `${opt.bg} ${opt.color} border-current/20`
                                              : 'bg-gray-950 text-gray-500 border-gray-800 hover:text-gray-300 hover:border-gray-700'
                                          }`}
                                        >
                                          <Icon className="h-3 w-3" />
                                          {opt.label}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {/* Sort + Clear */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    <select
                                      value={issueSortBy}
                                      onChange={(e) => { setIssueSortBy(e.target.value as 'severity' | 'filePath'); setExpandedIssueIndex(null); }}
                                      className="bg-gray-950 border border-gray-800 text-xs text-gray-300 rounded-lg px-2.5 py-2 outline-none focus:border-emerald-500/40 cursor-pointer"
                                    >
                                      <option value="severity">Severity</option>
                                      <option value="filePath">File Path</option>
                                    </select>
                                    {(severityFilter !== 'all' || typeFilter !== 'all' || folderSearchQuery.trim() !== '') && (
                                      <button
                                        onClick={() => {
                                          setSeverityFilter('all');
                                          setTypeFilter('all');
                                          setFolderSearchQuery('');
                                          setExpandedIssueIndex(null);
                                        }}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-[11px] text-red-400 hover:text-red-300 hover:border-red-500/30 transition-all cursor-pointer"
                                      >
                                        <XCircle className="h-3 w-3" />
                                        Clear
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Bottom row: severity filter + results count */}
                                <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-3.5 border-t border-gray-900">
                                  {/* Severity pills */}
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-500 font-mono uppercase mr-1">Severity:</span>
                                    {([
                                      { value: 'all',      label: 'All',       color: 'text-gray-400',      dot: 'bg-gray-500' },
                                      { value: 'critical', label: 'Critical',  color: 'text-red-400',        dot: 'bg-red-500' },
                                      { value: 'high',     label: 'High',      color: 'text-orange-400',     dot: 'bg-orange-500' },
                                      { value: 'medium',   label: 'Medium',    color: 'text-yellow-400',    dot: 'bg-yellow-500' },
                                      { value: 'low',      label: 'Low',       color: 'text-emerald-400',   dot: 'bg-emerald-500' },
                                    ] as { value: string; label: string; color: string; dot: string }[]).map((sev) => {
                                      const active = severityFilter === sev.value;
                                      const count = folderData.issues.filter((i) => sev.value === 'all' ? true : i.severity === sev.value).length;
                                      if (count === 0 && sev.value !== 'all') return null;
                                      return (
                                        <button
                                          key={sev.value}
                                          onClick={() => { setSeverityFilter(sev.value as any); setExpandedIssueIndex(null); }}
                                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                                            active
                                              ? `${sev.color} bg-gray-800 border-current/30`
                                              : 'text-gray-500 bg-gray-950 border-gray-800 hover:text-gray-300 hover:border-gray-700'
                                          }`}
                                        >
                                          <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                                          {sev.label}
                                          <span className={`ml-0.5 px-1 py-0.5 rounded text-[9px] font-mono ${
                                            active ? 'bg-black/30' : 'bg-gray-800'
                                          }`}>{count}</span>
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {/* Results count */}
                                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-mono">
                                    <span className="text-gray-600">Showing</span>
                                    <span className="text-emerald-400 font-semibold">{(() => {
                                      const total = folderData.issues.length;
                                      const filtered = folderData.issues.filter((issue) => {
                                        if (severityFilter !== 'all' && issue.severity !== severityFilter) return false;
                                        if (typeFilter !== 'all' && issue.type !== typeFilter) return false;
                                        if (folderSearchQuery.trim() !== '') {
                                          const q = folderSearchQuery.toLowerCase();
                                          if (!(issue.file || '').toLowerCase().includes(q) &&
                                              !(issue.message || '').toLowerCase().includes(q) &&
                                              !(issue.seniorCommentary || '').toLowerCase().includes(q)) return false;
                                        }
                                        return true;
                                      }).length;
                                      return `${filtered}/${total}`;
                                    })()}</span>
                                    <span className="text-gray-600">issues</span>
                                  </div>
                                </div>
                              </div>

                              {/* Issues Stepper Accordion list */}
                              <div className="space-y-4">
                                {(() => {
                                  const filteredIssues = folderData.issues.filter((issue) => {
                                    // 1. Severity filter
                                    if (severityFilter !== 'all' && issue.severity !== severityFilter) {
                                      return false;
                                    }
                                    // 2. Type/category filter
                                    if (typeFilter !== 'all' && issue.type !== typeFilter) {
                                      return false;
                                    }
                                    // 3. Search query filter (matches file path, message, or senior commentary)
                                    if (folderSearchQuery.trim() !== '') {
                                      const query = folderSearchQuery.toLowerCase();
                                      const matchesFile = issue.file ? issue.file.toLowerCase().includes(query) : false;
                                      const matchesMessage = issue.message ? issue.message.toLowerCase().includes(query) : false;
                                      const matchesCommentary = issue.seniorCommentary ? issue.seniorCommentary.toLowerCase().includes(query) : false;
                                      return matchesFile || matchesMessage || matchesCommentary;
                                    }
                                    return true;
                                  });

                                  const severityRank: Record<string, number> = {
                                    critical: 4,
                                    high: 3,
                                    medium: 2,
                                    low: 1
                                  };

                                  const sortedIssues = [...filteredIssues].sort((a, b) => {
                                    if (issueSortBy === 'severity') {
                                      const rankA = severityRank[a.severity] || 0;
                                      const rankB = severityRank[b.severity] || 0;
                                      if (rankB !== rankA) {
                                        return rankB - rankA;
                                      }
                                      return (a.file || '').localeCompare(b.file || '');
                                    } else {
                                      const fileComp = (a.file || '').localeCompare(b.file || '');
                                      if (fileComp !== 0) {
                                        return fileComp;
                                      }
                                      const rankA = severityRank[a.severity] || 0;
                                      const rankB = severityRank[b.severity] || 0;
                                      return rankB - rankA;
                                    }
                                  });

                                  if (sortedIssues.length === 0) {
                                    const searchActive = folderSearchQuery.trim() !== '';
                                    const typeLabel = typeFilter !== 'all' ? typeFilter : null;
                                    const sevLabel = severityFilter !== 'all' ? severityFilter : null;
                                    const labels = [sevLabel, typeLabel, searchActive ? `"${folderSearchQuery}"` : null].filter(Boolean).join(' + ');
                                    return (
                                      <div className="text-center py-12 bg-[#0b0c11] border border-gray-900 rounded-2xl text-xs text-gray-500 space-y-3.5">
                                        <p className="leading-relaxed">
                                          {labels ? `No issues found for ${labels}.` : 'No issues identified in this folder.'}
                                        </p>
                                        {(searchActive || severityFilter !== 'all' || typeFilter !== 'all') && (
                                          <button
                                            onClick={() => {
                                              setFolderSearchQuery('');
                                              setSeverityFilter('all');
                                              setTypeFilter('all');
                                              setExpandedIssueIndex(null);
                                            }}
                                            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer underline bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10 transition-all hover:bg-emerald-500/10"
                                          >
                                            Clear all filters
                                          </button>
                                        )}
                                      </div>
                                    );
                                  }

                                  return sortedIssues.map((issue, idx) => {
                                  const isExpanded = expandedIssueIndex === idx;
                                  return (
                                    <div
                                      key={idx}
                                      className={`issue-card-container scroll-mt-6 bg-[#0b0c11] border rounded-2xl overflow-hidden transition-all duration-200 ${
                                        isExpanded ? 'border-emerald-500/30 shadow-xl' : 'border-gray-900/80 hover:border-gray-800'
                                      }`}
                                    >
                                      {/* Accordion Trigger */}
                                      <div
                                        onClick={(e) => {
                                          const nextExpanded = !isExpanded;
                                          setExpandedIssueIndex(nextExpanded ? idx : null);
                                          if (nextExpanded) {
                                            const cardElement = e.currentTarget.closest('.issue-card-container');
                                            if (cardElement) {
                                              setTimeout(() => {
                                                cardElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                              }, 100);
                                            }
                                          }
                                        }}
                                        className="w-full text-left p-5 flex items-start justify-between space-x-4 cursor-pointer"
                                      >
                                        <div className="space-y-2 flex-1">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase tracking-wider ${
                                              issue.severity === 'critical'
                                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                : issue.severity === 'high'
                                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            }`}>
                                              {issue.severity}
                                            </span>
                                            <span className="text-xs font-mono text-gray-500">{issue.file} (Line {issue.line})</span>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setModalFile({ path: issue.file, line: issue.line });
                                              }}
                                              className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center space-x-1.5 ml-2.5 cursor-pointer bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/15"
                                              title="Jump to file view and highlight target line"
                                            >
                                              <Eye className="h-3 w-3" />
                                              <span>Jump to File</span>
                                            </button>
                                          </div>
                                          <h4 className="text-sm font-semibold text-gray-200 leading-snug">
                                            {issue.message}
                                          </h4>
                                        </div>

                                        <div className="pt-1.5 flex items-center space-x-2 shrink-0">
                                          <button
                                            title="Export Issue to JSON for Jira/Tickets"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              downloadIssueAsJSON(issue, selectedFolder);
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all border border-transparent hover:border-emerald-500/20 cursor-pointer"
                                          >
                                            <Download className="h-3.5 w-3.5" />
                                          </button>
                                          {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                                        </div>
                                      </div>

                                      {/* Accordion Expansion: Senior Developer Mentorship Playbook */}
                                      {isExpanded && (
                                        <div className="border-t border-gray-900/60 bg-black/20 p-5 space-y-6">
                                          {/* Senior Explanation & Business Impact Row */}
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                              <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider flex items-center space-x-1.5">
                                                <BookOpen className="h-3 w-3" />
                                                <span>Root Cause Explanation</span>
                                              </span>
                                              <p className="text-xs text-gray-400 leading-relaxed bg-[#0c0d12] border border-gray-900 p-4 rounded-xl">
                                                {issue.explanation || `The compiler identifies a dangerous anti-pattern here where logic relies on unverified parameters, leading to structural failures at scale. Refactoring is required to decouple execution components.`}
                                              </p>
                                            </div>
                                            <div className="space-y-2">
                                              <span className="text-[10px] text-red-400 font-mono uppercase tracking-wider flex items-center space-x-1.5">
                                                <ShieldAlert className="h-3 w-3" />
                                                <span>Business Impact & Risk</span>
                                              </span>
                                              <p className="text-xs text-red-300/90 leading-relaxed bg-red-950/10 border border-red-500/10 p-4 rounded-xl">
                                                {issue.businessImpact || `Failure to correct this exposes the organization to operational disruption, potential data leakage, severe latency spikes that compromise user trust, and increased cloud billing costs.`}
                                              </p>
                                            </div>
                                          </div>

                                          {/* Mentorship Commentary */}
                                          <div className="space-y-2.5">
                                            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 font-['Space_Grotesk'] uppercase tracking-wider">
                                              <Terminal className="h-4 w-4" />
                                              <span>Senior Staff Commentary</span>
                                            </div>
                                            <p className="text-xs text-gray-300 leading-relaxed bg-emerald-950/5 border border-emerald-500/10 p-4 rounded-xl font-sans font-medium">
                                              {issue.seniorCommentary}
                                            </p>
                                          </div>

                                          {/* Educational Insight deep-dive */}
                                          <div className="bg-teal-950/10 border border-teal-500/10 p-4 rounded-xl space-y-2 animate-fade-in">
                                            <span className="text-[10px] text-teal-400 font-mono uppercase tracking-wider flex items-center space-x-1.5">
                                              <Cpu className="h-3 w-3" />
                                              <span>Educational Concept Insight (For Junior Developers)</span>
                                            </span>
                                            <p className="text-xs text-gray-400 leading-relaxed font-sans">
                                              {issue.educationalInsight || `In standard computer architecture, security boundaries require rigorous separation between programmatic instructions and dynamic client arguments. Unchecked data inputs that cross compile-time thresholds introduce unstable branches in the execution engine.`}
                                            </p>
                                          </div>

                                          {/* Multiple, Context-Specific Solutions with Trade-offs */}
                                          <div className="space-y-3">
                                            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Context-Specific Fix Playbook & Trade-offs</span>
                                             
                                             {issue.bestOptionJustification && (
                                               <div className="bg-[#051610] border border-emerald-500/20 p-4 rounded-xl space-y-1.5 animate-fade-in text-left">
                                                 <div className="flex items-center space-x-1.5">
                                                   <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                                                   <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider">Recommended Fix & Selection Comparison</span>
                                                 </div>
                                                 <p className="text-xs text-gray-300 leading-relaxed font-sans font-medium">
                                                   {issue.bestOptionJustification}
                                                 </p>
                                               </div>
                                             )}
                                            
                                            {issue.solutions && issue.solutions.length > 0 ? (
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {issue.solutions.map((sol, sidx) => (
                                                  <div key={sidx} className="bg-[#0c0d12] border border-gray-900 rounded-xl p-4.5 space-y-3">
                                                    <div className="flex items-center justify-between border-b border-gray-900 pb-2">
                                                      <span className="text-xs font-bold text-white font-mono">Option {sidx + 1}: {sol.title}</span>
                                                      <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Ready</span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-400">{sol.description}</p>
                                                    <pre className="p-3 bg-black/60 rounded-lg text-[10px] font-mono text-emerald-400 overflow-x-auto text-left leading-relaxed max-h-48">
                                                      {sol.code}
                                                    </pre>
                                                    <div className="bg-black/30 p-2.5 rounded-lg border border-gray-900/50">
                                                      <span className="text-[9px] text-gray-500 uppercase font-mono block">Trade-off / Cost-Benefit:</span>
                                                      <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">{sol.tradeOffs}</p>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              /* Interactive Suggested Code Diff & Toggler */
                                              <div className="space-y-3">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-900 pb-2">
                                                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Suggested Code Diff & Interactive View</span>
                                                  
                                                  <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-900 gap-1 text-[10px] font-mono">
                                                    {(['diff', 'side', 'original', 'refactored'] as const).map((mode) => {
                                                      const activeMode = issueCodeTab[`${selectedFolder}-${idx}`] || 'diff';
                                                      const isActive = activeMode === mode;
                                                      const labels: Record<string, string> = {
                                                        diff: 'Unified Diff',
                                                        side: 'Side-by-Side',
                                                        original: 'Original',
                                                        refactored: 'Refactored'
                                                      };
                                                      return (
                                                        <button
                                                          key={mode}
                                                          onClick={() => setIssueCodeTab({
                                                            ...issueCodeTab,
                                                            [`${selectedFolder}-${idx}`]: mode
                                                          })}
                                                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-bold ${
                                                            isActive
                                                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                              : 'text-gray-500 hover:text-gray-300'
                                                          }`}
                                                        >
                                                          {labels[mode]}
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </div>

                                                {/* Display code based on selected tab mode */}
                                                {(() => {
                                                  const mode = issueCodeTab[`${selectedFolder}-${idx}`] || 'diff';
                                                  const lang = detectLang(issue.beforeCode || issue.afterCode);

                                                  if (mode === 'diff') {
                                                    return renderUnifiedDiff(issue.beforeCode, issue.afterCode);
                                                  }

                                                  if (mode === 'side') {
                                                    return renderSideBySideDiff(issue.beforeCode, issue.afterCode);
                                                  }

                                                  if (mode === 'original') {
                                                    return (
                                                      <div className="space-y-2">
                                                        <div className="flex items-center justify-between px-1">
                                                          <div className="text-[10px] text-red-400 font-mono uppercase tracking-wider flex items-center space-x-1.5">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                                            <span>Original Codebase Snapshot</span>
                                                          </div>
                                                          <button
                                                            onClick={() => copyToClipboard(issue.beforeCode)}
                                                            className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-emerald-400 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-emerald-500/10"
                                                          >
                                                            <Copy className="h-3 w-3" />
                                                            Copy
                                                          </button>
                                                        </div>
                                                        <div
                                                          className="p-4 bg-[#0c0d12] border border-red-500/10 rounded-xl font-mono text-xs overflow-x-auto text-left max-h-[350px] leading-relaxed"
                                                          dangerouslySetInnerHTML={{ __html: `<pre class="language-${lang}">${highlightCode(issue.beforeCode, lang)}</pre>` }}
                                                        />
                                                      </div>
                                                    );
                                                  }

                                                  return (
                                                    <div className="space-y-2">
                                                      <div className="flex items-center justify-between px-1">
                                                        <div className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider flex items-center space-x-1.5">
                                                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                          <span>Refactored Staff-Level Candidate</span>
                                                        </div>
                                                        <button
                                                          onClick={() => copyToClipboard(issue.afterCode)}
                                                          className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-emerald-400 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-emerald-500/10"
                                                        >
                                                          <Copy className="h-3 w-3" />
                                                          Copy
                                                        </button>
                                                      </div>
                                                      <div
                                                        className="p-4 bg-[#090b0e] border border-emerald-500/10 rounded-xl font-mono text-xs overflow-x-auto text-emerald-300 text-left max-h-[350px] leading-relaxed"
                                                        dangerouslySetInnerHTML={{ __html: `<pre class="language-${lang}">${highlightCode(issue.afterCode, lang)}</pre>` }}
                                                      />
                                                    </div>
                                                  );
                                                })()}
                                              </div>
                                            )}
                                          </div>

                                          {/* Quality improvement comparison footer */}
                                          <div className="p-3 bg-gray-950 border border-gray-900/60 rounded-xl flex items-center justify-between text-[11px] text-gray-500">
                                            <span>Expected Outcome:</span>
                                            <span className="font-semibold text-emerald-400 font-mono">{issue.expectedImprovement}</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="bg-[#0b0c11] border border-gray-900 rounded-2xl p-10 text-center text-sm text-gray-500">
                          Select an active workspace folder from the sidebar panel to audit directory files.
                        </div>
                      )}
                    </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'twin' && (
                <DigitalTwinPanel
                  agentsReport={agentsReport}
                  metrics={metrics}
                  projectName={currentProjectName}
                  knowledgeGraph={knowledgeGraph}
                />
              )}

              {/* What-If Simulator tab */}
              {activeTab === 'whatif' && (
                <WhatIfSimulator
                  knowledgeGraph={knowledgeGraph}
                  projectName={currentProjectName}
                />
              )}

              {/* Architecture Review tab */}
              {activeTab === 'architecture' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold font-['Space_Grotesk'] tracking-tight">Architecture Review</h2>
                    <p className="text-sm text-gray-500 mt-1">Inspection of module relationships, pattern safety, and design patterns.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Pattern Grade */}
                    <div className="bg-[#0b0c11] border border-gray-900 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                      <div>
                        <span className="text-xs text-gray-500 font-mono uppercase">Design Pattern Grade</span>
                        <div className="text-3xl font-extrabold text-white font-['Space_Grotesk'] mt-1">
                          {agentsReport.architecture.grade}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-4 leading-normal">
                        Grade represents modular decoupling, folder structure semantics, and strict clean dependency configurations.
                      </p>
                    </div>

                    {/* Framework Pattern Details */}
                    <div className="bg-[#0b0c11] border border-gray-900 p-6 rounded-2xl shadow-xl md:col-span-2 space-y-2">
                      <span className="text-xs text-gray-500 font-mono uppercase">Identified Pattern Layering</span>
                      <h3 className="text-lg font-bold text-white font-mono">{agentsReport.architecture.pattern}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed font-sans">
                        {agentsReport.architecture.description}
                      </p>
                    </div>
                  </div>

                  {/* Modular dependencies representation */}
                  <div className="bg-[#0b0c11] border border-gray-900 p-6 rounded-2xl shadow-xl">
                    <span className="text-xs text-gray-500 font-mono uppercase block mb-4">Functional Business Modules Detected</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {agentsReport.architecture.modules.map((mod, idx) => (
                        <div key={idx} className="bg-gray-950 border border-gray-900 p-4 rounded-xl flex items-start space-x-3">
                          <Layers className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-xs font-bold text-gray-200 block">{mod}</span>
                            <span className="text-[10px] text-gray-500 font-mono block mt-1">Functional separation</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 bg-gray-950 border border-gray-900 rounded-xl space-y-2 text-xs text-gray-400 leading-relaxed">
                    <span className="font-bold text-gray-300">Staff Architecture Feedback:</span>
                    <p>{agentsReport.architecture.feedback}</p>
                  </div>
                </div>
              )}

              {/* Predictive Risk & Capacity Simulator tab */}
              {activeTab === 'risks' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold font-['Space_Grotesk'] tracking-tight">Predictive Risks & Capacity Planning</h2>
                    <p className="text-sm text-gray-500 mt-1">Evaluation of infrastructure performance bottlenecks as the codebase scales under workloads.</p>
                  </div>

                  {/* Scaling Simulator Grid cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Level Gauge */}
                    <div className="bg-[#0b0c11] border border-gray-900 p-6 rounded-2xl shadow-xl space-y-2 flex flex-col justify-between">
                      <div>
                        <span className="text-xs text-gray-500 font-mono uppercase">Production Risk Level</span>
                        <div className={`text-3xl font-extrabold font-['Space_Grotesk'] tracking-tight ${
                          agentsReport.risk.level === 'HIGH' || agentsReport.risk.level === 'CRITICAL' ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          {agentsReport.risk.level}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Risk evaluates single points of failure, unparameterized database endpoints, and complex unindexed loops.
                      </p>
                    </div>

                    {/* Scale predictions details */}
                    <div className="bg-[#0b0c11] border border-gray-900 p-6 rounded-2xl shadow-xl md:col-span-2 space-y-3">
                      <span className="text-xs text-gray-500 font-mono uppercase">Workloads Capacity Bottleneck Predictor</span>
                      <h3 className="text-sm font-semibold text-gray-300 leading-relaxed">
                        {agentsReport.risk.scaling}
                      </h3>
                    </div>
                  </div>

                  {/* Cinematic Simulator representation */}
                  <div className="bg-black/40 border border-gray-900 p-6 rounded-2xl space-y-6">
                    <span className="text-xs text-gray-500 font-mono uppercase block">Live Concurrency Workload Prediction Simulator</span>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono text-gray-400">
                          <span>100 Concurrent Active Users (Minimal load)</span>
                          <span className="text-emerald-400">Operational Stable</span>
                        </div>
                        <div className="h-2 bg-gray-950 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: '15%' }}></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono text-gray-400">
                          <span>1,000 Concurrent Active Users (Average Enterprise scale)</span>
                          <span className="text-amber-400">Thread Pools Saturated | Latency spikes +200ms</span>
                        </div>
                        <div className="h-2 bg-gray-950 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: '65%' }}></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono text-gray-400">
                          <span>10,000 Concurrent Active Users (Extreme peak workload)</span>
                          <span className="text-red-400">Database Connection Exhaustion Risk | High Timeout drops</span>
                        </div>
                        <div className="h-2 bg-gray-950 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: '95%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Engineering report exporter tab */}
              {activeTab === 'report' && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold font-['Space_Grotesk'] tracking-tight">AI Compiled Engineering Report</h2>
                      <p className="text-sm text-gray-500 mt-1">Comprehensive audit summary prepared by the report consolidating agent.</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={exportReportToPDF}
                        disabled={isExporting}
                        className={`flex items-center space-x-2 ${
                          isExporting 
                            ? 'bg-emerald-950/40 text-emerald-500/50 border border-emerald-500/10 cursor-not-allowed' 
                            : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/10'
                        } px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer`}
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>{isExporting ? 'Compiling PDF...' : 'Download PDF Report'}</span>
                      </button>

                      <button
                        onClick={downloadMarkdownReport}
                        className="flex items-center space-x-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-emerald-400 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer"
                        title="Download compiled engineering report as a .md file"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Download MD Report</span>
                      </button>
                      
                      <button
                        onClick={() => copyToClipboard(buildMarkdownReport())}
                        className="flex items-center space-x-2 bg-gray-950 border border-gray-900 hover:bg-gray-900 text-gray-300 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Markdown</span>
                      </button>
                    </div>
                  </div>

                  {/* CI Badge Generator */}
                  <div className="bg-[#0b0c11] border border-gray-900 rounded-2xl overflow-hidden shadow-xl">
                    <div className="bg-gray-950 px-5 py-3.5 border-b border-gray-900 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-white font-['Space_Grotesk']">CI Badge Generator</span>
                        <span className="text-[10px] font-mono text-gray-500">— Embed in your README or CI pipeline</span>
                      </div>
                      {/* Live badge preview */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 font-mono">Preview:</span>
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 border border-gray-800">
                          <span className="text-[9px] font-bold text-white font-mono tracking-wide" style={{ fontFamily: 'Verdana, sans-serif' }}>
                            CodeDocAI
                          </span>
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white font-mono tracking-wide"
                            style={{ backgroundColor: statusColor.bg, fontFamily: 'Verdana, sans-serif' }}
                          >
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Threshold control */}
                      <div className="flex items-center gap-4">
                        <label className="text-xs text-gray-400 font-medium whitespace-nowrap">
                          Pass threshold:
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={badgeThreshold}
                          onChange={(e) => setBadgeThreshold(Number(e.target.value))}
                          className="flex-1 accent-emerald-500"
                        />
                        <span className="text-xs font-mono text-emerald-400 w-10 text-right">{badgeThreshold}</span>
                      </div>

                      {/* Format tabs */}
                      <div className="flex items-center gap-1 bg-gray-950 rounded-xl p-1 w-fit">
                        {([
                          { key: 'markdown', label: 'Markdown' },
                          { key: 'svg',      label: 'SVG' },
                          { key: 'html',     label: 'HTML' },
                        ] as { key: typeof badgeTab; label: string }[]).map((tab) => (
                          <button
                            key={tab.key}
                            onClick={() => setBadgeTab(tab.key)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                              badgeTab === tab.key
                                ? 'bg-emerald-500 text-black font-semibold'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Code block */}
                      <div className="relative bg-[#030406] border border-gray-900 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-900">
                          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                            {badgeTab === 'markdown' ? 'README.md' : badgeTab === 'svg' ? 'badge.svg' : 'index.html'}
                          </span>
                          <button
                            onClick={() => { copyToClipboard(currentBadge); showToast('success', `${badgeTab.toUpperCase()} badge copied to clipboard!`); }}
                            className="flex items-center gap-1.5 text-[10px] text-emerald-400 hover:text-emerald-300 font-mono transition-colors cursor-pointer px-2 py-1 rounded hover:bg-emerald-500/10"
                          >
                            <Copy className="h-3 w-3" />
                            Copy
                          </button>
                        </div>
                        <pre className="p-4 text-xs font-mono text-gray-400 overflow-x-auto max-h-40 leading-relaxed">
                          {currentBadge}
                        </pre>
                      </div>

                      {/* Usage tips */}
                      <div className="flex flex-wrap gap-3 text-[10px] text-gray-600 font-mono">
                        <span className="flex items-center gap-1">
                          <span className="text-emerald-500">›</span>
                          Markdown: paste directly into your README
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-emerald-500">›</span>
                          SVG: save as <span className="text-gray-400">.svg</span> or embed inline
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-emerald-500">›</span>
                          HTML: paste inside any <span className="text-gray-400">&lt;a&gt;</span> tag
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0b0c11] border border-gray-900 rounded-2xl p-6 shadow-xl space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-900 pb-4">
                      <div className="flex items-center space-x-2 text-xs text-gray-400 font-mono uppercase">
                        <FileText className="h-4 w-4 text-emerald-400" />
                        <span>Formatted Report View</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">MD-EXPORTER READY</span>
                    </div>

                    <div className="prose prose-invert prose-emerald max-w-none text-sm leading-relaxed text-gray-300 space-y-6 font-sans">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white border-l-2 border-emerald-400 pl-2.5">1. EXECUTIVE AUDIT SUMMARY</h3>
                        <p>SoftDocAI Software Engineering Inspector calculated overall codebase scores following detailed multi-agent evaluations. Evaluated workspace contains {metrics.totalFiles} files with {metrics.totalLines} lines of active code across {metrics.totalFolders} directory nodes.</p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white border-l-2 border-emerald-400 pl-2.5">2. ARCHITECTURE DIAGNOSTICS</h3>
                        <p><strong>Pattern Structure:</strong> {agentsReport.architecture.pattern}</p>
                        <p><strong>Reviewer Grade:</strong> {agentsReport.architecture.grade}</p>
                        <p>{agentsReport.architecture.description}</p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white border-l-2 border-emerald-400 pl-2.5">3. CRITICAL SECURITY DEFENSE ISSUES</h3>
                        <div className="bg-black/30 border border-red-500/10 p-4 rounded-xl space-y-2 text-xs">
                          {agentsReport.security.findings.length > 0 ? (
                            agentsReport.security.findings.map((f, i) => (
                              <div key={i} className="flex items-start space-x-2 text-gray-400 leading-normal">
                                <span className="text-red-400 shrink-0 font-bold font-mono">[{f.severity.toUpperCase()}]</span>
                                <div>
                                  <span className="text-gray-300 font-semibold block">{f.type}</span>
                                  <span className="text-gray-500 block">{f.message}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-500">No high severity security vectors registered.</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white border-l-2 border-emerald-400 pl-2.5">4. STAFF PRIORITIZED IMPROVEMENTS</h3>
                        <ol className="list-decimal pl-5 space-y-1 text-gray-300">
                          {agentsReport.risk.recommendations.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scan History and Improvement Tracking */}
              {activeTab === 'history' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold font-['Space_Grotesk'] tracking-tight">Inspection History</h2>
                      <p className="text-sm text-gray-500 mt-1">Track codebase quality trends and software maturity indicators over time.</p>
                    </div>
                    {history.length > 0 && (
                      <button
                        onClick={clearHistory}
                        className="flex items-center space-x-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Clear All History</span>
                      </button>
                    )}
                  </div>

                  {/* Quality Score Trend Chart (if multiple records exist) */}
                  {history.length > 1 && (
                    <div className="bg-[#0b0c11] border border-gray-900 rounded-2xl p-6 shadow-xl space-y-4">
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-mono">Codebase Quality Trend</span>
                        <h4 className="text-sm font-semibold text-white mt-1">Inspection score history progression chart</h4>
                      </div>
                      
                      <div className="h-40 flex items-end justify-between gap-4 pt-6 border-b border-gray-900/40 px-2">
                        {history.slice().reverse().map((item, idx) => {
                          const heightPercent = `${item.overallScore}%`;
                          const scoreColor = item.overallScore >= 80 ? 'bg-emerald-500' : item.overallScore >= 60 ? 'bg-amber-500' : 'bg-red-500';
                          return (
                            <div key={item.id} className="flex-1 flex flex-col items-center group h-full justify-end relative">
                              {/* Tooltip */}
                              <div className="absolute bottom-full mb-2 bg-black border border-gray-800 text-[10px] text-gray-300 rounded px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                <span className="font-bold text-white block">{item.projectName}</span>
                                <span className="block font-mono text-[9px]">Score: {item.overallScore}% | {item.totalErrors} issues</span>
                                <span className="text-gray-500 text-[8px]">{new Date(item.timestamp).toLocaleDateString()}</span>
                              </div>
                              {/* Bar */}
                              <div className="w-full max-w-[40px] rounded-t-lg relative group-hover:opacity-90 transition-all" style={{ height: heightPercent }}>
                                <div className={`absolute inset-0 ${scoreColor} opacity-25 rounded-t-lg`}></div>
                                <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${scoreColor} rounded-t-lg shadow-[0_-4px_12px_rgba(16,185,129,0.2)]`} style={{ height: '100%' }}></div>
                              </div>
                              {/* Label */}
                              <span className="text-[10px] text-gray-500 font-mono mt-2 truncate w-full text-center">
                                #{history.length - idx}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* History List */}
                  {history.length === 0 ? (
                    <div className="bg-[#0b0c11] border border-gray-900 border-dashed rounded-2xl p-12 text-center max-w-xl mx-auto my-8">
                      <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gray-950 border border-gray-900 text-gray-500 mb-4 shadow-inner">
                        <History className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">No scan history recorded</h3>
                      <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto leading-normal">
                        Every time you perform an engineering inspection on a codebase, the generated report metrics are saved here automatically.
                      </p>
                      <button
                        onClick={() => setScreen('upload')}
                        className="mt-6 inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                      >
                        <UploadCloud className="h-4 w-4" />
                        <span>Run First Inspection</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {history.map((item) => {
                        const scoreColorClass = item.overallScore >= 80 
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                          : item.overallScore >= 60 
                            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
                            : 'text-red-400 bg-red-500/10 border-red-500/20';

                        return (
                          <div
                            key={item.id}
                            onClick={() => loadHistoryItem(item)}
                            className="bg-[#0b0c11] hover:bg-[#0e0f16] border border-gray-900 hover:border-gray-800 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all cursor-pointer shadow-lg group relative overflow-hidden"
                          >
                            <div className="space-y-1.5 max-w-xl">
                              <div className="flex items-center space-x-2.5">
                                <h4 className="text-white font-bold font-['Space_Grotesk'] text-base tracking-tight group-hover:text-emerald-400 transition-colors">
                                  {item.projectName}
                                </h4>
                                {item.isDemo && (
                                  <span className="text-[9px] bg-gray-950 text-gray-500 px-1.5 py-0.5 rounded border border-gray-900/50 font-mono">
                                    SANDBOX
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-mono">
                                <span>Checked: {new Date(item.timestamp).toLocaleString()}</span>
                                <span className="text-gray-700">|</span>
                                <span>{item.totalFiles} Files</span>
                                <span className="text-gray-700">|</span>
                                <span>{item.totalLines.toLocaleString()} Lines</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-gray-900/40 pt-3 sm:pt-0 shrink-0">
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">Health:</span>
                                <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl border font-bold font-mono text-xs ${scoreColorClass}`}>
                                  <span>{item.overallScore}%</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => deleteHistoryItem(item.id, e)}
                                  className="p-2.5 bg-gray-950/40 hover:bg-red-950/20 text-gray-500 hover:text-red-400 border border-gray-900/80 hover:border-red-900/30 rounded-xl transition-all cursor-pointer"
                                  title="Delete Report"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
            )}
          </div>
        )}
      </main>

      {/* Footer bar */}
      <footer className="bg-[#07080b] border-t border-gray-900/60 py-4 px-6 text-center text-xs text-gray-500 font-mono flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>© 2026 SoftDocAI — Software Engineering Inspector. All rights reserved.</span>
        <div className="flex items-center space-x-3 text-gray-600">
          <span>Enterprise Grade Code Inspections</span>
        </div>
      </footer>

      {/* File Viewer Modal */}
      {modalFile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0b0c11] border border-gray-900 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl shadow-emerald-500/5">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-900 flex items-center justify-between bg-black/40">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  <FileCode className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono truncate max-w-lg">
                    {modalFile.path}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-mono">
                    HIGHLIGHTING TARGET LINE: {modalFile.line}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalFile(null)}
                className="p-1.5 hover:bg-gray-950 border border-transparent hover:border-gray-900 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {(() => {
                const targetFile = files.find(
                  (f) => f.path.endsWith(modalFile.path) || modalFile.path.endsWith(f.path)
                );

                if (!targetFile) {
                  return (
                    <div className="text-center py-12 bg-black/30 rounded-xl border border-gray-900 space-y-3">
                      <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
                      <div>
                        <h4 className="text-sm font-bold text-gray-300">File content not cached</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                          The analyzer has evaluated the file metadata, but the raw text content is not fully cached. Line {modalFile.line} points to a valid structural offset.
                        </p>
                      </div>
                    </div>
                  );
                }

                const linesOfCode = targetFile.content.split('\n');
                const extension = modalFile.path.split('.').pop()?.toLowerCase() || '';
                let prismLanguage = 'clike'; // fallback
                if (['ts', 'tsx'].includes(extension)) {
                  prismLanguage = 'tsx';
                } else if (['js', 'jsx'].includes(extension)) {
                  prismLanguage = 'jsx';
                } else if (['json'].includes(extension)) {
                  prismLanguage = 'json';
                } else if (['html', 'xml'].includes(extension)) {
                  prismLanguage = 'markup';
                } else if (['css'].includes(extension)) {
                  prismLanguage = 'css';
                } else if (['py'].includes(extension)) {
                  prismLanguage = 'python';
                }

                const grammar = Prism.languages[prismLanguage] || Prism.languages.clike;
                let highlightedLines: string[] = [];
                try {
                  const highlightedHTML = Prism.highlight(targetFile.content, grammar, prismLanguage);
                  highlightedLines = highlightedHTML.split('\n');
                } catch (e) {
                  console.error("Failed to highlight code with PrismJS:", e);
                  highlightedLines = linesOfCode;
                }

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <span>Source Code Viewer</span>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/15 font-mono uppercase font-bold tracking-wider">
                          {extension}
                        </span>
                      </div>
                      <span>{linesOfCode.length} lines total</span>
                    </div>
                    
                    <div className="border border-gray-900 bg-gray-950 rounded-xl overflow-hidden shadow-inner">
                      <div className={`max-h-[500px] overflow-y-auto p-4 font-mono text-xs text-gray-400 space-y-1 select-text scroll-smooth language-${prismLanguage}`}>
                        {linesOfCode.map((lineContent, lineIdx) => {
                          const currentLineNum = lineIdx + 1;
                          const isTargetLine = currentLineNum === modalFile.line;
                          const highlightedHtmlLine = highlightedLines[lineIdx] !== undefined ? highlightedLines[lineIdx] : lineContent;

                          return (
                            <div
                              key={lineIdx}
                              ref={isTargetLine ? (el) => {
                                if (el) {
                                  // Smooth scroll when mounted or changed
                                  setTimeout(() => {
                                    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
                                  }, 100);
                                }
                              } : undefined}
                              className={`flex items-start py-1 px-3 rounded transition-colors ${
                                isTargetLine
                                  ? 'bg-emerald-500/10 border-l-4 border-emerald-500 text-white font-semibold'
                                  : 'hover:bg-gray-900/40'
                              }`}
                            >
                              <span className={`w-10 shrink-0 select-none text-right pr-4 font-mono text-[11px] ${
                                isTargetLine ? 'text-emerald-400' : 'text-gray-700'
                              }`}>
                                {currentLineNum}
                              </span>
                              <pre 
                                className="whitespace-pre-wrap break-all font-mono leading-relaxed flex-1 text-[11px]"
                                dangerouslySetInnerHTML={{ __html: highlightedHtmlLine || '&nbsp;' }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-900 bg-black/40 flex justify-end">
              <button
                onClick={() => setModalFile(null)}
                className="bg-gray-950 hover:bg-gray-900 border border-gray-850 hover:border-gray-850 text-gray-300 font-semibold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Command Palette (Ctrl+K) */}
      {isCommandPaletteOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
          onClick={() => setIsCommandPaletteOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-[#090a0d] border border-gray-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden animate-[slideDown_0.15s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-800">
              <Command className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Type a command or search..."
                value={commandSearch}
                onChange={(e) => { setCommandSearch(e.target.value); setCommandFocusIndex(0); }}
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none font-['Plus_Jakarta_Sans']"
                aria-label="Command search"
              />
              <kbd className="text-[10px] font-mono px-2 py-1 rounded border border-gray-700 text-gray-500 bg-gray-900">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-2" role="listbox" aria-label="Commands">
              {filteredCommands.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  No commands match "{commandSearch}"
                </div>
              ) : (
                (() => {
                  let lastCategory = '';
                  return filteredCommands.map((cmd, i) => {
                    const showCategory = cmd.category !== lastCategory;
                    lastCategory = cmd.category;
                    const focused = commandFocusIndex === i;
                    return (
                      <React.Fragment key={cmd.id}>
                        {showCategory && (
                          <div className="px-4 pt-2 pb-1">
                            <span className="text-[10px] font-mono text-gray-600 uppercase tracking-wider">{cmd.category}</span>
                          </div>
                        )}
                        <button
                          role="option"
                          aria-selected={focused}
                          onClick={() => cmd.action()}
                          onMouseEnter={() => setCommandFocusIndex(i)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            focused ? 'bg-emerald-500/10 text-white' : 'text-gray-300 hover:bg-gray-900'
                          }`}
                        >
                          <cmd.icon className={`h-4 w-4 flex-shrink-0 ${focused ? 'text-emerald-400' : 'text-gray-500'}`} />
                          <span className="flex-1 text-left">{cmd.label}</span>
                          {cmd.shortcut && (
                            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-gray-700 text-gray-500 bg-gray-900">{cmd.shortcut}</kbd>
                          )}
                        </button>
                      </React.Fragment>
                    );
                  });
                })()
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-gray-800 flex items-center gap-4 text-[10px] font-mono text-gray-600">
              <span><kbd className="text-gray-500">↑↓</kbd> Navigate</span>
              <span><kbd className="text-gray-500">↵</kbd> Select</span>
              <span><kbd className="text-gray-500">ESC</kbd> Close</span>
            </div>
          </div>
        </div>
      )}

      {/* PDF Export Progress Overlay */}
      {isExporting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#090a0d] border border-emerald-500/20 rounded-2xl shadow-2xl shadow-black/60 w-80 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 h-1.5 transition-all duration-300"
              style={{ width: `${pdfProgress}%` }} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-500/10 p-2.5 rounded-xl">
                  <Cpu className="h-5 w-5 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-400 font-['Space_Grotesk']">Generating PDF Report</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{pdfStep}</p>
                </div>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden border border-gray-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                  style={{ width: `${pdfProgress}%` }}
                />
              </div>
              <p className="text-center text-xs font-mono text-gray-500 mt-3">{pdfProgress}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[110] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-[slideInRight_0.3s_ease-out] ${
              toast.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300' :
              toast.type === 'error'   ? 'bg-red-950/80 border-red-500/30 text-red-300' :
              'bg-gray-900/80 border-gray-700/50 text-gray-300'
            }`}
          >
            <div className={`mt-0.5 flex-shrink-0 ${
              toast.type === 'success' ? 'text-emerald-400' :
              toast.type === 'error'   ? 'text-red-400' : 'text-gray-400'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> :
               toast.type === 'error'   ? <AlertTriangle className="h-4 w-4" /> :
               <AlertCircle className="h-4 w-4" />}
            </div>
            <p className="text-xs leading-relaxed flex-1">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
