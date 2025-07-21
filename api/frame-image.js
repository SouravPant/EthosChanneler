export default function handler(req, res) {
    // Set headers for image response
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    // Create a simple SVG that we'll convert to PNG-like response
    const svg = `
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="purple" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
                </linearGradient>
            </defs>
            
            <!-- Background -->
            <rect width="1200" height="630" fill="url(#bg)"/>
            
            <!-- Main container -->
            <rect x="100" y="100" width="1000" height="430" rx="20" fill="rgba(255,255,255,0.05)" stroke="rgba(139,92,246,0.3)" stroke-width="2"/>
            
            <!-- Purple circle decoration -->
            <circle cx="200" cy="200" r="50" fill="url(#purple)" opacity="0.3"/>
            <circle cx="1000" cy="450" r="30" fill="url(#purple)" opacity="0.2"/>
            
            <!-- Title -->
            <text x="600" y="200" text-anchor="middle" fill="url(#purple)" font-family="Arial, sans-serif" font-size="48" font-weight="bold">
                🟣 Farcaster Search
            </text>
            
            <!-- Subtitle -->
            <text x="600" y="250" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="24">
                Discover user reputation on Ethos Network
            </text>
            
            <!-- Features -->
            <text x="600" y="320" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="20">
                🔍 Search any Farcaster user
            </text>
            <text x="600" y="360" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="20">
                👤 View your own profile
            </text>
            <text x="600" y="400" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="20">
                💎 ETH vouches & community reviews
            </text>
            
            <!-- Call to action -->
            <rect x="450" y="450" width="300" height="50" rx="25" fill="url(#purple)"/>
            <text x="600" y="480" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">
                Click to get started!
            </text>
        </svg>
    `;
    
    // For a real implementation, you'd convert SVG to PNG
    // For now, we'll return the SVG as PNG content type
    res.status(200).send(Buffer.from(svg));
}