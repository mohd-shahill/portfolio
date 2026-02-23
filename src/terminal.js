import { apps, showToast } from './main.js';

let commandHistory = [];
let historyIndex = -1;

// ════════════════════════════════════════════════════════════
// TERMINAL
// ════════════════════════════════════════════════════════════
const terminalCommands = {
  help: () => `
Available commands:
  <span class="t-gold">about</span>       — Who is Shahil?
  <span class="t-gold">skills</span>      — View technical skills
  <span class="t-gold">projects</span>    — Browse projects
  <span class="t-gold">experience</span>  — Work experience
  <span class="t-gold">contact</span>     — Get in touch
  <span class="t-gold">education</span>   — Education details
  <span class="t-gold">whoami</span>      — Identity info
  <span class="t-gold">date</span>        — Current date & time
  <span class="t-gold">neofetch</span>    — System info
  <span class="t-gold">open [app]</span>  — Open an app window
  <span class="t-gold">clear</span>       — Clear terminal
  <span class="t-gold">help</span>        — Show this help
`,
  about: () => `
<span class="t-iris">╔══════════════════════════════════════╗</span>
<span class="t-iris">║</span>  <span class="t-text">Mohd Shahil</span>                        <span class="t-iris">║</span>
<span class="t-iris">║</span>  <span class="t-foam">Full Stack Developer</span>               <span class="t-iris">║</span>
<span class="t-iris">╚══════════════════════════════════════╝</span>

Passionate developer with expertise in React.js, 
Node.js, Express.js, and modern databases.
B.Tech in Information Technology from 
Krishna Engineering College (2021-2025).
`,
  skills: () => `
<span class="t-iris">Languages:</span>    C, JavaScript
<span class="t-foam">Technologies:</span> React.js, Node.js, Express.js, TailwindCSS
<span class="t-gold">Tools/DB:</span>     MySQL, PostgreSQL, AWS S3, Git
`,
  projects: () => `
<span class="t-gold">1.</span> <span class="t-text">JWT Web Tools</span> — Encoder, Decoder & Verifier
   Client-side JWT utility with Web Crypto API.
   
<span class="t-gold">2.</span> <span class="t-text">JobHoarders</span> — Full-Stack Job Portal
   MERN stack job portal with Botpress chatbot.
   
<span class="t-gold">3.</span> <span class="t-text">NASA APOD</span> — Astronomy Picture Explorer
   React + Vite app integrating NASA's APOD API.
`,
  experience: () => `
<span class="t-foam">AKACORP Technology</span> — Full Stack Developer Intern
<span class="t-muted">June 2025 – October 2025</span>
  • Node.js, Express, MySQL backend services
  • AWS S3 file uploads, PWA support
  • VPS/Nginx deployment with SSL

<span class="t-foam">QSpiders/JSpiders</span> — Summer Intern
<span class="t-muted">July 2024 – August 2024</span>
  • Java, Python, HTML, CSS, JavaScript training
  • SDLC, version control, web development
`,
  contact: () => `
<span class="t-iris">Email:</span>    sahilsgf26@gmail.com
<span class="t-foam">Phone:</span>    +91 9871105736
<span class="t-gold">LinkedIn:</span> linkedin.com/in/mohd-shahill
`,
  education: () => `
<span class="t-iris">B.Tech — Information Technology</span>
  Krishna Engineering College (2021-2025)
  
<span class="t-foam">Class 12th</span>
  J R Global International School (2020-2021)
  
<span class="t-foam">Class 10th</span>
  J R Global International School (2018-2019)

<span class="t-gold">Certificates:</span>
  • Full Stack Developer Course: Bootcamp
  • HTML and CSS in Depth — Meta
`,
  whoami: () => `<span class="t-iris">shahil</span> — Full Stack Developer & Creator of cool things ✨`,
  date: () => `<span class="t-foam">${new Date().toLocaleString()}</span>`,
  neofetch: () => `
<span class="t-iris">       ██████</span>       <span class="t-text">shahil</span>@<span class="t-foam">portfolio</span>
<span class="t-iris">     ██</span>      <span class="t-iris">██</span>     ─────────────────
<span class="t-iris">    ██</span>  <span class="t-foam">████</span>  <span class="t-iris">██</span>    <span class="t-iris">OS:</span>      ShahilOS v1.0.0
<span class="t-iris">   ██</span>  <span class="t-foam">██████</span>  <span class="t-iris">██</span>   <span class="t-iris">Host:</span>    Portfolio Desktop
<span class="t-iris">    ██</span>  <span class="t-foam">████</span>  <span class="t-iris">██</span>    <span class="t-iris">Shell:</span>   shahil-terminal 1.0
<span class="t-iris">     ██</span>      <span class="t-iris">██</span>     <span class="t-iris">WM:</span>      ShahilWM
<span class="t-iris">       ██████</span>       <span class="t-iris">Theme:</span>   Rose Pine
                     <span class="t-iris">Apps:</span>    6 (About, Exp, Projects, Skills, Contact, Terminal)
                     <span class="t-iris">Uptime:</span>  Since you opened this page 😄
`,
  rickroll: () => {
    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
    return `<span class="t-foam">🎵 Now playing: Never Gonna Give You Up</span>`;
  },
  matrix: () => {
    startMatrixEffect();
    return `<span class="t-foam">Wake up, Neo...</span>`;
  }
};


function initTerminal() {
  const input = document.getElementById('terminal-input');
  const output = document.getElementById('terminal-output');
  if (!input || !output) return;

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = input.value.trim().toLowerCase();
      if (!cmd) return;

      // Add to history
      commandHistory.unshift(cmd);
      historyIndex = -1;

      // Echo command
      const cmdLine = document.createElement('div');
      cmdLine.classList.add('terminal-line');
      cmdLine.innerHTML = `<span class="t-foam">shahil</span><span class="t-muted">@</span><span class="t-rose">portfolio</span><span class="t-muted">:~$</span> <span class="t-text">${escapeHtml(cmd)}</span>`;
      output.appendChild(cmdLine);

      // Process command
      let result = '';
      if (cmd === 'clear') {
        output.innerHTML = '';
        input.value = '';
        return;
      } else if (cmd.startsWith('open ')) {
        const appName = cmd.split(' ')[1];
        if (apps.includes(appName)) {
          openApp(appName);
          result = `<span class="t-foam">Opening ${appName}...</span>`;
        } else {
          result = `<span class="t-rose">Error: Unknown app "${escapeHtml(appName)}". Available: ${apps.join(', ')}</span>`;
        }
      } else if (cmd.startsWith('sudo ')) {
        result = `<span class="t-rose">shahil is not in the sudoers file. This incident will be reported. 🚨</span>`;
      } else if (cmd.startsWith('cowsay ')) {
        const text = cmd.substring(7) || 'Moo';
        const dashes = '-'.repeat(text.length + 2);
        result = `
<pre class="t-text" style="font-family:monospace; line-height:1.2;">
 ${dashes}
&lt; ${escapeHtml(text)} &gt;
 ${dashes}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
</pre>`;
      } else if (terminalCommands[cmd]) {
        result = terminalCommands[cmd]();
      } else {
        result = `<span class="t-rose">Command not found: ${escapeHtml(cmd)}</span>\nType <span class="t-gold">'help'</span> for available commands.`;
      }

      if (result) {
        const resultLine = document.createElement('div');
        resultLine.classList.add('terminal-line');
        resultLine.innerHTML = result;
        output.appendChild(resultLine);
      }

      input.value = '';
      // Scroll to bottom
      const termBody = document.getElementById('terminal-body');
      if (termBody) termBody.scrollTop = termBody.scrollHeight;
      output.scrollTop = output.scrollHeight;
    }

    // Command history navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        input.value = commandHistory[historyIndex];
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        input.value = commandHistory[historyIndex];
      } else {
        historyIndex = -1;
        input.value = '';
      }
    }
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ════════════════════════════════════════════════════════════
// SKILL BARS ANIMATION
// ════════════════════════════════════════════════════════════
function animateSkillBars() {
  document.querySelectorAll('.skill-bar-fill').forEach(bar => {
    const width = bar.dataset.width;
    if (width) {
      setTimeout(() => {
        bar.style.width = width + '%';
      }, 100);
    }
  });
}


// ════════════════════════════════════════════════════════════
// MATRIX EFFECT
// ════════════════════════════════════════════════════════════
function startMatrixEffect() {
  const terminalBody = document.getElementById('terminal-body');
  if (document.getElementById('matrix-canvas')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'matrix-canvas';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '0';
  canvas.style.opacity = '0.8';
  
  terminalBody.style.position = 'relative';
  terminalBody.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = terminalBody.clientWidth;
  canvas.height = terminalBody.clientHeight;

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
  const fontSize = 14;
  const columns = canvas.width / fontSize;
  const drops = [];
  for (let x = 0; x < columns; x++) drops[x] = 1;

  const interval = setInterval(() => {
    ctx.fillStyle = 'rgba(31, 29, 46, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#9ccfd8';
    ctx.font = fontSize + 'px monospace';
    
    for (let i = 0; i < drops.length; i++) {
      const text = chars.charAt(Math.floor(Math.random() * chars.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }, 33);

  setTimeout(() => {
    clearInterval(interval);
    canvas.style.transition = 'opacity 1s';
    canvas.style.opacity = '0';
    setTimeout(() => canvas.remove(), 1000);
  }, 5000);
}

export { initTerminal };

