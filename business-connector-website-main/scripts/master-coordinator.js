#!/usr/bin/env node

/**
 * MASTER COORDINATOR - Orchestrates Worker Processes
 * 
 * Splits cities/ZIPs across workers
 * Monitors progress and health
 * Aggregates results
 * Handles retries
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

// Configuration
const WORKER_COUNT = parseInt(process.env.WORKER_COUNT || '4');
const CITIES = [
  { city: 'Tampa', state: 'FL', zips: ['33602', '33603', '33604', '33605', '33606', '33607', '33609', '33610', '33611', '33612', '33613', '33614', '33615', '33616', '33617', '33618', '33619', '33620', '33621', '33622'] },
  { city: 'Orlando', state: 'FL', zips: ['32801', '32802', '32803', '32804', '32805', '32806', '32807', '32808', '32809', '32810', '32811', '32812', '32814', '32815', '32816', '32817', '32818', '32819', '32820', '32821'] },
  { city: 'Miami', state: 'FL', zips: ['33101', '33102', '33103', '33104', '33105', '33106', '33107', '33109', '33110', '33111', '33112', '33113', '33114', '33115', '33116', '33117', '33118', '33119', '33120', '33121'] },
  { city: 'Jacksonville', state: 'FL', zips: ['32099', '32202', '32203', '32204', '32205', '32206', '32207', '32208', '32209', '32210', '32211', '32212', '32213', '32214', '32215', '32216', '32217', '32218', '32219', '32220'] },
  { city: 'Fort Lauderdale', state: 'FL', zips: ['33301', '33302', '33303', '33304', '33305', '33306', '33307', '33308', '33309', '33310', '33311', '33312', '33313', '33314', '33315', '33316', '33317', '33318', '33319', '33320'] },
  { city: 'Sarasota', state: 'FL', zips: ['34230', '34231', '34232', '34233', '34234', '34235', '34236', '34237', '34238', '34239', '34240', '34241', '34242', '34243', '34244', '34245', '34246', '34247', '34248', '34249'] },
  { city: 'Fort Myers', state: 'FL', zips: ['33901', '33902', '33903', '33904', '33905', '33906', '33907', '33908', '33909', '33910', '33911', '33912', '33913', '33914', '33915', '33916', '33917', '33918', '33919', '33920'] },
  { city: 'Naples', state: 'FL', zips: ['34102', '34103', '34104', '34105', '34106', '34107', '34108', '34109', '34110', '34111', '34112', '34113', '34114', '34115', '34116', '34117', '34118', '34119', '34120', '34121'] },
];

const APIS = ['realty_in_us', 'zillow'];

// Statistics
const globalStats = {
  workersStarted: 0,
  workersCompleted: 0,
  workersFailed: 0,
  totalPropertiesFound: 0,
  totalPropertiesUploaded: 0,
  totalDuplicates: 0,
  totalErrors: 0,
};

// Split work across workers
function distributeWork() {
  const workers = [];
  const citiesPerWorker = Math.ceil(CITIES.length / WORKER_COUNT);
  
  for (let i = 0; i < WORKER_COUNT; i++) {
    const startIdx = i * citiesPerWorker;
    const endIdx = Math.min(startIdx + citiesPerWorker, CITIES.length);
    const assignedCities = CITIES.slice(startIdx, endIdx);
    
    if (assignedCities.length === 0) continue;
    
    const zipCount = assignedCities.reduce((sum, c) => sum + c.zips.length, 0);
    const api = APIS[i % APIS.length]; // Alternate between APIs
    
    workers.push({
      id: i + 1,
      name: `Worker-${i + 1}`,
      cities: assignedCities,
      zipCount: zipCount,
      api: api,
    });
  }
  
  return workers;
}

// Spawn worker process
function spawnWorker(workerConfig) {
  return new Promise((resolve, reject) => {
    const configFile = `/tmp/worker-${workerConfig.id}.json`;
    fs.writeFileSync(configFile, JSON.stringify(workerConfig, null, 2));
    
    logger.info(`🚀 Starting ${workerConfig.name}`);
    globalStats.workersStarted++;
    
    const worker = spawn('node', [
      path.join(__dirname, 'worker-scraper.js'),
      configFile
    ], {
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    worker.on('close', (code) => {
      fs.unlinkSync(configFile);
      
      if (code === 0) {
        logger.info(`✅ ${workerConfig.name} completed successfully`);
        globalStats.workersCompleted++;
        resolve();
      } else {
        logger.error(`❌ ${workerConfig.name} failed with code ${code}`);
        globalStats.workersFailed++;
        reject(new Error(`Worker ${workerConfig.id} failed`));
      }
    });
    
    worker.on('error', (error) => {
      logger.error(`❌ ${workerConfig.name} error: ${error.message}`);
      globalStats.workersFailed++;
      reject(error);
    });
  });
}

// Main coordinator
async function main() {
  logger.info('🎯 MASTER COORDINATOR STARTED');
  logger.info(`   Workers: ${WORKER_COUNT}`);
  logger.info(`   Cities: ${CITIES.length}`);
  logger.info(`   APIs: ${APIS.join(', ')}`);
  logger.info('');
  
  const startTime = Date.now();
  
  // Distribute work
  const workers = distributeWork();
  logger.info(`📊 Work Distribution:`);
  workers.forEach(w => {
    logger.info(`   ${w.name}: ${w.cities.length} cities, ${w.zipCount} ZIPs, API: ${w.api}`);
  });
  logger.info('');
  
  // Run workers in parallel
  const workerPromises = workers.map(w => spawnWorker(w));
  
  try {
    await Promise.all(workerPromises);
  } catch (error) {
    logger.error(`⚠️  Some workers failed: ${error.message}`);
  }
  
  const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  
  logger.info('');
  logger.info('📈 FINAL RESULTS');
  logger.info(`   Duration: ${duration} minutes`);
  logger.info(`   Workers Started: ${globalStats.workersStarted}`);
  logger.info(`   Workers Completed: ${globalStats.workersCompleted}`);
  logger.info(`   Workers Failed: ${globalStats.workersFailed}`);
  logger.info('');
  
  if (globalStats.workersFailed === 0) {
    logger.info('✅ All workers completed successfully!');
    process.exit(0);
  } else {
    logger.error(`❌ ${globalStats.workersFailed} workers failed`);
    process.exit(1);
  }
}

// Run coordinator
main().catch(error => {
  logger.error(`❌ Coordinator failed: ${error.message}`);
  process.exit(1);
});
