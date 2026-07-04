/**
 * Knowledge Graph Builder - Constructs a comprehensive software architecture graph
 * from parsed dependencies, classifies layers, detects modules, and calculates health metrics
 */

import { DependencyNode, parseDependencies, getGraphStats } from './dependencyParser';

interface CodeFile {
  path: string;
  content: string;
  size: number;
}

interface MetricReport {
  totalFiles: number;
  totalFolders: number;
  totalLines: number;
  languageCounts: Record<string, number>;
  folderMetrics: Record<string, { files: number; lines: number; errors: number }>;
  localIssues: any[];
}

interface AgentsReport {
  overallScore: number;
  architecture: any;
  security: any;
  performance: any;
  maintainability: any;
  testing: any;
  risk: any;
  folderAnalysis: Record<string, FolderAnalysis>;
}

interface FolderAnalysis {
  errorsCount: number;
  summary: string;
  issues: any[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'module' | 'file' | 'function' | 'class' | 'package';
  layer: 'presentation' | 'api' | 'service' | 'data' | 'utility' | 'config' | 'test';
  health: number;
  complexity: number;
  dependencies: string[];
  dependents: string[];
  issuesCount: number;
  metadata: {
    path: string;
    language: string;
    lines: number;
    size: number;
    imports: number;
    exports: number;
    functions: string[];
    classes: string[];
  };
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: 'import' | 'call' | 'extends' | 'implements' | 'uses';
  weight: number;
  metadata: {
    lineNumber?: number;
    symbols?: string[];
  };
}

export interface ModuleCluster {
  id: string;
  name: string;
  nodes: string[];
  layer: string;
  health: number;
  issuesCount: number;
  description: string;
}

export interface KnowledgeGraph {
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge>;
  layers: {
    presentation: GraphNode[];
    api: GraphNode[];
    service: GraphNode[];
    data: GraphNode[];
    utility: GraphNode[];
    config: GraphNode[];
    test: GraphNode[];
  };
  modules: ModuleCluster[];
  statistics: {
    totalNodes: number;
    totalEdges: number;
    averageComplexity: number;
    averageHealth: number;
    criticalNodes: GraphNode[];
    isolatedNodes: GraphNode[];
    circularDependencies: string[][];
  };
}

/**
 * Main function to build the complete knowledge graph
 */
export function buildKnowledgeGraph(
  files: CodeFile[],
  metrics: MetricReport,
  agentsReport: AgentsReport | null
): KnowledgeGraph {
  
  console.log('[KnowledgeGraph] Starting graph construction...');
  
  // Step 1: Parse dependencies from all files
  const dependencyNodes = parseDependencies(files);
  console.log(`[KnowledgeGraph] Parsed ${dependencyNodes.size} dependency nodes`);
  
  // Step 2: Classify nodes into architectural layers
  const layerMap = classifyIntoLayers(dependencyNodes);
  console.log('[KnowledgeGraph] Classified nodes into layers');
  
  // Step 3: Calculate health scores based on issues
  const healthMap = calculateHealthScores(dependencyNodes, agentsReport);
  console.log('[KnowledgeGraph] Calculated health scores');
  
  // Step 4: Detect module clusters
  const modules = detectModules(dependencyNodes, layerMap);
  console.log(`[KnowledgeGraph] Detected ${modules.length} module clusters`);
  
  // Step 5: Build graph nodes
  const nodes = new Map<string, GraphNode>();
  dependencyNodes.forEach((depNode, id) => {
    const layer = layerMap.get(id) || 'utility';
    const health = healthMap.get(id) || 100;
    const issuesCount = countIssuesForFile(depNode.path, agentsReport);
    
    nodes.set(id, {
      id,
      label: depNode.name,
      type: determineNodeType(depNode),
      layer,
      health,
      complexity: depNode.metadata.complexity,
      dependencies: depNode.imports.map(imp => imp.source),
      dependents: depNode.usedBy,
      issuesCount,
      metadata: {
        path: depNode.path,
        language: depNode.language,
        lines: depNode.metadata.lines,
        size: depNode.metadata.size,
        imports: depNode.imports.length,
        exports: depNode.exports.length,
        functions: depNode.functions,
        classes: depNode.classes
      }
    });
  });
  
  // Step 6: Build graph edges
  const edges = new Map<string, GraphEdge>();
  dependencyNodes.forEach((depNode, fromId) => {
    depNode.imports.forEach((imp, idx) => {
      // Try to find the target node
      const toNode = findNodeByImport(imp.source, fromId, dependencyNodes);
      
      if (toNode) {
        const edgeId = `${fromId}->${toNode.id}`;
        edges.set(edgeId, {
          id: edgeId,
          from: fromId,
          to: toNode.id,
          type: 'import',
          weight: imp.symbols.length,
          metadata: {
            lineNumber: imp.lineNumber,
            symbols: imp.symbols
          }
        });
      }
    });
  });
  
  console.log(`[KnowledgeGraph] Built ${edges.size} edges`);
  
  // Step 7: Organize by layers
  const layers = organizeByLayers(nodes);
  
  // Step 8: Calculate statistics
  const statistics = calculateStatistics(nodes, edges);
  
  console.log('[KnowledgeGraph] Knowledge graph construction complete');
  
  return {
    nodes,
    edges,
    layers,
    modules,
    statistics
  };
}

/**
 * Classify files into architectural layers based on path and content patterns
 */
function classifyIntoLayers(nodes: Map<string, DependencyNode>): Map<string, GraphNode['layer']> {
  const layerMap = new Map<string, GraphNode['layer']>();
  
  nodes.forEach((node, id) => {
    const path = node.path.toLowerCase();
    const name = node.name.toLowerCase();
    
    // Test files
    if (path.includes('test') || path.includes('spec') || path.includes('__test__') ||
        name.includes('test') || name.includes('spec')) {
      layerMap.set(id, 'test');
      return;
    }
    
    // Config files
    if (path.includes('config') || name.includes('config') || 
        name.endsWith('.config.ts') || name.endsWith('.config.js') ||
        name === 'package.json' || name === 'tsconfig.json') {
      layerMap.set(id, 'config');
      return;
    }
    
    // Presentation layer (UI components, views, pages)
    if (path.includes('component') || path.includes('view') || path.includes('page') ||
        path.includes('ui') || path.includes('frontend') || path.includes('client') ||
        node.language === 'javascript' && (name.endsWith('.jsx') || name.endsWith('.tsx'))) {
      layerMap.set(id, 'presentation');
      return;
    }
    
    // API layer (controllers, routes, endpoints)
    if (path.includes('controller') || path.includes('route') || path.includes('api') ||
        path.includes('endpoint') || path.includes('handler') ||
        name.includes('controller') || name.includes('route')) {
      layerMap.set(id, 'api');
      return;
    }
    
    // Data layer (models, schemas, repositories, DAOs)
    if (path.includes('model') || path.includes('schema') || path.includes('entity') ||
        path.includes('repository') || path.includes('dao') || path.includes('database') ||
        path.includes('db') || path.includes('migration') ||
        name.includes('model') || name.includes('schema')) {
      layerMap.set(id, 'data');
      return;
    }
    
    // Service layer (business logic)
    if (path.includes('service') || path.includes('business') || path.includes('logic') ||
        path.includes('manager') || path.includes('provider') ||
        name.includes('service') || name.includes('manager')) {
      layerMap.set(id, 'service');
      return;
    }
    
    // Default to utility
    layerMap.set(id, 'utility');
  });
  
  return layerMap;
}

/**
 * Calculate health scores for each file based on issues found
 */
function calculateHealthScores(
  nodes: Map<string, DependencyNode>,
  agentsReport: AgentsReport | null
): Map<string, number> {
  const healthMap = new Map<string, number>();
  
  nodes.forEach((node, id) => {
    let health = 100;
    
    // Reduce health based on complexity
    if (node.metadata.complexity > 50) {
      health -= 20;
    } else if (node.metadata.complexity > 30) {
      health -= 10;
    } else if (node.metadata.complexity > 15) {
      health -= 5;
    }
    
    // Reduce health based on file size
    if (node.metadata.lines > 1000) {
      health -= 15;
    } else if (node.metadata.lines > 500) {
      health -= 10;
    } else if (node.metadata.lines > 300) {
      health -= 5;
    }
    
    // Reduce health based on issues from agents report
    if (agentsReport) {
      const issuesCount = countIssuesForFile(node.path, agentsReport);
      health -= issuesCount * 5;
    }
    
    // Ensure health stays in 0-100 range
    health = Math.max(0, Math.min(100, health));
    
    healthMap.set(id, health);
  });
  
  return healthMap;
}

/**
 * Count issues for a specific file from agents report
 */
function countIssuesForFile(filePath: string, agentsReport: AgentsReport | null): number {
  if (!agentsReport || !agentsReport.folderAnalysis) {
    return 0;
  }
  
  let count = 0;
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  Object.values(agentsReport.folderAnalysis).forEach(folder => {
    if (folder.issues) {
      folder.issues.forEach(issue => {
        const issuePath = issue.file?.replace(/\\/g, '/') || '';
        if (normalizedPath.includes(issuePath) || issuePath.includes(normalizedPath)) {
          count++;
        }
      });
    }
  });
  
  return count;
}

/**
 * Detect module clusters (groups of related files)
 */
function detectModules(
  nodes: Map<string, DependencyNode>,
  layerMap: Map<string, GraphNode['layer']>
): ModuleCluster[] {
  const modules: ModuleCluster[] = [];
  const pathPrefixes = new Map<string, string[]>();
  
  // Group files by directory prefix
  nodes.forEach((node, id) => {
    const normalized = node.path.replace(/\\/g, '/');
    const parts = normalized.split('/');
    
    if (parts.length > 1) {
      // Use first 2-3 directory levels as module identifier
      const moduleKey = parts.slice(0, Math.min(3, parts.length - 1)).join('/');
      
      if (!pathPrefixes.has(moduleKey)) {
        pathPrefixes.set(moduleKey, []);
      }
      pathPrefixes.get(moduleKey)!.push(id);
    }
  });
  
  // Create module clusters
  pathPrefixes.forEach((nodeIds, prefix) => {
    // Only create modules with at least 2 files
    if (nodeIds.length >= 2) {
      // Determine dominant layer
      const layerCounts = new Map<string, number>();
      nodeIds.forEach(nodeId => {
        const layer = layerMap.get(nodeId) || 'utility';
        layerCounts.set(layer, (layerCounts.get(layer) || 0) + 1);
      });
      
      let dominantLayer = 'utility';
      let maxCount = 0;
      layerCounts.forEach((count, layer) => {
        if (count > maxCount) {
          maxCount = count;
          dominantLayer = layer;
        }
      });
      
      // Calculate module health (average of node healths)
      const avgHealth = 85; // Placeholder, would calculate from actual health scores
      
      // Extract module name from path
      const moduleName = prefix.split('/').pop() || prefix;
      
      modules.push({
        id: prefix,
        name: moduleName.charAt(0).toUpperCase() + moduleName.slice(1),
        nodes: nodeIds,
        layer: dominantLayer,
        health: avgHealth,
        issuesCount: 0, // Would calculate from actual issues
        description: `Module containing ${nodeIds.length} files in ${dominantLayer} layer`
      });
    }
  });
  
  return modules;
}

/**
 * Determine node type based on its characteristics
 */
function determineNodeType(node: DependencyNode): GraphNode['type'] {
  if (node.classes.length > 0) {
    return 'class';
  }
  if (node.functions.length > 3) {
    return 'module';
  }
  if (node.path.includes('package.json')) {
    return 'package';
  }
  return 'file';
}

/**
 * Find a node by its import path
 */
function findNodeByImport(
  importPath: string,
  fromId: string,
  nodes: Map<string, DependencyNode>
): DependencyNode | null {
  // Skip external packages
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    return null;
  }
  
  // Direct match
  if (nodes.has(importPath)) {
    return nodes.get(importPath) || null;
  }
  
  // Try to resolve relative path
  const fromParts = fromId.replace(/\\/g, '/').split('/');
  fromParts.pop(); // Remove filename
  
  const importParts = importPath.split('/');
  const resolvedParts = [...fromParts];
  
  importParts.forEach(part => {
    if (part === '..') {
      resolvedParts.pop();
    } else if (part !== '.') {
      resolvedParts.push(part);
    }
  });
  
  const resolved = resolvedParts.join('/');
  
  // Try with different extensions
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.py', '.java'];
  for (const ext of extensions) {
    const testPath = resolved + ext;
    if (nodes.has(testPath)) {
      return nodes.get(testPath) || null;
    }
  }
  
  // Try index file
  for (const ext of extensions.slice(1)) {
    const indexPath = `${resolved}/index${ext}`;
    if (nodes.has(indexPath)) {
      return nodes.get(indexPath) || null;
    }
  }
  
  return null;
}

/**
 * Organize nodes by layer
 */
function organizeByLayers(nodes: Map<string, GraphNode>): KnowledgeGraph['layers'] {
  const layers: KnowledgeGraph['layers'] = {
    presentation: [],
    api: [],
    service: [],
    data: [],
    utility: [],
    config: [],
    test: []
  };
  
  nodes.forEach(node => {
    layers[node.layer].push(node);
  });
  
  return layers;
}

/**
 * Calculate graph statistics
 */
function calculateStatistics(
  nodes: Map<string, GraphNode>,
  edges: Map<string, GraphEdge>
): KnowledgeGraph['statistics'] {
  
  const nodeArray = Array.from(nodes.values());
  
  // Average complexity
  const avgComplexity = nodeArray.reduce((sum, n) => sum + n.complexity, 0) / nodeArray.length;
  
  // Average health
  const avgHealth = nodeArray.reduce((sum, n) => sum + n.health, 0) / nodeArray.length;
  
  // Critical nodes (low health or high complexity)
  const criticalNodes = nodeArray
    .filter(n => n.health < 60 || n.complexity > 30)
    .sort((a, b) => (a.health - a.complexity) - (b.health - b.complexity))
    .slice(0, 10);
  
  // Isolated nodes (no dependencies)
  const isolatedNodes = nodeArray.filter(n => 
    n.dependencies.length === 0 && n.dependents.length === 0
  );
  
  // Detect circular dependencies (simplified - full detection is complex)
  const circularDependencies: string[][] = [];
  // TODO: Implement proper cycle detection algorithm
  
  return {
    totalNodes: nodes.size,
    totalEdges: edges.size,
    averageComplexity: Math.round(avgComplexity * 10) / 10,
    averageHealth: Math.round(avgHealth * 10) / 10,
    criticalNodes,
    isolatedNodes,
    circularDependencies
  };
}

/**
 * Export graph to JSON for frontend visualization
 */
export function serializeGraph(graph: KnowledgeGraph): any {
  return {
    nodes: Array.from(graph.nodes.entries()).map(([id, node]) => ({
      id,
      ...node
    })),
    edges: Array.from(graph.edges.entries()).map(([id, edge]) => ({
      id,
      ...edge
    })),
    layers: {
      presentation: graph.layers.presentation.length,
      api: graph.layers.api.length,
      service: graph.layers.service.length,
      data: graph.layers.data.length,
      utility: graph.layers.utility.length,
      config: graph.layers.config.length,
      test: graph.layers.test.length
    },
    modules: graph.modules,
    statistics: {
      ...graph.statistics,
      criticalNodes: graph.statistics.criticalNodes.map(n => ({
        id: n.id,
        label: n.label,
        health: n.health,
        complexity: n.complexity
      })),
      isolatedNodes: graph.statistics.isolatedNodes.map(n => ({
        id: n.id,
        label: n.label
      }))
    }
  };
}

/**
 * Generate a human-readable report of the knowledge graph
 */
export function generateGraphReport(graph: KnowledgeGraph): string {
  const lines: string[] = [];
  
  lines.push('=== Software Architecture Knowledge Graph ===\n');
  lines.push(`Total Components: ${graph.statistics.totalNodes}`);
  lines.push(`Total Dependencies: ${graph.statistics.totalEdges}`);
  lines.push(`Average Complexity: ${graph.statistics.averageComplexity}`);
  lines.push(`Average Health: ${graph.statistics.averageHealth}%\n`);
  
  lines.push('Layer Distribution:');
  Object.entries(graph.layers).forEach(([layer, nodes]) => {
    lines.push(`  ${layer}: ${nodes.length} files`);
  });
  
  lines.push(`\nModule Clusters: ${graph.modules.length}`);
  graph.modules.slice(0, 5).forEach(mod => {
    lines.push(`  - ${mod.name}: ${mod.nodes.length} files (${mod.layer} layer)`);
  });
  
  if (graph.statistics.criticalNodes.length > 0) {
    lines.push('\nCritical Components (Needs Attention):');
    graph.statistics.criticalNodes.slice(0, 5).forEach(node => {
      lines.push(`  - ${node.label}: Health ${node.health}%, Complexity ${node.complexity}`);
    });
  }
  
  if (graph.statistics.isolatedNodes.length > 0) {
    lines.push(`\nIsolated Files (No Dependencies): ${graph.statistics.isolatedNodes.length}`);
  }
  
  return lines.join('\n');
}
