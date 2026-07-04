# Database & Data Architecture Document
## CodeInsight AI - Enterprise AI Software Engineering Inspector
**Version**: 1.0  

---

## 1. Storage Strategy & Technologies
CodeInsight AI leverages a hybrid data model designed for speed, flexibility, and semantic depth:
- **MongoDB (Primary Document Store)**: Ideal for storing hierarchical project folder structures, multi-layered agent diagnostic files, active sprint lists, and historic score histories.
- **ChromaDB (Vector Similarity Store)**: Used to index source code function definitions and imports. Enables rapid Cosine and L2 distance similarity queries for contextual RAG retrieval.
- **Local Sandbox (Ephemeral Disk Store)**: Ephemeral scratch space used during the secure extraction and deterministic parsing of uploaded ZIP files.

---

## 2. MongoDB Collection Schema Layouts

### 2.1 Projects Collection
Stores core metadata about analyzed code repositories.
```json
{
  "_id": "ObjectId",
  "name": "string",
  "ownerId": "string",
  "repositoryUrl": "string",
  "createdAt": "ISODate"
}
```

### 2.2 Scans Collection
Maintains the health scores, folder analysis results, and consolidated reports of every execution.
```json
{
  "_id": "ObjectId",
  "projectId": "ObjectId",
  "status": "string (running | completed | failed)",
  "overallScore": "number",
  "isAiDegraded": "boolean",
  "metrics": {
    "totalFiles": "number",
    "totalFolders": "number",
    "totalLines": "number"
  },
  "agentsReport": "AgentsReportJSON",
  "createdAt": "ISODate"
}
```

### 2.3 Issues Collection
Tracks granular findings across different files.
```json
{
  "_id": "ObjectId",
  "scanId": "ObjectId",
  "filePath": "string",
  "line": "number",
  "severity": "string (critical | high | medium | low)",
  "category": "string (security | performance | maintainability | testing)",
  "message": "string",
  "businessImpact": "string",
  "remediation": "string"
}
```

---

## 3. ChromaDB Vector Architecture
Code fragments are mapped to a high-density vector space.
- **Embedding Dimensions**: 768 or 1024 (using Gemini text-embedding-004 model).
- **Metadata Filters**: Chunks are indexed with `projectId`, `scanId`, `filePath`, and `chunkType` keys to support hybrid pre-filtering (filtering by folder name before executing cosine search).
