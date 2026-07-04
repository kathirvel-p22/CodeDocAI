/**
 * Actionable Task Generator - Converts analysis results into specific, actionable engineering tasks
 * Prioritizes by impact, estimates effort, and assigns to appropriate teams
 */

import { RiskScore, RiskBreakdown } from './riskScoring';

interface AgentsReport {
  overallScore: number;
  architecture: { grade: string; feedback: string };
  security: {
    score: number;
    findings: Array<{
      severity: 'critical' | 'high' | 'medium' | 'low';
      type: string;
      message: string;
      file?: string;
    }>;
  };
  performance: { score: number; feedback: string };
  maintainability: { score: number; feedback: string };
  testing: { score: number; feedback: string };
  folderAnalysis: Record<string, { issues: any[] }>;
}

interface KnowledgeGraph {
  statistics: {
    criticalNodes: Array<{ id: string; label: string; health: number }>;
    circularDependencies: string[][];
  };
}

export interface ActionableTask {
  id: string;
  priority: 'BLOCKER' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'security' | 'performance' | 'maintainability' | 'testing' | 'architecture' | 'dependencies';
  title: string;
  description: string;
  reasoning: string;
  estimatedEffort: string;
  recommendedAssignee: string;
  successCriteria: string[];
  resources: string[];
  relatedFiles: string[];
  deadline: 'immediate' | 'before_release' | 'this_sprint' | 'backlog';
  impact: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Generate actionable tasks from analysis results
 */
export function generateActionableTasks(
  agentsReport: AgentsReport,
  riskScore: RiskScore,
  knowledgeGraph?: KnowledgeGraph
): ActionableTask[] {
  
  console.log('[TaskGenerator] Generating actionable tasks...');
  
  const tasks: ActionableTask[] = [];
  
  // Generate security tasks
  tasks.push(...generateSecurityTasks(agentsReport, riskScore));
  
  // Generate performance tasks
  tasks.push(...generatePerformanceTasks(agentsReport, riskScore));
  
  // Generate maintainability tasks
  tasks.push(...generateMaintainabilityTasks(agentsReport, riskScore));
  
  // Generate testing tasks
  tasks.push(...generateTestingTasks(agentsReport, riskScore));
  
  // Generate architecture tasks
  tasks.push(...generateArchitectureTasks(agentsReport, riskScore));
  
  // Generate dependency tasks
  if (knowledgeGraph) {
    tasks.push(...generateDependencyTasks(knowledgeGraph, riskScore));
  }
  
  // Sort by priority (BLOCKER > HIGH > MEDIUM > LOW)
  const priorityOrder = { BLOCKER: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  console.log(`[TaskGenerator] Generated ${tasks.length} actionable tasks`);
  
  return tasks;
}

/**
 * Generate security-related tasks
 */
function generateSecurityTasks(agentsReport: AgentsReport, riskScore: RiskScore): ActionableTask[] {
  const tasks: ActionableTask[] = [];
  const findings = agentsReport.security.findings || [];
  
  // Critical security findings = BLOCKER tasks
  const criticalFindings = findings.filter(f => f.severity === 'critical');
  criticalFindings.forEach((finding, idx) => {
    tasks.push({
      id: `sec-critical-${idx}`,
      priority: 'BLOCKER',
      category: 'security',
      title: `Fix Critical Security Issue: ${finding.type}`,
      description: finding.message,
      reasoning: 'Critical security vulnerabilities pose immediate risk to system integrity and user data. Must be resolved before deployment.',
      estimatedEffort: estimateSecurityEffort(finding.type),
      recommendedAssignee: 'Security Team',
      successCriteria: [
        'Vulnerability is completely eliminated',
        'Security scan shows no critical issues',
        'Code review confirms fix is comprehensive'
      ],
      resources: [
        'OWASP Top 10: https://owasp.org/www-project-top-ten/',
        'Security Best Practices Documentation'
      ],
      relatedFiles: finding.file ? [finding.file] : [],
      deadline: 'immediate',
      impact: 'critical'
    });
  });
  
  // High security findings = HIGH priority tasks
  const highFindings = findings.filter(f => f.severity === 'high');
  if (highFindings.length > 0 && tasks.length < 5) {
    const finding = highFindings[0];
    tasks.push({
      id: `sec-high-0`,
      priority: 'HIGH',
      category: 'security',
      title: `Address High-Priority Security: ${finding.type}`,
      description: finding.message,
      reasoning: 'High-severity security issues should be addressed before release to minimize attack surface.',
      estimatedEffort: estimateSecurityEffort(finding.type),
      recommendedAssignee: 'Security Team',
      successCriteria: [
        'Security issue is resolved',
        'No regression in security posture'
      ],
      resources: ['Security Guidelines'],
      relatedFiles: finding.file ? [finding.file] : [],
      deadline: 'before_release',
      impact: 'high'
    });
  }
  
  // If overall security score is low, add general task
  if (agentsReport.security.score < 60 && tasks.length === 0) {
    tasks.push({
      id: 'sec-general',
      priority: 'HIGH',
      category: 'security',
      title: 'Improve Overall Security Posture',
      description: `Security score is ${agentsReport.security.score}/100, below acceptable threshold.`,
      reasoning: 'Low security scores indicate systemic vulnerabilities that need comprehensive review.',
      estimatedEffort: '3-5 days',
      recommendedAssignee: 'Security Team',
      successCriteria: [
        'Security score above 70',
        'All medium/low issues triaged',
        'Security best practices implemented'
      ],
      resources: ['Security Audit Checklist'],
      relatedFiles: [],
      deadline: 'this_sprint',
      impact: 'high'
    });
  }
  
  return tasks;
}

/**
 * Generate performance-related tasks
 */
function generatePerformanceTasks(agentsReport: AgentsReport, riskScore: RiskScore): ActionableTask[] {
  const tasks: ActionableTask[] = [];
  
  if (riskScore.factors.performanceRisk > 60) {
    tasks.push({
      id: 'perf-optimize',
      priority: 'HIGH',
      category: 'performance',
      title: 'Optimize Critical Performance Bottlenecks',
      description: `Performance score is ${agentsReport.performance.score}/100. Key areas: ${agentsReport.performance.feedback.slice(0, 100)}`,
      reasoning: 'Performance issues directly impact user experience and can lead to customer churn.',
      estimatedEffort: '2-4 days',
      recommendedAssignee: 'Backend Team',
      successCriteria: [
        'Performance score above 70',
        'Response times under 200ms for critical paths',
        'Load testing passes at 2x expected traffic'
      ],
      resources: [
        'Performance Profiling Guide',
        'Database Query Optimization',
        'Caching Strategy Documentation'
      ],
      relatedFiles: [],
      deadline: 'this_sprint',
      impact: 'high'
    });
  } else if (riskScore.factors.performanceRisk > 40) {
    tasks.push({
      id: 'perf-monitor',
      priority: 'MEDIUM',
      category: 'performance',
      title: 'Add Performance Monitoring',
      description: 'Implement APM and performance tracking to identify bottlenecks proactively.',
      reasoning: 'Performance monitoring enables early detection of degradation before it impacts users.',
      estimatedEffort: '1-2 days',
      recommendedAssignee: 'DevOps Team',
      successCriteria: [
        'APM tool integrated',
        'Key metrics dashboards created',
        'Alert thresholds configured'
      ],
      resources: ['APM Best Practices'],
      relatedFiles: [],
      deadline: 'this_sprint',
      impact: 'medium'
    });
  }
  
  return tasks;
}

/**
 * Generate maintainability-related tasks
 */
function generateMaintainabilityTasks(agentsReport: AgentsReport, riskScore: RiskScore): ActionableTask[] {
  const tasks: ActionableTask[] = [];
  
  if (riskScore.factors.maintainabilityRisk > 50) {
    tasks.push({
      id: 'maint-refactor',
      priority: 'MEDIUM',
      category: 'maintainability',
      title: 'Refactor High-Complexity Modules',
      description: `Maintainability score is ${agentsReport.maintainability.score}/100. Technical debt is accumulating.`,
      reasoning: 'High complexity and low maintainability increase cost of changes and risk of bugs.',
      estimatedEffort: '1 week',
      recommendedAssignee: 'Engineering Team',
      successCriteria: [
        'Complexity metrics reduced by 20%',
        'Code duplication eliminated',
        'Documentation updated'
      ],
      resources: [
        'Refactoring Patterns',
        'Clean Code Guidelines'
      ],
      relatedFiles: [],
      deadline: 'this_sprint',
      impact: 'medium'
    });
  }
  
  if (agentsReport.maintainability.score < 50) {
    tasks.push({
      id: 'maint-doc',
      priority: 'LOW',
      category: 'maintainability',
      title: 'Improve Code Documentation',
      description: 'Add comprehensive documentation to improve code understanding and onboarding.',
      reasoning: 'Documentation reduces knowledge silos and speeds up development.',
      estimatedEffort: '3-5 days',
      recommendedAssignee: 'Engineering Team',
      successCriteria: [
        'All public APIs documented',
        'README files updated',
        'Architecture diagrams created'
      ],
      resources: ['Documentation Standards'],
      relatedFiles: [],
      deadline: 'backlog',
      impact: 'low'
    });
  }
  
  return tasks;
}

/**
 * Generate testing-related tasks
 */
function generateTestingTasks(agentsReport: AgentsReport, riskScore: RiskScore): ActionableTask[] {
  const tasks: ActionableTask[] = [];
  
  if (riskScore.factors.testingRisk > 60) {
    tasks.push({
      id: 'test-coverage',
      priority: 'HIGH',
      category: 'testing',
      title: 'Increase Test Coverage for Critical Paths',
      description: `Testing score is ${agentsReport.testing.score}/100. Critical functionality lacks adequate tests.`,
      reasoning: 'Insufficient test coverage increases deployment risk and makes refactoring dangerous.',
      estimatedEffort: '1 week',
      recommendedAssignee: 'QA Team',
      successCriteria: [
        'Test coverage above 70%',
        'All critical paths have integration tests',
        'CI/CD pipeline runs all tests'
      ],
      resources: [
        'Testing Best Practices',
        'Test Framework Documentation'
      ],
      relatedFiles: [],
      deadline: 'before_release',
      impact: 'high'
    });
  } else if (riskScore.factors.testingRisk > 40) {
    tasks.push({
      id: 'test-e2e',
      priority: 'MEDIUM',
      category: 'testing',
      title: 'Add End-to-End Tests',
      description: 'Implement E2E tests for critical user workflows to catch integration issues.',
      reasoning: 'E2E tests validate complete user scenarios and prevent regressions.',
      estimatedEffort: '3-5 days',
      recommendedAssignee: 'QA Team',
      successCriteria: [
        'E2E tests for top 5 user flows',
        'Tests run in CI/CD pipeline',
        'Test reports integrated into dashboard'
      ],
      resources: ['E2E Testing Guide'],
      relatedFiles: [],
      deadline: 'this_sprint',
      impact: 'medium'
    });
  }
  
  return tasks;
}

/**
 * Generate architecture-related tasks
 */
function generateArchitectureTasks(agentsReport: AgentsReport, riskScore: RiskScore): ActionableTask[] {
  const tasks: ActionableTask[] = [];
  
  const grade = agentsReport.architecture.grade;
  if (['D', 'E', 'F'].includes(grade)) {
    tasks.push({
      id: 'arch-improve',
      priority: 'HIGH',
      category: 'architecture',
      title: `Improve Architecture Grade (Currently: ${grade})`,
      description: `Architecture grade ${grade} indicates poor separation of concerns and high coupling.`,
      reasoning: 'Poor architecture makes the system fragile and difficult to scale or modify.',
      estimatedEffort: '2-3 weeks',
      recommendedAssignee: 'Architecture Team',
      successCriteria: [
        'Architecture grade improved to C or better',
        'Coupling metrics reduced',
        'Layering violations eliminated'
      ],
      resources: [
        'Clean Architecture Patterns',
        'Domain-Driven Design Guide'
      ],
      relatedFiles: [],
      deadline: 'this_sprint',
      impact: 'high'
    });
  }
  
  return tasks;
}

/**
 * Generate dependency-related tasks
 */
function generateDependencyTasks(knowledgeGraph: KnowledgeGraph, riskScore: RiskScore): ActionableTask[] {
  const tasks: ActionableTask[] = [];
  
  if (knowledgeGraph.statistics.circularDependencies.length > 0) {
    tasks.push({
      id: 'dep-circular',
      priority: 'MEDIUM',
      category: 'dependencies',
      title: 'Resolve Circular Dependencies',
      description: `Found ${knowledgeGraph.statistics.circularDependencies.length} circular dependency chains.`,
      reasoning: 'Circular dependencies make code harder to test, understand, and maintain.',
      estimatedEffort: '2-4 days',
      recommendedAssignee: 'Engineering Team',
      successCriteria: [
        'All circular dependencies eliminated',
        'Dependency graph is acyclic',
        'Architecture rules enforced'
      ],
      resources: [
        'Dependency Inversion Principle',
        'Breaking Circular Dependencies Guide'
      ],
      relatedFiles: [],
      deadline: 'this_sprint',
      impact: 'medium'
    });
  }
  
  if (knowledgeGraph.statistics.criticalNodes.length > 5) {
    tasks.push({
      id: 'dep-critical',
      priority: 'LOW',
      category: 'dependencies',
      title: 'Reduce Critical Node Dependencies',
      description: `${knowledgeGraph.statistics.criticalNodes.length} nodes are critical bottlenecks.`,
      reasoning: 'High-dependency nodes are single points of failure and testing bottlenecks.',
      estimatedEffort: '1 week',
      recommendedAssignee: 'Engineering Team',
      successCriteria: [
        'Critical nodes reduced by 50%',
        'Dependencies redistributed',
        'Interface segregation applied'
      ],
      resources: ['Dependency Management Best Practices'],
      relatedFiles: knowledgeGraph.statistics.criticalNodes.slice(0, 3).map(n => n.label),
      deadline: 'backlog',
      impact: 'low'
    });
  }
  
  return tasks;
}

/**
 * Estimate effort for security fixes based on vulnerability type
 */
function estimateSecurityEffort(vulnType: string): string {
  const type = vulnType.toLowerCase();
  
  if (type.includes('sql injection') || type.includes('xss')) {
    return '4-8 hours';
  } else if (type.includes('authentication') || type.includes('authorization')) {
    return '1-2 days';
  } else if (type.includes('encryption') || type.includes('crypto')) {
    return '2-3 days';
  } else {
    return '4-6 hours';
  }
}

/**
 * Export tasks to various formats
 */
export function exportTasksAsJSON(tasks: ActionableTask[]): string {
  return JSON.stringify(tasks, null, 2);
}

export function exportTasksAsMarkdown(tasks: ActionableTask[]): string {
  const lines: string[] = [];
  
  lines.push('# Actionable Engineering Tasks\n');
  lines.push(`Generated: ${new Date().toLocaleString()}\n`);
  lines.push(`Total Tasks: ${tasks.length}\n`);
  
  const byPriority = {
    BLOCKER: tasks.filter(t => t.priority === 'BLOCKER'),
    HIGH: tasks.filter(t => t.priority === 'HIGH'),
    MEDIUM: tasks.filter(t => t.priority === 'MEDIUM'),
    LOW: tasks.filter(t => t.priority === 'LOW')
  };
  
  Object.entries(byPriority).forEach(([priority, priorityTasks]) => {
    if (priorityTasks.length === 0) return;
    
    lines.push(`\n## ${priority} Priority (${priorityTasks.length} tasks)\n`);
    
    priorityTasks.forEach((task, idx) => {
      lines.push(`\n### ${idx + 1}. ${task.title}`);
      lines.push(`**Category:** ${task.category}`);
      lines.push(`**Assignee:** ${task.recommendedAssignee}`);
      lines.push(`**Effort:** ${task.estimatedEffort}`);
      lines.push(`**Deadline:** ${task.deadline}\n`);
      lines.push(`**Description:**`);
      lines.push(task.description + '\n');
      lines.push(`**Success Criteria:**`);
      task.successCriteria.forEach(criteria => {
        lines.push(`- ${criteria}`);
      });
      lines.push('');
    });
  });
  
  return lines.join('\n');
}

export function exportTasksAsCSV(tasks: ActionableTask[]): string {
  const headers = ['Priority', 'Category', 'Title', 'Description', 'Effort', 'Assignee', 'Deadline'];
  const rows = tasks.map(t => [
    t.priority,
    t.category,
    `"${t.title}"`,
    `"${t.description}"`,
    t.estimatedEffort,
    t.recommendedAssignee,
    t.deadline
  ]);
  
  return [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');
}
