/**
 * Interactive Knowledge Graph Component
 * Professional force-directed graph visualization using React Flow
 */

import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  ConnectionLineType,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'motion/react';
import {
  Network,
  Layers,
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';
import type { KnowledgeGraph, GraphNode } from '../types/knowledgeGraph';

interface InteractiveKnowledgeGraphProps {
  knowledgeGraph: KnowledgeGraph;
  onNodeClick?: (node: GraphNode) => void;
}

// Custom node styles based on health and type
const getNodeColor = (health: number, layer: string) => {
  // Health-based color
  if (health >= 85) return '#10b981'; // emerald
  if (health >= 70) return '#3b82f6'; // blue
  if (health >= 50) return '#f59e0b'; // amber
  return '#ef4444'; // red
};

const getLayerColor = (layer: string) => {
  const colors: Record<string, string> = {
    presentation: '#8b5cf6', // purple
    api: '#3b82f6', // blue
    service: '#10b981', // emerald
    data: '#f59e0b', // amber
    utility: '#6b7280', // gray
    config: '#ec4899', // pink
    test: '#14b8a6' // teal
  };
  return colors[layer] || '#6b7280';
};

export default function InteractiveKnowledgeGraph({
  knowledgeGraph,
  onNodeClick
}: InteractiveKnowledgeGraphProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayers, setSelectedLayers] = useState<Set<string>>(new Set(['all']));
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

  // Convert knowledge graph nodes to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    if (!knowledgeGraph || !knowledgeGraph.nodes) return [];

    return knowledgeGraph.nodes.map((node, index) => {
      const angle = (index / knowledgeGraph.nodes.length) * 2 * Math.PI;
      const radius = 300;
      const x = 500 + radius * Math.cos(angle);
      const y = 300 + radius * Math.sin(angle);

      const color = getNodeColor(node.health, node.layer);
      const layerColor = getLayerColor(node.layer);

      return {
        id: node.id,
        type: 'default',
        position: { x, y },
        data: {
          label: node.label,
          ...node
        },
        style: {
          background: `linear-gradient(135deg, ${color}15, ${layerColor}10)`,
          border: `2px solid ${color}`,
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '12px',
          fontWeight: '600',
          color: '#ffffff',
          boxShadow: node.issuesCount > 2 
            ? `0 0 20px ${color}50` 
            : `0 4px 12px rgba(0,0,0,0.3)`,
          minWidth: '120px',
          textAlign: 'center'
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left
      };
    });
  }, [knowledgeGraph]);

  // Convert knowledge graph edges to React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    if (!knowledgeGraph || !knowledgeGraph.edges) return [];

    return knowledgeGraph.edges.map((edge) => {
      const sourceNode = knowledgeGraph.nodes.find(n => n.id === edge.from);
      const color = sourceNode ? getNodeColor(sourceNode.health, sourceNode.layer) : '#6b7280';

      return {
        id: edge.id,
        source: edge.from,
        target: edge.to,
        type: 'smoothstep',
        animated: edge.type === 'import',
        style: {
          stroke: color,
          strokeWidth: 2
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: color,
          width: 20,
          height: 20
        },
        label: edge.type,
        labelStyle: {
          fontSize: '10px',
          fontWeight: '500',
          fill: '#9ca3af'
        }
      };
    });
  }, [knowledgeGraph]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Filter nodes based on search and layer selection
  const filteredNodes = useMemo(() => {
    let filtered = nodes;

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(node =>
        node.data.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.data.metadata?.path?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by layer
    if (!selectedLayers.has('all')) {
      filtered = filtered.filter(node =>
        selectedLayers.has(node.data.layer)
      );
    }

    return filtered;
  }, [nodes, searchQuery, selectedLayers]);

  // Filter edges to only show connections between visible nodes
  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
    return edges.filter(edge =>
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [edges, filteredNodes]);

  // Handle node click
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setHighlightedNodeId(node.id);
    if (onNodeClick && node.data) {
      onNodeClick(node.data as GraphNode);
    }

    // Highlight connected nodes
    const connectedEdges = edges.filter(
      edge => edge.source === node.id || edge.target === node.id
    );
    const connectedNodeIds = new Set(
      connectedEdges.flatMap(edge => [edge.source, edge.target])
    );

    setNodes(currentNodes =>
      currentNodes.map(n => ({
        ...n,
        style: {
          ...n.style,
          opacity: connectedNodeIds.has(n.id) || n.id === node.id ? 1 : 0.3
        }
      }))
    );

    setEdges(currentEdges =>
      currentEdges.map(e => ({
        ...e,
        style: {
          ...e.style,
          opacity: connectedEdges.some(ce => ce.id === e.id) ? 1 : 0.1
        }
      }))
    );
  }, [edges, onNodeClick, setNodes, setEdges]);

  // Reset highlighting
  const resetHighlight = useCallback(() => {
    setHighlightedNodeId(null);
    setNodes(currentNodes =>
      currentNodes.map(n => ({
        ...n,
        style: {
          ...n.style,
          opacity: 1
        }
      }))
    );
    setEdges(currentEdges =>
      currentEdges.map(e => ({
        ...e,
        style: {
          ...e.style,
          opacity: 1
        }
      }))
    );
  }, [setNodes, setEdges]);

  // Toggle layer filter
  const toggleLayer = (layer: string) => {
    setSelectedLayers(prev => {
      const newSet = new Set(prev);
      if (layer === 'all') {
        return new Set(['all']);
      }
      newSet.delete('all');
      if (newSet.has(layer)) {
        newSet.delete(layer);
      } else {
        newSet.add(layer);
      }
      if (newSet.size === 0) {
        return new Set(['all']);
      }
      return newSet;
    });
  };

  const layerOptions = [
    { key: 'all', label: 'All Layers', color: '#6b7280' },
    { key: 'presentation', label: 'Presentation', color: '#8b5cf6' },
    { key: 'api', label: 'API', color: '#3b82f6' },
    { key: 'service', label: 'Service', color: '#10b981' },
    { key: 'data', label: 'Data', color: '#f59e0b' },
    { key: 'utility', label: 'Utility', color: '#6b7280' },
    { key: 'config', label: 'Config', color: '#ec4899' },
    { key: 'test', label: 'Test', color: '#14b8a6' }
  ];

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* Control Panel - Above the Graph */}
      <div className="flex flex-wrap gap-3 bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-4">
        {/* Title Section */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Network className="h-5 w-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Interactive Knowledge Graph</h3>
          <span className="text-xs text-gray-500">
            {filteredNodes.length} components • {filteredEdges.length} dependencies
          </span>
        </div>

        {/* Search Box */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30"
          />
        </div>

        {/* Mini Map Toggle */}
        <button
          onClick={() => setShowMiniMap(!showMiniMap)}
          className="px-3 py-2 bg-gray-950 hover:bg-gray-800 border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          {showMiniMap ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          <span className="text-xs">Mini Map</span>
        </button>
      </div>

      {/* Layer Filters - Separate Row */}
      <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-300">Filter by Layer:</span>
          </div>
          <div className="flex flex-wrap gap-2 flex-1">
            {layerOptions.map(layer => (
              <button
                key={layer.key}
                onClick={() => toggleLayer(layer.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedLayers.has(layer.key)
                    ? 'border'
                    : 'bg-gray-950 text-gray-500 hover:text-gray-300 border border-transparent'
                }`}
                style={
                  selectedLayers.has(layer.key)
                    ? {
                        backgroundColor: `${layer.color}15`,
                        borderColor: `${layer.color}40`,
                        color: layer.color
                      }
                    : {}
                }
              >
                {layer.label}
              </button>
            ))}
          </div>
          
          {/* Stats - Right Side */}
          <div className="flex gap-4 flex-shrink-0">
            <div>
              <div className="text-[10px] text-gray-500">Avg Health</div>
              <div className="text-sm font-bold text-emerald-400">
                {Math.round(knowledgeGraph.statistics.averageHealth)}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500">Complexity</div>
              <div className="text-sm font-bold text-amber-400">
                {Math.round(knowledgeGraph.statistics.averageComplexity)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* React Flow Graph - Full Width Below Controls */}
      <div className="flex-1 bg-[#07080a] rounded-2xl border border-gray-900 overflow-hidden">
        {/* React Flow Canvas */}
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onPaneClick={resetHighlight}
          connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false
        }}
      >
        {/* Background Grid */}
        <Background color="#1f2937" gap={16} size={1} />

        {/* Controls */}
        <Controls
          className="bg-gray-900 border border-gray-800 rounded-lg"
          showInteractive={false}
        />

        {/* Mini Map */}
        {showMiniMap && (
          <MiniMap
            className="bg-gray-900 border border-gray-800 rounded-lg"
            nodeColor={(node) => {
              const graphNode = node.data as GraphNode;
              return getNodeColor(graphNode.health, graphNode.layer);
            }}
            maskColor="rgba(0, 0, 0, 0.6)"
          />
        )}

        {/* Node Details Panel (when selected) */}
        {highlightedNodeId && (
          <Panel position="top-right">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900/95 backdrop-blur border border-gray-800 rounded-xl p-4 shadow-xl w-80"
            >
              {(() => {
                const node = nodes.find(n => n.id === highlightedNodeId);
                if (!node) return null;
                const graphNode = node.data as GraphNode;

                return (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-white">{graphNode.label}</h4>
                      <button
                        onClick={resetHighlight}
                        className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Health</span>
                        <span className={`font-bold ${
                          graphNode.health >= 85 ? 'text-emerald-400' :
                          graphNode.health >= 70 ? 'text-blue-400' :
                          graphNode.health >= 50 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {graphNode.health}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Layer</span>
                        <span
                          className="px-2 py-0.5 rounded font-medium"
                          style={{
                            backgroundColor: `${getLayerColor(graphNode.layer)}20`,
                            color: getLayerColor(graphNode.layer)
                          }}
                        >
                          {graphNode.layer}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Complexity</span>
                        <span className="font-medium text-gray-300">{graphNode.complexity}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Issues</span>
                        <span className={`font-bold ${
                          graphNode.issuesCount === 0 ? 'text-emerald-400' :
                          graphNode.issuesCount < 3 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {graphNode.issuesCount}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Dependencies</span>
                        <span className="font-medium text-gray-300">{graphNode.dependencies.length}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Dependents</span>
                        <span className="font-medium text-gray-300">{graphNode.dependents.length}</span>
                      </div>

                      <div className="pt-2 border-t border-gray-800">
                        <div className="text-[10px] text-gray-500 mb-1">File Path</div>
                        <div className="text-xs text-gray-400 font-mono break-all">
                          {graphNode.metadata.path}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-800">
                        <div className="text-[10px] text-gray-500 mb-1">Language</div>
                        <div className="text-xs text-gray-300 font-medium">
                          {graphNode.metadata.language}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-800">
                        <div className="text-[10px] text-gray-500 mb-1">Lines of Code</div>
                        <div className="text-xs text-gray-300 font-medium">
                          {graphNode.metadata.lines.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </Panel>
        )}
      </ReactFlow>
      </div>
    </div>
  );
}
