import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Folder,
  FileCode,
  ShieldAlert,
  Search,
  Check,
  TrendingUp,
  Info,
  ChevronRight,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface CodeFile {
  path: string;
  content: string;
  size: number;
}

interface FolderStat {
  folderPath: string;
  totalFiles: number;
  testFilesCount: number;
  sourceFilesCount: number;
  testFiles: CodeFile[];
  sourceFiles: CodeFile[];
}

interface TestingCoverageViewProps {
  files: CodeFile[];
  selectedFolder: string | null;
  setSelectedFolder: (folder: string) => void;
}

export default function TestingCoverageView({
  files,
  selectedFolder,
  setSelectedFolder
}: TestingCoverageViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Helper to check if a file is a test file
  const isTestFile = (filePath: string): boolean => {
    const lowerPath = filePath.toLowerCase();
    const fileName = filePath.split('/').pop() || '';
    const lowerName = fileName.toLowerCase();

    return (
      lowerName.includes('.test.') ||
      lowerName.includes('.spec.') ||
      lowerName.startsWith('test_') ||
      lowerName.endsWith('_test.py') ||
      lowerName.endsWith('_spec.py') ||
      lowerName.endsWith('test.java') ||
      lowerName.endsWith('tests.java') ||
      (lowerName.startsWith('test') && (lowerName.endsWith('.java') || lowerName.endsWith('.kt') || lowerName.endsWith('.ts') || lowerName.endsWith('.js'))) ||
      lowerPath.includes('/test/') ||
      lowerPath.includes('/tests/') ||
      lowerPath.includes('/spec/') ||
      lowerPath.includes('/specs/') ||
      lowerPath.includes('/__tests__/')
    );
  };

  // 2. Helper to get folder path from file path
  const getFolderPath = (filePath: string): string => {
    const parts = filePath.split('/');
    if (parts.length <= 1) return 'root';
    parts.pop(); // remove filename
    return parts.join('/');
  };

  // 3. Helper to match a source file to a test file in the codebase
  const hasMatchingTest = (sourcePath: string, allFiles: CodeFile[]): string | null => {
    const sourceName = sourcePath.split('/').pop() || '';
    const dotIdx = sourceName.lastIndexOf('.');
    const baseName = dotIdx !== -1 ? sourceName.slice(0, dotIdx) : sourceName;
    
    const match = allFiles.find(f => {
      if (!isTestFile(f.path)) return false;
      const testName = f.path.split('/').pop() || '';
      const lowerTestName = testName.toLowerCase();
      const lowerBaseName = baseName.toLowerCase();
      return lowerTestName.includes(lowerBaseName);
    });
    
    return match ? match.path.split('/').pop() || null : null;
  };

  // 4. Calculate stats per folder
  const folderStats = useMemo(() => {
    const stats: Record<string, FolderStat> = {};

    // First group everything by folder
    files.forEach((file) => {
      // Skip files that look like config files if needed, but analyze everything in project
      if (
        file.path.endsWith('.json') ||
        file.path.endsWith('.md') ||
        file.path.endsWith('.properties') && !file.path.includes('test')
      ) {
        // We still count them but they might not be source code
      }

      const folder = getFolderPath(file.path);
      if (!stats[folder]) {
        stats[folder] = {
          folderPath: folder,
          totalFiles: 0,
          testFilesCount: 0,
          sourceFilesCount: 0,
          testFiles: [],
          sourceFiles: []
        };
      }

      stats[folder].totalFiles += 1;
      if (isTestFile(file.path)) {
        stats[folder].testFilesCount += 1;
        stats[folder].testFiles.push(file);
      } else {
        stats[folder].sourceFilesCount += 1;
        stats[folder].sourceFiles.push(file);
      }
    });

    return stats;
  }, [files]);

  // Convert to array and calculate densities
  const folderDataArray = useMemo(() => {
    return (Object.values(folderStats) as FolderStat[]).map((folder) => {
      const density = folder.totalFiles > 0 
        ? Math.round((folder.testFilesCount / folder.totalFiles) * 100) 
        : 0;
      
      let rating: 'Healthy' | 'Moderate' | 'Vulnerable' | 'None' = 'None';
      if (folder.testFilesCount > 0) {
        if (density >= 35) rating = 'Healthy';
        else if (density >= 15) rating = 'Moderate';
        else rating = 'Vulnerable';
      } else {
        rating = folder.sourceFilesCount > 0 ? 'Vulnerable' : 'None';
      }

      return {
        ...folder,
        density,
        rating
      };
    }).sort((a, b) => b.density - a.density);
  }, [folderStats]);

  // Overall codebase summary metrics
  const summaryMetrics = useMemo(() => {
    let totalFiles = files.length;
    let totalTestFiles = files.filter(f => isTestFile(f.path)).length;
    let totalSourceFiles = totalFiles - totalTestFiles;
    let overallDensity = totalFiles > 0 ? Math.round((totalTestFiles / totalFiles) * 100) : 0;

    const foldersWithTests = folderDataArray.filter(f => f.testFilesCount > 0).length;
    const totalFolders = folderDataArray.length;

    // Highest density folder
    const coveredFolders = folderDataArray.filter(f => f.density > 0);
    const mostCovered = coveredFolders.length > 0 ? coveredFolders[0] : null;

    // Vulnerable folders (no tests)
    const vulnerableFolders = folderDataArray.filter(f => f.testFilesCount === 0 && f.sourceFilesCount > 0);

    return {
      totalFiles,
      totalTestFiles,
      totalSourceFiles,
      overallDensity,
      foldersWithTests,
      totalFolders,
      mostCovered,
      vulnerableFoldersCount: vulnerableFolders.length
    };
  }, [files, folderDataArray]);

  // Chart data formatted for horizontal bar chart
  const chartData = useMemo(() => {
    // Take top 8 folders to avoid clashing UI if there are too many folders
    return folderDataArray
      .slice(0, 8)
      .map((f) => ({
        name: f.folderPath,
        'Test Density (%)': f.density,
        'Tests': f.testFilesCount,
        'Sources': f.sourceFilesCount
      }));
  }, [folderDataArray]);

  const activeFolderData = selectedFolder ? folderStats[selectedFolder] : null;
  const activeFolderDensity = activeFolderData && activeFolderData.totalFiles > 0
    ? Math.round((activeFolderData.testFilesCount / activeFolderData.totalFiles) * 100)
    : 0;

  const filteredFolders = useMemo(() => {
    if (!searchQuery) return folderDataArray;
    return folderDataArray.filter(f => 
      f.folderPath.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [folderDataArray, searchQuery]);

  return (
    <div className="space-y-8 animate-fadeIn" id="testing-coverage-dashboard">
      <div>
        <h3 className="text-xl font-bold font-['Space_Grotesk'] tracking-tight text-white flex items-center space-x-2">
          <ShieldAlert className="h-5.5 w-5.5 text-emerald-400" />
          <span>Unit Testing Density & Coverage Analyzer</span>
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Scans workspace directories to map test-to-source ratios, identifying test gaps and orphan files.
        </p>
      </div>

      {/* Codebase Testing Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        <div className="bg-[#0b0c11] border border-gray-900 rounded-2xl p-5 shadow-xl space-y-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block">Overall Test Density</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-bold text-white font-['Space_Grotesk']">{summaryMetrics.overallDensity}%</span>
            <span className="text-xs text-gray-500 font-mono">ratio</span>
          </div>
          <div className="h-1.5 bg-gray-950 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                summaryMetrics.overallDensity >= 35 
                  ? 'bg-emerald-500' 
                  : summaryMetrics.overallDensity >= 15 
                    ? 'bg-amber-500' 
                    : 'bg-red-500'
              }`}
              style={{ width: `${summaryMetrics.overallDensity}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-gray-400 block pt-1">
            {summaryMetrics.overallDensity >= 35 
              ? '🟢 Robust Coverage Suite' 
              : summaryMetrics.overallDensity >= 15 
                ? '🟡 Moderate Testing Suite' 
                : '🔴 Weak Coverage Risk'}
          </span>
        </div>

        <div className="bg-[#0b0c11] border border-gray-900 rounded-2xl p-5 shadow-xl space-y-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block">Test File Metrics</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-emerald-400 font-['Space_Grotesk']">{summaryMetrics.totalTestFiles}</span>
            <span className="text-xs text-gray-500 font-mono">/ {summaryMetrics.totalFiles} total files</span>
          </div>
          <p className="text-[10.5px] text-gray-400">
            Isolated {summaryMetrics.totalSourceFiles} production execution modules.
          </p>
        </div>

        <div className="bg-[#0b0c11] border border-gray-900 rounded-2xl p-5 shadow-xl space-y-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block">Coverage Depth</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-bold text-teal-400 font-['Space_Grotesk']">
              {summaryMetrics.foldersWithTests}
            </span>
            <span className="text-xs text-gray-500 font-mono">/ {summaryMetrics.totalFolders} folders</span>
          </div>
          <p className="text-[10.5px] text-gray-400">
            {summaryMetrics.totalFolders - summaryMetrics.foldersWithTests} directory nodes completely lack unit tests.
          </p>
        </div>

        <div className="bg-[#0b0c11] border border-gray-900 rounded-2xl p-5 shadow-xl space-y-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block">Highest Coverage</span>
          <div className="truncate">
            {summaryMetrics.mostCovered ? (
              <span className="text-sm font-bold text-emerald-400 font-mono block truncate">
                {summaryMetrics.mostCovered.folderPath}
              </span>
            ) : (
              <span className="text-sm font-bold text-gray-500 font-mono block">None</span>
            )}
            <div className="flex items-center space-x-1.5 mt-1.5">
              <span className="text-xl font-bold text-white font-['Space_Grotesk']">
                {summaryMetrics.mostCovered ? `${summaryMetrics.mostCovered.density}%` : '0%'}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">density</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Test Density Bar Chart */}
        <div className="lg:col-span-7 bg-[#0b0c11] border border-gray-900 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider font-mono">Directory Test Density Chart</span>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">TESTS / TOTAL %</span>
          </div>

          {chartData.length > 0 ? (
            <div className="h-68">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#12131a" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="#525360" fontSize={10} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#525360" fontSize={9} tickLine={false} width={130} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b0c11', borderColor: '#22232a', color: '#fff', borderRadius: '12px' }}
                    cursor={{ fill: '#0e0f16' }}
                    formatter={(value: any) => [`${value}%`, 'Density']}
                  />
                  <Bar dataKey="Test Density (%)" radius={[0, 4, 4, 0]} barSize={16}>
                    {chartData.map((entry, index) => {
                      const d = entry['Test Density (%)'];
                      let fill = '#ef4444'; // vulnerable
                      if (d >= 35) fill = '#10b981'; // healthy
                      else if (d >= 15) fill = '#f59e0b'; // moderate
                      return <Cell key={`cell-${index}`} fill={fill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-68 flex flex-col items-center justify-center text-center p-6 bg-black/20 rounded-xl border border-gray-900/50">
              <FileCode className="h-10 w-10 text-gray-600 mb-2.5" />
              <h4 className="text-xs font-semibold text-gray-400">No directories found</h4>
              <p className="text-[11px] text-gray-500 mt-1 max-w-xs">
                Upload files to calculate unit test directory densities.
              </p>
            </div>
          )}
        </div>

        {/* Right: Testing Strategy Recommendations */}
        <div className="lg:col-span-5 bg-[#0b0c11] border border-gray-900 rounded-2xl p-5 shadow-xl space-y-4">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider font-mono block">Testing Remediation Strategy</span>
          
          <div className="space-y-3.5">
            {summaryMetrics.vulnerableFoldersCount > 0 && (
              <div className="p-3.5 bg-red-950/10 border border-red-950/20 rounded-xl space-y-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-red-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Uncovered Directories Risk</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  We identified <strong>{summaryMetrics.vulnerableFoldersCount} folders</strong> with 0% testing density. Critical services in these packages lack regression guards and present high maintenance risks.
                </p>
              </div>
            )}

            <div className="p-3.5 bg-gray-950 border border-gray-900 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 font-mono">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Recommended Priority Actions</span>
              </div>
              <ul className="list-disc pl-4 text-[11px] text-gray-400 space-y-1.5">
                <li>Create unit tests matching production file names inside the same folder directories.</li>
                <li>Aim for at least <strong>1 test module per 3 production files</strong> (~33% density) for secondary modules.</li>
                <li>Write assertions covering edge cases, negative outcomes, and error handling branches.</li>
              </ul>
            </div>

            <div className="p-3.5 bg-[#0e0f15] border border-gray-900/60 rounded-xl flex items-start space-x-3">
              <Info className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h5 className="text-[11px] font-bold text-gray-300">How is test density calculated?</h5>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  We evaluate the proportion of test specifications (e.g. <code>.test.ts</code>, <code>AuthControllerTest.java</code>) to overall source files within each folder node.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Browser & Test Match Audit */}
      <div className="bg-[#0b0c11] border border-gray-900 rounded-2xl p-5 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-900">
          <div>
            <h4 className="text-sm font-bold text-white">Folder-by-Folder Test Coverage Audit</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">Explore each directory's test-to-source ratio and direct test pairings.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-gray-600" />
            </div>
            <input
              type="text"
              placeholder="Filter directories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-950 border border-gray-900 hover:border-gray-800 text-xs text-gray-300 rounded-xl pl-9 pr-4 py-2 outline-none focus:border-emerald-500/20 transition-all placeholder:text-gray-600 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Folders List selection */}
          <div className="lg:col-span-5 space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredFolders.map((f) => {
              const isSelected = selectedFolder === f.folderPath;
              return (
                <button
                  key={f.folderPath}
                  onClick={() => setSelectedFolder(f.folderPath)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all border flex flex-col space-y-2 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-gray-950/50 hover:bg-gray-950 border-gray-900/80 hover:border-gray-800 text-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2 truncate">
                      <Folder className={`h-4 w-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-gray-500'}`} />
                      <span className="text-xs font-semibold truncate font-mono text-gray-200">{f.folderPath}</span>
                    </div>
                    <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full ${
                      f.rating === 'Healthy'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : f.rating === 'Moderate'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {f.rating === 'Healthy' ? 'Healthy' : f.rating === 'Moderate' ? 'Moderate' : 'Vulnerable'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between w-full text-[10px] text-gray-500 font-mono">
                    <div className="flex items-center space-x-3">
                      <span>{f.sourceFilesCount} source files</span>
                      <span>•</span>
                      <span>{f.testFilesCount} tests</span>
                    </div>
                    <span className={isSelected ? 'text-emerald-400 font-bold' : 'text-gray-400 font-bold'}>
                      {f.density}% Test Density
                    </span>
                  </div>
                </button>
              );
            })}

            {filteredFolders.length === 0 && (
              <div className="text-center py-10 text-xs text-gray-500 font-mono">
                No matching directories found.
              </div>
            )}
          </div>

          {/* Folder Details & File Pairings List */}
          <div className="lg:col-span-7 bg-black/30 border border-gray-900/60 rounded-2xl p-5 min-h-[300px] space-y-5">
            {selectedFolder && folderStats[selectedFolder] ? (
              (() => {
                const activeData = folderStats[selectedFolder];
                const density = activeFolderDensity;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-900 pb-3">
                      <div className="flex items-center space-x-2">
                        <Folder className="h-4.5 w-4.5 text-emerald-400" />
                        <h5 className="text-xs font-bold text-white font-mono">{selectedFolder}</h5>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block">Testing Density</span>
                        <span className={`text-sm font-bold font-mono ${
                          density >= 35 ? 'text-emerald-400' : density >= 15 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {density}% ({activeData.testFilesCount} tests, {activeData.sourceFilesCount} sources)
                        </span>
                      </div>
                    </div>

                    {/* Source Modules Pairings Audit */}
                    <div className="space-y-3">
                      <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Production Modules & Test Pairings</span>
                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                        {activeData.sourceFiles.map((srcFile) => {
                          const matchedTest = hasMatchingTest(srcFile.path, files);
                          return (
                            <div key={srcFile.path} className="flex items-center justify-between p-2.5 bg-gray-950/40 border border-gray-900 rounded-xl text-xs">
                              <div className="flex items-center space-x-2 truncate">
                                <FileCode className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                                <span className="font-mono text-gray-300 truncate" title={srcFile.path}>
                                  {srcFile.path.split('/').pop()}
                                </span>
                              </div>

                              <div className="flex items-center space-x-2 shrink-0">
                                {matchedTest ? (
                                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center space-x-1 font-mono">
                                    <Check className="h-3 w-3" />
                                    <span>Pairing: {matchedTest}</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center space-x-1 font-mono">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>Untested Module</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {activeData.sourceFiles.length === 0 && (
                          <div className="text-center py-6 text-xs text-gray-500 font-mono">
                            No production source files in this folder directory.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Isolated Test Modules List */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Identified Test Specifications ({activeData.testFilesCount})</span>
                      <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                        {activeData.testFiles.map((testFile) => (
                          <div key={testFile.path} className="flex items-center justify-between p-2.5 bg-[#0b0c11] border border-gray-900 rounded-xl text-xs font-mono">
                            <div className="flex items-center space-x-2 truncate">
                              <ShieldAlert className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              <span className="text-emerald-400 truncate" title={testFile.path}>
                                {testFile.path.split('/').pop()}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-500 shrink-0">{(testFile.size / 1024).toFixed(2)} KB</span>
                          </div>
                        ))}

                        {activeData.testFiles.length === 0 && (
                          <div className="text-center py-6 text-xs text-gray-500 font-mono">
                            No test specifications detected in this folder.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-6 font-mono">
                <HelpCircle className="h-8 w-8 text-gray-700 mb-2" />
                <span className="text-xs">Select an active directory folder to inspect its file testing status.</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
