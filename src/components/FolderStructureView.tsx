/**
 * Folder Structure Visualization
 * Shows uploaded project structure with error indicators
 */

import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  File, 
  FileCode, 
  AlertCircle, 
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Download
} from 'lucide-react';

interface FileNode {
  path: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  language?: string;
  errors?: number;
  size?: number;
  lines?: number;
}

interface FolderStructureViewProps {
  files: Array<{
    path: string;
    content: string;
    size: number;
  }>;
  folderAnalysis?: Record<string, {
    errorsCount: number;
    issues: any[];
  }>;
  localIssues?: Array<{
    file: string;
    severity: string;
  }>;
}

export default function FolderStructureView({ 
  files, 
  folderAnalysis,
  localIssues 
}: FolderStructureViewProps) {
  
  // Build folder tree structure
  const folderTree = buildFolderTree(files, folderAnalysis, localIssues);
  
  // Export functions
  const exportAsMarkdown = () => {
    const markdown = generateMarkdownTree(folderTree);
    downloadFile(markdown, 'folder-structure.md', 'text/markdown');
  };

  const exportAsText = () => {
    const text = generateTextTree(folderTree);
    downloadFile(text, 'folder-structure.txt', 'text/plain');
  };

  return (
    <div className="bg-[#0b0c11] border border-gray-900 rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-900 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
            Project Structure
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {files.length} files • {folderTree.children?.length || 0} folders
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportAsMarkdown}
            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Markdown</span>
          </button>
          <button
            onClick={exportAsText}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Text</span>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-4 text-xs bg-gray-950 p-3 rounded-lg border border-gray-900">
        <div className="flex items-center space-x-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          <span className="text-gray-400">Files with errors</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-gray-400">Clean files</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Folder className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-gray-400">Folders</span>
        </div>
      </div>

      {/* Tree View */}
      <div className="bg-gray-950 border border-gray-900 rounded-lg p-4 max-h-[600px] overflow-y-auto">
        <TreeNode node={folderTree} level={0} isRoot />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-900">
        <div className="bg-gray-950 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-white">
            {countFilesWithErrors(folderTree)}
          </div>
          <div className="text-xs text-red-400 mt-1">Files with Errors</div>
        </div>
        <div className="bg-gray-950 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-white">
            {countCleanFiles(folderTree)}
          </div>
          <div className="text-xs text-emerald-400 mt-1">Clean Files</div>
        </div>
        <div className="bg-gray-950 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-white">
            {countTotalErrors(folderTree)}
          </div>
          <div className="text-xs text-amber-400 mt-1">Total Issues</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Tree Node Component (Recursive)
 */
function TreeNode({ 
  node, 
  level, 
  isRoot = false 
}: { 
  node: FileNode; 
  level: number; 
  isRoot?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-expand first 2 levels
  
  const hasChildren = node.children && node.children.length > 0;
  const hasErrors = (node.errors || 0) > 0;
  
  const indent = level * 20;

  if (isRoot) {
    return (
      <div className="space-y-1">
        {node.children?.map((child, idx) => (
          <TreeNode key={idx} node={child} level={0} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Current Node */}
      <div
        className={`flex items-center space-x-2 py-1.5 px-2 rounded hover:bg-gray-900/50 transition-colors cursor-pointer group`}
        style={{ paddingLeft: `${indent + 8}px` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {/* Expand/Collapse Icon */}
        {hasChildren ? (
          isOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
          )
        ) : (
          <div className="w-4" /> // Spacer for alignment
        )}

        {/* Folder/File Icon */}
        {node.type === 'folder' ? (
          isOpen ? (
            <FolderOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-blue-400 flex-shrink-0" />
          )
        ) : (
          <FileCode className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}

        {/* Name */}
        <span className={`text-sm flex-1 ${
          hasErrors ? 'text-red-300 font-medium' : 'text-gray-300'
        }`}>
          {node.name}
        </span>

        {/* Error Badge */}
        {hasErrors && (
          <div className="flex items-center space-x-1 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
            <AlertCircle className="w-3 h-3 text-red-400" />
            <span className="text-[10px] font-mono text-red-400">
              {node.errors} {node.errors === 1 ? 'issue' : 'issues'}
            </span>
          </div>
        )}

        {/* Clean Badge */}
        {!hasErrors && node.type === 'file' && (
          <CheckCircle2 className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}

        {/* File Info */}
        {node.type === 'file' && node.lines && (
          <span className="text-[10px] text-gray-500 font-mono">
            {node.lines} lines
          </span>
        )}
      </div>

      {/* Children (Recursive) */}
      {hasChildren && isOpen && (
        <div className="space-y-1">
          {node.children!.map((child, idx) => (
            <TreeNode key={idx} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Build folder tree from flat file list
 */
function buildFolderTree(
  files: Array<{ path: string; content: string; size: number }>,
  folderAnalysis?: Record<string, { errorsCount: number; issues: any[] }>,
  localIssues?: Array<{ file: string; severity: string }>
): FileNode {
  const root: FileNode = {
    path: '/',
    name: 'root',
    type: 'folder',
    children: []
  };

  // Count errors per file
  const fileErrors = new Map<string, number>();
  
  // From folder analysis
  if (folderAnalysis) {
    Object.entries(folderAnalysis).forEach(([folder, data]) => {
      data.issues?.forEach((issue: any) => {
        const file = issue.file || issue.path;
        if (file) {
          fileErrors.set(file, (fileErrors.get(file) || 0) + 1);
        }
      });
    });
  }
  
  // From local issues
  if (localIssues) {
    localIssues.forEach(issue => {
      const file = issue.file;
      if (file) {
        fileErrors.set(file, (fileErrors.get(file) || 0) + 1);
      }
    });
  }

  // Build tree
  files.forEach(file => {
    const parts = file.path.replace(/\\/g, '/').split('/').filter(p => p);
    let currentNode = root;

    // Navigate/create folder structure
    for (let i = 0; i < parts.length - 1; i++) {
      const folderName = parts[i];
      let folderNode = currentNode.children?.find(
        n => n.name === folderName && n.type === 'folder'
      );

      if (!folderNode) {
        folderNode = {
          path: parts.slice(0, i + 1).join('/'),
          name: folderName,
          type: 'folder',
          children: []
        };
        currentNode.children = currentNode.children || [];
        currentNode.children.push(folderNode);
      }

      currentNode = folderNode;
    }

    // Add file
    const fileName = parts[parts.length - 1];
    const normalizedPath = file.path.replace(/\\/g, '/');
    const errors = fileErrors.get(normalizedPath) || 
                   fileErrors.get(file.path) || 
                   Array.from(fileErrors.keys()).filter(k => 
                     k.includes(fileName) || normalizedPath.includes(k)
                   ).reduce((sum, k) => sum + (fileErrors.get(k) || 0), 0);

    currentNode.children = currentNode.children || [];
    currentNode.children.push({
      path: normalizedPath,
      name: fileName,
      type: 'file',
      language: detectLanguage(fileName),
      errors,
      size: file.size,
      lines: file.content.split('\n').length
    });
  });

  // Sort: folders first, then files, then by name
  sortTree(root);
  
  // Calculate folder error counts
  calculateFolderErrors(root);

  return root;
}

/**
 * Sort tree: folders first, then alphabetically
 */
function sortTree(node: FileNode) {
  if (!node.children) return;

  node.children.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  node.children.forEach(child => sortTree(child));
}

/**
 * Calculate error counts for folders (sum of children)
 */
function calculateFolderErrors(node: FileNode): number {
  if (node.type === 'file') {
    return node.errors || 0;
  }

  let totalErrors = 0;
  node.children?.forEach(child => {
    totalErrors += calculateFolderErrors(child);
  });

  node.errors = totalErrors;
  return totalErrors;
}

/**
 * Detect programming language from filename
 */
function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    'js': 'JavaScript',
    'jsx': 'JavaScript',
    'ts': 'TypeScript',
    'tsx': 'TypeScript',
    'py': 'Python',
    'java': 'Java',
    'cs': 'C#',
    'go': 'Go',
    'rs': 'Rust',
    'php': 'PHP',
    'rb': 'Ruby',
    'swift': 'Swift',
    'kt': 'Kotlin',
    'dart': 'Dart',
    'json': 'JSON',
    'md': 'Markdown',
    'html': 'HTML',
    'css': 'CSS'
  };
  return langMap[ext || ''] || 'Text';
}

/**
 * Count files with errors
 */
function countFilesWithErrors(node: FileNode): number {
  if (node.type === 'file') {
    return node.errors && node.errors > 0 ? 1 : 0;
  }
  return (node.children || []).reduce((sum, child) => sum + countFilesWithErrors(child), 0);
}

/**
 * Count clean files
 */
function countCleanFiles(node: FileNode): number {
  if (node.type === 'file') {
    return !node.errors || node.errors === 0 ? 1 : 0;
  }
  return (node.children || []).reduce((sum, child) => sum + countCleanFiles(child), 0);
}

/**
 * Count total errors
 */
function countTotalErrors(node: FileNode): number {
  return node.errors || 0;
}

/**
 * Generate Markdown tree representation
 */
function generateMarkdownTree(node: FileNode, prefix = '', isLast = true): string {
  const lines: string[] = [];
  
  if (node.type !== 'folder' || node.name !== 'root') {
    const connector = isLast ? '└── ' : '├── ';
    const icon = node.type === 'folder' ? '📁' : '📄';
    const errorBadge = node.errors && node.errors > 0 ? ` ⚠️ ${node.errors} issues` : '';
    const lineBadge = node.lines ? ` (${node.lines} lines)` : '';
    
    lines.push(`${prefix}${connector}${icon} **${node.name}**${errorBadge}${lineBadge}`);
  }

  if (node.children && node.children.length > 0) {
    const childPrefix = node.name === 'root' ? '' : prefix + (isLast ? '    ' : '│   ');
    node.children.forEach((child, idx) => {
      const childIsLast = idx === node.children!.length - 1;
      lines.push(generateMarkdownTree(child, childPrefix, childIsLast));
    });
  }

  return lines.join('\n');
}

/**
 * Generate plain text tree
 */
function generateTextTree(node: FileNode, prefix = '', isLast = true): string {
  const lines: string[] = [];
  
  if (node.type !== 'folder' || node.name !== 'root') {
    const connector = isLast ? '└── ' : '├── ';
    const errorBadge = node.errors && node.errors > 0 ? ` [${node.errors} issues]` : '';
    
    lines.push(`${prefix}${connector}${node.name}${errorBadge}`);
  }

  if (node.children && node.children.length > 0) {
    const childPrefix = node.name === 'root' ? '' : prefix + (isLast ? '    ' : '│   ');
    node.children.forEach((child, idx) => {
      const childIsLast = idx === node.children!.length - 1;
      lines.push(generateTextTree(child, childPrefix, childIsLast));
    });
  }

  return lines.join('\n');
}

/**
 * Download file helper
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
