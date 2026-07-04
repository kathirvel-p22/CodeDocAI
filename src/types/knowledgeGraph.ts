/**
 * TypeScript type definitions for Knowledge Graph / Digital Twin
 */

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

export interface KnowledgeGraphStatistics {
  totalNodes: number;
  totalEdges: number;
  averageComplexity: number;
  averageHealth: number;
  criticalNodes: Array<{
    id: string;
    label: string;
    health: number;
    complexity: number;
  }>;
  isolatedNodes: Array<{
    id: string;
    label: string;
  }>;
  circularDependencies: string[][];
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  layers: {
    presentation: number;
    api: number;
    service: number;
    data: number;
    utility: number;
    config: number;
    test: number;
  };
  modules: ModuleCluster[];
  statistics: KnowledgeGraphStatistics;
}

export interface AnalysisResponse {
  metrics: any;
  agentsReport: any;
  knowledgeGraph?: KnowledgeGraph;
  graphReport?: string;
  demo?: boolean;
}
