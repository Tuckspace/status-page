const https = require('https');
const fs = require('fs');

const sites = [
  'https://solidsparkmusic.com',
  'https://solidspark.tv',
  'https://solidsparkgame.com',
  'https://shareyourarea.com',
  'https://playoptimumlink.com',
  'https://noticestudios.com',
  'https://tuckspace.com',
  'https://tuckspacegames.com'
];

const logFile = 'uptime-log.json';
let logs = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile)) : {};

function checkSite(url) {
  return new Promise((resolve) => {
    const start = Date.now();
    https.get(url, (res) => {
      const duration = Date.now() - start;
      resolve({ url, status: res.statusCode, duration, timestamp: new Date().toISOString(), ok: res.statusCode < 400 });
    }).on('error', () => {
      resolve({ url, status: 0, duration: -1, timestamp: new Date().toISOString(), ok: false });
    });
  });
}

async function runChecks() {
  for (const site of sites) {
    const result = await checkSite(site);
    if (!logs[site]) logs[site] = [];
    logs[site].push(result);
    logs[site] = logs[site].slice(-90); // Keep last 90 entries per site
    console.log(`[${result.timestamp}] ${site} is ${result.ok ? 'UP' : 'DOWN'}`);
  }
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

runChecks();