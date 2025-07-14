const axios = require('axios');
const { MongoClient } = require('mongodb');

// Only accepting these stacks for now
const STACK_TYPES = ['backend', 'frontend'];
const LOG_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const BACKEND_MODULES = [
  'cache', 'controller', 'cron_job', 'db', 'domain', 
  'handler', 'repository', 'route', 'service'
];

class LoggingMiddleware {
  constructor(apiUrl, authToken, mongoUri, dbName = 'logs') {
    if (!apiUrl) throw new Error('Missing logging API URL');
    if (!mongoUri) throw new Error('MongoDB URI not provided');

    this.apiUrl = apiUrl;
    this.authToken = authToken;
    this.mongoUri = mongoUri;
    this.dbName = dbName;

    this.client = new MongoClient(this.mongoUri);
    this.db = null;
    this.logCollection = null;

    // Lazy init for DB
    this._connectToDb();
  }

  async _connectToDb() {
    try {
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.logCollection = this.db.collection('application_logs');

      // Indexes to improve queries (might tweak later)
      await this.logCollection.createIndex({ level: 1 });
      await this.logCollection.createIndex({ package: 1 });
      await this.logCollection.createIndex({ timestamp: -1 });

      console.log('MongoDB connection established for logging');
    } catch (err) {
      console.error('Could not connect to MongoDB:', err);  // might want to rethrow?
    }
  }

  _checkParams(stack, level, pkg) {
    if (!STACK_TYPES.includes(stack)) {
      console.error(`Bad stack: ${stack}. Valid values: ${STACK_TYPES.join(', ')}`);
      return false;
    }

    if (!LOG_LEVELS.includes(level)) {
      console.error(`Invalid log level "${level}". Use: ${LOG_LEVELS.join(', ')}`);
      return false;
    }

    // Only care about this if backend
    if (stack === 'backend' && !BACKEND_MODULES.includes(pkg)) {
      console.error(`Backend package "${pkg}" not recognized. Try one of: ${BACKEND_MODULES.join(', ')}`);
      return false;
    }

    return true;
  }

  async _postLog(stack, level, pkg, message) {
    try {
      const payload = {
        stack,
        level,
        package: pkg,
        message
      };

      const res = await axios.post(this.apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });

      return res.data;
    } catch (err) {
      console.error('Remote log failed:', err.message);
      return null;
    }
  }

  async _saveLogToDb(logEntryData) {
    if (!this.logCollection) {
      console.warn('DB not ready, skipping local save');
      return;
    }

    try {
      await this.logCollection.insertOne(logEntryData);
    } catch (err) {
      console.error('Mongo insert failed:', err.message);
    }
  }

  async log(stack, level, pkg, message, extra = {}) {
    // Normalizing
    if (stack) stack = stack.toLowerCase();
    if (level) level = level.toLowerCase();
    if (pkg) pkg = pkg.toLowerCase();

    // A little redundant but clear
    if (!this._checkParams(stack, level, pkg)) return;

    if (!message || typeof message !== 'string') {
      console.error('Missing or bad log message');
      return;
    }

    const timestamp = new Date();

    const entry = {
      stack,
      level,
      package: pkg,
      message,
      timestamp,
      ...extra
    };

    // Print to console — might want to toggle this later
    console.log(`[${timestamp.toISOString()}] [${level.toUpperCase()}] [${pkg}] ${message}`);

    // Local storage
    await this._saveLogToDb(entry);

    // Remote send (non-blocking)
    this._postLog(stack, level, pkg, message)
      .catch(e => {
        // TODO: Maybe retry? For now, just log and move on
        console.error('Remote log post failed in background:', e);
      });
  }

  async getLogs(filter = {}, options = {}) {
    if (!this.logCollection) {
      throw new Error('Log collection not initialized yet');
    }

    try {
      const logs = await this.logCollection
        .find(filter)
        .sort(options.sort || { timestamp: -1 })
        .limit(options.limit || 100)
        .toArray();

      return logs;
    } catch (err) {
      console.error('Fetching logs blew up:', err);
      throw err;
    }
  }

  async close() {
    try {
      await this.client.close();
      console.log('Logging DB connection closed cleanly');
    } catch (err) {
      console.error('Error during DB shutdown:', err);
    }
  }
}

module.exports = LoggingMiddleware;

