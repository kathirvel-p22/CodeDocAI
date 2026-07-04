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
  Network
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

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Code Display Toggles
  const [issueCodeTab, setIssueCodeTab] = useState<Record<string, 'diff' | 'side' | 'original' | 'refactored'>>({});

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // System-aware Theme State ('dark' | 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Sync theme with system preference automatically
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    
    // Set initial theme based on current OS preference
    setTheme(mediaQuery.matches ? 'dark' : 'light');
    
    // Listen for changes to system theme
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleThemeChange);
    } else {
      mediaQuery.addListener(handleThemeChange);
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleThemeChange);
      } else {
        mediaQuery.removeListener(handleThemeChange);
      }
    };
  }, []);

  // Update HTML document class for theme overrides
  React.useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark-mode');
    } else {
      document.documentElement.classList.add('dark-mode');
      document.documentElement.classList.remove('light-mode');
    }
  }, [theme]);

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

  // Export active report to A4 PDF using html2canvas and jspdf
  const exportReportToPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);

    const previousTab = activeTab;
    // Temporarily switch to report tab to capture the full compiled engineering report
    setActiveTab('report');

    // Wait for the DOM tab switch transition to complete
    await new Promise((resolve) => setTimeout(resolve, 350));

    try {
      const element = document.getElementById('dashboard-content-panel');
      if (!element) {
        throw new Error('Capture target element #dashboard-content-panel not found.');
      }

      // Temporarily override height/overflow constraints so that everything is drawn completely on canvas
      const originalHeight = element.style.height;
      const originalMaxHeight = element.style.maxHeight;
      const originalOverflow = element.style.overflow;

      element.style.height = 'auto';
      element.style.maxHeight = 'none';
      element.style.overflow = 'visible';

      const canvas = await html2canvas(element, {
        scale: 2, // 2x scale for sharp high-DPI text resolution
        useCORS: true,
        backgroundColor: '#07080a',
        logging: false,
        allowTaint: true
      });

      // Restore original container style bounds immediately
      element.style.height = originalHeight;
      element.style.maxHeight = originalMaxHeight;
      element.style.overflow = originalOverflow;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 page width in mm
      const pageHeight = 297; // A4 page height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Handle multi-page overflow
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const formattedName = currentProjectName.replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`SoftDocAI_Report_${formattedName || 'Workspace'}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF Report:', err);
      alert('Failed to compile PDF. Please verify your browser has canvas rendering support enabled.');
    } finally {
      // Revert back to the user's previously active tab
      setActiveTab(previousTab);
      setIsExporting(false);
    }
  };

  // Renders a beautiful visual Git Diff between original code and the recommended refactor
  const renderUnifiedDiff = (before: string, after: string) => {
    const beforeLines = before.trim().split('\n');
    const afterLines = after.trim().split('\n');

    return (
      <div className="font-mono text-xs bg-[#030406] border border-gray-900 rounded-xl overflow-hidden leading-relaxed text-left">
        <div className="bg-gray-950 px-4 py-2.5 text-[10px] text-gray-500 border-b border-gray-900/50 flex justify-between items-center font-bold">
          <span className="tracking-wider uppercase">Unified Suggested Diff</span>
          <span className="text-emerald-400">-{beforeLines.length} / +{afterLines.length} Lines</span>
        </div>
        <div className="p-4 overflow-x-auto max-h-[350px] space-y-0.5">
          {beforeLines.map((line, i) => (
            <div key={`del-${i}`} className="flex bg-red-950/15 text-red-300 border-l-2 border-red-500 pl-2 pr-4 py-0.5 select-none hover:bg-red-950/25 transition-all">
              <span className="text-red-500/50 w-6 text-right mr-3 shrink-0">-</span>
              <span className="whitespace-pre">{line}</span>
            </div>
          ))}
          {afterLines.map((line, i) => (
            <div key={`add-${i}`} className="flex bg-emerald-950/15 text-emerald-300 border-l-2 border-emerald-500 pl-2 pr-4 py-0.5 hover:bg-emerald-950/25 transition-all">
              <span className="text-emerald-500/50 w-6 text-right mr-3 shrink-0">+</span>
              <span className="whitespace-pre">{line}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Key Input Modal / Setup
  const [apiKeySet, setApiKeySet] = useState<boolean>(true); // Assume auto injected backend or server side API key
  const [showConfigHint, setShowConfigHint] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

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
        worker.postMessage({ files: uploadedFiles });
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
        body: JSON.stringify({ files: uploadedFiles }),
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
          {/* System-aware Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode (Auto-synced to your OS preference)`}
          >
            {theme === 'dark' ? (
              <Moon className="h-4 w-4 text-emerald-400" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
            <span className="hidden md:inline ml-2 text-xs font-mono font-medium text-gray-400 hover:text-white">
              OS Theme: {theme.toUpperCase()}
            </span>
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

                              {/* Filtering and Actions Toolbar */}
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0b0c11] border border-gray-900 rounded-2xl p-4.5 shadow-xl">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                                  <div className="flex items-center space-x-2.5 shrink-0">
                                    <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                                      <Terminal className="h-4 w-4 text-emerald-400" />
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-bold text-white">Diagnostics & Search</h4>
                                      <p className="text-[10px] text-gray-500 font-mono">FOLDER ISSUE FILTERING</p>
                                    </div>
                                  </div>
                                  
                                  {/* Search Input */}
                                  <div className="relative flex-1 max-w-md w-full">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <Search className="h-3.5 w-3.5 text-gray-500" />
                                    </div>
                                    <input
                                      type="text"
                                      placeholder="Search by file, message or senior commentary..."
                                      value={folderSearchQuery}
                                      onChange={(e) => {
                                        setFolderSearchQuery(e.target.value);
                                        setExpandedIssueIndex(null);
                                      }}
                                      className="w-full bg-gray-950 border border-gray-900 hover:border-gray-800 text-xs text-gray-300 rounded-xl pl-9 pr-8 py-2.5 outline-none focus:border-emerald-500/30 transition-all placeholder:text-gray-600 font-medium"
                                    />
                                    {folderSearchQuery && (
                                      <button
                                        onClick={() => {
                                          setFolderSearchQuery('');
                                          setExpandedIssueIndex(null);
                                        }}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-all cursor-pointer"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-4 shrink-0">
                                  <div className="flex items-center space-x-3">
                                    <label htmlFor="severity-select" className="text-xs text-gray-400 font-medium">Severity:</label>
                                    <select
                                      id="severity-select"
                                      value={severityFilter}
                                      onChange={(e) => {
                                        setSeverityFilter(e.target.value as any);
                                        setExpandedIssueIndex(null);
                                      }}
                                      className="bg-gray-950 border border-gray-800 hover:border-gray-700 text-xs text-gray-300 rounded-xl px-3 py-2 outline-none focus:border-emerald-500/30 transition-all cursor-pointer font-semibold font-sans"
                                    >
                                      <option value="all">All Issues ({folderData.issues.length})</option>
                                      <option value="critical">Critical ({folderData.issues.filter(i => i.severity === 'critical').length})</option>
                                      <option value="high">High ({folderData.issues.filter(i => i.severity === 'high').length})</option>
                                      <option value="medium">Medium ({folderData.issues.filter(i => i.severity === 'medium').length})</option>
                                      <option value="low">Low ({folderData.issues.filter(i => i.severity === 'low').length})</option>
                                    </select>
                                  </div>

                                  <div className="flex items-center space-x-3">
                                    <label htmlFor="sort-select" className="text-xs text-gray-400 font-medium">Sort By:</label>
                                    <select
                                      id="sort-select"
                                      value={issueSortBy}
                                      onChange={(e) => {
                                        setIssueSortBy(e.target.value as 'severity' | 'filePath');
                                        setExpandedIssueIndex(null);
                                      }}
                                      className="bg-gray-950 border border-gray-800 hover:border-gray-700 text-xs text-gray-300 rounded-xl px-3 py-2 outline-none focus:border-emerald-500/30 transition-all cursor-pointer font-semibold font-sans"
                                    >
                                      <option value="severity">Severity (Critical to Low)</option>
                                      <option value="filePath">File Path (Alphabetical)</option>
                                    </select>
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
                                    // 2. Search query filter (matches file path, message, or senior commentary)
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
                                    return (
                                      <div className="text-center py-12 bg-[#0b0c11] border border-gray-900 rounded-2xl text-xs text-gray-500 space-y-3.5">
                                        <p className="leading-relaxed">
                                          {searchActive 
                                            ? `No issues matching "${folderSearchQuery}" found with ${severityFilter} severity.` 
                                            : `No ${severityFilter} severity issues identified in this folder.`
                                          }
                                        </p>
                                        {searchActive && (
                                          <button
                                            onClick={() => {
                                              setFolderSearchQuery('');
                                              setExpandedIssueIndex(null);
                                            }}
                                            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer underline bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10 transition-all hover:bg-emerald-500/10"
                                          >
                                            Clear search query
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
                                                  if (mode === 'diff') {
                                                    return renderUnifiedDiff(issue.beforeCode, issue.afterCode);
                                                  }
                                                  
                                                  if (mode === 'side') {
                                                    return (
                                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                          <div className="text-[10px] text-red-400 font-mono uppercase tracking-wider flex items-center space-x-1.5 pl-1">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                                            <span>Original Code</span>
                                                          </div>
                                                          <pre className="p-4 bg-[#0c0d12] border border-red-500/10 rounded-xl font-mono text-xs overflow-x-auto text-gray-400 leading-relaxed text-left max-h-[350px]">
                                                            {issue.beforeCode}
                                                          </pre>
                                                        </div>
                                                        <div className="space-y-2">
                                                          <div className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider flex items-center space-x-1.5 pl-1">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                            <span>Refactored Code</span>
                                                          </div>
                                                          <pre className="p-4 bg-[#090b0e] border border-emerald-500/10 rounded-xl font-mono text-xs overflow-x-auto text-emerald-300 leading-relaxed text-left max-h-[350px]">
                                                            {issue.afterCode}
                                                          </pre>
                                                        </div>
                                                      </div>
                                                    );
                                                  }
                                                  
                                                  if (mode === 'original') {
                                                    return (
                                                      <div className="space-y-2">
                                                        <div className="text-[10px] text-red-400 font-mono uppercase tracking-wider flex items-center space-x-1.5 pl-1">
                                                          <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                                          <span>Original Codebase Snapshot</span>
                                                        </div>
                                                        <pre className="p-4 bg-[#0c0d12] border border-red-500/10 rounded-xl font-mono text-xs overflow-x-auto text-gray-400 text-left leading-relaxed max-h-[350px]">
                                                          {issue.beforeCode}
                                                        </pre>
                                                      </div>
                                                    );
                                                  }
                                                  
                                                  return (
                                                    <div className="space-y-2">
                                                      <div className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider flex items-center space-x-1.5 pl-1">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                        <span>Refactored Staff-Level Candidate</span>
                                                      </div>
                                                      <pre className="p-4 bg-[#090b0e] border border-emerald-500/10 rounded-xl font-mono text-xs overflow-x-auto text-emerald-300 text-left leading-relaxed max-h-[350px]">
                                                        {issue.afterCode}
                                                      </pre>
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
    </div>
  );
}
