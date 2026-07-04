/**
 * MongoDB Database Configuration and Connection
 * Stores scan history, user data, and analysis results
 */

import { MongoClient, Db, Collection } from 'mongodb';

// MongoDB connection URL (from environment variable or default to local)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'codedocai';

let client: MongoClient | null = null;
let db: Db | null = null;

// Interface for Scan History document
export interface ScanHistoryDocument {
  _id?: string;
  projectName: string;
  timestamp: Date;
  overallScore: number;
  totalFiles: number;
  totalLines: number;
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  metrics: any;
  agentsReport: any;
  knowledgeGraph?: any;
  userId?: string;
  tags?: string[];
}

// Interface for User document
export interface UserDocument {
  _id?: string;
  email: string;
  name: string;
  createdAt: Date;
  lastLogin: Date;
  totalScans: number;
  apiKey?: string;
}

/**
 * Connect to MongoDB
 */
export async function connectDB(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    console.log('[Database] Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    db = client.db(DB_NAME);
    console.log(`[Database] Connected to MongoDB: ${DB_NAME}`);
    
    // Create indexes for better query performance
    await createIndexes(db);
    
    return db;
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error);
    // Continue without database (graceful degradation)
    return null as any;
  }
}

/**
 * Create database indexes
 */
async function createIndexes(database: Db) {
  try {
    const scanHistory = database.collection('scanHistory');
    await scanHistory.createIndex({ timestamp: -1 });
    await scanHistory.createIndex({ projectName: 1 });
    await scanHistory.createIndex({ overallScore: -1 });
    
    console.log('[Database] Indexes created successfully');
  } catch (error) {
    console.error('[Database] Error creating indexes:', error);
  }
}

/**
 * Save scan result to database
 */
export async function saveScanHistory(data: ScanHistoryDocument): Promise<string | null> {
  try {
    const database = await connectDB();
    if (!database) {
      console.warn('[Database] DB not available, skipping save');
      return null;
    }
    
    const collection: Collection<ScanHistoryDocument> = database.collection('scanHistory');
    
    const document: ScanHistoryDocument = {
      ...data,
      timestamp: new Date()
    };
    
    const result = await collection.insertOne(document as any);
    console.log(`[Database] Scan history saved with ID: ${result.insertedId}`);
    
    return result.insertedId.toString();
  } catch (error) {
    console.error('[Database] Error saving scan history:', error);
    return null;
  }
}

/**
 * Get recent scan history
 */
export async function getRecentScans(limit: number = 10): Promise<ScanHistoryDocument[]> {
  try {
    const database = await connectDB();
    if (!database) return [];
    
    const collection: Collection<ScanHistoryDocument> = database.collection('scanHistory');
    
    const scans = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
    
    return scans as ScanHistoryDocument[];
  } catch (error) {
    console.error('[Database] Error fetching scan history:', error);
    return [];
  }
}

/**
 * Get scan by ID
 */
export async function getScanById(scanId: string): Promise<ScanHistoryDocument | null> {
  try {
    const database = await connectDB();
    if (!database) return null;
    
    const collection: Collection<ScanHistoryDocument> = database.collection('scanHistory');
    const { ObjectId } = await import('mongodb');
    
    const scan = await collection.findOne({ _id: new ObjectId(scanId) } as any);
    return scan as ScanHistoryDocument | null;
  } catch (error) {
    console.error('[Database] Error fetching scan by ID:', error);
    return null;
  }
}

/**
 * Get statistics
 */
export async function getStatistics() {
  try {
    const database = await connectDB();
    if (!database) return null;
    
    const collection: Collection<ScanHistoryDocument> = database.collection('scanHistory');
    
    const stats = await collection.aggregate([
      {
        $group: {
          _id: null,
          totalScans: { $sum: 1 },
          avgScore: { $avg: '$overallScore' },
          totalIssuesFound: { $sum: '$totalIssues' },
          totalFilesAnalyzed: { $sum: '$totalFiles' }
        }
      }
    ]).toArray();
    
    return stats[0] || {
      totalScans: 0,
      avgScore: 0,
      totalIssuesFound: 0,
      totalFilesAnalyzed: 0
    };
  } catch (error) {
    console.error('[Database] Error fetching statistics:', error);
    return null;
  }
}

/**
 * Close database connection
 */
export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('[Database] Connection closed');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});
