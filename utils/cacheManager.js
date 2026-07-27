const fs = require('fs');
const path = require('path');
const doctorSchema = require('../Database/Models/Doctors.js');
const clinicSchema = require('../Database/Models/Clinics.js');
const addressesSchema = require('../Database/Models/doctorAddresses.js');
const clinicDoctorSchema = require('../Database/Models/ClinicDoctors.js');
const versionSchema = require('../Database/Models/Version.js');

const CACHE_FILE_PATH = path.join(__dirname, '..', 'data.json');
const VERSION_CHECK_COOLDOWN_MS = 5000; // 5 seconds TTL

let cachedData = null;
let lastVersionCheckTime = 0;

/**
 * Helper to get the current version document or create it if it doesn't exist.
 */
async function getDbVersion() {
  let verDoc = await versionSchema.findOne();
  if (!verDoc) {
    verDoc = new versionSchema({ version: 1 });
    await verDoc.save();
  }
  return verDoc;
}

/**
 * Regenerates the data.json cache by querying all collections from MongoDB.
 */
async function regenerateCache(targetVersion) {
  try {
    console.log(`[CacheManager] Regenerating cache for version ${targetVersion}...`);
    
    // Fetch all records concurrently for efficiency
    const [doctors, clinics, addresses, clinicDoctors] = await Promise.all([
      doctorSchema.find({}).lean(),
      clinicSchema.find({}).lean(),
      addressesSchema.find({}).lean(),
      clinicDoctorSchema.find({}).lean()
    ]);

    const dataToCache = {
      version: targetVersion,
      doctors,
      clinics,
      addresses,
      clinicDoctors
    };

    // Write to local file
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(dataToCache, null, 2), 'utf-8');
    
    // Update local in-memory cache
    cachedData = dataToCache;
    lastVersionCheckTime = Date.now();
    
    console.log(`[CacheManager] Cache successfully regenerated for version ${targetVersion}.`);
  } catch (error) {
    console.error('[CacheManager] Error regenerating cache:', error);
    throw error;
  }
}

/**
 * Initializes cache on server start.
 */
async function initializeCache() {
  try {
    console.log('[CacheManager] Initializing cache...');
    
    // 1. Fetch DB version
    const verDoc = await getDbVersion();
    const dbVersion = verDoc.version;

    // 2. Try to read from local file
    let fileData = null;
    if (fs.existsSync(CACHE_FILE_PATH)) {
      try {
        const fileContent = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
        fileData = JSON.parse(fileContent);
      } catch (err) {
        console.warn('[CacheManager] Local cache file is invalid, will regenerate.', err.message);
      }
    }

    // 3. Compare versions and load/regenerate
    if (!fileData || fileData.version !== dbVersion) {
      await regenerateCache(dbVersion);
    } else {
      cachedData = fileData;
      lastVersionCheckTime = Date.now();
      console.log(`[CacheManager] Cache loaded from disk. Version: ${cachedData.version}`);
    }
  } catch (error) {
    console.error('[CacheManager] Failed to initialize cache:', error);
  }
}

/**
 * Checks if the version has changed and returns the latest cached data.
 * Employs a 5-second TTL cooldown to avoid overloading MongoDB with version checks.
 */
async function checkAndSync() {
  const now = Date.now();
  
  // If we are within the cooldown period and have cachedData, return it immediately
  if (cachedData && (now - lastVersionCheckTime < VERSION_CHECK_COOLDOWN_MS)) {
    return cachedData;
  }

  try {
    // Check MongoDB version
    const verDoc = await getDbVersion();
    const dbVersion = verDoc.version;

    // If cache is not initialized or version has changed, regenerate it
    if (!cachedData || cachedData.version !== dbVersion) {
      await regenerateCache(dbVersion);
    } else {
      lastVersionCheckTime = now;
    }
  } catch (error) {
    console.error('[CacheManager] Error checking version / syncing cache:', error);
    // Fall back to stale cache if MongoDB query fails, to ensure resilience
    if (!cachedData) {
      throw error;
    }
  }

  return cachedData;
}

/**
 * Increments the version in MongoDB and triggers local cache regeneration.
 */
async function incrementVersion() {
  try {
    const verDoc = await getDbVersion();
    verDoc.version += 1;
    await verDoc.save();
    
    console.log(`[CacheManager] Database version incremented to ${verDoc.version}.`);
    await regenerateCache(verDoc.version);
  } catch (error) {
    console.error('[CacheManager] Error incrementing version:', error);
    throw error;
  }
}

/**
 * Gets cached data.
 */
function getCachedData() {
  if (!cachedData) {
    // If not initialized yet, try to load synchronously or return null
    if (fs.existsSync(CACHE_FILE_PATH)) {
      try {
        const fileContent = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
        cachedData = JSON.parse(fileContent);
      } catch (e) {}
    }
  }
  return cachedData;
}

module.exports = {
  initializeCache,
  checkAndSync,
  incrementVersion,
  getCachedData
};
