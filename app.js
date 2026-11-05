/**
 * ====================================================================
 * ITSVG.IN EXACT MODEL JAVASCRIPT ENGINE
 * ====================================================================
 */

(function () {
  'use strict';

  let currentData = null;
  let currentTestimonialIndex = 0;
  let isAudioPlaying = false;
  let audioEl = null;

  let isAdmin = localStorage.getItem('portfolio_is_admin') === 'true';
  let adminPin = localStorage.getItem('portfolio_admin_pin') || '2026';

  function getAuthHeaders() {
    const pin = localStorage.getItem('portfolio_admin_pin') || adminPin || '2026';
    return {
      'Content-Type': 'application/json',
      'x-admin-pin': pin
    };
  }

  function syncAdminModeUI() {
    if (isAdmin) {
      document.body.classList.add('is-admin-mode');
      const badge = document.getElementById('owner-active-badge');
      if (badge) {
        badge.classList.remove('hidden');
        badge.classList.add('inline-flex');
      }
      const label = document.getElementById('nav-account-label');
      if (label) label.textContent = 'Account';
    } else {
      document.body.classList.remove('is-admin-mode');
      const badge = document.getElementById('owner-active-badge');
      if (badge) {
        badge.classList.add('hidden');
        badge.classList.remove('inline-flex');
      }
      const label = document.getElementById('nav-account-label');
      if (label) label.textContent = 'Owner Login';
    }
  }

  function init() {
    loadData();
    syncAdminModeUI();
    renderAll();
    setupEventListeners();
    setupAudio();
  }

  // Load data: merges portfolioData with any projects added directly via the website
  function loadData() {
    if (window.portfolioData) {
      currentData = JSON.parse(JSON.stringify(window.portfolioData));
    } else {
      currentData = {};
    }

    if (!Array.isArray(currentData.projects)) {
      currentData.projects = [];
    }
    if (!Array.isArray(currentData.achievements)) {
      currentData.achievements = [];
    }
    if (!Array.isArray(currentData.visaCards)) {
      currentData.visaCards = [];
    }

    // Merge any projects created directly via the website interface
    try {
      const savedUserProjs = localStorage.getItem('portfolio_user_projects');
      if (savedUserProjs) {
        const parsed = JSON.parse(savedUserProjs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (currentData.projects.length === 0) {
            currentData.projects = parsed;
          } else {
            const existingKeys = new Set(currentData.projects.map(p => (p.id || '') + (p.url || '')));
            parsed.forEach(p => {
              const k = (p.id || '') + (p.url || '');
              if (!existingKeys.has(k)) {
                currentData.projects.push(p);
              }
            });
          }
        }
      }
    } catch (e) {
      console.error('Error loading stored projects:', e);
    }

    // Merge any achievements created directly via the website interface
    try {
      const savedUserAchs = localStorage.getItem('portfolio_user_achievements');
      if (savedUserAchs) {
        const parsed = JSON.parse(savedUserAchs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (currentData.achievements.length === 0) {
            currentData.achievements = parsed;
          } else {
            const existingKeys = new Set(currentData.achievements.map(a => (a.id || '') + (a.title || '')));
            parsed.forEach(a => {
              const k = (a.id || '') + (a.title || '');
              if (!existingKeys.has(k)) {
                currentData.achievements.push(a);
              }
            });
          }
        }
      }
    } catch (e) {
      console.error('Error loading stored achievements:', e);
    }

    // Merge any experience created/edited directly via website interface
    try {
      const savedUserExp = localStorage.getItem('portfolio_user_experience');
      if (savedUserExp) {
        const parsed = JSON.parse(savedUserExp);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentData.visaCards = parsed;
        }
      }
    } catch (e) {
      console.error('Error loading stored experience:', e);
    }

    // Merge any personal profile updates (custom photo, name, role, email)
    try {
      const savedProfile = localStorage.getItem('portfolio_user_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed && typeof parsed === 'object') {
          currentData.personal = Object.assign({}, currentData.personal, parsed);
        }
      }
      const savedAvatar = localStorage.getItem('portfolio_user_avatar');
      if (savedAvatar) {
        currentData.personal.avatar = savedAvatar;
      }
    } catch (e) {
      console.error('Error loading stored profile & avatar:', e);
    }

    if (currentData.admin && currentData.admin.pin) {
      if (!localStorage.getItem('portfolio_admin_pin')) {
        adminPin = String(currentData.admin.pin).trim();
      }
    }
  }

  function renderAll() {
    renderHeroLetters();
    renderIntro();
    renderSocials();
    renderTerminal();
    renderProjects();
    renderImpact();
    renderVisaCards();
    renderAchievements();
    renderBentoFeatures();
    renderTestimonials();
    populateCustomizer();
  }

  // 1. Giant Hero Letters - Generates letters from personal.name or personal.heroLetters
  function renderHeroLetters() {
    const container = document.getElementById('hero-letters-container');
    if (!container) return;

    const colors = [
      "hover:text-blue-600",
      "hover:text-green-600",
      "hover:text-red-600",
      "hover:text-fuchsia-600",
      "hover:text-emerald-600",
      "hover:text-pink-600",
      "hover:text-yellow-600",
      "hover:text-indigo-600",
      "hover:text-cyan-600",
      "hover:text-amber-600"
    ];

    let letters = [];
    if (currentData.personal && currentData.personal.heroLetters && currentData.personal.heroLetters.length > 0) {
      letters = currentData.personal.heroLetters;
    } else if (currentData.personal && currentData.personal.name) {
      const cleanName = currentData.personal.name.toUpperCase().replace(/\s+/g, '');
      letters = cleanName.split('').map((char, i) => ({
        char,
        color: colors[i % colors.length]
      }));
    }

    container.innerHTML = letters.map(item => `
      <span class="hero-letter ${item.color} group/char relative">
        ${item.char}
        <span class="absolute -top-4 sm:-top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/char:opacity-100 transition-all duration-300 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 sm:w-8 h-6 sm:h-8 traingle-rotate-with-delay text-current"><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path><path d="M12 20l7 -12h-14z"></path></svg>
        </span>
      </span>
    `).join('');
  }

  // Helper to update avatar photo across all UI touchpoints
  function updateAvatarElements(url) {
    if (!url) url = 'https://github.com/Hemasagarraju.png';
    const avatarIds = ['nav-avatar-img', 'intro-avatar-img', 'drawer-avatar-img', 'custom-avatar-preview'];
    avatarIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.src = url;
        el.onerror = () => {
          el.onerror = null;
          el.src = 'https://github.com/Hemasagarraju.png';
        };
      }
    });
  }

  // 2. Intro Text & Photo
  function renderIntro() {
    const p = currentData.personal || {};
    const introName = document.getElementById('intro-name');
    if (introName && p.name) {
      introName.textContent = p.name;
    }
    const avatarUrl = p.avatar || 'https://github.com/Hemasagarraju.png';
    updateAvatarElements(avatarUrl);
  }

  // 3. Social Links with Scribble hover outline
  function renderSocials() {
    const container = document.getElementById('top-social-links');
    if (!container) return;

    const s = (currentData.personal && currentData.personal.socials) || {};

    container.innerHTML = `
      <a href="${s.twitter || '#'}" target="_blank" rel="noopener noreferrer" class="group-social text-zinc-700 hover:text-black" aria-label="Twitter">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>
        <svg class="scribble-svg" viewBox="0 0 40 40" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="20" cy="20" r="16" stroke-dasharray="4 2"></circle></svg>
      </a>
      <a href="${s.github || '#'}" target="_blank" rel="noopener noreferrer" class="group-social text-zinc-700 hover:text-black" aria-label="GitHub">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"></path></svg>
        <svg class="scribble-svg" viewBox="0 0 40 40" fill="none" stroke="#10b981" stroke-width="2"><circle cx="20" cy="20" r="16" stroke-dasharray="4 2"></circle></svg>
      </a>
      <a href="${s.linkedin || '#'}" target="_blank" rel="noopener noreferrer" class="group-social text-zinc-700 hover:text-black" aria-label="LinkedIn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M8 11l0 5"></path><path d="M8 8l0 .01"></path><path d="M12 16l0 -5"></path><path d="M16 16v-3a2 2 0 0 0 -4 0"></path></svg>
        <svg class="scribble-svg" viewBox="0 0 40 40" fill="none" stroke="#3b82f6" stroke-width="2"><circle cx="20" cy="20" r="16" stroke-dasharray="4 2"></circle></svg>
      </a>
      <a href="${s.instagram || '#'}" target="_blank" rel="noopener noreferrer" class="group-social text-zinc-700 hover:text-black" aria-label="Instagram">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
        <svg class="scribble-svg" viewBox="0 0 40 40" fill="none" stroke="#ec4899" stroke-width="2"><circle cx="20" cy="20" r="16" stroke-dasharray="4 2"></circle></svg>
      </a>
    `;
  }

  // 4. Terminal with Letters Scan Up-To-Bottom Design & Falling Matrix Letters
  let matrixCanvas = null;
  let matrixCtx = null;
  let matrixAnimationId = null;
  let matrixDrops = [];
  let isMatrixEnabled = true;
  let isScanBeamEnabled = true;
  let terminalTheme = 'emerald';
  let isScanningInProgress = false;

  function renderTerminal() {
    const termBody = document.getElementById('terminal-content');
    if (!termBody) return;

    const termData = currentData.terminal || {
      lastLogin: "wed oct 4 12:00:49 on console",
      theme: "emerald",
      scanActive: true,
      matrixActive: true,
      commands: [
        { cmd: "whoami", res: "hemasagar — frontend engineer & AI/ML developer" },
        { cmd: "cat current_stack.txt", res: "React.js • Python • Machine Learning • Tailwind CSS • Node.js" },
        { cmd: "status", res: "Open to work • Building new projects" }
      ]
    };

    if (termData.theme) terminalTheme = termData.theme;
    if (typeof termData.scanActive === 'boolean') isScanBeamEnabled = termData.scanActive;
    if (typeof termData.matrixActive === 'boolean') isMatrixEnabled = termData.matrixActive;

    applyTerminalTheme(terminalTheme);

    const formatLettersAsSpans = (text) => {
      return String(text).split('').map(ch => {
        if (ch === ' ') return ' ';
        return `<span class="term-char" data-orig="${ch}">${ch}</span>`;
      }).join('');
    };

    termBody.innerHTML = `
      <div class="text-zinc-500 mb-3 font-mono text-[11px] sm:text-xs border-b border-zinc-800/80 pb-2 flex items-center justify-between">
        <span>Last login: ${termData.lastLogin || 'today on console'}</span>
        <span class="text-emerald-500 font-bold hidden xs:inline">[SYSTEM SCAN: ONLINE]</span>
      </div>
      <div id="term-output-lines" class="space-y-3">
        ${(termData.commands || []).map((item, idx) => `
          <div class="term-line font-mono text-xs sm:text-sm" data-line-idx="${idx}">
            <div class="flex items-center gap-2 text-zinc-200">
              <span class="text-emerald-400 font-bold">➜</span>
              <span class="text-cyan-400 font-bold">~</span>
              <span class="font-semibold text-emerald-300">${formatLettersAsSpans(item.cmd)}</span>
            </div>
            <div class="text-zinc-300 pl-5 mt-1 text-xs leading-relaxed font-mono">
              ${formatLettersAsSpans(item.res)}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Initialize falling letters stream
    initMatrixLettersCanvas();

    // Sync beam state
    const beam = document.getElementById('terminal-scanner-beam');
    if (beam) {
      if (isScanBeamEnabled) {
        beam.classList.add('active');
        beam.style.display = 'block';
      } else {
        beam.classList.remove('active');
        beam.style.display = 'none';
      }
    }

    // Trigger initial letter scan from up to bottom after load
    setTimeout(() => {
      triggerTerminalLetterScan(true);
    }, 450);
  }

  function triggerTerminalLetterScan(silent) {
    if (isScanningInProgress) return;
    isScanningInProgress = true;

    const beam = document.getElementById('terminal-scanner-beam');
    const badge = document.getElementById('terminal-scan-badge');

    if (badge) {
      badge.textContent = '📡 SCANNING: UP ➔ BOTTOM...';
      badge.className = 'px-1.5 py-0.5 rounded text-[10px] bg-yellow-950/90 text-yellow-300 border border-yellow-700 animate-pulse';
    }

    if (beam) {
      beam.style.display = 'block';
      beam.classList.remove('active');
      void beam.offsetWidth; // Force reflow to restart animation from the top
      beam.classList.add('active');
    }

    const lines = document.querySelectorAll('#term-output-lines .term-line');
    const cyberChars = '01#@$%&*!?<>[]{}~+=-/X';

    let lineDelay = 0;
    lines.forEach((lineEl) => {
      setTimeout(() => {
        lineEl.classList.add('term-line-scanning');
        const chars = lineEl.querySelectorAll('.term-char');

        chars.forEach((charEl, charIdx) => {
          const original = charEl.getAttribute('data-orig') || charEl.textContent;
          // Step 1: Scramble into random digital glyph
          setTimeout(() => {
            charEl.textContent = cyberChars[Math.floor(Math.random() * cyberChars.length)];
            charEl.classList.add('scanned');
          }, charIdx * 14);

          // Step 2: Resolve into true character with bright pulse
          setTimeout(() => {
            charEl.textContent = original;
            setTimeout(() => {
              charEl.classList.remove('scanned');
            }, 600);
          }, charIdx * 14 + 110);
        });

        setTimeout(() => {
          lineEl.classList.remove('term-line-scanning');
        }, chars.length * 14 + 350);
      }, lineDelay);

      lineDelay += 320;
    });

    setTimeout(() => {
      isScanningInProgress = false;
      if (badge) {
        badge.textContent = '✔️ SCAN COMPLETE';
        badge.className = 'px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800';
      }
      if (!silent) {
        showToast('📡 Letters scan (up-to-bottom) finished!');
      }
    }, lineDelay + 400);
  }

  function initMatrixLettersCanvas() {
    const canvas = document.getElementById('terminal-matrix-canvas');
    if (!canvas) return;

    matrixCanvas = canvas;
    matrixCtx = canvas.getContext('2d');

    const updateDimensions = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth || 640;
      canvas.height = parent.clientHeight || 280;

      const fontSize = 14;
      const columns = Math.floor(canvas.width / fontSize);
      matrixDrops = [];
      for (let i = 0; i < columns; i++) {
        matrixDrops[i] = Math.floor(Math.random() * -30);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    const matrixChars = 'HEMASAGAR01AI<>{}[]/*+=-!#%$@;:?1010101'.split('');
    const fontSize = 14;

    const drawMatrixFrame = () => {
      if (!isMatrixEnabled) {
        if (matrixCtx && canvas) {
          matrixCtx.clearRect(0, 0, canvas.width, canvas.height);
        }
        return;
      }

      matrixCtx.fillStyle = 'rgba(9, 14, 23, 0.12)';
      matrixCtx.fillRect(0, 0, canvas.width, canvas.height);

      let headColor = '#ffffff';
      let trailColor = '#10b981';

      if (terminalTheme === 'cyan') {
        headColor = '#e0f2fe';
        trailColor = '#06b6d4';
      } else if (terminalTheme === 'amber') {
        headColor = '#fef3c7';
        trailColor = '#f59e0b';
      }

      matrixCtx.font = `${fontSize}px monospace`;

      for (let i = 0; i < matrixDrops.length; i++) {
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        const x = i * fontSize;
        const y = matrixDrops[i] * fontSize;

        if (y >= 0 && y <= canvas.height + fontSize) {
          matrixCtx.fillStyle = headColor;
          matrixCtx.fillText(char, x, y);

          matrixCtx.fillStyle = trailColor;
          const prevChar = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          matrixCtx.fillText(prevChar, x, y - fontSize);
        }

        if (y > canvas.height && Math.random() > 0.975) {
          matrixDrops[i] = 0; // Reset to top
        }

        matrixDrops[i]++;
      }
    };

    if (matrixAnimationId) clearInterval(matrixAnimationId);
    matrixAnimationId = setInterval(drawMatrixFrame, 45);
  }

  function applyTerminalTheme(theme) {
    terminalTheme = theme;
    const termWin = document.getElementById('terminal-window');
    if (!termWin) return;
    termWin.classList.remove('terminal-theme-cyan', 'terminal-theme-amber');
    if (theme === 'cyan') {
      termWin.classList.add('terminal-theme-cyan');
    } else if (theme === 'amber') {
      termWin.classList.add('terminal-theme-amber');
    }
  }

  // Interactive Window Controls for Terminal & Scan
  window.triggerTerminalLetterScan = function () {
    triggerTerminalLetterScan(false);
  };

  window.toggleMatrixLetters = function () {
    isMatrixEnabled = !isMatrixEnabled;
    const btn = document.getElementById('term-matrix-btn');
    const optInput = document.getElementById('opt-terminal-matrix');
    if (btn) {
      btn.className = isMatrixEnabled
        ? 'px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1'
        : 'px-2 py-1 rounded-md bg-zinc-800 text-zinc-500 border border-zinc-700 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1';
    }
    if (optInput) optInput.checked = isMatrixEnabled;
    showToast(isMatrixEnabled ? '⚡ Falling letters stream: ON' : '⚡ Falling letters stream: OFF');
  };

  window.clearTerminal = function () {
    const lines = document.getElementById('term-output-lines');
    if (lines) {
      lines.innerHTML = `
        <div class="text-zinc-500 text-xs italic py-2">
          Terminal cleared. Type <span class="text-emerald-400 font-bold">scan</span> to run letter scan, or <span class="text-emerald-400 font-bold">help</span>.
        </div>
      `;
    }
    showToast('🧹 Terminal cleared');
  };

  window.handleTerminalInputKey = function (event) {
    if (event.key === 'Enter') {
      const input = document.getElementById('terminal-cli-input');
      if (!input) return;
      const cmd = input.value.trim();
      input.value = '';
      if (cmd) {
        executeTerminalCommand(cmd);
      }
    }
  };

  window.runTerminalCommand = function (cmd) {
    const input = document.getElementById('terminal-cli-input');
    if (input) input.value = cmd;
    executeTerminalCommand(cmd);
  };

  function executeTerminalCommand(rawCmd) {
    const cmd = rawCmd.trim().toLowerCase();
    const linesContainer = document.getElementById('term-output-lines');
    if (!linesContainer) return;

    const formatLettersAsSpans = (text) => {
      return String(text).split('').map(ch => {
        if (ch === ' ') return ' ';
        return `<span class="term-char" data-orig="${ch}">${ch}</span>`;
      }).join('');
    };

    let responseHtml = '';

    if (cmd === 'scan') {
      responseHtml = `<span class="text-emerald-400 font-bold">Initiating top-to-bottom letters scan diagnostic...</span>`;
      setTimeout(() => triggerTerminalLetterScan(false), 200);
    } else if (cmd === 'matrix') {
      window.toggleMatrixLetters();
      responseHtml = `<span class="text-emerald-300">Falling matrix letters toggled to: <strong>${isMatrixEnabled ? 'ENABLED' : 'DISABLED'}</strong></span>`;
    } else if (cmd === 'whoami') {
      responseHtml = `Hemasagar Raju Chamarthi — Front-end focused Software Developer specialized in building scalable, user-centric web applications and AI/ML architectures.`;
    } else if (cmd === 'skills') {
      responseHtml = `Frontend: React.js, Next.js, TypeScript, Tailwind CSS, Framer Motion<br>Backend & AI: Python, Node.js, Express, Machine Learning, MongoDB, SQL`;
    } else if (cmd === 'projects') {
      const projs = currentData.projects || [];
      if (projs.length === 0) {
        responseHtml = `No projects added yet. Click "+ Add Project" in the Showcase section to create one!`;
      } else {
        responseHtml = projs.map(p => `• <strong>${p.title}</strong> (${p.domain || p.url})`).join('<br>');
      }
    } else if (cmd === 'repo' || cmd === 'github') {
      responseHtml = `GitHub Repository: <a href="https://github.com/Hemasagarraju/hemasagar-portfolio" target="_blank" class="text-cyan-400 underline font-bold">https://github.com/Hemasagarraju/hemasagar-portfolio</a><br>Clone: <code class="text-emerald-300 bg-zinc-900 px-1 py-0.5 rounded">git clone https://github.com/Hemasagarraju/hemasagar-portfolio.git</code>`;
    } else if (cmd === 'clear') {
      window.clearTerminal();
      return;
    } else if (cmd.startsWith('login ') || cmd.startsWith('admin ') || cmd.startsWith('auth ')) {
      const parts = rawCmd.trim().split(/\s+/);
      const enteredPin = parts[1] || '';
      if (enteredPin === adminPin) {
        isAdmin = true;
        localStorage.setItem('portfolio_is_admin', 'true');
        localStorage.setItem('portfolio_admin_pin', enteredPin);
        syncAdminModeUI();
        renderAll();
        showToast('👑 Owner Mode unlocked via Terminal!');
        responseHtml = `<span class="text-emerald-400 font-bold">👑 Access Granted! Welcome back, Hemasagar. Owner Mode is now ACTIVE. You can now add, edit, and delete projects and achievements.</span>`;
      } else {
        responseHtml = `<span class="text-red-400 font-bold">❌ Access Denied: Incorrect PIN.</span>`;
      }
    } else if (cmd === 'logout' || cmd === 'lock') {
      window.logoutAdmin();
      responseHtml = `<span class="text-amber-300 font-bold">🔒 Locked into Visitor Mode. Add/edit controls hidden.</span>`;
    } else if (cmd.startsWith('theme ')) {
      const t = cmd.split(' ')[1];
      if (['emerald', 'cyan', 'amber'].includes(t)) {
        window.setTerminalTheme(t);
        responseHtml = `Terminal theme set to: <strong class="uppercase text-emerald-400">${t}</strong>`;
      } else {
        responseHtml = `Unknown theme. Available: emerald, cyan, amber`;
      }
    } else if (cmd === 'help') {
      responseHtml = `
        <strong>Available Commands:</strong><br>
        • <span class="text-emerald-400 font-bold">scan</span> : Run top-to-bottom letter scanner animation<br>
        • <span class="text-cyan-400 font-bold">matrix</span> : Toggle falling letters stream<br>
        • <span class="text-yellow-400 font-bold">whoami</span> : Developer profile details<br>
        • <span class="text-pink-400 font-bold">skills</span> : Tech stack and languages<br>
        • <span class="text-indigo-400 font-bold">projects</span> : List portfolio projects<br>
        • <span class="text-emerald-300 font-bold">repo</span> : Portfolio GitHub repository<br>
        • <span class="text-emerald-400 font-bold">login &lt;pin&gt;</span> : Unlock owner mode with your PIN<br>
        • <span class="text-amber-400 font-bold">logout</span> : Lock portfolio back to visitor mode<br>
        • <span class="text-amber-400 font-bold">theme &lt;color&gt;</span> : emerald | cyan | amber<br>
        • <span class="text-zinc-400 font-bold">clear</span> : Clear terminal output
      `;
    } else {
      responseHtml = `<span class="text-red-400">Command not found: "${rawCmd}". Type <strong class="text-emerald-400">help</strong> for available commands.</span>`;
    }

    const newBlock = document.createElement('div');
    newBlock.className = 'term-line font-mono text-xs sm:text-sm pt-2 border-t border-zinc-800/50';
    newBlock.innerHTML = `
      <div class="flex items-center gap-2 text-zinc-200">
        <span class="text-emerald-400 font-bold">➜</span>
        <span class="text-cyan-400 font-bold">~</span>
        <span class="font-semibold text-emerald-300">${formatLettersAsSpans(rawCmd)}</span>
      </div>
      <div class="text-zinc-300 pl-5 mt-1 text-xs leading-relaxed font-mono">
        ${responseHtml}
      </div>
    `;

    linesContainer.appendChild(newBlock);

    const termWin = document.getElementById('terminal-window');
    if (termWin) {
      termWin.scrollTop = termWin.scrollHeight;
    }
  }

  window.setTerminalTheme = function (theme) {
    applyTerminalTheme(theme);
    showToast(`🎨 Terminal theme set to ${theme.toUpperCase()}`);
  };

  window.setTerminalScanOption = function (enabled) {
    isScanBeamEnabled = enabled;
    const beam = document.getElementById('terminal-scanner-beam');
    if (beam) {
      if (enabled) {
        beam.classList.add('active');
        beam.style.display = 'block';
      } else {
        beam.classList.remove('active');
        beam.style.display = 'none';
      }
    }
    showToast(enabled ? '📡 Up-to-bottom laser scan: ENABLED' : '📡 Up-to-bottom laser scan: DISABLED');
  };

  window.setTerminalMatrixOption = function (enabled) {
    isMatrixEnabled = enabled;
    const optInput = document.getElementById('opt-terminal-matrix');
    if (optInput) optInput.checked = enabled;
    const btn = document.getElementById('term-matrix-btn');
    if (btn) {
      btn.className = isMatrixEnabled
        ? 'px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1'
        : 'px-2 py-1 rounded-md bg-zinc-800 text-zinc-500 border border-zinc-700 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1';
    }
    showToast(enabled ? '⚡ Falling letters stream: ENABLED' : '⚡ Falling letters stream: DISABLED');
  };

  window.openTerminalOptions = function () {
    const drawer = document.getElementById('customizer-drawer');
    if (drawer) {
      drawer.classList.add('open');
      const optEl = document.getElementById('account-terminal-options');
      if (optEl) {
        setTimeout(() => optEl.scrollIntoView({ behavior: 'smooth' }), 200);
      }
    }
  };

  window.testTerminalScanFromSettings = function () {
    const drawer = document.getElementById('customizer-drawer');
    if (drawer) drawer.classList.remove('open');
    const termEl = document.getElementById('terminal-window');
    if (termEl) {
      termEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        triggerTerminalLetterScan(false);
      }, 500);
    }
  };

  // 5. Projects: Exact Neo-Brutalist 3D Pop Cards
  function renderProjects() {
    const grid = document.getElementById('projects-neo-grid');
    if (!grid) return;

    const projs = currentData.projects || [];

    if (projs.length === 0) {
      if (isAdmin) {
        grid.innerHTML = `
          <div class="col-span-full py-16 px-6 text-center border-2 border-dashed border-zinc-300 rounded-3xl bg-zinc-50/80">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl font-bold shadow-sm">
              📁
            </div>
            <h3 class="text-xl font-extrabold text-zinc-900 mb-2">No Projects Added Yet</h3>
            <p class="text-sm text-zinc-600 max-w-md mx-auto mb-6 leading-relaxed">
              You are in Owner Mode. Click the button below to add your project name, title, live URL, and GitHub repository!
            </p>
            <button type="button" onclick="window.openAddProjectModal()" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#FBC138] hover:bg-amber-400 text-black font-extrabold text-sm border-2 border-black shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#000] transition-all cursor-pointer">
              <span class="text-base font-bold">➕</span>
              <span>Add Your First Project</span>
            </button>
          </div>
        `;
      } else {
        grid.innerHTML = `
          <div class="col-span-full py-16 px-6 text-center border-2 border-dashed border-zinc-300 rounded-3xl bg-zinc-50/80">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl font-bold shadow-sm">
              🚀
            </div>
            <h3 class="text-xl font-extrabold text-zinc-900 mb-2">Featured Projects Coming Soon</h3>
            <p class="text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
              Exciting full-stack web applications, AI models, and open-source tools are currently being crafted.
            </p>
          </div>
        `;
      }
      return;
    }

    const cardsHtml = projs.map((proj, idx) => `
      <button type="button" class="neo-card-wrapper group" onclick="window.openProjectModal(${idx})">
        <div class="neo-card-front">
          <img src="${proj.logo || 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&w=120&q=80'}" alt="${proj.title}" class="w-14 h-14 rounded-xl object-contain bg-slate-50 p-1 border border-zinc-200 shrink-0" onerror="this.src='https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&w=120&q=80'">
          <div class="flex flex-col gap-1 text-left overflow-hidden">
            <p class="text-sm sm:text-base font-bold text-zinc-900 truncate">${proj.title}</p>
            <p class="text-xs sm:text-sm text-blue-600 font-medium truncate">${proj.domain || proj.url || 'web-project'}</p>
          </div>
        </div>
        <div class="neo-card-layer-1"></div>
        <div class="neo-card-layer-2"></div>
      </button>
    `).join('');

    const addCardHtml = isAdmin ? `
      <button type="button" onclick="window.openAddProjectModal()" class="admin-only-card h-32 border-2 border-dashed border-zinc-300 hover:border-black rounded-3xl bg-zinc-50/60 hover:bg-amber-50/60 transition-all flex flex-col items-center justify-center gap-2 p-6 cursor-pointer group">
        <div class="w-10 h-10 rounded-full bg-amber-100 text-amber-800 group-hover:bg-[#FBC138] flex items-center justify-center font-bold text-lg border border-black shadow-[2px_2px_0px_#000] transition-all">
          ➕
        </div>
        <span class="text-sm font-extrabold text-zinc-800 group-hover:text-black">+ Add Another Project</span>
      </button>
    ` : '';

    grid.innerHTML = cardsHtml + addCardHtml;
  }

  // 6. Impact Section
  function renderImpact() {
    const headingEl = document.getElementById('impact-heading');
    if (headingEl && currentData.impact && currentData.impact.heading) {
      headingEl.textContent = currentData.impact.heading;
    }

    const container = document.getElementById('impact-stats-container');
    if (!container) return;

    const stats = (currentData.impact && currentData.impact.stats) || [
      { value: "1H+", label: "Happy Users Worldwide" },
      { value: "1200+", label: "Country's people" },
      { value: "4+", label: "Projects Launched" }
    ];

    container.innerHTML = stats.map(item => `
      <div class="text-center p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm">
        <div class="text-3xl sm:text-5xl font-extrabold text-zinc-900 font-mono tracking-tight">${item.value}</div>
        <div class="text-xs sm:text-sm text-zinc-500 font-medium mt-2">${item.label}</div>
      </div>
    `).join('');
  }

  // 7. Bento Features
  function renderBentoFeatures() {
    const container = document.getElementById('bento-features-container');
    if (!container) return;

    const feats = currentData.features || [];

    container.innerHTML = feats.map(f => `
      <div class="bento-card flex flex-col justify-between">
        <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg mb-4">
          ★
        </div>
        <div>
          <h3 class="text-lg font-bold text-zinc-900 mb-2">${f.title}</h3>
          <p class="text-sm text-zinc-600 leading-relaxed">${f.desc}</p>
        </div>
      </div>
    `).join('');
  }

  // 8. Signature VISA Credit Cards (Career Credentials)
  function renderVisaCards() {
    const track = document.getElementById('visa-cards-track');
    if (!track) return;

    const cards = currentData.visaCards || [];

    if (cards.length === 0) {
      if (isAdmin) {
        track.innerHTML = `
          <div class="visa-card-item p-6 flex flex-col justify-center items-center text-center font-mono border-2 border-dashed border-zinc-700 bg-zinc-900/60 cursor-pointer" onclick="window.openAddExperienceModal()">
            <span class="text-4xl mb-3">💼</span>
            <div class="font-bold text-base text-zinc-200 mb-1">No Experience Added Yet</div>
            <p class="text-xs text-zinc-400 mb-4 max-w-xs">You are in Owner Mode. Click below to add your education, roles, or internships directly on the website!</p>
            <span class="px-4 py-2 bg-[#FBC138] text-black font-extrabold text-xs rounded-xl shadow cursor-pointer">➕ Add Experience</span>
          </div>
        `;
      } else {
        track.innerHTML = `
          <div class="visa-card-item p-6 flex flex-col justify-center items-center text-center font-mono border border-zinc-800 bg-zinc-900/60">
            <span class="text-4xl mb-3">💼</span>
            <div class="font-bold text-base text-zinc-200 mb-1">Career & Academic Credentials</div>
            <p class="text-xs text-zinc-400 max-w-xs">Credentials and milestones will be showcased here.</p>
          </div>
        `;
      }
      return;
    }

    const cardsHtml = cards.map((c, idx) => {
      const cardTitle = c.role || c.education || c.university || c.status || 'DEVELOPER';
      const field1Label = c.company ? 'COMPANY' : (c.university ? 'UNIVERSITY' : (c.Branch ? 'BRANCH' : (c.education ? 'DEGREE' : 'ORGANIZATION')));
      const field1Val = c.company || c.university || c.Branch || c.present || '';
      const field2Label = c.tenure ? 'TENURE' : (c.location ? 'LOCATION' : (c.status ? 'STATUS' : 'PERIOD'));
      const field2Val = c.tenure || c.location || c.status || '';

      return `
        <div class="visa-card-item p-6 flex flex-col justify-between font-mono text-white group" style="background: ${c.bgGradient || 'linear-gradient(135deg, #1e3a8a, #0f172a)'}" onclick="window.openExperienceModal(${idx})">
          <div class="flex justify-between items-start">
            <div class="visa-chip"></div>
            <div class="text-xs font-bold tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">VISA</div>
          </div>
          
          <div class="text-center my-2">
            <div class="text-xs text-white/60 uppercase tracking-widest mb-1">CAREER CREDENTIAL</div>
            <div class="text-base sm:text-xl font-bold tracking-wider uppercase truncate">${cardTitle}</div>
          </div>

          <div class="flex justify-between items-end text-xs gap-2">
            <div class="overflow-hidden">
              <div class="text-white/60 text-[10px] uppercase">${field1Label}</div>
              <div class="font-semibold text-xs sm:text-sm truncate">${field1Val}</div>
            </div>
            <div class="text-right shrink-0">
              <div class="text-white/60 text-[10px] uppercase">${field2Label}</div>
              <div class="font-semibold text-xs sm:text-sm">${field2Val}</div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const addCardHtml = isAdmin ? `
      <div class="admin-only-card visa-card-item p-6 flex flex-col justify-center items-center text-center font-mono border-2 border-dashed border-zinc-700 hover:border-amber-400 bg-zinc-900/40 hover:bg-zinc-900/70 transition-all cursor-pointer group" onclick="window.openAddExperienceModal()">
        <div class="w-12 h-12 rounded-full bg-amber-400/20 text-amber-400 group-hover:bg-[#FBC138] group-hover:text-black flex items-center justify-center text-xl font-bold mb-3 transition-colors">
          ➕
        </div>
        <div class="font-bold text-sm text-zinc-300 group-hover:text-white">+ Add Another Experience</div>
        <p class="text-[11px] text-zinc-500 mt-1">Education, internship or role</p>
      </div>
    ` : '';

    track.innerHTML = cardsHtml + addCardHtml;
  }

  // 8B. Signature Achievement Credit Cards Track
  function renderAchievements() {
    const track = document.getElementById('achievements-cards-track');
    if (!track) return;

    const achs = currentData.achievements || [];

    if (achs.length === 0) {
      if (isAdmin) {
        track.innerHTML = `
          <div class="visa-card-item p-6 flex flex-col justify-center items-center text-center font-mono border-2 border-dashed border-zinc-700 bg-zinc-900/60 cursor-pointer" onclick="window.openAddAchievementModal()">
            <span class="text-4xl mb-3">🏆</span>
            <div class="font-bold text-base text-zinc-200 mb-1">No Achievements Added Yet</div>
            <p class="text-xs text-zinc-400 mb-4 max-w-xs">You are in Owner Mode. Click below to add your certifications, awards, hackathons, and honors!</p>
            <span class="px-4 py-2 bg-[#FBC138] text-black font-extrabold text-xs rounded-xl shadow cursor-pointer">➕ Add Achievement</span>
          </div>
        `;
      } else {
        track.innerHTML = `
          <div class="visa-card-item p-6 flex flex-col justify-center items-center text-center font-mono border border-zinc-800 bg-zinc-900/60">
            <span class="text-4xl mb-3">🏆</span>
            <div class="font-bold text-base text-zinc-200 mb-1">Key Achievements</div>
            <p class="text-xs text-zinc-400 max-w-xs">Awards, certifications, and honors will be showcased here.</p>
          </div>
        `;
      }
      return;
    }

    const cardsHtml = achs.map((a, idx) => `
      <div class="visa-card-item p-6 flex flex-col justify-between font-mono text-white group" style="background: ${a.bgGradient || 'linear-gradient(135deg, #78350f, #d97706)'}" onclick="window.openAchievementModal(${idx})">
        <div class="flex justify-between items-start">
          <div class="visa-chip"></div>
          <div class="text-[10px] font-bold tracking-widest uppercase bg-white/20 px-2.5 py-0.5 rounded backdrop-blur-sm">
            ${a.badgeType || 'HONOR'}
          </div>
        </div>

        <div class="text-center my-2">
          <div class="text-[10px] text-white/70 uppercase tracking-widest mb-1">HONOR & MILESTONE</div>
          <div class="text-base sm:text-lg font-extrabold tracking-wider uppercase line-clamp-2">${a.title}</div>
        </div>

        <div class="flex justify-between items-end text-xs gap-2">
          <div class="overflow-hidden">
            <div class="text-white/60 text-[10px] uppercase">ISSUED BY</div>
            <div class="font-semibold text-xs sm:text-sm truncate">${a.issuer || 'Recognized'}</div>
          </div>
          <div class="text-right shrink-0">
            <div class="text-white/60 text-[10px] uppercase">YEAR</div>
            <div class="font-semibold text-xs sm:text-sm">${a.date || ''}</div>
          </div>
        </div>
      </div>
    `).join('');

    const addCardHtml = isAdmin ? `
      <div class="admin-only-card visa-card-item p-6 flex flex-col justify-center items-center text-center font-mono border-2 border-dashed border-zinc-700 hover:border-amber-400 bg-zinc-900/40 hover:bg-zinc-900/70 transition-all cursor-pointer group" onclick="window.openAddAchievementModal()">
        <div class="w-12 h-12 rounded-full bg-amber-400/20 text-amber-400 group-hover:bg-[#FBC138] group-hover:text-black flex items-center justify-center text-xl font-bold mb-3 transition-colors">
          ➕
        </div>
        <div class="font-bold text-sm text-zinc-300 group-hover:text-white">+ Add Another Achievement</div>
        <p class="text-[11px] text-zinc-500 mt-1">Hackathons, awards & certificates</p>
      </div>
    ` : '';

    track.innerHTML = cardsHtml + addCardHtml;
  }

  // 9. Testimonials
  function renderTestimonials() {
    const cardEl = document.getElementById('testimonial-card');
    if (!cardEl) return;

    const list = currentData.testimonials || [];
    if (list.length === 0) return;

    const t = list[currentTestimonialIndex % list.length];

    cardEl.innerHTML = `
      <div class="text-3xl text-amber-500 font-serif mb-4">“</div>
      <p class="text-base sm:text-lg text-zinc-800 leading-relaxed font-medium mb-6">
        ${t.quote}
      </p>
      <div class="flex items-center justify-center gap-3">
        <div class="font-bold text-zinc-900">${t.author}</div>
        <div class="text-amber-500 text-sm">★★★★★</div>
      </div>
    `;
  }

  // Project Modal Logic
  window.openProjectModal = function (idx) {
    const projs = currentData.projects || [];
    const p = projs[idx];
    if (!p) return;

    const modal = document.getElementById('project-modal');
    const content = document.getElementById('project-modal-content');

    content.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center gap-4 border-b border-zinc-200 pb-4">
          <img src="${p.logo || 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&w=120&q=80'}" class="w-16 h-16 rounded-xl object-contain bg-slate-100 p-1 border border-zinc-300 shrink-0" onerror="this.src='https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&w=120&q=80'">
          <div class="overflow-hidden">
            <h3 class="text-xl font-bold text-zinc-900 truncate">${p.title}</h3>
            <a href="${p.url || '#'}" target="_blank" rel="noopener noreferrer" class="text-sm text-blue-600 font-semibold hover:underline truncate block">${p.domain || p.url} ↗</a>
          </div>
        </div>

        <p class="text-zinc-700 text-sm leading-relaxed">${p.description || 'No description provided.'}</p>

        ${p.users ? `
          <div class="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
            <span>🚀 ${p.users}</span>
          </div>
        ` : ''}

        <div class="flex flex-wrap gap-2 pt-1">
          ${(p.tags || []).map(t => `<span class="px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-300 text-xs font-mono font-medium text-zinc-700">${t}</span>`).join('')}
        </div>

        <div class="flex items-center gap-3 pt-4 border-t border-zinc-200">
          <a href="${p.url || '#'}" target="_blank" rel="noopener noreferrer" class="flex-1 py-2.5 text-center bg-[#FBC138] text-black font-extrabold text-xs rounded-xl border border-black hover:bg-amber-400 transition-colors">
            Live Website ↗
          </a>
          ${p.github ? `
            <a href="${p.github}" target="_blank" rel="noopener noreferrer" class="py-2.5 px-3 bg-zinc-900 text-white rounded-xl font-bold text-xs hover:bg-zinc-800 transition-colors">
              GitHub
            </a>
          ` : ''}
          ${isAdmin ? `
            <button type="button" onclick="window.openEditProjectModal(${idx})" class="admin-only-action py-2.5 px-3 bg-zinc-100 text-zinc-800 rounded-xl font-bold text-xs hover:bg-zinc-200 transition-colors border border-zinc-300 cursor-pointer" title="Edit this project">
              ✏️ Edit
            </button>
            <button type="button" onclick="window.deleteProject(${idx})" class="admin-only-action py-2.5 px-3 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors border border-red-200 cursor-pointer" title="Delete this project">
              🗑️ Delete
            </button>
          ` : ''}
        </div>
      </div>
    `;

    modal.classList.add('open');
  };

  window.closeProjectModal = function () {
    const modal = document.getElementById('project-modal');
    if (modal) modal.classList.remove('open');
  };

  // Add Project Modal Controls
  window.openAddProjectModal = function () {
    if (!isAdmin) {
      window.openOwnerLoginModal();
      showToast('🔒 Only the portfolio owner can add projects.');
      return;
    }
    const modal = document.getElementById('add-project-modal');
    if (modal) modal.classList.add('open');
    const input = document.getElementById('new-proj-title');
    if (input) setTimeout(() => input.focus(), 100);
  };

  window.closeAddProjectModal = function () {
    const modal = document.getElementById('add-project-modal');
    if (modal) modal.classList.remove('open');
  };

  // In-Website Add Project Handler
  window.handleAddNewProject = async function (event) {
    if (event) event.preventDefault();
    if (!isAdmin) {
      window.openOwnerLoginModal();
      showToast('🔒 Only the portfolio owner can add projects.');
      return;
    }

    const title = document.getElementById('new-proj-title')?.value.trim();
    const url = document.getElementById('new-proj-url')?.value.trim();
    const github = document.getElementById('new-proj-github')?.value.trim();
    const desc = document.getElementById('new-proj-desc')?.value.trim();
    const tags = document.getElementById('new-proj-tags')?.value.trim();
    const logo = document.getElementById('new-proj-logo')?.value.trim();

    if (!title || !url) {
      alert('Please fill in both Project Name/Title and Live URL.');
      return;
    }

    let domain = '';
    try {
      domain = new URL(url).hostname.replace(/^www\./, '');
    } catch (e) {
      domain = url;
    }

    const newProject = {
      id: 'proj-' + Date.now(),
      title: title,
      domain: domain || 'web-app',
      url: url,
      github: github || '',
      logo: logo || 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&w=120&q=80',
      description: desc || 'An interactive web application built with modern web technologies.',
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : ['Web', 'FullStack'],
      users: 'Active Project'
    };

    if (!Array.isArray(currentData.projects)) {
      currentData.projects = [];
    }
    currentData.projects.push(newProject);

    // Save to browser localStorage
    try {
      localStorage.setItem('portfolio_user_projects', JSON.stringify(currentData.projects));
    } catch (e) {}

    // Send to local server API to persist in portfolio-data.js on disk!
    try {
      await fetch('/api/add-project', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newProject)
      });
    } catch (err) {
      console.log('Saved to browser storage (server offline or static)');
    }

    renderProjects();
    populateCustomizer();
    window.closeAddProjectModal();

    const form = document.getElementById('add-project-form');
    if (form) form.reset();

    showToast(`🎉 Project "${title}" added to your website!`);
  };

  // Delete Project Handler
  window.deleteProject = async function (idx) {
    if (!isAdmin) {
      window.openOwnerLoginModal();
      showToast('🔒 Only the portfolio owner can delete projects.');
      return;
    }
    if (!currentData.projects || !currentData.projects[idx]) return;
    const proj = currentData.projects[idx];

    if (!confirm(`Are you sure you want to delete "${proj.title}" from your portfolio?`)) {
      return;
    }

    currentData.projects.splice(idx, 1);

    // Save to localStorage
    try {
      localStorage.setItem('portfolio_user_projects', JSON.stringify(currentData.projects));
    } catch (e) {}

    // Send to backend server to update portfolio-data.js
    try {
      await fetch('/api/delete-project', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: proj.id, index: idx })
      });
    } catch (err) {}

    window.closeProjectModal();
    renderProjects();
    populateCustomizer();
    showToast(`Project "${proj.title}" removed.`);
  };

  // Edit Project Controls
  window.openEditProjectModal = function (idx) {
    if (!isAdmin) {
      window.openOwnerLoginModal();
      showToast('🔒 Only the portfolio owner can edit projects.');
      return;
    }
    const projs = currentData.projects || [];
    const p = projs[idx];
    if (!p) return;

    window.closeProjectModal();

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('edit-proj-idx', idx);
    setVal('edit-proj-title', p.title);
    setVal('edit-proj-url', p.url);
    setVal('edit-proj-github', p.github);
    setVal('edit-proj-desc', p.description);
    setVal('edit-proj-tags', Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''));
    setVal('edit-proj-logo', p.logo);

    const modal = document.getElementById('edit-project-modal');
    if (modal) modal.classList.add('open');
  };

  window.closeEditProjectModal = function () {
    const modal = document.getElementById('edit-project-modal');
    if (modal) modal.classList.remove('open');
  };

  window.handleSaveEditProject = async function (event) {
    if (event) event.preventDefault();
    if (!isAdmin) {
      window.openOwnerLoginModal();
      showToast('🔒 Only the portfolio owner can edit projects.');
      return;
    }

    const idx = parseInt(document.getElementById('edit-proj-idx')?.value, 10);
    if (isNaN(idx) || !currentData.projects || !currentData.projects[idx]) return;

    const title = document.getElementById('edit-proj-title')?.value.trim();
    const url = document.getElementById('edit-proj-url')?.value.trim();
    const github = document.getElementById('edit-proj-github')?.value.trim();
    const desc = document.getElementById('edit-proj-desc')?.value.trim();
    const tags = document.getElementById('edit-proj-tags')?.value.trim();
    const logo = document.getElementById('edit-proj-logo')?.value.trim();

    if (!title || !url) {
      alert('Please fill in both Project Title and Live URL.');
      return;
    }

    let domain = '';
    try {
      domain = new URL(url).hostname.replace(/^www\./, '');
    } catch (e) {
      domain = url;
    }

    const current = currentData.projects[idx];
    current.title = title;
    current.url = url;
    current.domain = domain || current.domain;
    current.github = github;
    current.description = desc;
    current.tags = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : current.tags;
    if (logo) current.logo = logo;

    try {
      localStorage.setItem('portfolio_user_projects', JSON.stringify(currentData.projects));
    } catch (e) {}

    try {
      await fetch('/api/edit-project', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ index: idx, id: current.id, ...current })
      });
    } catch (err) {}

    window.closeEditProjectModal();
    renderProjects();
    populateCustomizer();
    showToast(`✅ Project "${title}" updated successfully!`);
  };

  // Achievement Modal Controls
  window.openAddAchievementModal = function () {
    if (!isAdmin) {
      window.openOwnerLoginModal();
      showToast('🔒 Only the portfolio owner can add achievements.');
      return;
    }
    const modal = document.getElementById('add-achievement-modal');
    if (modal) modal.classList.add('open');
    const input = document.getElementById('new-ach-title');
    if (input) setTimeout(() => input.focus(), 100);
  };

  window.closeAddAchievementModal = function () {
    const modal = document.getElementById('add-achievement-modal');
    if (modal) modal.classList.remove('open');
  };

  window.openAchievementModal = function (idx) {
    const achs = currentData.achievements || [];
    const a = achs[idx];
    if (!a) return;

    const modal = document.getElementById('achievement-modal');
    const content = document.getElementById('achievement-modal-content');

    content.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center gap-4 border-b border-zinc-200 pb-4">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-sm shrink-0" style="background: ${a.bgGradient || '#d97706'}">
            🏆
          </div>
          <div class="overflow-hidden">
            <div class="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600">${a.badgeType || 'HONOR'} CREDENTIAL</div>
            <h3 class="text-xl font-bold text-zinc-900 truncate">${a.title}</h3>
            <p class="text-xs text-zinc-500 font-medium">${a.issuer || ''} • ${a.date || ''}</p>
          </div>
        </div>

        <p class="text-zinc-700 text-sm leading-relaxed">${a.description || 'Achievement recognized for technical excellence and dedication.'}</p>

        <div class="flex items-center gap-3 pt-4 border-t border-zinc-200">
          ${a.credentialUrl ? `
            <a href="${a.credentialUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 py-2.5 text-center bg-[#FBC138] text-black font-extrabold text-xs rounded-xl border border-black hover:bg-amber-400 transition-colors">
              Verify Certificate ↗
            </a>
          ` : `
            <div class="flex-1 text-xs font-mono text-zinc-400 italic">Verified Portfolio Milestone</div>
          `}
          ${isAdmin ? `
            <button type="button" onclick="window.openEditAchievementModal(${idx})" class="admin-only-action py-2.5 px-3 bg-zinc-100 text-zinc-800 rounded-xl font-bold text-xs hover:bg-zinc-200 transition-colors border border-zinc-300 cursor-pointer" title="Edit this achievement">
              ✏️ Edit
            </button>
            <button type="button" onclick="window.deleteAchievement(${idx})" class="admin-only-action py-2.5 px-3 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors border border-red-200 cursor-pointer" title="Delete this achievement">
              🗑️ Delete
            </button>
          ` : ''}
        </div>
      </div>
    `;

    modal.classList.add('open');
  };

  window.closeAchievementModal = function () {
    const modal = document.getElementById('achievement-modal');
    if (modal) modal.classList.remove('open');
  };

  window.handleAddNewAchievement = async function (event) {
    if (event) event.preventDefault();
    if (!isAdmin) {
      window.openOwnerLoginModal();
      showToast('🔒 Only the portfolio owner can add achievements.');
      return;
    }

    const title = document.getElementById('new-ach-title')?.value.trim();
    const issuer = document.getElementById('new-ach-issuer')?.value.trim();
    const date = document.getElementById('new-ach-date')?.value.trim();
    const url = document.getElementById('new-ach-url')?.value.trim();
    const theme = document.getElementById('new-ach-theme')?.value || 'gold';
    const desc = document.getElementById('new-ach-desc')?.value.trim();

    if (!title || !issuer) {
      alert('Please fill in both Achievement Title and Issuer.');
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

    const randomDigits = Math.floor(1000 + Math.random() * 9000);

    const newAchievement = {
      id: 'ach-' + Date.now(),
      title: title,
      issuer: issuer,
      date: date || new Date().getFullYear().toString(),
      badgeType: theme.toUpperCase(),
      bgGradient: themes[theme] || themes.gold,
      number: `•••• •••• •••• ${randomDigits}`,
      description: desc || 'Achievement recognized for technical excellence and dedication.',
      credentialUrl: url || ''
    };

    if (!Array.isArray(currentData.achievements)) {
      currentData.achievements = [];
    }
    currentData.achievements.push(newAchievement);

    try {
      localStorage.setItem('portfolio_user_achievements', JSON.stringify(currentData.achievements));
    } catch (e) {}

    try {
      await fetch('/api/add-achievement', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newAchievement)
      });
    } catch (err) {
      console.log('Saved achievement to browser storage');
    }

    renderAchievements();
    window.closeAddAchievementModal();

    const form = document.getElementById('add-achievement-form');
    if (form) form.reset();

    showToast(`🏆 Achievement "${title}" added to your portfolio!`);
  };

  window.deleteAchievement = async function (idx) {
    if (!isAdmin) {
      window.openOwnerLoginModal();
      showToast('🔒 Only the portfolio owner can delete achievements.');
      return;
    }
    if (!currentData.achievements || !currentData.achievements[idx]) return;
    const ach = currentData.achievements[idx];

    if (!confirm(`Are you sure you want to delete "${ach.title}"?`)) {
      return;
    }

    currentData.achievements.splice(idx, 1);

    try {
      localStorage.setItem('portfolio_user_achievements', JSON.stringify(currentData.achievements));
    } catch (e) {}

    try {
      await fetch('/api/delete-achievement', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: ach.id, index: idx })
      });
    } catch (err) {}

    window.closeAchievementModal();
    renderAchievements();
    showToast(`Achievement "${ach.title}" removed.`);
  };

  // Edit Achievement Controls
  window.openEditAchievementModal = function (idx) {
    if (!isAdmin) {
      window.openOwnerLoginModal();
      showToast('🔒 Only the portfolio owner can edit achievements.');
      return;
    }
    const achs = currentData.achievements || [];
    const a = achs[idx];
    if (!a) return;

    window.closeAchievementModal();

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('edit-ach-idx', idx);
    setVal('edit-ach-title', a.title);
    setVal('edit-ach-issuer', a.issuer);
    setVal('edit-ach-date', a.date);
    setVal('edit-ach-url', a.credentialUrl);
    setVal('edit-ach-desc', a.description);

    const modal = document.getElementById('edit-achievement-modal');
    if (modal) modal.classList.add('open');
  };

  window.closeEditAchievementModal = function () {
    const modal = document.getElementById('edit-achievement-modal');
    if (modal) modal.classList.remove('open');
  };

  window.handleSaveEditAchievement = async function (event) {
    if (event) event.preventDefault();
    if (!isAdmin) {
      window.openOwnerLoginModal();
      showToast('🔒 Only the portfolio owner can edit achievements.');
      return;
    }

    const idx = parseInt(document.getElementById('edit-ach-idx')?.value, 10);
    if (isNaN(idx) || !currentData.achievements || !currentData.achievements[idx]) return;

    const title = document.getElementById('edit-ach-title')?.value.trim();
    const issuer = document.getElementById('edit-ach-issuer')?.value.trim();
    const date = document.getElementById('edit-ach-date')?.value.trim();
    const url = document.getElementById('edit-ach-url')?.value.trim();
    const theme = document.getElementById('edit-ach-theme')?.value || 'gold';
    const desc = document.getElementById('edit-ach-desc')?.value.trim();

    if (!title || !issuer) {
      alert('Please fill in both Achievement Title and Issuer.');
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

    const current = currentData.achievements[idx];
    current.title = title;
    current.issuer = issuer;
    current.date = date;
    current.credentialUrl = url;
    current.bgGradient = themes[theme] || current.bgGradient;
    current.badgeType = theme.toUpperCase();
    current.description = desc;

    try {
      localStorage.setItem('portfolio_user_achievements', JSON.stringify(currentData.achievements));
    } catch (e) {}

    try {
      await fetch('/api/edit-achievement', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ index: idx, id: current.id, ...current })
      });
    } catch (err) {}

    window.closeEditAchievementModal();
    renderAchievements();
    showToast(`✅ Achievement "${title}" updated successfully!`);
  };

  // Experience Modal Controls (Add, Edit, View, Delete)
  window.openExperienceModal = function (idx) {
    const cards = currentData.visaCards || [];
    const c = cards[idx];
    if (!c) return;

    const cardTitle = c.role || c.education || c.university || c.status || 'CAREER CREDENTIAL';
    const org = c.company || c.university || c.Branch || c.present || 'Self / Tech';
    const tenure = c.tenure || c.location || c.status || 'Present';

    const modal = document.getElementById('experience-modal');
    const content = document.getElementById('experience-modal-content');

    content.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center gap-4 border-b border-zinc-200 pb-4">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-sm shrink-0" style="background: ${c.bgGradient || '#312e81'}">
            💼
          </div>
          <div class="overflow-hidden">
            <div class="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600">PROFESSIONAL CREDENTIAL</div>
            <h3 class="text-xl font-bold text-zinc-900 truncate">${cardTitle}</h3>
            <p class="text-xs text-zinc-500 font-medium">${org} • ${tenure}</p>
          </div>
        </div>

        <p class="text-zinc-700 text-sm leading-relaxed">${c.description || 'Verified academic, professional or open-source engineering credential.'}</p>

        <div class="flex items-center gap-3 pt-4 border-t border-zinc-200">
          ${isAdmin ? `
            <button type="button" onclick="window.openEditExperienceModal(${idx})" class="admin-only-action flex-1 py-2.5 bg-[#FBC138] text-black font-extrabold text-xs rounded-xl border border-black hover:bg-amber-400 transition-colors cursor-pointer">
              ✏️ Edit Experience
            </button>
            <button type="button" onclick="window.deleteExperience(${idx})" class="admin-only-action py-2.5 px-4 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors border border-red-200 cursor-pointer" title="Delete this experience card">
              🗑️ Delete
            </button>
          ` : `
            <div class="flex-1 text-xs font-mono text-zinc-400 italic">Verified Portfolio Credential</div>
          `}
        </div>
      </div>
    `;

    modal.classList.add('open');
  };

  window.closeExperienceModal = function () {
    const modal = document.getElementById('experience-modal');
    if (modal) modal.classList.remove('open');
  };

  window.openAddExperienceModal = function () {
    if (!isAdmin) {
      window.openOwnerLoginModal();
      showToast('🔒 Only the portfolio owner can add experience.');
      return;
    }

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('exp-form-idx', '-1');
    setVal('exp-form-role', '');
    setVal('exp-form-company', '');
    setVal('exp-form-tenure', '');
    setVal('exp-form-desc', '');

    const badge = document.getElementById('exp-form-badge');
    const heading = document.getElementById('exp-form-heading');
    const submitBtn = document.getElementById('exp-form-submit-btn');

    if (badge) badge.textContent = 'CAREER CREDENTIAL';
    if (heading) heading.textContent = 'Add Experience';
    if (submitBtn) submitBtn.textContent = '💼 Add Experience';

    const modal = document.getElementById('experience-form-modal');
    if (modal) modal.classList.add('open');
    const input = document.getElementById('exp-form-role');
    if (input) setTimeout(() => input.focus(), 100);
  };

  window.openEditExperienceModal = function (idx) {
    if (!isAdmin) {
      window.openOwnerLoginModal();
      showToast('🔒 Only the portfolio owner can edit experience.');
      return;
    }

    const cards = currentData.visaCards || [];
    const c = cards[idx];
    if (!c) return;

    window.closeExperienceModal();

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('exp-form-idx', idx);
    setVal('exp-form-role', c.role || c.education || c.university || '');
    setVal('exp-form-company', c.company || c.university || c.Branch || '');
    setVal('exp-form-tenure', c.tenure || c.location || c.status || '');
    setVal('exp-form-desc', c.description || '');

    const badge = document.getElementById('exp-form-badge');
    const heading = document.getElementById('exp-form-heading');
    const submitBtn = document.getElementById('exp-form-submit-btn');

    if (badge) badge.textContent = 'EDIT CREDENTIAL';
    if (heading) heading.textContent = 'Edit Experience';
    if (submitBtn) submitBtn.textContent = '💾 Save Changes';

    const modal = document.getElementById('experience-form-modal');
    if (modal) modal.classList.add('open');
  };

  window.closeExperienceFormModal = function () {
    const modal = document.getElementById('experience-form-modal');
    if (modal) modal.classList.remove('open');
  };

  window.handleSaveExperience = async function (event) {
    if (event) event.preventDefault();
    if (!isAdmin) {
      window.openOwnerLoginModal();
      showToast('🔒 Only the portfolio owner can save experience.');
      return;
    }

    const idx = parseInt(document.getElementById('exp-form-idx')?.value, 10);
    const role = document.getElementById('exp-form-role')?.value.trim();
    const company = document.getElementById('exp-form-company')?.value.trim();
    const tenure = document.getElementById('exp-form-tenure')?.value.trim();
    const theme = document.getElementById('exp-form-theme')?.value || 'violet';
    const desc = document.getElementById('exp-form-desc')?.value.trim();

    if (!role || !company) {
      alert('Please fill in both Role/Degree and Company/University.');
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

    if (!Array.isArray(currentData.visaCards)) {
      currentData.visaCards = [];
    }

    if (idx >= 0 && currentData.visaCards[idx]) {
      const target = currentData.visaCards[idx];
      target.role = role;
      target.company = company;
      target.tenure = tenure || 'Present';
      target.bgGradient = expThemes[theme] || target.bgGradient;
      target.description = desc;

      try {
        localStorage.setItem('portfolio_user_experience', JSON.stringify(currentData.visaCards));
      } catch (e) {}

      try {
        await fetch('/api/edit-experience', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ index: idx, id: target.id, ...target })
        });
      } catch (err) {}

      showToast(`✅ Experience "${role}" updated!`);
    } else {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const newCard = {
        id: 'exp-' + Date.now(),
        role: role,
        company: company,
        tenure: tenure || 'Present',
        bgGradient: expThemes[theme] || expThemes.violet,
        number: `•••• •••• •••• ${randomDigits}`,
        description: desc
      };

      currentData.visaCards.push(newCard);

      try {
        localStorage.setItem('portfolio_user_experience', JSON.stringify(currentData.visaCards));
      } catch (e) {}

      try {
        await fetch('/api/add-experience', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(newCard)
        });
      } catch (err) {}

      showToast(`🎉 Experience "${role}" added!`);
    }

    window.closeExperienceFormModal();
    renderVisaCards();
  };

  window.deleteExperience = async function (idx) {
    if (!isAdmin) {
      window.openOwnerLoginModal();
      showToast('🔒 Only the portfolio owner can delete experience.');
      return;
    }
    if (!currentData.visaCards || !currentData.visaCards[idx]) return;
    const c = currentData.visaCards[idx];
    const title = c.role || c.education || 'Experience';

    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    currentData.visaCards.splice(idx, 1);

    try {
      localStorage.setItem('portfolio_user_experience', JSON.stringify(currentData.visaCards));
    } catch (e) {}

    try {
      await fetch('/api/delete-experience', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: c.id, index: idx })
      });
    } catch (err) {}

    window.closeExperienceModal();
    renderVisaCards();
    showToast(`Experience "${title}" removed.`);
  };

  // Contact Dialog
  window.openContactDialog = function () {
    const modal = document.getElementById('contact-dialog');
    if (modal) modal.classList.add('open');
  };

  window.closeContactDialog = function () {
    const modal = document.getElementById('contact-dialog');
    if (modal) modal.classList.remove('open');
  };

  // Highlighter "If you like, send me 'Hi'!" trigger
  window.sendHiMessage = function () {
    window.openContactDialog();
    const msgInput = document.getElementById('dlg-msg');
    if (msgInput) {
      msgInput.value = "Hi Hemasagar! 👋 I checked out your portfolio and loved your work!";
      setTimeout(() => msgInput.focus(), 150);
    }
  };

  // Music Player Toggle
  function setupAudio() {
    audioEl = document.getElementById('radio');
    const playBtn = document.getElementById('play-audio-btn');

    if (playBtn && audioEl) {
      playBtn.addEventListener('click', () => {
        if (!isAudioPlaying) {
          audioEl.play().then(() => {
            isAudioPlaying = true;
            playBtn.classList.add('text-amber-500');
            showToast('🎵 Playing radio tune...');
          }).catch(err => {
            console.log('Audio autoplay prevented:', err);
            showToast('Click anywhere on page to enable audio!');
          });
        } else {
          audioEl.pause();
          isAudioPlaying = false;
          playBtn.classList.remove('text-amber-500');
          showToast('Music paused.');
        }
      });
    }
  }

  // Event Listeners
  function setupEventListeners() {
    const prevBtn = document.getElementById('prev-testimonial-btn');
    const nextBtn = document.getElementById('next-testimonial-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const list = currentData.testimonials || [];
        currentTestimonialIndex = (currentTestimonialIndex - 1 + list.length) % list.length;
        renderTestimonials();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const list = currentData.testimonials || [];
        currentTestimonialIndex = (currentTestimonialIndex + 1) % list.length;
        renderTestimonials();
      });
    }

    const projModal = document.getElementById('project-modal');
    if (projModal) {
      projModal.addEventListener('click', (e) => {
        if (e.target === projModal) window.closeProjectModal();
      });
    }

    const addProjModal = document.getElementById('add-project-modal');
    if (addProjModal) {
      addProjModal.addEventListener('click', (e) => {
        if (e.target === addProjModal) window.closeAddProjectModal();
      });
    }

    const achModal = document.getElementById('achievement-modal');
    if (achModal) {
      achModal.addEventListener('click', (e) => {
        if (e.target === achModal) window.closeAchievementModal();
      });
    }

    const addAchModal = document.getElementById('add-achievement-modal');
    if (addAchModal) {
      addAchModal.addEventListener('click', (e) => {
        if (e.target === addAchModal) window.closeAddAchievementModal();
      });
    }

    const editProjModal = document.getElementById('edit-project-modal');
    if (editProjModal) {
      editProjModal.addEventListener('click', (e) => {
        if (e.target === editProjModal) window.closeEditProjectModal();
      });
    }

    const editAchModal = document.getElementById('edit-achievement-modal');
    if (editAchModal) {
      editAchModal.addEventListener('click', (e) => {
        if (e.target === editAchModal) window.closeEditAchievementModal();
      });
    }

    const expModal = document.getElementById('experience-modal');
    if (expModal) {
      expModal.addEventListener('click', (e) => {
        if (e.target === expModal) window.closeExperienceModal();
      });
    }

    const expFormModal = document.getElementById('experience-form-modal');
    if (expFormModal) {
      expFormModal.addEventListener('click', (e) => {
        if (e.target === expFormModal) window.closeExperienceFormModal();
      });
    }

    const contactModal = document.getElementById('contact-dialog');
    if (contactModal) {
      contactModal.addEventListener('click', (e) => {
        if (e.target === contactModal) window.closeContactDialog();
      });
    }

    const ownerLoginModal = document.getElementById('owner-login-modal');
    if (ownerLoginModal) {
      ownerLoginModal.addEventListener('click', (e) => {
        if (e.target === ownerLoginModal) window.closeOwnerLoginModal();
      });
    }

    const openDrawerBtn = document.getElementById('open-customizer-btn');
    const closeDrawerBtn = document.getElementById('close-customizer-btn');
    const drawer = document.getElementById('customizer-drawer');

    if (openDrawerBtn && drawer) {
      openDrawerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.handleAccountButtonClick();
      });
    }
    if (closeDrawerBtn && drawer) {
      closeDrawerBtn.addEventListener('click', () => drawer.classList.remove('open'));
    }

    setupCustomizerHandlers();
  }

  // Customizer Setup
  function populateCustomizer() {
    const p = currentData.personal || {};
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('custom-name', p.name);
    setVal('custom-email', p.email);
    setVal('custom-role', p.role);
    setVal('custom-avatar-url', (p.avatar && !p.avatar.startsWith('data:')) ? p.avatar : '');
    setVal('custom-owner-pin', adminPin);
    updateAvatarElements(p.avatar || 'https://github.com/Hemasagarraju.png');

    const scanOpt = document.getElementById('opt-terminal-scan');
    if (scanOpt) scanOpt.checked = isScanBeamEnabled;
    const matrixOpt = document.getElementById('opt-terminal-matrix');
    if (matrixOpt) matrixOpt.checked = isMatrixEnabled;

    const projSelect = document.getElementById('custom-project-select');
    if (projSelect && currentData.projects) {
      projSelect.innerHTML = currentData.projects.map((proj, idx) => `
        <option value="${idx}">${proj.title}</option>
      `).join('');

      loadProjectInCustomizer(0);

      projSelect.onchange = (e) => loadProjectInCustomizer(parseInt(e.target.value, 10));
    }
  }

  function loadProjectInCustomizer(idx) {
    const proj = (currentData.projects && currentData.projects[idx]) || {};
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('custom-proj-title', proj.title);
    setVal('custom-proj-domain', proj.domain);
    setVal('custom-proj-url', proj.url);
    setVal('custom-proj-desc', proj.description);
    setVal('custom-proj-users', proj.users);
  }

  function setupCustomizerHandlers() {
    const savePersonalBtn = document.getElementById('save-personal-btn');
    if (savePersonalBtn) {
      savePersonalBtn.addEventListener('click', () => {
        if (!isAdmin) {
          window.openOwnerLoginModal();
          showToast('🔒 Only the portfolio owner can modify account settings.');
          return;
        }

        const getVal = id => document.getElementById(id)?.value.trim();
        const newName = getVal('custom-name') || currentData.personal.name;
        const newRole = getVal('custom-role') || currentData.personal.role;
        const newEmail = getVal('custom-email') || currentData.personal.email;
        const newAvatar = getVal('custom-avatar-url') || currentData.personal.avatar || 'https://github.com/Hemasagarraju.png';
        const newPin = getVal('custom-owner-pin');

        if (newPin) {
          adminPin = newPin;
          localStorage.setItem('portfolio_admin_pin', newPin);
        }

        currentData.personal.name = newName;
        currentData.personal.email = newEmail;
        currentData.personal.role = newRole;
        currentData.personal.avatar = newAvatar;

        currentData._isExplicitDrawerSave = true;
        localStorage.setItem('portfolio_user_profile', JSON.stringify({
          name: newName,
          role: newRole,
          email: newEmail,
          avatar: newAvatar
        }));

        updateAvatarElements(newAvatar);

        // Sync with backend server
        fetch('/api/save-profile', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: newName,
            role: newRole,
            email: newEmail,
            avatar: newAvatar,
            pin: newPin || adminPin
          })
        })
        .then(r => r.json())
        .then(res => {
          if (res.success && res.personal) {
            currentData.personal = Object.assign({}, currentData.personal, res.personal);
          }
        })
        .catch(err => console.warn('Saved profile locally:', err));

        renderIntro();
        renderHeroLetters();
        populateCustomizer();
        showToast('✅ Account profile, PIN & photo saved successfully!');
      });
    }

    const saveProjectBtn = document.getElementById('save-project-btn');
    if (saveProjectBtn) {
      saveProjectBtn.addEventListener('click', () => {
        if (!isAdmin) {
          window.openOwnerLoginModal();
          showToast('🔒 Only the portfolio owner can edit projects.');
          return;
        }

        const projSelect = document.getElementById('custom-project-select');
        const idx = parseInt(projSelect?.value, 10);
        if (isNaN(idx) || !currentData.projects || !currentData.projects[idx]) return;

        const getVal = id => document.getElementById(id)?.value.trim();
        const p = currentData.projects[idx];

        p.title = getVal('custom-proj-title') || p.title;
        p.domain = getVal('custom-proj-domain') || p.domain;
        p.url = getVal('custom-proj-url') || p.url;
        p.description = getVal('custom-proj-desc') || p.description;
        p.users = getVal('custom-proj-users') || p.users;

        currentData._isExplicitDrawerSave = true;
        localStorage.setItem('itsvg_exact_model_data', JSON.stringify(currentData));
        renderProjects();
        showToast(`Project "${p.title}" updated!`);
      });
    }

    const addNewProjBtn = document.getElementById('add-new-proj-btn');
    if (addNewProjBtn) {
      addNewProjBtn.addEventListener('click', () => {
        if (!isAdmin) {
          window.openOwnerLoginModal();
          showToast('🔒 Only the portfolio owner can create projects.');
          return;
        }

        const newP = {
          id: `proj-${Date.now()}`,
          title: "New Project Showcase",
          domain: "myproject.dev",
          url: "https://github.com/Hemasagarraju",
          github: "https://github.com/Hemasagarraju",
          logo: "https://gprm.itsvg.in/logo.png",
          description: "A fast, modern web application crafted with React and Tailwind CSS.",
          tags: ["React", "JavaScript", "Tailwind"],
          users: "1K+ Users"
        };
        currentData.projects.unshift(newP);
        currentData._isExplicitDrawerSave = true;
        localStorage.setItem('itsvg_exact_model_data', JSON.stringify(currentData));
        renderProjects();
        populateCustomizer();
        showToast('New project created!');
      });
    }

    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (!isAdmin) {
          window.openOwnerLoginModal();
          return;
        }
        if (confirm('Reset to original default data from portfolio-data.js?')) {
          localStorage.removeItem('itsvg_exact_model_data');
          localStorage.removeItem('portfolio_user_profile');
          localStorage.removeItem('portfolio_user_avatar');
          currentData = window.portfolioData ? JSON.parse(JSON.stringify(window.portfolioData)) : {};
          renderAll();
          showToast('Reset complete.');
        }
      });
    }
  }

  // Window Avatar Handlers
  window.handleAvatarFileUpload = function (event) {
    if (!isAdmin) {
      window.openOwnerLoginModal();
      showToast('🔒 Only the portfolio owner can upload a profile photo.');
      return;
    }

    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Please select a valid image file (PNG, JPG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const rawData = e.target.result;
      const img = new Image();
      img.onload = function () {
        const maxDim = 512;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressedDataUrl = canvas.toDataURL('image/png', 0.9);

        // Immediate visual feedback across all avatar elements
        updateAvatarElements(compressedDataUrl);
        currentData.personal.avatar = compressedDataUrl;
        localStorage.setItem('portfolio_user_avatar', compressedDataUrl);
        localStorage.setItem('portfolio_user_profile', JSON.stringify({
          name: currentData.personal.name,
          role: currentData.personal.role,
          email: currentData.personal.email,
          avatar: compressedDataUrl
        }));

        const urlInput = document.getElementById('custom-avatar-url');
        if (urlInput) urlInput.value = '';

        // Send to server to write avatar.png and update portfolio-data.js
        fetch('/api/upload-avatar', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ data: compressedDataUrl })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.avatarUrl) {
            currentData.personal.avatar = data.avatarUrl;
            updateAvatarElements(data.avatarUrl);
            if (urlInput) urlInput.value = data.avatarUrl;
            showToast('📸 Profile photo uploaded & saved successfully!');
          } else {
            showToast('📸 Profile photo applied!');
          }
        })
        .catch(err => {
          console.warn('Server upload fallback to local:', err);
          showToast('📸 Profile photo saved locally!');
        });
      };
      img.src = rawData;
    };
    reader.readAsDataURL(file);
  };

  window.handleAvatarUrlInput = function (url) {
    const preview = document.getElementById('custom-avatar-preview');
    if (preview && url && url.trim()) {
      preview.src = url.trim();
    }
  };

  window.previewAvatarUrl = function () {
    const url = document.getElementById('custom-avatar-url')?.value.trim();
    if (!url) {
      showToast('⚠️ Please enter an image URL first');
      return;
    }
    updateAvatarElements(url);
    showToast('👁️ Live preview updated! Click "Save Profile, PIN & Photo" to apply.');
  };

  window.usePresetAvatar = function (type) {
    let url = 'https://github.com/Hemasagarraju.png';
    const urlInput = document.getElementById('custom-avatar-url');
    if (urlInput) urlInput.value = url;
    updateAvatarElements(url);
    currentData.personal.avatar = url;
    showToast('🐙 GitHub avatar loaded! Click "Save Profile, PIN & Photo" to apply.');
  };

  // Window Authentication Controls
  window.handleAccountButtonClick = function () {
    if (isAdmin) {
      const drawer = document.getElementById('customizer-drawer');
      if (drawer) drawer.classList.add('open');
    } else {
      window.openOwnerLoginModal();
    }
  };

  window.openOwnerLoginModal = function () {
    const modal = document.getElementById('owner-login-modal');
    if (modal) {
      modal.classList.add('open');
      const err = document.getElementById('owner-login-error');
      if (err) {
        err.textContent = '';
        err.classList.add('hidden');
      }
      const pinInput = document.getElementById('owner-login-pin');
      if (pinInput) {
        pinInput.value = '';
        setTimeout(() => pinInput.focus(), 150);
      }
    }
  };

  window.closeOwnerLoginModal = function () {
    const modal = document.getElementById('owner-login-modal');
    if (modal) modal.classList.remove('open');
  };

  window.handleOwnerLoginSubmit = async function (event) {
    if (event) event.preventDefault();
    const pinInput = document.getElementById('owner-login-pin');
    const err = document.getElementById('owner-login-error');
    const enteredPin = (pinInput ? pinInput.value : '').trim();

    if (!enteredPin) {
      if (err) {
        err.textContent = 'Please enter your Owner PIN.';
        err.classList.remove('hidden');
      }
      return;
    }

    let isValid = (enteredPin === adminPin);

    // Also check server if available
    try {
      const resp = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: enteredPin })
      });
      const data = await resp.json();
      if (data && typeof data.valid === 'boolean') {
        isValid = data.valid;
      }
    } catch (e) {
      // offline / static fallback uses adminPin
    }

    if (isValid) {
      isAdmin = true;
      adminPin = enteredPin;
      localStorage.setItem('portfolio_is_admin', 'true');
      localStorage.setItem('portfolio_admin_pin', enteredPin);
      syncAdminModeUI();
      renderAll();
      window.closeOwnerLoginModal();
      const drawer = document.getElementById('customizer-drawer');
      if (drawer) drawer.classList.add('open');
      showToast('👑 Welcome back, Hemasagar! Owner Mode unlocked.');
    } else {
      if (err) {
        err.textContent = '❌ Incorrect PIN. Please try again.';
        err.classList.remove('hidden');
      }
      if (pinInput) {
        pinInput.classList.add('border-red-500');
        setTimeout(() => pinInput.classList.remove('border-red-500'), 1500);
      }
    }
  };

  window.logoutAdmin = function () {
    isAdmin = false;
    localStorage.removeItem('portfolio_is_admin');
    syncAdminModeUI();
    const drawer = document.getElementById('customizer-drawer');
    if (drawer) drawer.classList.remove('open');
    renderAll();
    showToast('🔒 Locked into Visitor Mode (Owner logged out)');
  };

  window.toggleShowOwnerPin = function () {
    const pinInput = document.getElementById('custom-owner-pin');
    if (!pinInput) return;
    pinInput.type = pinInput.type === 'password' ? 'text' : 'password';
  };

  function showToast(msg) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<span>⚡</span><span>${msg}</span>`;
    container.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity 0.3s';
      setTimeout(() => t.remove(), 300);
    }, 2800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
