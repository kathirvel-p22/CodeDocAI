/**
 * What-If Simulator Component
 * Interactive UI for simulating architecture changes
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Database,
  Layers,
  Network,
  Trash2,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  Code,
  Package,
  Sparkles,
  Play,
  ChevronRight,
  Info,
  FileText,
  Users,
  DollarSign
} from 'lucide-react';
import type { KnowledgeGraph } from '../types/knowledgeGraph';
import {
  simulateScenario,
  PREDEFINED_SCENARIOS,
  generateScenarioId,
  type SimulationScenario,
  type SimulationResult,
  type ScenarioType
} from '../lib/simulator';

interface WhatIfSimulatorProps {
  knowledgeGraph: KnowledgeGraph | null;
  projectName: string;
}

export default function WhatIfSimulator({ knowledgeGraph, projectName }: WhatIfSimulatorProps) {
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'scenarios' | 'results'>('scenarios');

  // Scenario categories
  const scenarioCategories = useMemo(() => {
    const categories: Record<string, typeof PREDEFINED_SCENARIOS> = {
      'Database': [],
      'Architecture': [],
      'Microservices': [],
      'Performance': [],
      'Other': []
    };

    PREDEFINED_SCENARIOS.forEach(scenario => {
      if (scenario.type === 'database-migration') {
        categories['Database'].push(scenario);
      } else if (scenario.type === 'architecture-refactor') {
        categories['Architecture'].push(scenario);
      } else if (scenario.type === 'microservices-split') {
        categories['Microservices'].push(scenario);
      } else if (scenario.type === 'add-caching' || scenario.type === 'add-layer') {
        categories['Performance'].push(scenario);
      } else {
        categories['Other'].push(scenario);
      }
    });

    return categories;
  }, []);

  const runSimulation = async () => {
    if (!selectedScenario || !knowledgeGraph) return;

    setIsSimulating(true);
    setActiveTab('results');

    // Simulate with small delay for UX
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const result = simulateScenario(selectedScenario, knowledgeGraph);
      setSimulationResult(result);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const selectScenario = (scenario: typeof PREDEFINED_SCENARIOS[0]) => {
    setSelectedScenario({
      ...scenario,
      id: generateScenarioId()
    });
    setSimulationResult(null);
  };

  const getScenarioIcon = (type: ScenarioType) => {
    switch (type) {
      case 'database-migration': return Database;
      case 'architecture-refactor': return Layers;
      case 'microservices-split': return Network;
      case 'add-caching': return Zap;
      case 'remove-module': return Trash2;
      case 'technology-swap': return RefreshCw;
      default: return Code;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Proceed': return 'emerald';
      case 'Proceed with Caution': return 'amber';
      case 'Not Recommended': return 'red';
      default: return 'gray';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'emerald';
      case 'Medium': return 'amber';
      case 'High': return 'orange';
      case 'Critical': return 'red';
      default: return 'gray';
    }
  };

  if (!knowledgeGraph) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center">
            <Network className="h-8 w-8 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Knowledge Graph Required</h3>
            <p className="text-sm text-gray-500 max-w-md">
              The What-If Simulator needs a knowledge graph to analyze your architecture.
              Please upload a project first to build the digital twin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-900 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="bg-purple-500/10 text-purple-400 p-2 rounded-xl border border-purple-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold font-['Space_Grotesk'] tracking-tight">What-If Simulator</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1.5">
            Simulate architecture changes and see their impact before implementation
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-gray-900 border border-gray-800 p-1.5 rounded-xl text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 font-bold">
            {knowledgeGraph.statistics.totalNodes} Components Analyzed
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 bg-gray-950 p-1 rounded-xl border border-gray-900 w-fit">
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'scenarios'
              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Select Scenario
        </button>
        <button
          onClick={() => setActiveTab('results')}
          disabled={!simulationResult && !isSimulating}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'results'
              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              : 'text-gray-500 hover:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          Simulation Results
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'scenarios' && (
          <motion.div
            key="scenarios"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Scenario Categories */}
            {Object.entries(scenarioCategories).map(([category, scenarios]) => (
              scenarios.length > 0 && (
                <div key={category} className="space-y-3">
                  <h3 className="text-xs font-bold font-mono uppercase text-gray-400 tracking-wider">
                    {category} Scenarios
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scenarios.map((scenario, idx) => {
                      const Icon = getScenarioIcon(scenario.type);
                      const isSelected = selectedScenario?.name === scenario.name;

                      return (
                        <motion.button
                          key={idx}
                          onClick={() => selectScenario(scenario)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`text-left p-4 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-purple-500/10 border-purple-500/30 shadow-lg shadow-purple-500/10'
                              : 'bg-[#0b0c11] border-gray-900 hover:border-gray-800'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg shrink-0 ${
                              isSelected ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-900 text-gray-400'
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-white mb-1 line-clamp-1">
                                {scenario.name}
                              </h4>
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {scenario.description}
                              </p>
                              {isSelected && (
                                <div className="mt-2 flex items-center text-xs text-purple-400">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Selected
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )
            ))}

            {/* Selected Scenario Details */}
            {selectedScenario && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20 rounded-2xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {selectedScenario.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {selectedScenario.description}
                    </p>
                  </div>
                  <button
                    onClick={runSimulation}
                    disabled={isSimulating}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 text-white rounded-xl font-medium transition-all disabled:cursor-not-allowed"
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Simulating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        <span>Run Simulation</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Scenario Changes Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedScenario.changes.from && (
                    <div className="bg-[#0b0c11] border border-gray-900 rounded-xl p-3">
                      <div className="text-xs text-gray-500 mb-1">From</div>
                      <div className="text-sm font-medium text-white">{selectedScenario.changes.from}</div>
                    </div>
                  )}
                  {selectedScenario.changes.to && (
                    <div className="bg-[#0b0c11] border border-gray-900 rounded-xl p-3">
                      <div className="text-xs text-gray-500 mb-1">To</div>
                      <div className="text-sm font-medium text-emerald-400">{selectedScenario.changes.to}</div>
                    </div>
                  )}
                  <div className="bg-[#0b0c11] border border-gray-900 rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1">Affected Layers</div>
                    <div className="text-sm font-medium text-white">
                      {selectedScenario.changes.affected.join(', ')}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {isSimulating ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
                    <RefreshCw className="h-8 w-8 text-purple-400 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Simulating Changes...</h3>
                    <p className="text-sm text-gray-500">
                      Analyzing impact, calculating effort, and predicting outcomes
                    </p>
                  </div>
                </div>
              </div>
            ) : simulationResult ? (
              <SimulationResults result={simulationResult} />
            ) : (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">No Simulation Yet</h3>
                    <p className="text-sm text-gray-500">
                      Select a scenario and run a simulation to see results
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Simulation Results Display Component
 */
function SimulationResults({ result }: { result: SimulationResult }) {
  const recommendationColor = getRecommendationColor(result.costBenefit.recommendation);
  const riskColor = getRiskColor(result.effort.risk);

  return (
    <div className="space-y-6">
      {/* Overall Recommendation */}
      <div className={`bg-gradient-to-br from-${recommendationColor}-500/10 to-${recommendationColor}-500/5 border border-${recommendationColor}-500/20 rounded-2xl p-6`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              {result.costBenefit.recommendation === 'Proceed' && (
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              )}
              {result.costBenefit.recommendation === 'Proceed with Caution' && (
                <AlertTriangle className="h-6 w-6 text-amber-400" />
              )}
              {result.costBenefit.recommendation === 'Not Recommended' && (
                <XCircle className="h-6 w-6 text-red-400" />
              )}
              <h3 className={`text-xl font-bold text-${recommendationColor}-400`}>
                {result.costBenefit.recommendation}
              </h3>
            </div>
            <p className="text-sm text-gray-300">
              {result.costBenefit.reasoning}
            </p>
          </div>
          
          <div className={`px-3 py-1.5 bg-${riskColor}-500/10 border border-${riskColor}-500/20 rounded-lg`}>
            <div className="text-xs text-gray-500">Risk Level</div>
            <div className={`text-sm font-bold text-${riskColor}-400`}>{result.effort.risk}</div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={FileText}
          label="Files Affected"
          value={result.impact.filesAffected}
          color="blue"
        />
        <MetricCard
          icon={Clock}
          label="Total Effort"
          value={`${result.effort.total}h`}
          subtitle={`~${Math.ceil(result.effort.total / 8)} days`}
          color="purple"
        />
        <MetricCard
          icon={Activity}
          label="Performance"
          value={result.performance.score > 0 ? `+${result.performance.score}%` : `${result.performance.score}%`}
          color={result.performance.score > 0 ? 'emerald' : result.performance.score < 0 ? 'red' : 'gray'}
          icon2={result.performance.score > 0 ? TrendingUp : result.performance.score < 0 ? TrendingDown : Activity}
        />
        <MetricCard
          icon={Shield}
          label="Security"
          value={result.security.score > 0 ? `+${result.security.score}%` : `${result.security.score}%`}
          color={result.security.score > 0 ? 'emerald' : result.security.score < 0 ? 'amber' : 'gray'}
        />
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Impact Analysis */}
        <DetailCard title="Impact Analysis" icon={Activity}>
          <div className="space-y-3">
            <DetailItem label="Files Modified" value={result.impact.filesModified.length} />
            <DetailItem label="Files Created" value={result.impact.filesCreated.length} />
            <DetailItem label="Files Deleted" value={result.impact.filesDeleted.length} />
            <DetailItem label="Dependencies Changed" value={result.impact.dependenciesChanged} />
            <DetailItem label="Testing Required" value={`${result.impact.testingRequired} test files`} />
            <DetailItem label="Deployment Complexity" value={`${result.impact.deploymentComplexity}/10`} />
          </div>
        </DetailCard>

        {/* Effort Breakdown */}
        <DetailCard title="Effort Breakdown" icon={Users}>
          <div className="space-y-3">
            <DetailItem label="Planning" value={`${result.effort.planning}h`} />
            <DetailItem label="Implementation" value={`${result.effort.implementation}h`} />
            <DetailItem label="Testing" value={`${result.effort.testing}h`} />
            <DetailItem label="Deployment" value={`${result.effort.deployment}h`} />
            <div className="pt-2 border-t border-gray-900">
              <DetailItem label="Total" value={`${result.effort.total}h`} highlight />
            </div>
          </div>
        </DetailCard>
      </div>

      {/* Pros and Cons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
          <h4 className="text-sm font-bold text-emerald-400 mb-3 flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Benefits
          </h4>
          <ul className="space-y-2">
            {result.costBenefit.pros.map((pro, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start">
                <span className="text-emerald-400 mr-2">•</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
          <h4 className="text-sm font-bold text-red-400 mb-3 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Concerns
          </h4>
          <ul className="space-y-2">
            {result.costBenefit.cons.map((con, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start">
                <span className="text-red-400 mr-2">•</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Timeline */}
      <DetailCard title="Implementation Timeline" icon={Clock}>
        <div className="space-y-3">
          {result.timeline.map((phase, idx) => (
            <div key={idx} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center text-xs font-bold text-purple-400">
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-sm font-medium text-white">{phase.phase}</h5>
                  <span className="text-xs text-gray-500">{phase.duration}h</span>
                </div>
                <p className="text-xs text-gray-500">{phase.description}</p>
              </div>
            </div>
          ))}
        </div>
      </DetailCard>

      {/* Alternative Approaches */}
      {result.alternativeApproaches.length > 0 && (
        <DetailCard title="Alternative Approaches" icon={ChevronRight}>
          <ul className="space-y-2">
            {result.alternativeApproaches.map((alt, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start">
                <ChevronRight className="h-4 w-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>{alt}</span>
              </li>
            ))}
          </ul>
        </DetailCard>
      )}
    </div>
  );
}

// Helper Components
function MetricCard({ icon: Icon, label, value, subtitle, color, icon2 }: any) {
  const Icon2 = icon2 || Icon;
  return (
    <div className="bg-[#0b0c11] border border-gray-900 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`h-4 w-4 text-${color}-400`} />
        <Icon2 className={`h-3 w-3 text-${color}-400`} />
      </div>
      <div className={`text-2xl font-bold text-${color}-400 mb-1`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
      {subtitle && <div className="text-xs text-gray-600 mt-1">{subtitle}</div>}
    </div>
  );
}

function DetailCard({ title, icon: Icon, children }: any) {
  return (
    <div className="bg-[#0b0c11] border border-gray-900 rounded-xl p-5">
      <h4 className="text-sm font-bold text-white mb-4 flex items-center">
        <Icon className="h-4 w-4 mr-2 text-gray-400" />
        {title}
      </h4>
      {children}
    </div>
  );
}

function DetailItem({ label, value, highlight }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${highlight ? 'font-bold text-white' : 'text-gray-400'}`}>{label}</span>
      <span className={`text-sm ${highlight ? 'font-bold text-purple-400' : 'font-medium text-gray-300'}`}>{value}</span>
    </div>
  );
}

function getRecommendationColor(recommendation: string) {
  switch (recommendation) {
    case 'Proceed': return 'emerald';
    case 'Proceed with Caution': return 'amber';
    case 'Not Recommended': return 'red';
    default: return 'gray';
  }
}

function getRiskColor(risk: string) {
  switch (risk) {
    case 'Low': return 'emerald';
    case 'Medium': return 'amber';
    case 'High': return 'orange';
    case 'Critical': return 'red';
    default: return 'gray';
  }
}
