/**
 * Dependency Parser - Extract imports, exports, and relationships from source files
 * Supports: JavaScript, TypeScript, Python, Java, C#, Go, Rust
 */

interface CodeFile {
  path: string;
  content: string;
  size: number;
}

export interface DependencyNode {
  id: string;
  path: string;
  name: string;
  type: 'file' | 'function' | 'class' | 'module';
  language: string;
  imports: ImportStatement[];
  exports: ExportStatement[];
  functions: string[];
  classes: string[];
  usedBy: string[];
  metadata: {
    lines: number;
    size: number;
    complexity: number;
  };
}

export interface ImportStatement {
  source: string;
  symbols: string[];
  isDefault: boolean;
  lineNumber: number;
}

export interface ExportStatement {
  name: string;
  type: 'function' | 'class' | 'const' | 'default';
  lineNumber: number;
}

/**
 * Main parser function - analyzes all files and builds dependency graph
 */
export function parseDependencies(files: CodeFile[]): Map<string, DependencyNode> {
  const nodes = new Map<string, DependencyNode>();

  // First pass: create nodes for each file
  files.forEach(file => {
    const language = detectLanguage(file.path);
    const node: DependencyNode = {
      id: file.path,
      path: file.path,
      name: extractFileName(file.path),
      type: 'file',
      language,
      imports: extractImports(file.content, language),
      exports: extractExports(file.content, language),
      functions: extractFunctions(file.content, language),
      classes: extractClasses(file.content, language),
      usedBy: [],
      metadata: {
        lines: file.content.split('\n').length,
        size: file.size,
        complexity: calculateComplexity(file.content, language)
      }
    };

    nodes.set(file.path, node);
  });

  // Second pass: build reverse dependencies (usedBy)
  buildReverseDependencies(nodes, files);

  return nodes;
}

/**
 * Detect programming language from file extension
 */
function detectLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  
  const langMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'php': 'php',
    'rb': 'ruby',
    'swift': 'swift',
    'kt': 'kotlin',
    'dart': 'dart',
    'cpp': 'cpp',
    'c': 'c',
    'h': 'c'
  };

  return langMap[ext] || 'text';
}

/**
 * Extract file name from path
 */
function extractFileName(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  const parts = normalized.split('/');
  return parts[parts.length - 1];
}

/**
 * Extract import statements from code
 */
function extractImports(content: string, language: string): ImportStatement[] {
  const imports: ImportStatement[] = [];

  switch (language) {
    case 'javascript':
    case 'typescript':
      imports.push(...extractJSImports(content));
      break;
    case 'python':
      imports.push(...extractPythonImports(content));
      break;
    case 'java':
      imports.push(...extractJavaImports(content));
      break;
    case 'csharp':
      imports.push(...extractCSharpImports(content));
      break;
    case 'go':
      imports.push(...extractGoImports(content));
      break;
    case 'rust':
      imports.push(...extractRustImports(content));
      break;
  }

  return imports;
}

/**
 * Extract JavaScript/TypeScript imports
 */
function extractJSImports(content: string): ImportStatement[] {
  const imports: ImportStatement[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // ES6 import statements
    // import { Something } from './module'
    // import Something from './module'
    // import * as Something from './module'
    const importMatch = line.match(/import\s+(?:(?:\{[^}]+\})|(?:\*\s+as\s+\w+)|(?:\w+))\s+from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      const source = importMatch[1];
      const symbolsMatch = line.match(/import\s+\{([^}]+)\}/);
      const defaultMatch = line.match(/import\s+(\w+)\s+from/);
      const namespaceMatch = line.match(/import\s+\*\s+as\s+(\w+)/);

      let symbols: string[] = [];
      let isDefault = false;

      if (symbolsMatch) {
        symbols = symbolsMatch[1].split(',').map(s => s.trim().split(' as ')[0]);
      } else if (defaultMatch) {
        symbols = [defaultMatch[1]];
        isDefault = true;
      } else if (namespaceMatch) {
        symbols = [namespaceMatch[1]];
      }

      imports.push({
        source,
        symbols,
        isDefault,
        lineNumber: index + 1
      });
    }

    // require statements
    // const Something = require('./module')
    const requireMatch = line.match(/(?:const|let|var)\s+(?:\{[^}]+\}|\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/);
    if (requireMatch) {
      const source = requireMatch[1];
      const symbolsMatch = line.match(/(?:const|let|var)\s+\{([^}]+)\}/);
      const varMatch = line.match(/(?:const|let|var)\s+(\w+)/);

      let symbols: string[] = [];
      if (symbolsMatch) {
        symbols = symbolsMatch[1].split(',').map(s => s.trim());
      } else if (varMatch) {
        symbols = [varMatch[1]];
      }

      imports.push({
        source,
        symbols,
        isDefault: true,
        lineNumber: index + 1
      });
    }
  });

  return imports;
}

/**
 * Extract Python imports
 */
function extractPythonImports(content: string): ImportStatement[] {
  const imports: ImportStatement[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // import module
    // import module as alias
    const importMatch = line.match(/^import\s+([^\s,]+)(?:\s+as\s+(\w+))?/);
    if (importMatch) {
      const source = importMatch[1];
      const alias = importMatch[2] || importMatch[1];
      imports.push({
        source,
        symbols: [alias],
        isDefault: true,
        lineNumber: index + 1
      });
    }

    // from module import something
    // from module import something, another
    // from module import *
    const fromMatch = line.match(/^from\s+([^\s]+)\s+import\s+(.+)/);
    if (fromMatch) {
      const source = fromMatch[1];
      const importedItems = fromMatch[2].trim();

      let symbols: string[] = [];
      if (importedItems === '*') {
        symbols = ['*'];
      } else {
        symbols = importedItems
          .split(',')
          .map(item => item.trim().split(' as ')[0].trim());
      }

      imports.push({
        source,
        symbols,
        isDefault: false,
        lineNumber: index + 1
      });
    }
  });

  return imports;
}

/**
 * Extract Java imports
 */
function extractJavaImports(content: string): ImportStatement[] {
  const imports: ImportStatement[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // import package.ClassName;
    // import package.*;
    const importMatch = line.match(/^import\s+(?:static\s+)?([^\s;]+);/);
    if (importMatch) {
      const fullPath = importMatch[1];
      const parts = fullPath.split('.');
      const symbol = parts[parts.length - 1];

      imports.push({
        source: fullPath,
        symbols: [symbol],
        isDefault: symbol !== '*',
        lineNumber: index + 1
      });
    }
  });

  return imports;
}

/**
 * Extract C# using statements
 */
function extractCSharpImports(content: string): ImportStatement[] {
  const imports: ImportStatement[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // using System.Collections.Generic;
    // using static System.Math;
    const usingMatch = line.match(/^using\s+(?:static\s+)?([^\s;]+);/);
    if (usingMatch) {
      const namespace = usingMatch[1];
      imports.push({
        source: namespace,
        symbols: [namespace.split('.').pop() || namespace],
        isDefault: true,
        lineNumber: index + 1
      });
    }
  });

  return imports;
}

/**
 * Extract Go imports
 */
function extractGoImports(content: string): ImportStatement[] {
  const imports: ImportStatement[] = [];
  
  // Single import: import "fmt"
  const singleImportRegex = /import\s+"([^"]+)"/g;
  let match;
  
  while ((match = singleImportRegex.exec(content)) !== null) {
    const source = match[1];
    imports.push({
      source,
      symbols: [source.split('/').pop() || source],
      isDefault: true,
      lineNumber: content.substring(0, match.index).split('\n').length
    });
  }

  // Multi-line imports: import ( ... )
  const multiImportRegex = /import\s+\(([\s\S]*?)\)/g;
  while ((match = multiImportRegex.exec(content)) !== null) {
    const block = match[1];
    const lines = block.split('\n');
    lines.forEach(line => {
      const importMatch = line.match(/"([^"]+)"/);
      if (importMatch) {
        const source = importMatch[1];
        imports.push({
          source,
          symbols: [source.split('/').pop() || source],
          isDefault: true,
          lineNumber: content.substring(0, match.index).split('\n').length
        });
      }
    });
  }

  return imports;
}

/**
 * Extract Rust use statements
 */
function extractRustImports(content: string): ImportStatement[] {
  const imports: ImportStatement[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // use std::collections::HashMap;
    // use std::io::*;
    const useMatch = line.match(/^use\s+([^\s;]+);/);
    if (useMatch) {
      const path = useMatch[1];
      const parts = path.split('::');
      const symbol = parts[parts.length - 1];

      imports.push({
        source: path,
        symbols: [symbol],
        isDefault: symbol !== '*',
        lineNumber: index + 1
      });
    }
  });

  return imports;
}

/**
 * Extract export statements from code
 */
function extractExports(content: string, language: string): ExportStatement[] {
  const exports: ExportStatement[] = [];

  switch (language) {
    case 'javascript':
    case 'typescript':
      exports.push(...extractJSExports(content));
      break;
    case 'python':
      exports.push(...extractPythonExports(content));
      break;
    case 'java':
      exports.push(...extractJavaExports(content));
      break;
  }

  return exports;
}

/**
 * Extract JavaScript/TypeScript exports
 */
function extractJSExports(content: string): ExportStatement[] {
  const exports: ExportStatement[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // export function name()
    const funcMatch = line.match(/export\s+(?:async\s+)?function\s+(\w+)/);
    if (funcMatch) {
      exports.push({
        name: funcMatch[1],
        type: 'function',
        lineNumber: index + 1
      });
    }

    // export class Name
    const classMatch = line.match(/export\s+class\s+(\w+)/);
    if (classMatch) {
      exports.push({
        name: classMatch[1],
        type: 'class',
        lineNumber: index + 1
      });
    }

    // export const NAME =
    const constMatch = line.match(/export\s+const\s+(\w+)/);
    if (constMatch) {
      exports.push({
        name: constMatch[1],
        type: 'const',
        lineNumber: index + 1
      });
    }

    // export default
    const defaultMatch = line.match(/export\s+default/);
    if (defaultMatch) {
      exports.push({
        name: 'default',
        type: 'default',
        lineNumber: index + 1
      });
    }
  });

  return exports;
}

/**
 * Extract Python public functions/classes (exports)
 */
function extractPythonExports(content: string): ExportStatement[] {
  const exports: ExportStatement[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // def function_name( - public functions (not starting with _)
    const funcMatch = line.match(/^def\s+([a-zA-Z][a-zA-Z0-9_]*)\(/);
    if (funcMatch && !funcMatch[1].startsWith('_')) {
      exports.push({
        name: funcMatch[1],
        type: 'function',
        lineNumber: index + 1
      });
    }

    // class ClassName: - public classes
    const classMatch = line.match(/^class\s+([A-Z][a-zA-Z0-9_]*)/);
    if (classMatch) {
      exports.push({
        name: classMatch[1],
        type: 'class',
        lineNumber: index + 1
      });
    }
  });

  return exports;
}

/**
 * Extract Java public classes/methods
 */
function extractJavaExports(content: string): ExportStatement[] {
  const exports: ExportStatement[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // public class ClassName
    const classMatch = line.match(/public\s+class\s+(\w+)/);
    if (classMatch) {
      exports.push({
        name: classMatch[1],
        type: 'class',
        lineNumber: index + 1
      });
    }

    // public method
    const methodMatch = line.match(/public\s+(?:static\s+)?(?:\w+)\s+(\w+)\s*\(/);
    if (methodMatch && !classMatch) {
      exports.push({
        name: methodMatch[1],
        type: 'function',
        lineNumber: index + 1
      });
    }
  });

  return exports;
}

/**
 * Extract function names from code
 */
function extractFunctions(content: string, language: string): string[] {
  const functions: string[] = [];
  const lines = content.split('\n');

  switch (language) {
    case 'javascript':
    case 'typescript':
      lines.forEach(line => {
        // function name() or const name = () =>
        const match = line.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\()/);
        if (match) {
          functions.push(match[1] || match[2]);
        }
      });
      break;

    case 'python':
      lines.forEach(line => {
        const match = line.match(/def\s+(\w+)\(/);
        if (match) {
          functions.push(match[1]);
        }
      });
      break;

    case 'java':
      lines.forEach(line => {
        const match = line.match(/(?:public|private|protected)\s+(?:static\s+)?(?:\w+)\s+(\w+)\s*\(/);
        if (match) {
          functions.push(match[1]);
        }
      });
      break;
  }

  return functions;
}

/**
 * Extract class names from code
 */
function extractClasses(content: string, language: string): string[] {
  const classes: string[] = [];
  const lines = content.split('\n');

  lines.forEach(line => {
    const match = line.match(/class\s+(\w+)/);
    if (match) {
      classes.push(match[1]);
    }
  });

  return classes;
}

/**
 * Calculate code complexity (simplified cyclomatic complexity)
 */
function calculateComplexity(content: string, language: string): number {
  let complexity = 1; // Base complexity

  // Count decision points - word keywords
  const wordKeywords = ['if', 'else', 'while', 'for', 'case', 'catch'];
  wordKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    const matches = content.match(regex);
    if (matches) {
      complexity += matches.length;
    }
  });
  
  // Count operator decision points (no word boundaries needed)
  const operatorKeywords = ['&&', '||', '?'];
  operatorKeywords.forEach(keyword => {
    // Escape special regex characters
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    const matches = content.match(regex);
    if (matches) {
      complexity += matches.length;
    }
  });

  return complexity;
}

/**
 * Build reverse dependencies (usedBy relationships)
 */
function buildReverseDependencies(nodes: Map<string, DependencyNode>, files: CodeFile[]): void {
  const filePathMap = new Map<string, string>();
  
  // Create a map of possible file resolutions
  files.forEach(file => {
    const normalized = file.path.replace(/\\/g, '/');
    filePathMap.set(normalized, file.path);
    
    // Also store without extension for loose matching
    const withoutExt = normalized.replace(/\.(js|ts|jsx|tsx|py|java|cs|go|rs)$/, '');
    filePathMap.set(withoutExt, file.path);
  });

  // Build reverse dependencies
  nodes.forEach((node, nodePath) => {
    node.imports.forEach(imp => {
      // Try to resolve the import to an actual file
      const resolvedPath = resolveImportPath(imp.source, nodePath, filePathMap);
      
      if (resolvedPath && nodes.has(resolvedPath)) {
        const targetNode = nodes.get(resolvedPath);
        if (targetNode && !targetNode.usedBy.includes(nodePath)) {
          targetNode.usedBy.push(nodePath);
        }
      }
    });
  });
}

/**
 * Resolve import path to actual file path
 */
function resolveImportPath(
  importSource: string,
  currentFilePath: string,
  filePathMap: Map<string, string>
): string | null {
  // Skip external packages (node_modules, etc.)
  if (!importSource.startsWith('.') && !importSource.startsWith('/')) {
    return null;
  }

  const currentDir = currentFilePath.replace(/\\/g, '/').split('/').slice(0, -1).join('/');
  
  // Resolve relative path
  let resolvedPath = importSource;
  if (importSource.startsWith('.')) {
    resolvedPath = resolvePath(currentDir, importSource);
  }

  // Normalize
  resolvedPath = resolvedPath.replace(/\\/g, '/');

  // Try direct match
  if (filePathMap.has(resolvedPath)) {
    return filePathMap.get(resolvedPath) || null;
  }

  // Try with common extensions
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.cs', '.go', '.rs'];
  for (const ext of extensions) {
    const withExt = resolvedPath + ext;
    if (filePathMap.has(withExt)) {
      return filePathMap.get(withExt) || null;
    }
  }

  // Try index files
  for (const ext of extensions) {
    const indexPath = `${resolvedPath}/index${ext}`;
    if (filePathMap.has(indexPath)) {
      return filePathMap.get(indexPath) || null;
    }
  }

  return null;
}

/**
 * Resolve relative path
 */
function resolvePath(basePath: string, relativePath: string): string {
  const parts = basePath.split('/');
  const relParts = relativePath.split('/');

  relParts.forEach(part => {
    if (part === '..') {
      parts.pop();
    } else if (part !== '.') {
      parts.push(part);
    }
  });

  return parts.join('/');
}

/**
 * Get statistics about the dependency graph
 */
export function getGraphStats(nodes: Map<string, DependencyNode>) {
  const totalNodes = nodes.size;
  const totalImports = Array.from(nodes.values()).reduce((sum, node) => sum + node.imports.length, 0);
  const totalExports = Array.from(nodes.values()).reduce((sum, node) => sum + node.exports.length, 0);
  
  const languageDistribution: Record<string, number> = {};
  nodes.forEach(node => {
    languageDistribution[node.language] = (languageDistribution[node.language] || 0) + 1;
  });

  const mostConnected = Array.from(nodes.values())
    .sort((a, b) => (b.imports.length + b.usedBy.length) - (a.imports.length + a.usedBy.length))
    .slice(0, 10);

  return {
    totalNodes,
    totalImports,
    totalExports,
    languageDistribution,
    mostConnected: mostConnected.map(n => ({
      path: n.path,
      imports: n.imports.length,
      usedBy: n.usedBy.length,
      total: n.imports.length + n.usedBy.length
    }))
  };
}
