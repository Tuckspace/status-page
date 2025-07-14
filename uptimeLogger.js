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
  'https://tuckspacegames.com',
  'https://www.protoriastudios.com',
  'https://www.playskyfear.com'
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

function getDateKey(timestamp) {
  return timestamp.slice(0, 10); // 'YYYY-MM-DD'
}

async function runChecks() {
  for (const site of sites) {
    const result = await checkSite(site);

    if (!logs[site]) logs[site] = [];

    const dateKey = getDateKey(result.timestamp);
    const alreadyLoggedToday = logs[site].some(entry => getDateKey(entry.timestamp) === dateKey);

    if (!alreadyLoggedToday) {
      logs[site].push(result);
    }

    // Keep only 90 most recent days (one entry per day)
    logs[site] = logs[site]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .filter((entry, index, self) => {
        const entryDate = getDateKey(entry.timestamp);
        return self.findIndex(e => getDateKey(e.timestamp) === entryDate) === index;
      })
      .slice(-90);

    console.log(`[${result.timestamp}] ${site} is ${result.ok ? 'UP' : 'DOWN'}`);
  }

  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

runChecks();