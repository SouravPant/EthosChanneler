export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'image/svg+xml');

  const { type, address, score, name, query, message, users, reviews } = req.query;

  let svg = '';

  switch (type) {
    case 'user':
      svg = generateUserImage(address, score, name);
      break;
    case 'search':
      svg = generateSearchImage();
      break;
    case 'stats':
      svg = generateStatsImage(users, reviews, score);
      break;
    case 'notfound':
      svg = generateNotFoundImage(query);
      break;
    case 'error':
      svg = generateErrorImage(message);
      break;
    default:
      svg = generateDefaultImage();
  }

  res.status(200).send(svg);
}

function generateUserImage(address, score, name) {
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown';
  const displayName = decodeURIComponent(name || 'Anonymous');
  const credibilityScore = score || 0;
  
  return `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0a0a0f;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="card" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgba(255,255,255,0.05);stop-opacity:1" />
        </linearGradient>
        <linearGradient id="score" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- Header -->
      <text x="60" y="80" fill="white" font-family="Arial, sans-serif" font-size="36" font-weight="bold">
        Ethos Network
      </text>
      <text x="60" y="120" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="20">
        Web3 Reputation Profile
      </text>
      
      <!-- User Card -->
      <rect x="60" y="180" width="1080" height="360" rx="20" fill="url(#card)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
      
      <!-- Avatar -->
      <circle cx="180" cy="280" r="60" fill="#6366f1" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
      <text x="180" y="290" fill="white" font-family="Arial, sans-serif" font-size="36" text-anchor="middle" font-weight="bold">
        ${displayName.charAt(0).toUpperCase()}
      </text>
      
      <!-- User Info -->
      <text x="280" y="250" fill="white" font-family="Arial, sans-serif" font-size="32" font-weight="bold">
        ${displayName}
      </text>
      <text x="280" y="290" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="20">
        ${shortAddress}
      </text>
      
      <!-- Credibility Score -->
      <rect x="280" y="320" width="200" height="60" rx="10" fill="url(#score)"/>
      <text x="380" y="345" fill="white" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" font-weight="bold">
        CREDIBILITY
      </text>
      <text x="380" y="365" fill="white" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" font-weight="bold">
        ${credibilityScore}
      </text>
      
      <!-- Stats Grid -->
      <rect x="520" y="240" width="140" height="80" rx="10" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.3)" stroke-width="1"/>
      <text x="590" y="270" fill="#10b981" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" font-weight="bold">
        ${Math.floor(Math.random() * 50) + 10}
      </text>
      <text x="590" y="290" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="14" text-anchor="middle">
        Reviews
      </text>
      
      <rect x="680" y="240" width="140" height="80" rx="10" fill="rgba(168,85,247,0.1)" stroke="rgba(168,85,247,0.3)" stroke-width="1"/>
      <text x="750" y="270" fill="#a855f7" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" font-weight="bold">
        ${Math.floor(Math.random() * 30) + 5}
      </text>
      <text x="750" y="290" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="14" text-anchor="middle">
        Vouches
      </text>
      
      <rect x="840" y="240" width="140" height="80" rx="10" fill="rgba(245,158,11,0.1)" stroke="rgba(245,158,11,0.3)" stroke-width="1"/>
      <text x="910" y="270" fill="#f59e0b" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" font-weight="bold">
        ${Math.floor(credibilityScore / 10) + 1}
      </text>
      <text x="910" y="290" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="14" text-anchor="middle">
        Rank
      </text>
      
      <!-- Footer -->
      <text x="600" y="580" fill="rgba(255,255,255,0.5)" font-family="Arial, sans-serif" font-size="16" text-anchor="middle">
        Powered by Ethos Network • Building Trust in Web3
      </text>
    </svg>
  `;
}

function generateSearchImage() {
  return `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0a0a0f;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- Search Icon -->
      <circle cx="600" cy="250" r="80" fill="none" stroke="url(#accent)" stroke-width="8"/>
      <line x1="660" y1="310" x2="720" y2="370" stroke="url(#accent)" stroke-width="8" stroke-linecap="round"/>
      
      <!-- Title -->
      <text x="600" y="420" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle">
        Search Ethos Network
      </text>
      
      <!-- Subtitle -->
      <text x="600" y="470" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="24" text-anchor="middle">
        Enter wallet address or @username to explore reputation
      </text>
      
      <!-- Footer -->
      <text x="600" y="580" fill="rgba(255,255,255,0.5)" font-family="Arial, sans-serif" font-size="16" text-anchor="middle">
        Powered by Ethos Network • Building Trust in Web3
      </text>
    </svg>
  `;
}

function generateStatsImage(users, reviews, avgScore) {
  return `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0a0a0f;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- Title -->
      <text x="600" y="100" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle">
        Ethos Network Stats
      </text>
      
      <!-- Stats Grid -->
      <rect x="100" y="180" width="300" height="200" rx="20" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.3)" stroke-width="2"/>
      <text x="250" y="240" fill="#6366f1" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle">
        ${users || '50K+'}
      </text>
      <text x="250" y="280" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="20" text-anchor="middle">
        Verified Users
      </text>
      
      <rect x="450" y="180" width="300" height="200" rx="20" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.3)" stroke-width="2"/>
      <text x="600" y="240" fill="#10b981" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle">
        ${reviews || '125K+'}
      </text>
      <text x="600" y="280" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="20" text-anchor="middle">
        Total Reviews
      </text>
      
      <rect x="800" y="180" width="300" height="200" rx="20" fill="rgba(168,85,247,0.1)" stroke="rgba(168,85,247,0.3)" stroke-width="2"/>
      <text x="950" y="240" fill="#a855f7" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle">
        ${avgScore || '750'}
      </text>
      <text x="950" y="280" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="20" text-anchor="middle">
        Avg Score
      </text>
      
      <!-- Footer -->
      <text x="600" y="500" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="24" text-anchor="middle">
        Building Trust in the Web3 Ecosystem
      </text>
      <text x="600" y="580" fill="rgba(255,255,255,0.5)" font-family="Arial, sans-serif" font-size="16" text-anchor="middle">
        Powered by Ethos Network
      </text>
    </svg>
  `;
}

function generateNotFoundImage(query) {
  const searchQuery = decodeURIComponent(query || 'Unknown');
  
  return `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0a0a0f;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- Icon -->
      <circle cx="600" cy="250" r="80" fill="none" stroke="#f59e0b" stroke-width="8"/>
      <text x="600" y="270" fill="#f59e0b" font-family="Arial, sans-serif" font-size="72" text-anchor="middle">?</text>
      
      <!-- Title -->
      <text x="600" y="380" fill="white" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle">
        User Not Found
      </text>
      
      <!-- Query -->
      <text x="600" y="430" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="20" text-anchor="middle">
        "${searchQuery}" not found in Ethos Network
      </text>
      
      <!-- Suggestion -->
      <text x="600" y="480" fill="rgba(255,255,255,0.5)" font-family="Arial, sans-serif" font-size="16" text-anchor="middle">
        Try a different wallet address or username
      </text>
      
      <!-- Footer -->
      <text x="600" y="580" fill="rgba(255,255,255,0.5)" font-family="Arial, sans-serif" font-size="16" text-anchor="middle">
        Powered by Ethos Network • Building Trust in Web3
      </text>
    </svg>
  `;
}

function generateErrorImage(message) {
  const errorMessage = decodeURIComponent(message || 'An error occurred');
  
  return `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0a0a0f;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- Icon -->
      <circle cx="600" cy="250" r="80" fill="none" stroke="#ef4444" stroke-width="8"/>
      <text x="600" y="270" fill="#ef4444" font-family="Arial, sans-serif" font-size="72" text-anchor="middle">!</text>
      
      <!-- Title -->
      <text x="600" y="380" fill="white" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle">
        Error
      </text>
      
      <!-- Message -->
      <text x="600" y="430" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="20" text-anchor="middle">
        ${errorMessage}
      </text>
      
      <!-- Footer -->
      <text x="600" y="580" fill="rgba(255,255,255,0.5)" font-family="Arial, sans-serif" font-size="16" text-anchor="middle">
        Powered by Ethos Network • Building Trust in Web3
      </text>
    </svg>
  `;
}

function generateDefaultImage() {
  return `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0a0a0f;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- Logo -->
      <circle cx="600" cy="250" r="80" fill="url(#accent)"/>
      <text x="600" y="270" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle">E</text>
      
      <!-- Title -->
      <text x="600" y="380" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle">
        Ethos Network
      </text>
      
      <!-- Subtitle -->
      <text x="600" y="430" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="24" text-anchor="middle">
        Web3 Reputation Platform
      </text>
      
      <!-- Description -->
      <text x="600" y="480" fill="rgba(255,255,255,0.5)" font-family="Arial, sans-serif" font-size="18" text-anchor="middle">
        Connect • Search • Build Trust
      </text>
      
      <!-- Footer -->
      <text x="600" y="580" fill="rgba(255,255,255,0.5)" font-family="Arial, sans-serif" font-size="16" text-anchor="middle">
        Building Trust in Web3
      </text>
    </svg>
  `;
}