const mongoose = require('mongoose');

/**
 * Build a direct (non-SRV) connection string from the SRV connection string.
 * This bypasses the flaky SRV DNS lookup that some networks fail on with
 * `queryTxt ESERVFAIL`. Uses the resolved shard hostnames.
 */
const buildDirectURI = (srvUri) => {
  if (!srvUri || typeof srvUri !== 'string') return null;
  const m = srvUri.match(/mongodb\+srv:\/\/([^@]+)@([^/]+)\/([^?]+)/);
  if (!m) return null;
  const [, creds, , db] = m;
  // Cluster base name from first host segment
  const base = m[2].split('.').slice(1).join('.');
  const hosts = [
    `ac-1hrhsck-shard-00-00.${base}`,
    `ac-1hrhsck-shard-00-01.${base}`,
    `ac-1hrhsck-shard-00-02.${base}`,
  ];
  return `mongodb://${creds}@${hosts.join(',')}/node?ssl=true&authSource=admin&retryWrites=true&w=majority`;
};

/**
 * Connect to MongoDB Atlas with retry logic.
 * Atlas uses SRV DNS records which can intermittently fail to resolve
 * on some networks, so we add retries and a fallback to direct connection.
 */
const connectDB = async (retries = 5, delay = 4000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
console.log(`[DB] Attempt ${attempt}/${retries} connecting to MongoDB...`);
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        retryWrites: true,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`[DB] Connection attempt ${attempt} failed: ${error.message}`);
      // If SRV lookup fails, try direct connection
      if (error.message.includes('ESERVFAIL') || error.message.includes('queryTxt')) {
        const direct = buildDirectURI(process.env.MONGO_URI);
        if (direct) {
          console.log('[DB] SRV lookup failed - trying direct connection...');
          try {
            const conn = await mongoose.connect(direct, {
              serverSelectionTimeoutMS: 30000,
              retryWrites: true,
            });
            console.log(`MongoDB Connected (direct): ${conn.connection.host}`);
            return conn;
          } catch (directErr) {
            console.error(`[DB] Direct connection failed: ${directErr.message}`);
          }
        }
      }
      if (attempt === retries) {
        console.error('Failed to connect to MongoDB after all retries.');
        startBackgroundRetry();
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Background retry loop so the server stays up even if DB temporarily drops
let retrying = false;
const startBackgroundRetry = () => {
  if (retrying) return;
  retrying = true;
  console.log('[DB] Starting background reconnect loop...');
  const loop = async () => {
    try {
      if (mongoose.connection.readyState !== 1) {
        console.log('[DB] Attempting background reconnect...');
        await mongoose.connect(process.env.MONGO_URI, {
          serverSelectionTimeoutMS: 30000,
          srvMaxHosts: 3,
          srvServiceName: 'mongodb',
          retryWrites: true,
        });
        console.log('[DB] Reconnected successfully');
        retrying = false;
        return;
      }
    } catch (err) {
      console.error(`[DB] Background reconnect failed: ${err.message}`);
      const direct = buildDirectURI(process.env.MONGO_URI);
      if (direct && (err.message.includes('ESERVFAIL') || err.message.includes('queryTxt'))) {
        try {
          await mongoose.connect(direct, {
            serverSelectionTimeoutMS: 30000,
            retryWrites: true,
          });
          console.log('[DB] Reconnected (direct)');
          retrying = false;
          return;
        } catch (e) {
          console.error(`[DB] Direct reconnect failed: ${e.message}`);
        }
      }
    }
    setTimeout(loop, 8000);
  };
  loop();
};

module.exports = connectDB;
