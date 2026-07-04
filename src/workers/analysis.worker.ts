// Web Worker for file parsing and static code analysis
// Moves heavy computations off the main thread to keep UI completely responsive

interface CodeFile {
  path: string;
  content: string;
  size: number;
}

interface Issue {
  path: string;
  line: number;
  type: 'security' | 'performance' | 'maintainability' | 'bugs' | 'testing';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  code: string;
  suggestedFix: string;
  explanation: string;
  businessImpact: string;
  solutions: Array<{
    title: string;
    code: string;
    description: string;
    tradeOffs: string;
  }>;
  educationalInsight: string;
}

interface MetricReport {
  totalFiles: number;
  totalFolders: number;
  totalLines: number;
  languageCounts: Record<string, number>;
  folderMetrics: Record<string, { files: number; lines: number; errors: number }>;
  localIssues: Issue[];
}

self.onmessage = function (e: MessageEvent) {
  const { files } = e.data as { files: CodeFile[] };

  if (!files || !Array.isArray(files)) {
    self.postMessage({ type: 'error', error: 'Invalid or missing files list.' });
    return;
  }

  let totalLines = 0;
  const languageCounts: Record<string, number> = {};
  const folderMetrics: Record<string, { files: number; lines: number; errors: number }> = {};
  const localIssues: Issue[] = [];
  const foldersSet = new Set<string>();

  const totalFiles = files.length;

  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    const normalizedPath = file.path.replace(/\\/g, '/');
    const parts = normalizedPath.split('/');

    // Track directories
    for (let j = 1; j < parts.length; j++) {
      foldersSet.add(parts.slice(0, j).join('/'));
    }

    const folderKey = parts.length > 1 ? parts.slice(0, -1).join('/') : 'root';
    if (!folderMetrics[folderKey]) {
      folderMetrics[folderKey] = { files: 0, lines: 0, errors: 0 };
    }

    // Language identification
    const extParts = file.path.split('.');
    const ext = extParts.length > 1 ? extParts[extParts.length - 1].toLowerCase() : 'text';
    languageCounts[ext] = (languageCounts[ext] || 0) + 1;

    const lines = file.content.split(/\r?\n/);
    totalLines += lines.length;

    folderMetrics[folderKey].files += 1;
    folderMetrics[folderKey].lines += lines.length;

    // Report granular file parsing progress periodically to keep UI moving smoothly
    if (i % 5 === 0 || i === totalFiles - 1) {
      self.postMessage({
        type: 'progress',
        data: {
          index: i + 1,
          total: totalFiles,
          filename: file.path,
          percent: Math.round(((i + 1) / totalFiles) * 100),
          statusText: `Parsing [${i + 1}/${totalFiles}]: ${file.path}`
        }
      });
    }

    // Run line-by-line static analysis checks
    lines.forEach((lineText, index) => {
      const lineNum = index + 1;
      const cleanLine = lineText.trim();

      // 1. Security Check: Hardcoded credentials/keys
      if (
        /api_?key|secret|password|passwd|private_?key|token|jwt_?secret|aws_?key/i.test(cleanLine) &&
        /['"`][a-zA-Z0-9_\-\.\/]{10,}['"`]/.test(cleanLine) &&
        !/process\.env|config|import|from/i.test(cleanLine)
      ) {
        localIssues.push({
          path: normalizedPath,
          line: lineNum,
          type: 'security',
          severity: 'critical',
          message: 'Potential hardcoded API key, token, or secret credentials detected.',
          code: cleanLine,
          suggestedFix: 'Extract this value to an environment variable and load it securely using process.env or configuration files.',
          explanation: 'Hardcoding cryptographic keys, database passwords, or third-party service tokens directly in source control exposes credentials to anyone with read access to the repository, including compromised CI/CD systems, internal staff, or public scrapers.',
          businessImpact: 'If leaked, attackers can hijack critical third-party resources (e.g., Stripe, AWS, Twilio), resulting in unlimited resource theft, data breaches, service termination, regulatory penalties (e.g., GDPR/CCPA), and substantial financial damage.',
          solutions: [
            {
              title: 'Environment Variables (.env)',
              code: 'const apiKey = process.env.STRIPE_SECRET_KEY || "";',
              description: 'Load secrets dynamically at runtime from secure environment variables.',
              tradeOffs: 'Simple and robust, but variables must be manually or programmatically injected into the host environment or container runtime.'
            },
            {
              title: 'Cloud Secret Managers (e.g., GCP Secret Manager)',
              code: 'import { SecretManagerServiceClient } from "@google-cloud/secret-manager";\nconst client = new SecretManagerServiceClient();\nconst [version] = await client.accessSecretVersion({ name: "projects/my-project/secrets/stripe-key/versions/latest" });\nconst apiKey = version.payload.data.toString();',
              description: 'Retrieve secrets programmatically from a managed cloud vault.',
              tradeOffs: 'Highest security, fine-grained access audits, but introduces network latency on startup and requires cloud SDK setup.'
            }
          ],
          educationalInsight: 'Secrets belong outside of code. This principle is codified in the Twelve-Factor App methodology (Config chapter). Code repositories are meant for logic, while configuration and secrets are environment-dependent artifacts that should be injected at the execution boundary.'
        });
        folderMetrics[folderKey].errors += 1;
      }

      // 2. Security Check: Raw SQL injection
      if (
        /select\s+.*\s+from\s+/i.test(cleanLine) &&
        /(\+\s*[a-zA-Z0-9_]+|\$\{[a-zA-Z0-9_]+\})/i.test(cleanLine) &&
        !/placeholder|param/i.test(cleanLine)
      ) {
        localIssues.push({
          path: normalizedPath,
          line: lineNum,
          type: 'security',
          severity: 'high',
          message: 'Potential raw SQL Injection vulnerability due to dynamic string concatenation in query.',
          code: cleanLine,
          suggestedFix: 'Use parameterized queries or prepared statements instead of dynamic SQL string formatting.',
          explanation: 'Constructing database queries using direct string concatenation allows unsanitized user inputs to alter the syntax of the SQL command, giving attackers the ability to execute unauthorized statements directly against your relational backend.',
          businessImpact: 'Enables arbitrary database access, leading to complete data exfiltration (PII leakage), table drops (data loss), unauthorized administrative modifications, and severe reputational and compliance liabilities.',
          solutions: [
            {
              title: 'Parameterized Queries (Prepared Statements)',
              code: 'const query = "SELECT * FROM users WHERE email = $1";\nconst results = await db.query(query, [userEmail]);',
              description: 'Keep code instructions and data inputs strictly separate by sending parameters separately to the database engine.',
              tradeOffs: 'Extremely secure, highly optimized via database-level query plan caching, but requires rewriting raw concatenated string queries.'
            },
            {
              title: 'Using Type-Safe ORMs (e.g., Drizzle or Prisma)',
              code: 'const user = await db.select().from(users).where(eq(users.email, userEmail));',
              description: 'Employ an Object-Relational Mapper that automatically parameterizes query arguments and provides compile-time type checking.',
              tradeOffs: 'Highest safety and developer productivity, auto-escaped inputs, but adds a library abstraction layer and slight query construction overhead.'
            }
          ],
          educationalInsight: 'SQL Injection occurs because the SQL parser cannot distinguish between code commands (like SELECT, WHERE, OR) and user input unless they are passed through separate channels. Parameterization tells the SQL engine to treat input strictly as literal values rather than executable query tokens.'
        });
        folderMetrics[folderKey].errors += 1;
      }

      // 3. Security Check: Insecure localStorage usage
      if (/localStorage\.setItem\((['"`])(token|auth|password|jwt|session)/i.test(cleanLine)) {
        localIssues.push({
          path: normalizedPath,
          line: lineNum,
          type: 'security',
          severity: 'medium',
          message: 'Storing sensitive authentication or session tokens in localStorage is prone to XSS attacks.',
          code: cleanLine,
          suggestedFix: 'Use secure HttpOnly, SameSite cookies to manage and persist session information.',
          explanation: 'Web browsers expose standard localStorage APIs directly to any JavaScript running on the page. Storing sensitive state, such as raw JSON Web Tokens (JWT) or user passwords, leaves them highly vulnerable to theft via Cross-Site Scripting (XSS) attacks.',
          businessImpact: 'If an attacker executes a malicious script (e.g., through a compromised NPM package, CDN, or third-party tracking pixel), they can read the localStorage contents instantly, hijack active user sessions, steal identities, and perform fraudulent actions on behalf of customers.',
          solutions: [
            {
              title: 'Secure HttpOnly SameSite Cookies',
              code: 'res.cookie("token", jwtToken, { httpOnly: true, secure: true, sameSite: "strict" });',
              description: 'Store the token in a cookie configured with the HttpOnly flag, which prevents any client-side JavaScript from accessing it.',
              tradeOffs: 'Highly secure against client-side script theft, but requires server-side cookie management and careful handling of Cross-Origin Resource Sharing (CORS) configurations.'
            },
            {
              title: 'Short-Lived Memory State + Silent Refresh',
              code: 'const [accessToken, setAccessToken] = useState(null);\n// Retrieve via secure refresh token cookie on mount',
              description: 'Keep the access token solely in memory while storing a refresh token in a highly restricted, secure HttpOnly cookie.',
              tradeOffs: 'Ensures tokens vanish on browser reload/tab close, safe from XSS, but introduces extra handshake logic to obtain new tokens silently.'
            }
          ],
          educationalInsight: 'The browser\'s security boundary separates script execution from cookie payloads using flags like HttpOnly and Secure. When a cookie is HttpOnly, browser APIs like document.cookie cannot read or write to it, meaning malicious scripts injected via XSS cannot access your session tokens.'
        });
        folderMetrics[folderKey].errors += 1;
      }

      // 4. Performance Check: Nested loops
      if (/(for|while)\s*\(.*\)\s*{/.test(cleanLine)) {
        const lookAheadRange = lines.slice(index + 1, index + 4);
        lookAheadRange.forEach((subLine) => {
          if (/(for|while|forEach|map)\s*\(.*\)\s*{/.test(subLine) || /\.[map|forEach]\(/.test(subLine)) {
            localIssues.push({
              path: normalizedPath,
              line: lineNum,
              type: 'performance',
              severity: 'medium',
              message: 'Nested loops detected. This can lead to O(n²) time complexity bottleneck.',
              code: `${cleanLine} \n  --> nested loop: ${subLine.trim()}`,
              suggestedFix: 'Optimize with a hash-map or set to reduce loop lookups from O(n²) to O(1) space-time overhead.',
              explanation: 'Utilizing nested iterations over collection arrays (e.g., nested for loops or forEach within map) results in quadratic O(N²) time complexity. As the input data size grows, the execution time scales exponentially.',
              businessImpact: 'Causes severe CPU bottlenecks on the backend or main-thread rendering freezes on the frontend. This translates directly to sluggish user interfaces, high infrastructure compute bills, request timeouts, and poor user conversion.',
              solutions: [
                {
                  title: 'Hash-Map Lookup (O(N) Complexity)',
                  code: 'const userMap = new Map(users.map(u => [u.id, u]));\nconst matchedData = orders.map(order => ({\n  ...order,\n  user: userMap.get(order.userId)\n}));',
                  description: 'Convert the lookup collection into a Map or Hash Set, changing the lookup complexity from O(N) to O(1) constant time.',
                  tradeOffs: 'Drastically reduces execution time from seconds to milliseconds, but requires O(N) auxiliary space to store the map.'
                },
                {
                  title: 'Database Join Resolution',
                  code: 'SELECT orders.*, users.* FROM orders INNER JOIN users ON orders.userId = users.id;',
                  description: 'Delegate relational correlations directly to the database layer, which uses optimized index trees and hash-joins.',
                  tradeOffs: 'Minimizes memory usage and network overhead, but relies heavily on appropriate database index designs.'
                }
              ],
              educationalInsight: 'Big O notation measures the scalability of an algorithm\'s runtime relative to input size. An O(N²) algorithm with 10,000 items requires up to 100 million operations, whereas an O(N) algorithm takes only 10,000 operations. Choosing appropriate data structures like hash tables (constant-time lookup) is key to writing high-performance code.'
            });
            folderMetrics[folderKey].errors += 1;
          }
        });
      }

      // 5. Performance Check: Sync operations
      if (/(readFileSync|writeFileSync|execSync|spawnSync)/.test(cleanLine)) {
        localIssues.push({
          path: normalizedPath,
          line: lineNum,
          type: 'performance',
          severity: 'high',
          message: 'Blocking synchronous file or shell execution detected in async environment.',
          code: cleanLine,
          suggestedFix: 'Use the non-blocking asynchronous alternative (e.g., promises or callbacks) to keep the execution loop responsive.',
          explanation: 'Synchronous operations like fs.readFileSync run blockingly, freezing the entire Node.js single-threaded event loop. No other incoming requests or asynchronous operations can execute until the blocking synchronous call returns.',
          businessImpact: 'Drastically limits API server throughput. Under minimal user load, response times spike exponentially, causing high latency, gateway timeout errors (504), failed request attempts, and overall service unreliability.',
          solutions: [
            {
              title: 'Promise-based Asynchronous File System',
              code: 'import { promises as fs } from "fs";\nconst data = await fs.readFile(filePath, "utf-8");',
              description: 'Use non-blocking asynchronous APIs that delegate the heavy input-output operation to thread pools, returning execution context back to the event loop.',
              tradeOffs: 'Excellent throughput and non-blocking scalability, but requires asynchronous control flow mechanisms (async/await or .then()).'
            },
            {
              title: 'Read Stream Processing',
              code: 'import fs from "fs";\nconst stream = fs.createReadStream(filePath);\nstream.pipe(res);',
              description: 'Stream data in small chunks instead of loading the entire file into memory at once.',
              tradeOffs: 'Extremely low memory footprint, ideal for large files, but requires managing stream event cycles.'
            }
          ],
          educationalInsight: 'Node.js utilizes a Single-Threaded Event Loop architecture. Heavy computations or synchronous file I/O block this loop entirely. Using asynchronous functions allows the runtime to offload file system operations to Node\'s internal libuv C++ thread pool, letting the JavaScript thread continue serving other incoming connections.'
        });
        folderMetrics[folderKey].errors += 1;
      }

      // 6. Maintainability Check: Console.log clutter
      if (/console\.log\(/.test(cleanLine) && !/console\.(error|warn|info)/.test(cleanLine) && index % 15 === 0) {
        if (localIssues.filter(i => i.path === normalizedPath && i.type === 'maintainability').length < 3) {
          localIssues.push({
            path: normalizedPath,
            line: lineNum,
            type: 'maintainability',
            severity: 'low',
            message: 'Active console.log debugging statement left in codebase.',
            code: cleanLine,
            suggestedFix: 'Remove console logs before deployment or use a robust logging framework with customizable logging levels.',
            explanation: 'Frequent logging to standard output using unmonitored console.log statements adds unnecessary clutter, slows down console runtimes, and may inadvertently write sensitive internal application state or data to system log files.',
            businessImpact: 'Exposes sensitive user data or system paths in server logs (breaching compliance like SOC2). It also increases cloud logging costs (data ingestion limits) and pollutes log streams, making debugging real issues much harder.',
            solutions: [
              {
                title: 'Structured Logging Library (e.g., Winston or Pino)',
                code: 'import pino from "pino";\nconst logger = pino();\nlogger.info({ userId }, "User login processed");',
                description: 'Deploy a highly performant logging framework that outputs structured JSON records and supports log levels.',
                tradeOffs: 'Produces machine-readable log records that integrate cleanly with Elastic, Datadog, or GCP logging, but introduces minor library setup.'
              },
              {
                title: 'Dynamic Environment Logger Guards',
                code: 'const debugLog = (msg) => { if (process.env.NODE_ENV !== "production") console.log(msg); };',
                description: 'Create a tiny custom wrapper that disables logs in live production environments.',
                tradeOffs: 'Zero-dependency and extremely simple, but lacks robust features like transport configurations or file rotation.'
              }
            ],
            educationalInsight: 'Structured logging in JSON format is standard for production container platforms (like Kubernetes or Cloud Run). Structured logs let you search, query, and trigger automated alerts based on fields like { level: "error" } rather than reading raw text streams.'
          });
          folderMetrics[folderKey].errors += 1;
        }
      }

      // 7. Maintainability Check: dangerous eval()
      if (/eval\s*\(/.test(cleanLine)) {
        localIssues.push({
          path: normalizedPath,
          line: lineNum,
          type: 'maintainability',
          severity: 'critical',
          message: 'Dangerous usage of the eval() function.',
          code: cleanLine,
          suggestedFix: 'Refactor code to avoid eval(), using explicit object mapping, standard JSON parsing, or standard callbacks.',
          explanation: 'The eval() function compiles and runs raw string inputs as actual JavaScript commands. Any input passed into eval() has unrestricted, direct access to the application context, local variables, and global scopes.',
          businessImpact: 'If any user input flows into an eval() call, it creates a severe Remote Code Execution (RCE) vulnerability. Attackers can execute arbitrary terminal command scripts, steal data, or crash your service completely.',
          solutions: [
            {
              title: 'Explicit Object Mapping',
              code: 'const actionMap = {\n  sum: (a, b) => a + b,\n  diff: (a, b) => a - b\n};\nconst result = actionMap[dynamicAction]?.(x, y);',
              description: 'Map dynamic strings directly to predefined safe function references or dictionaries instead of executing string commands.',
              tradeOffs: 'Completely safe, highly readable, and maintainable, but requires pre-declaring allowed command keys.'
            },
            {
              title: 'Standard JSON Parser',
              code: 'const parsedData = JSON.parse(safeJsonString);',
              description: 'Parse structured string inputs using standard Web standard algorithms like JSON.parse which only evaluate data format.',
              tradeOffs: 'Native and safe, but only parses raw data structures, not executable logical statements.'
            }
          ],
          educationalInsight: 'Using eval() prevents the JavaScript engine from optimizing your code, as the runtime engine cannot pre-compile lexical scopes. More importantly, it bypasses Content Security Policies (CSP) and opens a direct vector for script injection, representing one of the highest security risks in web software.'
        });
        folderMetrics[folderKey].errors += 1;
      }
    });
  }

  const result: MetricReport = {
    totalFiles,
    totalFolders: foldersSet.size || 1,
    totalLines,
    languageCounts,
    folderMetrics,
    localIssues
  };

  self.postMessage({ type: 'complete', data: result });
};
