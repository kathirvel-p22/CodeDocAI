import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { KnowledgeGraph, GraphNode } from '../types/knowledgeGraph';
import InteractiveKnowledgeGraph from './InteractiveKnowledgeGraph';
import { calculateRiskScore } from '../lib/riskScoring';
import { generateActionableTasks } from '../lib/taskGenerator';
import {
  Network,
  Clock,
  Activity,
  Zap,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Play,
  Sliders,
  TrendingUp,
  TrendingDown,
  Gauge,
  Folder,
  FileCode,
  ArrowRight,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Shield,
  HelpCircle,
  Download,
  Target
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface FolderAnalysis {
  errorsCount: number;
  summary: string;
  issues: any[];
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

interface DigitalTwinPanelProps {
  agentsReport: AgentsReport;
  metrics: {
    totalFiles: number;
    totalLines: number;
  } | null;
  projectName: string;
  knowledgeGraph?: KnowledgeGraph | null;
}

// Interactive Twin Graph Nodes Types
interface TwinNode {
  id: string;
  label: string;
  type: 'module' | 'folder' | 'system' | 'external';
  x: number;
  y: number;
  health: number; // 0 - 100
  size: number; // radius or impact weight
  issuesCount: number;
  details: string;
  dependencies: string[];
}

export default function DigitalTwinPanel({ agentsReport, metrics, projectName, knowledgeGraph }: DigitalTwinPanelProps) {
  // 1. Digital Twin States
  const [selectedNode, setSelectedNode] = useState<TwinNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<TwinNode | null>(null);
  const [graphPerspective, setGraphPerspective] = useState<'layer' | 'dependency' | 'risk'>('layer');
  const [graphView, setGraphView] = useState<'simple' | 'interactive'>('interactive'); // Default to interactive

  // 2. Engineering Time Machine States
  const [timelineMonths, setTimelineMonths] = useState<number>(0); // 0 (current) to 24 (2 years)
  const [teamSizeGrowth, setTeamSizeGrowth] = useState<number>(20); // % growth
  const [velocity, setVelocity] = useState<number>(50); // commit velocity slider
  const [refactoringPriority, setRefactoringPriority] = useState<number>(30); // refactoring slider

  // 3. AI CTO Decisions State
  const [ctoApproved, setCtoApproved] = useState<boolean | null>(null);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [showOverrideInput, setShowOverrideInput] = useState<boolean>(false);

  // 4. Enhanced Risk Scoring & Task Generation (NEW!)
  const riskScore = useMemo(() => {
    return calculateRiskScore(agentsReport, knowledgeGraph || undefined);
  }, [agentsReport, knowledgeGraph]);

  const actionableTasks = useMemo(() => {
    return generateActionableTasks(agentsReport, riskScore, knowledgeGraph || undefined);
  }, [agentsReport, riskScore, knowledgeGraph]);

  // Derive nodes from Real Knowledge Graph or fallback to mock data
  const nodes: TwinNode[] = useMemo(() => {
    // Use real knowledge graph if available
    if (knowledgeGraph && knowledgeGraph.nodes && knowledgeGraph.nodes.length > 0) {
      console.log('[DigitalTwin] Using real knowledge graph with', knowledgeGraph.nodes.length, 'nodes');
      
      const graphNodes: TwinNode[] = [];
      const moduleNodes = knowledgeGraph.modules || [];
      
      // Create module-level nodes from detected modules
      if (moduleNodes.length > 0) {
        moduleNodes.forEach((module, idx) => {
          const angle = (idx / moduleNodes.length) * 2 * Math.PI;
          const radius = 180;
          const x = 350 + radius * Math.cos(angle);
          const y = 200 + radius * Math.sin(angle);
          
          graphNodes.push({
            id: module.id,
            label: module.name,
            type: 'module',
            x,
            y,
            health: module.health,
            size: 22,
            issuesCount: module.issuesCount,
            details: module.description,
            dependencies: module.nodes // File IDs in this module
          });
        });
      } else {
        // Use individual files as nodes
        const fileNodes = knowledgeGraph.nodes.slice(0, 20); // Limit to 20 for visualization
        fileNodes.forEach((node, idx) => {
          const angle = (idx / fileNodes.length) * 2 * Math.PI;
          const radius = 180;
          const x = 350 + radius * Math.cos(angle);
          const y = 200 + radius * Math.sin(angle);
          
          graphNodes.push({
            id: node.id,
            label: node.label,
            type: node.type === 'module' ? 'module' : 'folder',
            x,
            y,
            health: node.health,
            size: 18,
            issuesCount: node.issuesCount,
            details: `${node.metadata.language} file in ${node.layer} layer`,
            dependencies: node.dependencies
          });
        });
      }
      
      // Add central root node
      graphNodes.unshift({
        id: 'root',
        label: projectName || 'Project Root',
        type: 'system',
        x: 350,
        y: 200,
        health: agentsReport.overallScore,
        size: 28,
        issuesCount: Object.values(agentsReport.folderAnalysis || {}).reduce((acc, f) => acc + f.errorsCount, 0),
        details: `Central architecture with ${knowledgeGraph.statistics.totalNodes} components and ${knowledgeGraph.statistics.totalEdges} dependencies`,
        dependencies: moduleNodes.map(m => m.id)
      });
      
      return graphNodes;
    }
    
    // Fallback to original mock data
    console.log('[DigitalTwin] Using fallback mock data (knowledge graph not available)');
    const defaultModules = agentsReport.architecture.modules.length > 0
      ? agentsReport.architecture.modules
      : ['Auth', 'Core', 'UI', 'Database', 'API'];

    const baseNodes: TwinNode[] = [];

    // Add root system node
    baseNodes.push({
      id: 'root',
      label: projectName || 'Workspace App',
      type: 'system',
      x: 350,
      y: 200,
      health: agentsReport.overallScore,
      size: 28,
      issuesCount: Object.values(agentsReport.folderAnalysis || {}).reduce((acc, f) => acc + f.errorsCount, 0),
      details: `Central architecture coordinator mapped on ${agentsReport.architecture.pattern}`,
      dependencies: defaultModules.map(m => m.toLowerCase())
    });

    // Add modules
    defaultModules.forEach((mod, idx) => {
      const angle = (idx / defaultModules.length) * 2 * Math.PI;
      const radius = 160;
      const x = 350 + radius * Math.cos(angle);
      const y = 200 + radius * Math.sin(angle);

      // Find if there is folder metrics matched
      const folderKey = mod.toLowerCase();
      const folderMatch = Object.entries(agentsReport.folderAnalysis || {}).find(
        ([k]) => k.toLowerCase().includes(folderKey)
      );

      const issuesCount = folderMatch ? folderMatch[1].errorsCount : Math.floor(Math.random() * 4);
      // Health decreases as issues increase
      const health = Math.max(40, 100 - (issuesCount * 12));

      baseNodes.push({
        id: folderKey,
        label: mod,
        type: 'module',
        x,
        y,
        health,
        size: 20,
        issuesCount,
        details: folderMatch ? folderMatch[1].summary : `Operational module coordinating ${mod} routines.`,
        dependencies: ['root']
      });
    });

    // If perspective is risk-based, let's scatter them by risk factor
    if (graphPerspective === 'risk') {
      return baseNodes.map((n, idx) => {
        if (n.id === 'root') return n;
        // Move high issues nodes closer to bottom (ground zero)
        const isHighRisk = n.issuesCount > 2;
        return {
          ...n,
          y: isHighRisk ? 300 + (idx * 10) : 100 + (idx * 15),
          x: 100 + (idx * 110)
        };
      });
    }

    return baseNodes;
  }, [agentsReport, projectName, graphPerspective, knowledgeGraph]);

  // Compute connections
  const connections = useMemo(() => {
    const lines: Array<{ from: TwinNode; to: TwinNode; key: string }> = [];
    nodes.forEach(node => {
      node.dependencies.forEach(depId => {
        const target = nodes.find(n => n.id === depId);
        if (target) {
          lines.push({
            from: node,
            to: target,
            key: `${node.id}-${target.id}`
          });
        }
      });
    });
    return lines;
  }, [nodes]);

  // Engineering Time Machine - Dynamic Projections based on interactive variables
  const projectionData = useMemo(() => {
    const points = [];
    const baseScore = agentsReport.overallScore;
    const baseDebtRatio = Math.max(5, 100 - baseScore);
    const baseBugs = Object.values(agentsReport.folderAnalysis || {}).reduce((acc, f) => acc + f.errorsCount, 0);

    for (let m = 0; m <= 24; m += 3) {
      // Team growth increases complexity
      const teamMultiplier = 1 + (teamSizeGrowth / 100) * (m / 24);
      // Velocity increases features but also debt unless refactoring is high
      const velocityImpact = (velocity / 50) * (m / 12);
      // Refactoring decreases debt
      const refactorImpact = (refactoringPriority / 100) * 15 * (m / 12);

      const debtGrowth = (velocityImpact * 6 * teamMultiplier) - refactorImpact;
      const projectedDebt = Math.min(85, Math.max(2, baseDebtRatio + debtGrowth));
      const projectedMaintainability = Math.max(15, Math.min(99, 100 - projectedDebt));
      
      const bugLeakage = Math.max(0, Math.floor(baseBugs + (m * (velocity / 60) * teamMultiplier) - (m * (refactoringPriority / 40))));
      const codebaseLines = Math.floor((metrics?.totalLines || 5000) * (1 + (velocity / 120) * (m / 12) * teamMultiplier));

      points.push({
        month: m === 0 ? 'Now' : `M+${m}`,
        'Technical Debt (%)': Math.round(projectedDebt),
        'Maintainability Index': Math.round(projectedMaintainability),
        'Projected Bug Leakage': bugLeakage,
        'Code Size (LoC)': codebaseLines
      });
    }
    return points;
  }, [agentsReport, metrics, timelineMonths, teamSizeGrowth, velocity, refactoringPriority]);

  // Current projected parameters based on slider choice
  const activeProjection = useMemo(() => {
    const index = Math.min(Math.floor(timelineMonths / 3), projectionData.length - 1);
    return projectionData[index] || projectionData[0];
  }, [timelineMonths, projectionData]);

  // AI CTO Decision Engine
  const ctoDecision = useMemo(() => {
    const securityFindings = agentsReport.security.findings || [];
    const criticalSecurity = securityFindings.filter(f => f.severity === 'critical' || f.severity === 'high').length;
    const totalIssues = Object.values(agentsReport.folderAnalysis || {}).reduce((acc, f) => acc + f.errorsCount, 0);
    const overallScore = agentsReport.overallScore;

    let decision: 'GO' | 'CONDITIONAL_GO' | 'NO_GO' = 'GO';
    let summary = '';
    const gates = [
      { name: 'Security Baseline Threshold', passed: true, detail: 'No critical vulnerabilities' },
      { name: 'Decoupling Architecture Grade', passed: true, detail: `Grade is ${agentsReport.architecture.grade}` },
      { name: 'Debt Complexity Index', passed: true, detail: 'Debt remains under 35%' },
      { name: 'Quality Coverage Standard', passed: true, detail: 'Basic tests mapped and functional' }
    ];

    // Evaluate gates
    if (criticalSecurity > 0) {
      gates[0].passed = false;
      gates[0].detail = `${criticalSecurity} critical/high vulnerability detected`;
    }
    if (['D', 'F', 'E'].includes(agentsReport.architecture.grade)) {
      gates[1].passed = false;
      gates[1].detail = 'Decoupling grade fails baseline guidelines';
    }
    if (overallScore < 60) {
      gates[2].passed = false;
      gates[2].detail = `Overall codebase score (${overallScore}) triggers complexity warnings`;
    }
    if (agentsReport.testing.score < 50) {
      gates[3].passed = false;
      gates[3].detail = 'Test suite shows insufficient path validation';
    }

    const failedCount = gates.filter(g => !g.passed).length;
    if (failedCount >= 2 || !gates[0].passed) {
      decision = 'NO_GO';
      summary = 'Deployment is strictly blocked. High security exposure or severe component degradation discovered by multi-agent audit routines.';
    } else if (failedCount === 1) {
      decision = 'CONDITIONAL_GO';
      summary = 'Conditional Approval granted. Safe for isolated staging environments, but active mitigations are required for architectural bottleneck.';
    } else {
      decision = 'GO';
      summary = 'Full production clearance. High compliance across security, maintainability, and structural decoupling benchmarks.';
    }

    return { decision, summary, gates };
  }, [agentsReport]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview Block */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-900 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl border border-emerald-500/20">
              <Network className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold font-['Space_Grotesk'] tracking-tight">Digital Twin & AI CTO</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1.5">
            Interact with your codebase's live representation, simulate multi-year technical debt, and access autonomous CTO deployment clearance.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-gray-900 border border-gray-800 p-1.5 rounded-xl text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold">DIGITAL TWIN ENGAGED</span>
        </div>
      </div>

      {/* Main Grid: Interactive Twin on Left, Side Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visualizer Frame */}
        <div className="lg:col-span-2 bg-[#0b0c11] border border-gray-900 rounded-2xl p-5 shadow-xl flex flex-col justify-between min-h-[480px] relative overflow-hidden">
          
          {/* Visualizer Controls */}
          <div className="flex items-center justify-between border-b border-gray-900 pb-4 mb-4 z-10">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-bold font-mono text-gray-200">Interactive Software Knowledge Graph</span>
            </div>
            <div className="flex items-center space-x-2">
              {/* View Toggle */}
              <div className="flex space-x-1 bg-gray-950 p-1 rounded-lg border border-gray-900">
                <button
                  onClick={() => setGraphView('interactive')}
                  className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    graphView === 'interactive' ? 'bg-purple-500/15 text-purple-400' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  Interactive
                </button>
                <button
                  onClick={() => setGraphView('simple')}
                  className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    graphView === 'simple' ? 'bg-purple-500/15 text-purple-400' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  Simple
                </button>
              </div>

              {/* Perspective Toggle (only for simple view) */}
              {graphView === 'simple' && (
                <div className="flex space-x-1 bg-gray-950 p-1 rounded-lg border border-gray-900">
                  <button
                    onClick={() => setGraphPerspective('layer')}
                    className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      graphPerspective === 'layer' ? 'bg-emerald-500/15 text-emerald-400' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    Layer View
                  </button>
                  <button
                    onClick={() => setGraphPerspective('dependency')}
                    className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      graphPerspective === 'dependency' ? 'bg-emerald-500/15 text-emerald-400' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    Dynamic Flow
                  </button>
                  <button
                    onClick={() => setGraphPerspective('risk')}
                    className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      graphPerspective === 'risk' ? 'bg-emerald-500/15 text-emerald-400' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    Risk Cascade
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Conditional Rendering: Interactive vs Simple Graph */}
          {graphView === 'interactive' && knowledgeGraph ? (
            <div className="flex-1 -mx-5 -mb-5">
              <InteractiveKnowledgeGraph
                knowledgeGraph={knowledgeGraph}
                onNodeClick={(node) => {
                  console.log('Node clicked:', node);
                  // Could set selected node for detail panel
                }}
              />
            </div>
          ) : (
            <>
          {/* SVG Graph Drawing Stage (Simple View) */}
          <div className="flex-1 flex items-center justify-center min-h-[340px] relative">
            <svg className="w-full h-full max-w-[650px] max-h-[350px]" viewBox="0 0 700 400">
              <defs>
                <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.4" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Draw Dependency Connection Lines */}
              {connections.map((line) => {
                const isHighlighted = selectedNode?.id === line.from.id || selectedNode?.id === line.to.id;
                const isHovered = hoveredNode?.id === line.from.id || hoveredNode?.id === line.to.id;
                return (
                  <g key={line.key}>
                    <line
                      x1={line.from.x}
                      y1={line.from.y}
                      x2={line.to.x}
                      y2={line.to.y}
                      stroke={isHighlighted || isHovered ? '#10b981' : '#1e293b'}
                      strokeWidth={isHighlighted || isHovered ? 2.5 : 1.2}
                      strokeDasharray={line.from.type === 'system' ? '0' : '4 3'}
                      className="transition-all duration-300"
                    />
                    {(isHighlighted || isHovered) && (
                      <circle r="4" fill="#10b981">
                        <animateMotion
                          path={`M ${line.from.x} ${line.from.y} L ${line.to.x} ${line.to.y}`}
                          dur="2.5s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* Draw Interactive Nodes */}
              {nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNode?.id === node.id;
                const nodeColor = node.health > 85 ? '#10b981' : node.health > 60 ? '#f59e0b' : '#ef4444';

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer group"
                    onClick={() => setSelectedNode(node)}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Ring selection aura */}
                    {(isSelected || isHovered) && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.size + 10}
                        fill="none"
                        stroke={nodeColor}
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                        className="animate-[spin_20s_linear_infinite]"
                      />
                    )}

                    {/* Outer core node shape */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.size}
                      fill={node.type === 'system' ? 'url(#glowGrad)' : '#07080a'}
                      stroke={nodeColor}
                      strokeWidth={node.type === 'system' ? 3 : 2}
                      className="transition-all duration-300 hover:scale-110"
                    />

                    {/* Dynamic pulse for high issue count node */}
                    {node.issuesCount > 2 && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.size + 6}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1"
                        className="animate-ping opacity-60"
                      />
                    )}

                    {/* Shortened node tag text */}
                    <text
                      x={node.x}
                      y={node.y + (node.size + 15)}
                      textAnchor="middle"
                      fill={isSelected || isHovered ? '#ffffff' : '#94a3b8'}
                      fontSize="10"
                      fontWeight="600"
                      className="pointer-events-none font-mono"
                    >
                      {node.label}
                    </text>

                    {/* Centered initial symbol */}
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fill={node.type === 'system' ? '#000000' : '#ffffff'}
                      fontSize="10"
                      fontWeight="bold"
                      className="pointer-events-none font-sans"
                    >
                      {node.type === 'system' ? 'TWIN' : node.issuesCount}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Instruction tooltip */}
            <div className="absolute bottom-1 right-2 flex items-center space-x-1.5 text-[10px] font-mono text-gray-500">
              <HelpCircle className="h-3 w-3" />
              <span>Click nodes to inspect metadata blueprints</span>
            </div>
          </div>

          {/* Detailed Selected Node Card Overlay */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-gray-950/95 border border-gray-900 rounded-xl p-4.5 space-y-3 z-10 shadow-2xl relative"
              >
                <div className="flex items-center justify-between border-b border-gray-900 pb-2">
                  <div className="flex items-center space-x-2">
                    {selectedNode.type === 'system' ? (
                      <Gauge className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Folder className="h-4 w-4 text-blue-400" />
                    )}
                    <span className="font-bold text-sm font-['Space_Grotesk'] text-white">
                      {selectedNode.label} {selectedNode.type === 'system' ? '(Workspace Core)' : 'Module'}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1 rounded-md bg-gray-900 border border-gray-800 text-gray-400 hover:text-white cursor-pointer text-[10px] px-2 font-mono"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-[#0b0c11] p-2.5 rounded-lg border border-gray-900 text-center">
                    <span className="text-[9px] text-gray-500 uppercase block">Layer Health</span>
                    <span className={`text-sm font-bold font-mono ${
                      selectedNode.health > 85 ? 'text-emerald-400' : selectedNode.health > 60 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {selectedNode.health}%
                    </span>
                  </div>
                  <div className="bg-[#0b0c11] p-2.5 rounded-lg border border-gray-900 text-center">
                    <span className="text-[9px] text-gray-500 uppercase block">Errors Found</span>
                    <span className="text-sm font-bold font-mono text-red-400">
                      {selectedNode.issuesCount} Issues
                    </span>
                  </div>
                  <div className="bg-[#0b0c11] p-2.5 rounded-lg border border-gray-900 text-center">
                    <span className="text-[9px] text-gray-500 uppercase block">Active Flow</span>
                    <span className="text-sm font-bold font-mono text-gray-300">
                      {selectedNode.dependencies.length > 0 ? `${selectedNode.dependencies.length} Lines` : 'Leaf layer'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed font-sans mt-1">
                  <strong className="text-gray-300">Twin Mapping Details:</strong> {selectedNode.details}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
            </>
          )}
        </div>

        {/* AI CTO Authorization Board */}
        <div className="bg-[#0b0c11] border border-gray-900 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-gray-900 pb-3">
              <div>
                <span className="text-[9px] text-gray-500 uppercase font-mono tracking-wider">Decision Layer</span>
                <h3 className="text-base font-bold font-['Space_Grotesk'] text-white">AI CTO Deployment Clearance</h3>
              </div>
              <Shield className="h-5 w-5 text-emerald-400" />
            </div>

            {/* Authorization Stamp Panel */}
            <div className="relative py-4 flex flex-col items-center justify-center bg-gray-950 rounded-xl border border-gray-900">
              
              {/* Radial Glow */}
              <div className={`absolute w-32 h-32 rounded-full filter blur-xl opacity-10 ${
                ctoApproved === false || (ctoApproved === null && ctoDecision.decision === 'NO_GO') ? 'bg-red-500' : 'bg-emerald-500'
              }`} />

              <div className="z-10 text-center space-y-2">
                {/* Visual Stamp */}
                {(ctoApproved !== null ? ctoApproved : ctoDecision.decision !== 'NO_GO') ? (
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-400/80 animate-pulse">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                ) : (
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border-2 border-red-500/80">
                    <ShieldAlert className="h-8 w-8 text-red-500" />
                  </div>
                )}

                <div className="space-y-0.5">
                  <span className="text-[9px] text-gray-500 uppercase font-mono">STATUS DECREE</span>
                  <div className={`text-lg font-black tracking-wider uppercase font-['Space_Grotesk'] ${
                    (ctoApproved !== null ? ctoApproved : ctoDecision.decision !== 'NO_GO') ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {ctoApproved !== null
                      ? (ctoApproved ? 'MANUAL APPROVAL' : 'MANUAL BLOCK')
                      : ctoDecision.decision === 'GO' ? 'GO (CLEARED)' : ctoDecision.decision === 'CONDITIONAL_GO' ? 'CONDITIONAL GO' : 'NO-GO (BLOCKED)'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Core Summary */}
            <div className="space-y-1 text-xs leading-normal">
              <span className="text-[9px] text-gray-500 uppercase font-mono block">Executive Reason</span>
              <p className="text-gray-400">
                {ctoDecision.summary}
              </p>
            </div>

            {/* Quality gate checks */}
            <div className="space-y-2">
              <span className="text-[9px] text-gray-500 uppercase font-mono block">Verification Gates</span>
              <div className="space-y-2">
                {ctoDecision.gates.map((g, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-sans bg-gray-950 p-2 rounded-lg border border-gray-900">
                    <div className="flex items-center space-x-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${g.passed ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <span className="text-gray-300 font-medium">{g.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">{g.passed ? 'PASSED' : 'FAILED'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTO Manual Override Override Actions */}
          <div className="mt-5 border-t border-gray-900 pt-4 space-y-2">
            {!showOverrideInput ? (
              <button
                onClick={() => setShowOverrideInput(true)}
                className="w-full text-center py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-[11px] font-mono font-bold text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                🛠️ Execute CTO Override Action
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Reason for manual override approval/block..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-900 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCtoApproved(true);
                      setShowOverrideInput(false);
                    }}
                    disabled={!overrideReason.trim()}
                    className="flex-1 text-center py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-[10px] font-mono font-bold disabled:opacity-40 cursor-pointer"
                  >
                    Force GO
                  </button>
                  <button
                    onClick={() => {
                      setCtoApproved(false);
                      setShowOverrideInput(false);
                    }}
                    disabled={!overrideReason.trim()}
                    className="flex-1 text-center py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-[10px] font-mono font-bold disabled:opacity-40 cursor-pointer"
                  >
                    Force Block
                  </button>
                  <button
                    onClick={() => {
                      setCtoApproved(null);
                      setOverrideReason('');
                      setShowOverrideInput(false);
                    }}
                    className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-500 hover:text-white text-[10px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Risk Score Breakdown (NEW!) */}
          <div className="mt-5 border-t border-gray-900 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-bold font-mono text-gray-400 uppercase">
                  Risk Analysis
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  riskScore.level === 'LOW' ? 'bg-emerald-500/20 text-emerald-400' :
                  riskScore.level === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                  riskScore.level === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {riskScore.level}
                </div>
                <span className="text-[10px] text-gray-500 font-mono">{riskScore.overall}/100</span>
              </div>
            </div>

            {/* Risk Factors Grid */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(riskScore.factors).map(([key, value]) => {
                const label = key.replace('Risk', '').charAt(0).toUpperCase() + key.replace('Risk', '').slice(1);
                return (
                  <div key={key} className="bg-gray-950 p-2 rounded-lg border border-gray-900">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] text-gray-400">{label}</span>
                      <span className={`text-[10px] font-mono font-bold ${
                        value < 25 ? 'text-emerald-400' :
                        value < 50 ? 'text-yellow-400' :
                        value < 75 ? 'text-orange-400' :
                        'text-red-400'
                      }`}>
                        {value}
                      </span>
                    </div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          value < 25 ? 'bg-emerald-500' :
                          value < 50 ? 'bg-yellow-500' :
                          value < 75 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Primary Concerns */}
            {riskScore.primaryConcerns.length > 0 && (
              <div className="bg-gray-950 p-3 rounded-lg border border-gray-900">
                <span className="text-[9px] text-gray-500 uppercase font-mono block mb-2">
                  Primary Concerns
                </span>
                <div className="space-y-1.5">
                  {riskScore.primaryConcerns.map((concern, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-[11px]">
                      <AlertTriangle className="h-3 w-3 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{concern}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trend Indicator */}
            <div className="flex items-center justify-center space-x-2 text-[10px] py-2">
              {riskScore.trendDirection === 'improving' ? (
                <>
                  <TrendingDown className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Risk Trending Down</span>
                </>
              ) : riskScore.trendDirection === 'degrading' ? (
                <>
                  <TrendingUp className="h-3 w-3 text-red-400" />
                  <span className="text-red-400 font-semibold">Risk Trending Up</span>
                </>
              ) : (
                <span className="text-gray-400">Risk Stable</span>
              )}
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">Confidence: {riskScore.confidenceLevel}%</span>
            </div>
          </div>

          {/* Actionable Tasks (NEW!) */}
          {actionableTasks.length > 0 && (
            <div className="mt-5 border-t border-gray-900 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold font-mono text-gray-400 uppercase">
                    Required Actions ({actionableTasks.length})
                  </span>
                </div>
                <button 
                  onClick={() => {
                    const md = require('../lib/taskGenerator').exportTasksAsMarkdown(actionableTasks);
                    const blob = new Blob([md], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'actionable-tasks.md';
                    a.click();
                  }}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  <span>Export</span>
                </button>
              </div>

              {actionableTasks.slice(0, 3).map((task) => (
                <div 
                  key={task.id}
                  className="bg-gray-950 p-3 rounded-lg border border-gray-900 space-y-2 hover:border-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2 flex-1">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold flex-shrink-0 ${
                        task.priority === 'BLOCKER' ? 'bg-red-500/20 text-red-400' :
                        task.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                        task.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="text-xs font-semibold text-white leading-tight">
                        {task.title}
                      </span>
                    </div>
                    <span className="text-[9px] text-gray-500 font-mono flex-shrink-0 ml-2">
                      {task.estimatedEffort}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 leading-relaxed pl-12">
                    {task.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] pl-12">
                    <span className="text-gray-500">
                      Assign: <span className="text-emerald-400">{task.recommendedAssignee}</span>
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                      task.deadline === 'immediate' ? 'bg-red-500/20 text-red-400' :
                      task.deadline === 'before_release' ? 'bg-orange-500/20 text-orange-400' :
                      task.deadline === 'this_sprint' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {task.deadline.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}

              {actionableTasks.length > 3 && (
                <button className="w-full text-center py-2 text-[11px] font-mono text-gray-500 hover:text-emerald-400 transition-colors">
                  View All {actionableTasks.length} Tasks →
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* 2. Engineering Time Machine (Predictive Simulation Canvas) */}
      <div className="bg-[#0b0c11] border border-gray-900 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-900 pb-4">
          <div className="flex items-center space-x-2.5">
            <Clock className="h-5 w-5 text-emerald-400" />
            <div>
              <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white">Engineering Time Machine</h3>
              <p className="text-xs text-gray-500">Predict future technical debt, code growth, and bug leakage across development timelines.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-gray-950 px-3 py-1.5 rounded-lg border border-gray-900 font-mono text-[10px] text-gray-400">
            <span>Projection Target:</span>
            <span className="text-emerald-400 font-bold uppercase">{timelineMonths === 0 ? 'Current Day' : `Month + ${timelineMonths}`}</span>
          </div>
        </div>

        {/* Dynamic Parameter Sliders Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-400">Timeline Scope</span>
              <span className="text-emerald-400 font-bold">{timelineMonths} Months</span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              step="3"
              value={timelineMonths}
              onChange={(e) => setTimelineMonths(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-gray-950 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-gray-500 block leading-tight">Simulates code accumulation and regression exposure up to 2 years.</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-400">Team Size Growth</span>
              <span className="text-emerald-400 font-bold">+{teamSizeGrowth}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="10"
              value={teamSizeGrowth}
              onChange={(e) => setTeamSizeGrowth(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-gray-950 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-gray-500 block leading-tight">Staff additions scale coordination complexity and multi-agent merge risks.</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-400">Feature Velocity</span>
              <span className="text-emerald-400 font-bold">{velocity} commits/wk</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="10"
              value={velocity}
              onChange={(e) => setVelocity(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-gray-950 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-gray-500 block leading-tight">Speed of pushing features. High speed increases the technical debt curve.</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-400">Refactoring priority</span>
              <span className="text-emerald-400 font-bold">{refactoringPriority}% focus</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={refactoringPriority}
              onChange={(e) => setRefactoringPriority(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-gray-950 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-gray-500 block leading-tight">Allocation for decoupling, test automation, and codebase maintenance.</span>
          </div>

        </div>

        {/* Live Multi-metric Projection Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          
          {/* Chart Wrapper (2/3 span) */}
          <div className="lg:col-span-2 bg-gray-950 p-5 rounded-xl border border-gray-900 min-h-[250px]">
            <span className="text-xs font-bold font-mono text-gray-400 block mb-4">Technical Debt & Maintainability Timeline</span>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity="0.2"/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="maintGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity="0.2"/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#111827" />
                  <XAxis dataKey="month" stroke="#4b5563" fontSize={10} fontStyle="italic" />
                  <YAxis stroke="#4b5563" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#07080a', borderColor: '#1f2937', color: '#fff' }}
                    labelStyle={{ fontWeight: 'bold', color: '#10b981' }}
                  />
                  <Area type="monotone" dataKey="Technical Debt (%)" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#debtGrad)" />
                  <Area type="monotone" dataKey="Maintainability Index" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#maintGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats Panel (1/3 span) */}
          <div className="space-y-3.5 flex flex-col justify-between">
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-900 space-y-1">
              <span className="text-[10px] text-gray-500 uppercase font-mono block">Projected Total Lines of Code</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xl font-bold font-mono text-gray-200">
                  {activeProjection['Code Size (LoC)'].toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">LoC size</span>
              </div>
            </div>

            <div className="bg-gray-950 p-4 rounded-xl border border-gray-900 space-y-1">
              <span className="text-[10px] text-gray-500 uppercase font-mono block">Projected Regression Defect Rate</span>
              <div className="flex items-baseline space-x-1.5">
                <span className={`text-xl font-bold font-mono ${
                  activeProjection['Projected Bug Leakage'] > 6 ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                }`}>
                  {activeProjection['Projected Bug Leakage']} Critical Bugs
                </span>
                <span className="text-[10px] text-gray-500">estimate</span>
              </div>
            </div>

            <div className="bg-gray-950 p-4 rounded-xl border border-gray-900">
              <span className="text-[10px] text-gray-500 uppercase font-mono block mb-2">Time Machine Rationale</span>
              <p className="text-[11px] text-gray-400 leading-normal font-sans">
                {refactoringPriority < 25 ? (
                  <span className="text-red-400/90 font-medium">⚠️ Critical Warning: Poor refactoring priority under high speed will drive tech-debt past 50% in 12 months, triggering critical bug leakage bottlenecks.</span>
                ) : refactoringPriority > 60 ? (
                  <span className="text-emerald-400/95 font-medium">✨ High Refactoring Priority holds technical debt extremely flat, preserving maintainability index near 85% even as lines scale.</span>
                ) : (
                  <span className="text-gray-400">Average refactoring allocation will keep stability levels within stable parameters over the 24-month horizon.</span>
                )}
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
