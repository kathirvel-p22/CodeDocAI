/**
 * What-If Simulator Engine
 * Simulates architecture changes and calculates their impact
 */

import type { KnowledgeGraph, GraphNode, GraphEdge } from '../types/knowledgeGraph';

export type ScenarioType = 
  | 'database-migration'
  | 'architecture-refactor'
  | 'add-layer'
  | 'remove-module'
  | 'technology-swap'
  | 'microservices-split'
  | 'add-caching'
  | 'custom';

export interface SimulationScenario {
  id: string;
  type: ScenarioType;
  name: string;
  description: string;
  changes: {
    from?: string;
    to?: string;
    affected: string[];
    removed?: string[];
    added?: string[];
  };
  parameters?: Record<string, any>;
}

export interface ImpactAnalysis {
  filesAffected: number;
  filesModified: string[];
  filesCreated: string[];
  filesDeleted: string[];
  dependenciesChanged: number;
  testingRequired: number;
  deploymentComplexity: number;
  breakingChanges: string[];
  warnings: string[];
  recommendations: string[];
}

export interface EffortEstimate {
  planning: number; // hours
  implementation: number; // hours
  testing: number; // hours
  deployment: number; // hours
  total: number; // hours
  complexity: 'Low' | 'Medium' | 'High' | 'Very High';
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface PerformanceImpact {
  score: number; // -100 to +100 (negative is worse, positive is better)
  description: string;
  metrics: {
    latency?: string;
    throughput?: string;
    memory?: string;
    cpu?: string;
  };
}

export interface SecurityImpact {
  score: number; // -100 to +100
  description: string;
  newVulnerabilities: string[];
  mitigatedVulnerabilities: string[];
}

export interface SimulationResult {
  scenario: SimulationScenario;
  impact: ImpactAnalysis;
  effort: EffortEstimate;
  performance: PerformanceImpact;
  security: SecurityImpact;
  costBenefit: {
    pros: string[];
    cons: string[];
    recommendation: 'Proceed' | 'Proceed with Caution' | 'Not Recommended';
    reasoning: string;
  };
  timeline: {
    phase: string;
    duration: number;
    description: string;
  }[];
  alternativeApproaches: string[];
}

/**
 * Predefined simulation scenarios
 */
export const PREDEFINED_SCENARIOS: Omit<SimulationScenario, 'id'>[] = [
  {
    type: 'database-migration',
    name: 'Migrate MongoDB → PostgreSQL',
    description: 'Replace document database with relational database',
    changes: {
      from: 'MongoDB',
      to: 'PostgreSQL',
      affected: ['data', 'service'],
      removed: ['mongoose', 'mongodb'],
      added: ['pg', 'sequelize']
    }
  },
  {
    type: 'database-migration',
    name: 'Migrate MySQL → PostgreSQL',
    description: 'Switch from MySQL to PostgreSQL for better JSON support',
    changes: {
      from: 'MySQL',
      to: 'PostgreSQL',
      affected: ['data', 'service']
    }
  },
  {
    type: 'architecture-refactor',
    name: 'MVC → Clean Architecture',
    description: 'Refactor from MVC pattern to Clean Architecture with clear boundaries',
    changes: {
      from: 'MVC',
      to: 'Clean Architecture',
      affected: ['api', 'service', 'data'],
      added: ['use-cases', 'entities', 'interfaces']
    }
  },
  {
    type: 'architecture-refactor',
    name: 'Monolith → Layered Architecture',
    description: 'Separate concerns into distinct architectural layers',
    changes: {
      from: 'Monolithic',
      to: 'Layered',
      affected: ['all']
    }
  },
  {
    type: 'microservices-split',
    name: 'Extract Authentication Microservice',
    description: 'Split authentication logic into separate microservice',
    changes: {
      affected: ['api', 'service'],
      removed: ['auth-module'],
      added: ['auth-service', 'api-gateway']
    }
  },
  {
    type: 'microservices-split',
    name: 'Monolith → Microservices',
    description: 'Decompose monolithic application into microservices',
    changes: {
      from: 'Monolith',
      to: 'Microservices',
      affected: ['all'],
      added: ['service-discovery', 'api-gateway', 'message-queue']
    }
  },
  {
    type: 'add-caching',
    name: 'Add Redis Caching Layer',
    description: 'Implement Redis for session storage and query caching',
    changes: {
      affected: ['api', 'service'],
      added: ['redis', 'cache-middleware']
    }
  },
  {
    type: 'add-layer',
    name: 'Add Event-Driven Architecture',
    description: 'Introduce event bus for decoupled communication',
    changes: {
      affected: ['service'],
      added: ['event-bus', 'message-queue', 'event-handlers']
    }
  },
  {
    type: 'technology-swap',
    name: 'Express → NestJS',
    description: 'Migrate from Express to NestJS framework',
    changes: {
      from: 'Express',
      to: 'NestJS',
      affected: ['api']
    }
  },
  {
    type: 'remove-module',
    name: 'Remove Legacy Module',
    description: 'Safely remove deprecated functionality',
    changes: {
      removed: ['legacy-module']
    }
  }
];

/**
 * Main simulation function
 */
export function simulateScenario(
  scenario: SimulationScenario,
  knowledgeGraph: KnowledgeGraph
): SimulationResult {
  
  console.log('[Simulator] Running simulation for:', scenario.name);
  
  // Analyze impact
  const impact = analyzeImpact(scenario, knowledgeGraph);
  
  // Estimate effort
  const effort = estimateEffort(impact, scenario, knowledgeGraph);
  
  // Analyze performance impact
  const performance = analyzePerformanceImpact(scenario, knowledgeGraph);
  
  // Analyze security impact
  const security = analyzeSecurityImpact(scenario, knowledgeGraph);
  
  // Generate cost-benefit analysis
  const costBenefit = generateCostBenefit(scenario, impact, effort, performance, security);
  
  // Create timeline
  const timeline = createTimeline(effort, scenario);
  
  // Suggest alternatives
  const alternativeApproaches = suggestAlternatives(scenario, knowledgeGraph);
  
  return {
    scenario,
    impact,
    effort,
    performance,
    security,
    costBenefit,
    timeline,
    alternativeApproaches
  };
}

/**
 * Analyze the impact of the scenario
 */
function analyzeImpact(
  scenario: SimulationScenario,
  graph: KnowledgeGraph
): ImpactAnalysis {
  
  const affectedLayers = scenario.changes.affected || [];
  const filesModified: string[] = [];
  const filesCreated: string[] = [];
  const filesDeleted: string[] = [];
  let dependenciesChanged = 0;
  const breakingChanges: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Find affected nodes
  graph.nodes.forEach(node => {
    if (affectedLayers.includes(node.layer) || affectedLayers.includes('all')) {
      filesModified.push(node.metadata.path);
      dependenciesChanged += node.dependencies.length;
    }
  });
  
  // Scenario-specific impact analysis
  switch (scenario.type) {
    case 'database-migration':
      // All data layer files need modification
      graph.nodes
        .filter(n => n.layer === 'data')
        .forEach(n => {
          if (!filesModified.includes(n.metadata.path)) {
            filesModified.push(n.metadata.path);
          }
        });
      
      breakingChanges.push('Database schema migration required');
      breakingChanges.push('ORM/ODM queries need rewriting');
      warnings.push('Data migration strategy needed');
      warnings.push('Rollback plan required');
      recommendations.push('Use migration scripts for gradual transition');
      recommendations.push('Implement dual-write pattern during migration');
      break;
      
    case 'architecture-refactor':
      // Most files need restructuring
      filesModified.push(...graph.nodes.map(n => n.metadata.path));
      breakingChanges.push('Directory structure changes');
      breakingChanges.push('Import paths need updating');
      warnings.push('High risk of introducing bugs during refactor');
      recommendations.push('Refactor incrementally, not all at once');
      recommendations.push('Maintain comprehensive test coverage');
      break;
      
    case 'microservices-split':
      const affectedModules = graph.modules.filter(m => 
        scenario.changes.removed?.some(r => m.name.toLowerCase().includes(r.toLowerCase()))
      );
      
      affectedModules.forEach(module => {
        filesModified.push(...module.nodes);
      });
      
      filesCreated.push('new-service/Dockerfile');
      filesCreated.push('new-service/package.json');
      filesCreated.push('api-gateway/routes.ts');
      
      breakingChanges.push('API contracts need versioning');
      breakingChanges.push('Network calls replace function calls');
      warnings.push('Distributed system complexity increases');
      warnings.push('Need service discovery and load balancing');
      recommendations.push('Start with strangler fig pattern');
      recommendations.push('Implement API gateway for routing');
      break;
      
    case 'add-caching':
      // Service and API layers affected
      graph.nodes
        .filter(n => n.layer === 'service' || n.layer === 'api')
        .forEach(n => filesModified.push(n.metadata.path));
      
      filesCreated.push('config/redis.ts');
      filesCreated.push('middleware/cache.ts');
      
      recommendations.push('Implement cache invalidation strategy');
      recommendations.push('Monitor cache hit rates');
      break;
      
    case 'remove-module':
      const removedModule = graph.modules.find(m =>
        scenario.changes.removed?.some(r => m.name.toLowerCase().includes(r.toLowerCase()))
      );
      
      if (removedModule) {
        filesDeleted.push(...removedModule.nodes);
        
        // Find dependents
        graph.nodes.forEach(node => {
          if (node.dependencies.some(dep => removedModule.nodes.includes(dep))) {
            filesModified.push(node.metadata.path);
            breakingChanges.push(`${node.metadata.path} depends on removed module`);
          }
        });
      }
      
      warnings.push('Ensure no critical functionality is lost');
      recommendations.push('Archive code instead of deleting');
      break;
  }
  
  // Calculate testing required
  const testingRequired = Math.ceil(filesModified.length * 0.3); // 30% of modified files
  
  // Deployment complexity (1-10 scale)
  let deploymentComplexity = 5;
  if (breakingChanges.length > 5) deploymentComplexity = 9;
  else if (breakingChanges.length > 2) deploymentComplexity = 7;
  else if (filesModified.length > 50) deploymentComplexity = 6;
  
  return {
    filesAffected: filesModified.length + filesCreated.length + filesDeleted.length,
    filesModified: filesModified.slice(0, 50), // Limit for display
    filesCreated,
    filesDeleted,
    dependenciesChanged,
    testingRequired,
    deploymentComplexity,
    breakingChanges,
    warnings,
    recommendations
  };
}

/**
 * Estimate effort required
 */
function estimateEffort(
  impact: ImpactAnalysis,
  scenario: SimulationScenario,
  graph: KnowledgeGraph
): EffortEstimate {
  
  // Base estimation factors
  const filesPerHour = 3; // Average files that can be modified per hour
  const testingRatio = 0.5; // Testing takes 50% of implementation time
  const deploymentBase = 8; // Base deployment hours
  
  // Calculate implementation hours
  const implementation = Math.ceil(impact.filesAffected / filesPerHour);
  
  // Calculate testing hours
  const testing = Math.ceil(implementation * testingRatio);
  
  // Calculate planning hours (varies by scenario)
  let planning = Math.ceil(implementation * 0.2);
  if (scenario.type === 'microservices-split') planning *= 2;
  if (scenario.type === 'architecture-refactor') planning *= 1.5;
  
  // Calculate deployment hours
  let deployment = deploymentBase;
  if (impact.breakingChanges.length > 5) deployment *= 2;
  if (scenario.type === 'microservices-split') deployment += 16;
  
  const total = planning + implementation + testing + deployment;
  
  // Determine complexity
  let complexity: EffortEstimate['complexity'] = 'Medium';
  if (total > 200) complexity = 'Very High';
  else if (total > 100) complexity = 'High';
  else if (total < 40) complexity = 'Low';
  
  // Determine risk
  let risk: EffortEstimate['risk'] = 'Medium';
  if (impact.breakingChanges.length > 5 || impact.deploymentComplexity > 7) risk = 'Critical';
  else if (impact.breakingChanges.length > 2 || impact.deploymentComplexity > 5) risk = 'High';
  else if (impact.filesAffected < 10) risk = 'Low';
  
  return {
    planning,
    implementation,
    testing,
    deployment,
    total,
    complexity,
    risk
  };
}

/**
 * Analyze performance impact
 */
function analyzePerformanceImpact(
  scenario: SimulationScenario,
  graph: KnowledgeGraph
): PerformanceImpact {
  
  let score = 0;
  let description = '';
  const metrics: PerformanceImpact['metrics'] = {};
  
  switch (scenario.type) {
    case 'database-migration':
      if (scenario.changes.to === 'PostgreSQL') {
        score = 15;
        description = 'PostgreSQL offers better performance for complex queries and JSON operations';
        metrics.latency = '-10% (improved)';
        metrics.throughput = '+20% (improved)';
      }
      break;
      
    case 'add-caching':
      score = 40;
      description = 'Redis caching will significantly improve read performance';
      metrics.latency = '-60% for cached queries';
      metrics.throughput = '+200% for read operations';
      metrics.memory = '+512MB Redis overhead';
      break;
      
    case 'microservices-split':
      score = -15;
      description = 'Network latency introduced by service-to-service calls';
      metrics.latency = '+20-50ms per service call';
      metrics.throughput = '-10% due to network overhead';
      break;
      
    case 'architecture-refactor':
      score = 10;
      description = 'Better separation of concerns enables optimization';
      metrics.cpu = 'Potential -5% through better caching';
      break;
      
    default:
      score = 0;
      description = 'Neutral performance impact expected';
  }
  
  return { score, description, metrics };
}

/**
 * Analyze security impact
 */
function analyzeSecurityImpact(
  scenario: SimulationScenario,
  graph: KnowledgeGraph
): SecurityImpact {
  
  let score = 0;
  let description = '';
  const newVulnerabilities: string[] = [];
  const mitigatedVulnerabilities: string[] = [];
  
  switch (scenario.type) {
    case 'microservices-split':
      score = -10;
      description = 'Increased attack surface with more network endpoints';
      newVulnerabilities.push('Service-to-service authentication required');
      newVulnerabilities.push('Network traffic must be encrypted');
      newVulnerabilities.push('API gateway becomes single point of failure');
      break;
      
    case 'add-caching':
      score = -5;
      description = 'Cached sensitive data requires additional security';
      newVulnerabilities.push('Cache poisoning risk');
      newVulnerabilities.push('Sensitive data in Redis needs encryption');
      break;
      
    case 'database-migration':
      score = 5;
      description = 'Opportunity to implement better security practices';
      mitigatedVulnerabilities.push('Row-level security in PostgreSQL');
      mitigatedVulnerabilities.push('Better encryption at rest options');
      break;
      
    case 'architecture-refactor':
      score = 15;
      description = 'Clean architecture improves security boundaries';
      mitigatedVulnerabilities.push('Better input validation layers');
      mitigatedVulnerabilities.push('Clearer authorization boundaries');
      break;
  }
  
  return { score, description, newVulnerabilities, mitigatedVulnerabilities };
}

/**
 * Generate cost-benefit analysis
 */
function generateCostBenefit(
  scenario: SimulationScenario,
  impact: ImpactAnalysis,
  effort: EffortEstimate,
  performance: PerformanceImpact,
  security: SecurityImpact
): SimulationResult['costBenefit'] {
  
  const pros: string[] = [];
  const cons: string[] = [];
  
  // Analyze benefits
  if (performance.score > 20) {
    pros.push(`Significant performance improvement: ${performance.description}`);
  } else if (performance.score > 0) {
    pros.push(`Moderate performance improvement expected`);
  }
  
  if (security.score > 0) {
    pros.push(`Security improvements: ${security.mitigatedVulnerabilities.length} vulnerabilities mitigated`);
  }
  
  if (effort.complexity === 'Low') {
    pros.push('Low complexity - can be implemented quickly');
  }
  
  // Analyze costs
  cons.push(`Requires ${effort.total} hours of work (${Math.ceil(effort.total / 8)} working days)`);
  
  if (effort.risk === 'Critical' || effort.risk === 'High') {
    cons.push(`${effort.risk} risk of production issues`);
  }
  
  if (impact.breakingChanges.length > 0) {
    cons.push(`${impact.breakingChanges.length} breaking changes require coordination`);
  }
  
  if (security.score < 0) {
    cons.push(`Security concerns: ${security.newVulnerabilities.length} new vulnerabilities to address`);
  }
  
  if (performance.score < 0) {
    cons.push(`Performance degradation: ${performance.description}`);
  }
  
  // Generate recommendation
  let recommendation: SimulationResult['costBenefit']['recommendation'] = 'Proceed with Caution';
  let reasoning = '';
  
  const benefitScore = performance.score + security.score;
  const riskScore = effort.risk === 'Critical' ? 50 : effort.risk === 'High' ? 30 : effort.risk === 'Medium' ? 15 : 5;
  
  if (benefitScore > 30 && riskScore < 30) {
    recommendation = 'Proceed';
    reasoning = 'High benefit with acceptable risk. This change will significantly improve the system.';
  } else if (benefitScore < -20 || riskScore > 40) {
    recommendation = 'Not Recommended';
    reasoning = 'High risk with limited benefits. Consider alternative approaches.';
  } else {
    recommendation = 'Proceed with Caution';
    reasoning = 'Moderate benefits with moderate risks. Ensure proper planning and testing.';
  }
  
  return {
    pros,
    cons,
    recommendation,
    reasoning
  };
}

/**
 * Create implementation timeline
 */
function createTimeline(
  effort: EffortEstimate,
  scenario: SimulationScenario
): SimulationResult['timeline'] {
  
  return [
    {
      phase: 'Planning & Design',
      duration: effort.planning,
      description: 'Detailed technical design, architecture decisions, and team alignment'
    },
    {
      phase: 'Implementation',
      duration: effort.implementation,
      description: 'Code changes, refactoring, and integration'
    },
    {
      phase: 'Testing & QA',
      duration: effort.testing,
      description: 'Unit tests, integration tests, and quality assurance'
    },
    {
      phase: 'Deployment',
      duration: effort.deployment,
      description: 'Production deployment, monitoring, and rollback planning'
    }
  ];
}

/**
 * Suggest alternative approaches
 */
function suggestAlternatives(
  scenario: SimulationScenario,
  graph: KnowledgeGraph
): string[] {
  
  const alternatives: string[] = [];
  
  switch (scenario.type) {
    case 'database-migration':
      alternatives.push('Gradual migration with dual-write pattern');
      alternatives.push('Use database abstraction layer to support both databases');
      alternatives.push('Migrate non-critical data first, then critical data');
      break;
      
    case 'microservices-split':
      alternatives.push('Start with modular monolith before splitting');
      alternatives.push('Use strangler fig pattern for gradual extraction');
      alternatives.push('Extract only high-traffic or independent modules first');
      break;
      
    case 'architecture-refactor':
      alternatives.push('Refactor incrementally, one layer at a time');
      alternatives.push('Create new structure alongside old, then migrate');
      alternatives.push('Focus on high-value areas first');
      break;
      
    case 'add-caching':
      alternatives.push('Start with application-level caching before Redis');
      alternatives.push('Cache only high-traffic endpoints initially');
      alternatives.push('Use CDN for static content caching');
      break;
  }
  
  return alternatives;
}

/**
 * Generate scenario ID
 */
export function generateScenarioId(): string {
  return `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
