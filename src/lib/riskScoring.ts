/**
 * Risk Scoring Engine - Calculates comprehensive risk scores for deployment decisions
 * Analyzes multiple factors: security, performance, maintainability, testing, architecture, dependencies
 */

interface AgentsReport {
  overallScore: number;
  isAiDegraded?: boolean;
  architecture: {
    pattern: string;
    grade: string;
    feedback: string;
    modules: string[];
  };
  security: {
    score: number;
    grade: string;
    findings: Array<{
      severity: 'critical' | 'high' | 'medium' | 'low';
      type: string;
      message: string;
    }>;
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
  folderAnalysis: Record<string, any>;
}

interface KnowledgeGraph {
  statistics: {
    totalNodes: number;
    totalEdges: number;
    averageComplexity: number;
    averageHealth: number;
    criticalNodes: any[];
    isolatedNodes: any[];
    circularDependencies: string[][];
  };
}

export interface RiskFactors {
  securityRisk: number;        // 0-100
  performanceRisk: number;     // 0-100
  maintainabilityRisk: number; // 0-100
  testingRisk: number;         // 0-100
  architectureRisk: number;    // 0-100
  dependencyRisk: number;      // 0-100
}

export interface RiskBreakdown {
  security: {
    weight: number;
    score: number;
    issues: string[];
  };
  performance: {
    weight: number;
    score: number;
    issues: string[];
  };
  maintainability: {
    weight: number;
    score: number;
    issues: string[];
  };
  testing: {
    weight: number;
    score: number;
    issues: string[];
  };
  architecture: {
    weight: number;
    score: number;
    issues: string[];
  };
  dependencies: {
    weight: number;
    score: number;
    issues: string[];
  };
}

export interface RiskScore {
  overall: number;              // 0-100
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: RiskFactors;
  breakdown: RiskBreakdown;
  trendDirection: 'improving' | 'stable' | 'degrading';
  confidenceLevel: number;      // 0-100 (based on data completeness)
  recommendation: string;
  primaryConcerns: string[];
}

/**
 * Calculate comprehensive risk score from agents report and knowledge graph
 */
export function calculateRiskScore(
  agentsReport: AgentsReport,
  knowledgeGraph?: KnowledgeGraph
): RiskScore {
  
  console.log('[RiskScoring] Calculating comprehensive risk score...');
  
  // Calculate individual risk factors
  const securityRisk = calculateSecurityRisk(agentsReport);
  const performanceRisk = calculatePerformanceRisk(agentsReport);
  const maintainabilityRisk = calculateMaintainabilityRisk(agentsReport);
  const testingRisk = calculateTestingRisk(agentsReport);
  const architectureRisk = calculateArchitectureRisk(agentsReport);
  const dependencyRisk = calculateDependencyRisk(agentsReport, knowledgeGraph);
  
  // Define weights for each factor (must sum to 1.0)
  const weights = {
    security: 0.25,        // Security is critical
    performance: 0.15,     // Performance affects UX
    maintainability: 0.20, // Maintainability affects long-term
    testing: 0.20,         // Testing provides confidence
    architecture: 0.15,    // Architecture affects scalability
    dependencies: 0.05     // Dependencies are supporting factor
  };
  
  // Calculate weighted overall risk
  const overall = Math.round(
    securityRisk * weights.security +
    performanceRisk * weights.performance +
    maintainabilityRisk * weights.maintainability +
    testingRisk * weights.testing +
    architectureRisk * weights.architecture +
    dependencyRisk * weights.dependencies
  );
  
  // Determine risk level
  let level: RiskScore['level'];
  if (overall >= 75) {
    level = 'CRITICAL';
  } else if (overall >= 50) {
    level = 'HIGH';
  } else if (overall >= 25) {
    level = 'MEDIUM';
  } else {
    level = 'LOW';
  }
  
  // Build detailed breakdown
  const breakdown: RiskBreakdown = {
    security: {
      weight: weights.security,
      score: securityRisk,
      issues: extractSecurityIssues(agentsReport)
    },
    performance: {
      weight: weights.performance,
      score: performanceRisk,
      issues: extractPerformanceIssues(agentsReport)
    },
    maintainability: {
      weight: weights.maintainability,
      score: maintainabilityRisk,
      issues: extractMaintainabilityIssues(agentsReport)
    },
    testing: {
      weight: weights.testing,
      score: testingRisk,
      issues: extractTestingIssues(agentsReport)
    },
    architecture: {
      weight: weights.architecture,
      score: architectureRisk,
      issues: extractArchitectureIssues(agentsReport)
    },
    dependencies: {
      weight: weights.dependencies,
      score: dependencyRisk,
      issues: extractDependencyIssues(knowledgeGraph)
    }
  };
  
  // Calculate confidence level
  const confidenceLevel = calculateConfidence(agentsReport, knowledgeGraph);
  
  // Determine trend (would need historical data in production)
  const trendDirection = determineTrend(agentsReport);
  
  // Generate recommendation
  const recommendation = generateRecommendation(overall, level, breakdown);
  
  // Extract primary concerns (top 3)
  const primaryConcerns = extractPrimaryConcerns(breakdown);
  
  console.log(`[RiskScoring] Overall risk: ${overall}/100 (${level}), Confidence: ${confidenceLevel}%`);
  
  return {
    overall,
    level,
    factors: {
      securityRisk,
      performanceRisk,
      maintainabilityRisk,
      testingRisk,
      architectureRisk,
      dependencyRisk
    },
    breakdown,
    trendDirection,
    confidenceLevel,
    recommendation,
    primaryConcerns
  };
}

/**
 * Calculate security risk based on findings severity
 */
function calculateSecurityRisk(agentsReport: AgentsReport): number {
  const findings = agentsReport.security.findings || [];
  
  let risk = 0;
  findings.forEach(finding => {
    if (finding.severity === 'critical') risk += 25;
    else if (finding.severity === 'high') risk += 15;
    else if (finding.severity === 'medium') risk += 8;
    else if (finding.severity === 'low') risk += 3;
  });
  
  // Also factor in the security score (inverse)
  const scoreRisk = 100 - agentsReport.security.score;
  
  // Average the two approaches
  const combinedRisk = (Math.min(risk, 100) + scoreRisk) / 2;
  
  return Math.round(Math.min(combinedRisk, 100));
}

/**
 * Calculate performance risk
 */
function calculatePerformanceRisk(agentsReport: AgentsReport): number {
  // Inverse of performance score
  const risk = 100 - agentsReport.performance.score;
  return Math.round(risk);
}

/**
 * Calculate maintainability risk
 */
function calculateMaintainabilityRisk(agentsReport: AgentsReport): number {
  // Inverse of maintainability score
  const risk = 100 - agentsReport.maintainability.score;
  return Math.round(risk);
}

/**
 * Calculate testing risk
 */
function calculateTestingRisk(agentsReport: AgentsReport): number {
  // Inverse of testing score
  const risk = 100 - agentsReport.testing.score;
  
  // Amplify if testing score is critically low
  const amplifiedRisk = agentsReport.testing.score < 40 ? risk * 1.2 : risk;
  
  return Math.round(Math.min(amplifiedRisk, 100));
}

/**
 * Calculate architecture risk
 */
function calculateArchitectureRisk(agentsReport: AgentsReport): number {
  // Grade to risk mapping
  const gradeRisk: Record<string, number> = {
    'A': 10,
    'B': 20,
    'C': 40,
    'D': 60,
    'E': 80,
    'F': 95
  };
  
  const grade = agentsReport.architecture.grade;
  const risk = gradeRisk[grade] || 50;
  
  return risk;
}

/**
 * Calculate dependency risk from knowledge graph
 */
function calculateDependencyRisk(
  agentsReport: AgentsReport,
  knowledgeGraph?: KnowledgeGraph
): number {
  if (!knowledgeGraph) {
    // Fallback if no graph data
    return 30; // Assume moderate risk
  }
  
  let risk = 0;
  
  // Circular dependencies are high risk
  if (knowledgeGraph.statistics.circularDependencies.length > 0) {
    risk += knowledgeGraph.statistics.circularDependencies.length * 10;
  }
  
  // Isolated nodes indicate potential dead code
  if (knowledgeGraph.statistics.isolatedNodes.length > 5) {
    risk += 10;
  }
  
  // High average complexity increases dependency risk
  if (knowledgeGraph.statistics.averageComplexity > 20) {
    risk += 15;
  }
  
  // Critical nodes are single points of failure
  if (knowledgeGraph.statistics.criticalNodes.length > 10) {
    risk += 10;
  }
  
  return Math.round(Math.min(risk, 100));
}

/**
 * Extract specific security issues
 */
function extractSecurityIssues(agentsReport: AgentsReport): string[] {
  const issues: string[] = [];
  const findings = agentsReport.security.findings || [];
  
  findings.slice(0, 3).forEach(finding => {
    issues.push(`${finding.severity.toUpperCase()}: ${finding.type} - ${finding.message}`);
  });
  
  if (findings.length > 3) {
    issues.push(`...and ${findings.length - 3} more security findings`);
  }
  
  if (issues.length === 0) {
    issues.push('No major security concerns detected');
  }
  
  return issues;
}

/**
 * Extract performance issues
 */
function extractPerformanceIssues(agentsReport: AgentsReport): string[] {
  const issues: string[] = [];
  
  // Parse feedback for specific issues
  const feedback = agentsReport.performance.feedback || '';
  
  if (feedback.toLowerCase().includes('slow')) {
    issues.push('Performance degradation detected');
  }
  if (feedback.toLowerCase().includes('bottleneck')) {
    issues.push('Performance bottlenecks identified');
  }
  if (feedback.toLowerCase().includes('memory')) {
    issues.push('Memory usage concerns');
  }
  
  if (agentsReport.performance.score < 60) {
    issues.push(`Low performance score: ${agentsReport.performance.score}/100`);
  }
  
  if (issues.length === 0) {
    issues.push('Performance within acceptable range');
  }
  
  return issues;
}

/**
 * Extract maintainability issues
 */
function extractMaintainabilityIssues(agentsReport: AgentsReport): string[] {
  const issues: string[] = [];
  
  if (agentsReport.maintainability.score < 50) {
    issues.push('Code maintainability below threshold');
  }
  if (agentsReport.maintainability.score < 70) {
    issues.push('Technical debt accumulation detected');
  }
  
  if (issues.length === 0) {
    issues.push('Maintainability is satisfactory');
  }
  
  return issues;
}

/**
 * Extract testing issues
 */
function extractTestingIssues(agentsReport: AgentsReport): string[] {
  const issues: string[] = [];
  
  if (agentsReport.testing.score < 40) {
    issues.push('Critical: Insufficient test coverage');
  } else if (agentsReport.testing.score < 60) {
    issues.push('Test coverage below recommended threshold');
  }
  
  const feedback = agentsReport.testing.feedback || '';
  if (feedback.toLowerCase().includes('missing')) {
    issues.push('Missing tests for critical paths');
  }
  
  if (issues.length === 0) {
    issues.push('Testing coverage is adequate');
  }
  
  return issues;
}

/**
 * Extract architecture issues
 */
function extractArchitectureIssues(agentsReport: AgentsReport): string[] {
  const issues: string[] = [];
  
  const grade = agentsReport.architecture.grade;
  if (['D', 'E', 'F'].includes(grade)) {
    issues.push(`Poor architecture grade: ${grade}`);
  }
  
  const feedback = agentsReport.architecture.feedback || '';
  if (feedback.toLowerCase().includes('coupling')) {
    issues.push('High coupling detected');
  }
  if (feedback.toLowerCase().includes('cohesion')) {
    issues.push('Low cohesion concerns');
  }
  
  if (issues.length === 0) {
    issues.push('Architecture follows best practices');
  }
  
  return issues;
}

/**
 * Extract dependency issues
 */
function extractDependencyIssues(knowledgeGraph?: KnowledgeGraph): string[] {
  if (!knowledgeGraph) {
    return ['Dependency analysis not available'];
  }
  
  const issues: string[] = [];
  
  if (knowledgeGraph.statistics.circularDependencies.length > 0) {
    issues.push(`${knowledgeGraph.statistics.circularDependencies.length} circular dependencies detected`);
  }
  
  if (knowledgeGraph.statistics.isolatedNodes.length > 5) {
    issues.push(`${knowledgeGraph.statistics.isolatedNodes.length} isolated files (potential dead code)`);
  }
  
  if (issues.length === 0) {
    issues.push('Dependency structure is healthy');
  }
  
  return issues;
}

/**
 * Calculate confidence level based on data completeness
 */
function calculateConfidence(
  agentsReport: AgentsReport,
  knowledgeGraph?: KnowledgeGraph
): number {
  let confidence = 100;
  
  // Reduce confidence if AI is degraded
  if (agentsReport.isAiDegraded) {
    confidence -= 20;
  }
  
  // Reduce confidence if no knowledge graph
  if (!knowledgeGraph) {
    confidence -= 15;
  }
  
  // Reduce confidence if reports are empty
  if (!agentsReport.security.findings || agentsReport.security.findings.length === 0) {
    confidence -= 10;
  }
  
  return Math.max(confidence, 50); // Minimum 50% confidence
}

/**
 * Determine trend direction (placeholder - would need historical data)
 */
function determineTrend(agentsReport: AgentsReport): 'improving' | 'stable' | 'degrading' {
  // In production, this would compare with previous analyses
  // For now, use risk level as proxy
  if (agentsReport.risk.level === 'LOW') {
    return 'improving';
  } else if (agentsReport.risk.level === 'CRITICAL' || agentsReport.risk.level === 'HIGH') {
    return 'degrading';
  }
  return 'stable';
}

/**
 * Generate overall recommendation
 */
function generateRecommendation(
  overall: number,
  level: string,
  breakdown: RiskBreakdown
): string {
  if (level === 'CRITICAL') {
    return 'DEPLOYMENT BLOCKED: Critical risks must be addressed before release. Immediate action required on security and stability concerns.';
  } else if (level === 'HIGH') {
    return 'DEPLOYMENT CAUTION: Significant risks present. Recommend addressing high-priority issues before production release.';
  } else if (level === 'MEDIUM') {
    return 'DEPLOYMENT CONDITIONAL: Moderate risks acceptable for staging/beta. Monitor closely and plan fixes for production.';
  } else {
    return 'DEPLOYMENT APPROVED: Low risk profile. Standard release procedures apply. Continue monitoring post-deployment.';
  }
}

/**
 * Extract primary concerns (top 3 highest risks)
 */
function extractPrimaryConcerns(breakdown: RiskBreakdown): string[] {
  const concerns: Array<{ category: string; score: number; issue: string }> = [];
  
  Object.entries(breakdown).forEach(([category, data]) => {
    if (data.score > 40 && data.issues.length > 0) {
      concerns.push({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        score: data.score,
        issue: data.issues[0]
      });
    }
  });
  
  // Sort by score descending
  concerns.sort((a, b) => b.score - a.score);
  
  // Return top 3
  return concerns.slice(0, 3).map(c => `${c.category}: ${c.issue}`);
}
