const http = require('http');
const fs = require('fs');
const path = require('path');

// Automatically load .env file if it exists
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of envLines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = (match[2] || '').trim().replace(/^['"](.*)['"]$/, '$1');
        if (process.env[key] === undefined) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (e) {}

let PORT = parseInt(process.env.PORT, 10) || 3000;
const BASE_DIR = __dirname;
const PORTFOLIO_DATA_FILE = path.join(BASE_DIR, 'portfolio-data.js');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

function readPortfolioDataProjects() {
  try {
    delete require.cache[require.resolve(PORTFOLIO_DATA_FILE)];
    const pData = require(PORTFOLIO_DATA_FILE);
    return Array.isArray(pData.projects) ? pData.projects : [];
  } catch (err) {
    console.error('Error reading projects from portfolio-data.js:', err);
    return [];
  }
}

function writeArrayToPortfolioData(keyName, list) {
  try {
    let content = fs.readFileSync(PORTFOLIO_DATA_FILE, 'utf8');
    const startMarker = `${keyName}:`;
    const startIdx = content.indexOf(startMarker);
    if (startIdx === -1) {
      console.error(`Could not find ${keyName} marker in portfolio-data.js`);
      return false;
    }

    const bracketStart = content.indexOf('[', startIdx);
    if (bracketStart === -1) return false;

    let depth = 0;
    let bracketEnd = -1;
    let inString = false;
    let quoteChar = '';

    for (let i = bracketStart; i < content.length; i++) {
      const char = content[i];
      const prevChar = content[i - 1];

      if (inString) {
        if (char === quoteChar && prevChar !== '\\') {
          inString = false;
        }
        continue;
      }

      if (char === '"' || char === "'" || char === '`') {
        inString = true;
        quoteChar = char;
        continue;
      }

      if (char === '[') {
        depth++;
      } else if (char === ']') {
        depth--;
        if (depth === 0) {
          bracketEnd = i;
          break;
        }
      }
    }

    if (bracketEnd === -1) {
      console.error(`Could not find matching bracket for ${keyName} in portfolio-data.js`);
      return false;
    }

    let endPos = bracketEnd + 1;
    while (endPos < content.length && (content[endPos] === ' ' || content[endPos] === '\t')) {
      endPos++;
    }
    if (content[endPos] === ',') {
      endPos++;
    }

    const formatted = JSON.stringify(list, null, 2);
    content = content.slice(0, startIdx) + `${keyName}: ${formatted},` + content.slice(endPos);
    fs.writeFileSync(PORTFOLIO_DATA_FILE, content, 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${keyName} to portfolio-data.js:`, err);
    return false;
  }
}

function writePortfolioDataProjects(projectsList) {
  return writeArrayToPortfolioData('projects', projectsList);
}

function readPortfolioDataAchievements() {
  try {
    delete require.cache[require.resolve(PORTFOLIO_DATA_FILE)];
    const pData = require(PORTFOLIO_DATA_FILE);
    return Array.isArray(pData.achievements) ? pData.achievements : [];
  } catch (err) {
    console.error('Error reading achievements from portfolio-data.js:', err);
    return [];
  }
}

function writePortfolioDataAchievements(achievementsList) {
  return writeArrayToPortfolioData('achievements', achievementsList);
}

function readPortfolioDataVisaCards() {
  try {
    delete require.cache[require.resolve(PORTFOLIO_DATA_FILE)];
    const pData = require(PORTFOLIO_DATA_FILE);
    return Array.isArray(pData.visaCards) ? pData.visaCards : [];
  } catch (err) {
    console.error('Error reading visaCards from portfolio-data.js:', err);
    return [];
  }
}

function writePortfolioDataVisaCards(visaCardsList) {
  return writeArrayToPortfolioData('visaCards', visaCardsList);
}

function readPortfolioDataPersonal() {
  try {
    delete require.cache[require.resolve(PORTFOLIO_DATA_FILE)];
    const pData = require(PORTFOLIO_DATA_FILE);
    return (pData && pData.personal) ? pData.personal : {};
  } catch (err) {
    console.error('Error reading personal from portfolio-data.js:', err);
    return {};
  }
}

function updatePortfolioDataPersonal(updates) {
  try {
    let content = fs.readFileSync(PORTFOLIO_DATA_FILE, 'utf8');
    const startMarker = 'personal: {';
    const startIdx = content.indexOf(startMarker);
    if (startIdx === -1) {
      console.error('Could not find personal: { marker in portfolio-data.js');
      return false;
    }

    const braceStart = content.indexOf('{', startIdx);
    let depth = 0;
    let braceEnd = -1;
    let inString = false;
    let quoteChar = '';

    for (let i = braceStart; i < content.length; i++) {
      const char = content[i];
      const prevChar = content[i - 1];

      if (inString) {
        if (char === quoteChar && prevChar !== '\\') {
          inString = false;
        }
        continue;
      }

      if (char === '"' || char === "'" || char === '`') {
        inString = true;
        quoteChar = char;
        continue;
      }

      if (char === '{') depth++;
      else if (char === '}') {
        depth--;
        if (depth === 0) {
          braceEnd = i;
          break;
        }
      }
    }

    if (braceEnd === -1) {
      console.error('Could not find matching brace for personal block in portfolio-data.js');
      return false;
    }

    let personalBlock = content.slice(braceStart, braceEnd + 1);

    for (const [key, value] of Object.entries(updates)) {
      if (typeof value !== 'string') continue;
      // Match key: "..." or key: '...' or key: `...`
      const keyRegex = new RegExp(`(${key}\\s*:\\s*)(["'\`])([\\s\\S]*?)(["'\`])`);
      if (keyRegex.test(personalBlock)) {
        personalBlock = personalBlock.replace(keyRegex, `$1${JSON.stringify(value)}`);
      } else {
        // Insert right after the opening brace
        personalBlock = personalBlock.slice(0, 1) + `\n    ${key}: ${JSON.stringify(value)},` + personalBlock.slice(1);
      }
    }

    content = content.slice(0, braceStart) + personalBlock + content.slice(braceEnd + 1);
    fs.writeFileSync(PORTFOLIO_DATA_FILE, content, 'utf8');
    return true;
  } catch (err) {
    console.error('Error updating personal in portfolio-data.js:', err);
    return false;
  }
}

function getOwnerPin() {
  if (process.env.ADMIN_PIN) {
    return String(process.env.ADMIN_PIN).trim();
  }
  if (process.env.PORTFOLIO_ADMIN_PIN) {
    return String(process.env.PORTFOLIO_ADMIN_PIN).trim();
  }
  try {
    delete require.cache[require.resolve(PORTFOLIO_DATA_FILE)];
    const pData = require(PORTFOLIO_DATA_FILE);
    return (pData && pData.admin && pData.admin.pin) ? String(pData.admin.pin).trim() : "2026";
  } catch (err) {
    return "2026";
  }
}

function updatePortfolioDataAdmin(newPin) {
  try {
    let content = fs.readFileSync(PORTFOLIO_DATA_FILE, 'utf8');
    const pinRegex = /(admin\s*:\s*\{[\s\S]*?pin\s*:\s*)(["'`])(.*?)(["'`])/;
    if (pinRegex.test(content)) {
      content = content.replace(pinRegex, `$1${JSON.stringify(String(newPin).trim())}`);
      fs.writeFileSync(PORTFOLIO_DATA_FILE, content, 'utf8');
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error updating admin PIN in portfolio-data.js:', err);
    return false;
  }
}

function verifyOwnerAccess(req) {
  const pinHeader = req.headers['x-admin-pin'] || req.headers['authorization'] || '';
  const expectedPin = getOwnerPin();
  if (pinHeader && String(pinHeader).replace(/^Bearer\s+/i, '').trim() === expectedPin) {
    return true;
  }
  return false;
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-pin, Authorization');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let reqUrl = req.url.split('?')[0];

  // API 1: GET /api/projects
  if (req.method === 'GET' && reqUrl === '/api/projects') {
    const list = readPortfolioDataProjects();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, projects: list }));
    return;
  }

  // API 1B: POST /api/verify-pin
  if (req.method === 'POST' && reqUrl === '/api/verify-pin') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { pin } = JSON.parse(body || '{}');
        const expectedPin = getOwnerPin();
        const valid = String(pin || '').trim() === expectedPin;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, valid }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API 2: POST /api/add-project
  if (req.method === 'POST' && reqUrl === '/api/add-project') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        if (!verifyOwnerAccess(req)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Unauthorized: Only portfolio owner (Hemasagar) can modify data.' }));
          return;
        }

        const item = JSON.parse(body || '{}');
        if (!item.title) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Project title is required' }));
          return;
        }

        let domain = item.domain || '';
        if (!domain && item.url) {
          try {
            domain = new URL(item.url).hostname.replace(/^www\./, '');
          } catch(e) {
            domain = item.url;
          }
        }

        const newProject = {
          id: item.id || 'proj-' + Date.now(),
          title: item.title.trim(),
          domain: domain || 'web-project',
          url: (item.url || '#').trim(),
          github: (item.github || '').trim(),
          logo: item.logo ? item.logo.trim() : 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&w=120&q=80',
          description: (item.description || 'An interactive web application built with modern web technologies.').trim(),
          tags: Array.isArray(item.tags)
            ? item.tags
            : (item.tags ? item.tags.split(',').map(t => t.trim()).filter(Boolean) : ['Web', 'FullStack']),
          users: (item.users || 'Active Project').trim()
        };

        const existingList = readPortfolioDataProjects();
        existingList.push(newProject);
        const saved = writePortfolioDataProjects(existingList);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: saved,
          project: newProject,
          allProjects: existingList
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API 3: POST /api/delete-project
  if (req.method === 'POST' && reqUrl === '/api/delete-project') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        if (!verifyOwnerAccess(req)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Unauthorized: Only portfolio owner (Hemasagar) can modify data.' }));
          return;
        }

        const { id, index } = JSON.parse(body || '{}');
        let list = readPortfolioDataProjects();

        if (typeof index === 'number' && index >= 0 && index < list.length) {
          list.splice(index, 1);
        } else if (id) {
          list = list.filter(p => p.id !== id);
        }

        const saved = writePortfolioDataProjects(list);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: saved, allProjects: list }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API 3B: POST /api/edit-project
  if (req.method === 'POST' && reqUrl === '/api/edit-project') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        if (!verifyOwnerAccess(req)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Unauthorized: Only portfolio owner (Hemasagar) can modify data.' }));
          return;
        }

        const item = JSON.parse(body || '{}');
        let list = readPortfolioDataProjects();
        let targetIdx = -1;

        if (typeof item.index === 'number' && item.index >= 0 && item.index < list.length) {
          targetIdx = item.index;
        } else if (item.id) {
          targetIdx = list.findIndex(p => p.id === item.id);
        }

        if (targetIdx === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Project not found' }));
          return;
        }

        let domain = item.domain || '';
        if (!domain && item.url) {
          try {
            domain = new URL(item.url).hostname.replace(/^www\./, '');
          } catch(e) {
            domain = item.url;
          }
        }

        list[targetIdx] = {
          ...list[targetIdx],
          title: item.title ? item.title.trim() : list[targetIdx].title,
          domain: domain || list[targetIdx].domain,
          url: item.url ? item.url.trim() : list[targetIdx].url,
          github: typeof item.github === 'string' ? item.github.trim() : list[targetIdx].github,
          logo: item.logo ? item.logo.trim() : list[targetIdx].logo,
          description: typeof item.description === 'string' ? item.description.trim() : list[targetIdx].description,
          tags: Array.isArray(item.tags)
            ? item.tags
            : (item.tags ? item.tags.split(',').map(t => t.trim()).filter(Boolean) : list[targetIdx].tags)
        };

        const saved = writePortfolioDataProjects(list);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: saved, project: list[targetIdx], allProjects: list }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API 4: GET /api/achievements
  if (req.method === 'GET' && reqUrl === '/api/achievements') {
    const list = readPortfolioDataAchievements();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, achievements: list }));
    return;
  }

  // API 5: POST /api/add-achievement
  if (req.method === 'POST' && reqUrl === '/api/add-achievement') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        if (!verifyOwnerAccess(req)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Unauthorized: Only portfolio owner (Hemasagar) can modify data.' }));
          return;
        }

        const item = JSON.parse(body || '{}');
        if (!item.title) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Achievement title is required' }));
          return;
        }

        const themes = {
          gold: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)',
          sapphire: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #60a5fa 100%)',
          emerald: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #34d399 100%)',
          crimson: 'linear-gradient(135deg, #881337 0%, #e11d48 50%, #fb7185 100%)',
          violet: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #7c3aed 100%)',
          obsidian: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)'
        };

        const bgGradient = item.bgGradient || themes[item.theme] || themes.gold;
        const randomDigits = Math.floor(1000 + Math.random() * 9000);

        const newAchievement = {
          id: item.id || 'ach-' + Date.now(),
          title: item.title.trim(),
          issuer: (item.issuer || 'Achievement').trim(),
          date: (item.date || new Date().getFullYear().toString()).trim(),
          badgeType: (item.badgeType || 'HONOR').trim().toUpperCase(),
          bgGradient: bgGradient,
          number: `•••• •••• •••• ${randomDigits}`,
          description: (item.description || '').trim(),
          credentialUrl: (item.credentialUrl || '').trim()
        };

        const list = readPortfolioDataAchievements();
        list.push(newAchievement);
        const saved = writePortfolioDataAchievements(list);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: saved,
          achievement: newAchievement,
          allAchievements: list
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API 6: POST /api/delete-achievement
  if (req.method === 'POST' && reqUrl === '/api/delete-achievement') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        if (!verifyOwnerAccess(req)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Unauthorized: Only portfolio owner (Hemasagar) can modify data.' }));
          return;
        }

        const { id, index } = JSON.parse(body || '{}');
        let list = readPortfolioDataAchievements();

        if (typeof index === 'number' && index >= 0 && index < list.length) {
          list.splice(index, 1);
        } else if (id) {
          list = list.filter(a => a.id !== id);
        }

        const saved = writePortfolioDataAchievements(list);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: saved, allAchievements: list }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API 6B: POST /api/edit-achievement
  if (req.method === 'POST' && reqUrl === '/api/edit-achievement') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        if (!verifyOwnerAccess(req)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Unauthorized: Only portfolio owner (Hemasagar) can modify data.' }));
          return;
        }

        const item = JSON.parse(body || '{}');
        let list = readPortfolioDataAchievements();
        let targetIdx = -1;

        if (typeof item.index === 'number' && item.index >= 0 && item.index < list.length) {
          targetIdx = item.index;
        } else if (item.id) {
          targetIdx = list.findIndex(a => a.id === item.id);
        }

        if (targetIdx === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Achievement not found' }));
          return;
        }

        const themes = {
          gold: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)',
          sapphire: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #60a5fa 100%)',
          emerald: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #34d399 100%)',
          crimson: 'linear-gradient(135deg, #881337 0%, #e11d48 50%, #fb7185 100%)',
          violet: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #7c3aed 100%)',
          obsidian: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)'
        };

        const bgGradient = item.bgGradient || themes[item.theme] || list[targetIdx].bgGradient;

        list[targetIdx] = {
          ...list[targetIdx],
          title: item.title ? item.title.trim() : list[targetIdx].title,
          issuer: item.issuer ? item.issuer.trim() : list[targetIdx].issuer,
          date: item.date ? item.date.trim() : list[targetIdx].date,
          badgeType: item.badgeType ? item.badgeType.trim().toUpperCase() : (item.theme ? item.theme.toUpperCase() : list[targetIdx].badgeType),
          bgGradient: bgGradient,
          description: typeof item.description === 'string' ? item.description.trim() : list[targetIdx].description,
          credentialUrl: typeof item.credentialUrl === 'string' ? item.credentialUrl.trim() : list[targetIdx].credentialUrl
        };

        const saved = writePortfolioDataAchievements(list);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: saved, achievement: list[targetIdx], allAchievements: list }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API 7: GET /api/experience
  if (req.method === 'GET' && reqUrl === '/api/experience') {
    const list = readPortfolioDataVisaCards();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, experience: list }));
    return;
  }

  // API 8: POST /api/add-experience
  if (req.method === 'POST' && reqUrl === '/api/add-experience') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        if (!verifyOwnerAccess(req)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Unauthorized: Only portfolio owner (Hemasagar) can modify data.' }));
          return;
        }

        const item = JSON.parse(body || '{}');
        const role = (item.role || item.education || item.title || '').trim();
        const company = (item.company || item.university || item.Branch || item.organization || '').trim();

        if (!role) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Role or Title is required' }));
          return;
        }

        const expThemes = {
          cyan: 'linear-gradient(135deg, #0998b4 0%, #dfbfac 100%)',
          amber: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
          violet: 'linear-gradient(135deg, #6d28d9 0%, #312e81 100%)',
          crimson: 'linear-gradient(135deg, #a51569 0%, #78350f 100%)',
          blue: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
          emerald: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)'
        };

        const bgGradient = item.bgGradient || expThemes[item.theme] || expThemes.violet;
        const randomDigits = Math.floor(1000 + Math.random() * 9000);

        const newExp = {
          id: item.id || 'exp-' + Date.now(),
          role: role,
          company: company || 'Self / Tech',
          tenure: (item.tenure || 'Present').trim(),
          bgGradient: bgGradient,
          number: `•••• •••• •••• ${randomDigits}`,
          description: (item.description || '').trim()
        };

        const list = readPortfolioDataVisaCards();
        list.push(newExp);
        const saved = writePortfolioDataVisaCards(list);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: saved, experience: newExp, allExperience: list }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API 9: POST /api/edit-experience
  if (req.method === 'POST' && reqUrl === '/api/edit-experience') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        if (!verifyOwnerAccess(req)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Unauthorized: Only portfolio owner (Hemasagar) can modify data.' }));
          return;
        }

        const item = JSON.parse(body || '{}');
        let list = readPortfolioDataVisaCards();
        let targetIdx = -1;

        if (typeof item.index === 'number' && item.index >= 0 && item.index < list.length) {
          targetIdx = item.index;
        } else if (item.id) {
          targetIdx = list.findIndex(e => e.id === item.id);
        }

        if (targetIdx === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Experience card not found' }));
          return;
        }

        const expThemes = {
          cyan: 'linear-gradient(135deg, #0998b4 0%, #dfbfac 100%)',
          amber: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
          violet: 'linear-gradient(135deg, #6d28d9 0%, #312e81 100%)',
          crimson: 'linear-gradient(135deg, #a51569 0%, #78350f 100%)',
          blue: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
          emerald: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)'
        };

        const target = list[targetIdx];
        const newRole = item.role || item.education || item.title || target.role || target.education || target.university;
        const newCompany = item.company || item.university || item.Branch || target.company || target.university || target.Branch;
        const newTenure = item.tenure || target.tenure || target.location || target.status;
        const bgGradient = item.bgGradient || expThemes[item.theme] || target.bgGradient;

        list[targetIdx] = {
          ...target,
          role: newRole,
          company: newCompany,
          tenure: newTenure,
          bgGradient: bgGradient,
          description: typeof item.description === 'string' ? item.description.trim() : (target.description || '')
        };

        const saved = writePortfolioDataVisaCards(list);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: saved, experience: list[targetIdx], allExperience: list }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API 10: POST /api/delete-experience
  if (req.method === 'POST' && reqUrl === '/api/delete-experience') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        if (!verifyOwnerAccess(req)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Unauthorized: Only portfolio owner (Hemasagar) can modify data.' }));
          return;
        }

        const { id, index } = JSON.parse(body || '{}');
        let list = readPortfolioDataVisaCards();

        if (typeof index === 'number' && index >= 0 && index < list.length) {
          list.splice(index, 1);
        } else if (id) {
          list = list.filter(e => e.id !== id);
        }

        const saved = writePortfolioDataVisaCards(list);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: saved, allExperience: list }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API 11: GET /api/profile
  if (req.method === 'GET' && reqUrl === '/api/profile') {
    const personal = readPortfolioDataPersonal();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, personal }));
    return;
  }

  // API 12: POST /api/save-profile
  if (req.method === 'POST' && reqUrl === '/api/save-profile') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        if (!verifyOwnerAccess(req)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Unauthorized: Only portfolio owner (Hemasagar) can modify data.' }));
          return;
        }

        const { name, role, email, avatar, pin } = JSON.parse(body || '{}');
        const updates = {};
        if (typeof name === 'string' && name.trim()) updates.name = name.trim();
        if (typeof role === 'string' && role.trim()) updates.role = role.trim();
        if (typeof email === 'string' && email.trim()) updates.email = email.trim();
        if (typeof avatar === 'string' && avatar.trim()) updates.avatar = avatar.trim();

        if (typeof pin === 'string' && pin.trim().length >= 4) {
          updatePortfolioDataAdmin(pin.trim());
        }

        const saved = updatePortfolioDataPersonal(updates);
        const updatedPersonal = readPortfolioDataPersonal();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: saved, personal: updatedPersonal }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API 13: POST /api/upload-avatar
  if (req.method === 'POST' && reqUrl === '/api/upload-avatar') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        if (!verifyOwnerAccess(req)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Unauthorized: Only portfolio owner (Hemasagar) can modify data.' }));
          return;
        }

        const payload = JSON.parse(body || '{}');
        const dataUri = payload.data || payload.image || '';
        if (!dataUri) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'No image data provided' }));
          return;
        }

        const matches = dataUri.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        let ext = 'png';
        let rawBase64 = dataUri;
        if (matches) {
          ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          rawBase64 = matches[2];
        }

        const buffer = Buffer.from(rawBase64, 'base64');
        const fileName = `avatar.${ext}`;
        const targetPath = path.join(BASE_DIR, fileName);
        fs.writeFileSync(targetPath, buffer);

        if (ext !== 'png') {
          fs.writeFileSync(path.join(BASE_DIR, 'avatar.png'), buffer);
        }

        const avatarRelativeUrl = `/${fileName}?t=${Date.now()}`;
        updatePortfolioDataPersonal({ avatar: `/${fileName}` });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          avatarUrl: avatarRelativeUrl,
          personal: readPortfolioDataPersonal()
        }));
      } catch (err) {
        console.error('Avatar upload error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Static File Serving
  if (reqUrl === '/') reqUrl = '/index.html';
  const safePath = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(BASE_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + reqUrl);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

function startServer(portToTry) {
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${portToTry} is in use, trying port ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(portToTry, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Sagar Portfolio is live!`);
    console.log(`📡 URL: http://localhost:${portToTry}`);
    console.log(`✨ Open http://localhost:${portToTry} in your browser`);
    console.log(`======================================================\n`);
  });
}

startServer(PORT);

module.exports = server;
