// Ethos Mapper - Farcaster Mini App with Ethos Network Integration
// Connect Farcaster profiles with Ethos Network analysis

console.log('🗺️ Starting Ethos Mapper App...');

const EthosMapper = {
    sdk: null,
    user: null,
    context: null,
    searchResults: null,
    isLoading: false,
    
    async init() {
        console.log('🔄 Initializing Farcaster Connection...');
        
        // Wait for SDK to load
        await this.waitForSDK();
        
        // Get context and check for user
        if (this.sdk) {
            try {
                this.context = await this.sdk.context;
                console.log('📱 Context:', this.context);
                
                // Check if user is already available in context
                if (this.context && this.context.user) {
                    console.log('🎉 User found in context:', this.context.user);
                    this.user = this.context.user;
                }
                
                // Mark as ready
                await this.sdk.actions.ready();
                console.log('✅ SDK ready() called');
            } catch (error) {
                console.warn('⚠️ Context error:', error);
                // Still mark as ready even if context fails
                try {
                    await this.sdk.actions.ready();
                    console.log('✅ SDK ready() called (fallback)');
                } catch (readyError) {
                    console.warn('⚠️ Ready() failed:', readyError);
                }
            }
        }
        
        this.render();
    },

    // Ethos Network API Integration
    async searchEthosProfile(username) {
        if (!username) return null;
        
        this.isLoading = true;
        this.render(); // Show loading state
        
        try {
            console.log('🔍 Searching Ethos profile for:', username);
            
            // Try multiple API endpoints for Ethos Network
            const endpoints = [
                `https://api.ethos.network/api/v2/user/by/farcaster/username/${username}`,
                `https://api.ethos.network/v2/user/by/farcaster/${username}`,
                `https://ethos.network/api/user/farcaster/${username}`
            ];
            
            let profileData = null;
            
            for (const endpoint of endpoints) {
                try {
                    console.log('📡 Trying endpoint:', endpoint);
                    const response = await fetch(endpoint);
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('✅ Ethos API response:', data);
                        profileData = this.processEthosData(data, username);
                        break;
                    } else {
                        console.warn('⚠️ Endpoint failed:', endpoint, response.status);
                    }
                } catch (error) {
                    console.warn('⚠️ Endpoint error:', endpoint, error);
                }
            }
            
            // If no API data, create mock data for demo
            if (!profileData) {
                console.log('📝 Creating demo data for:', username);
                profileData = this.createDemoData(username);
            }
            
            this.searchResults = profileData;
            
            // Success haptic
            if (this.sdk && this.sdk.haptics) {
                await this.sdk.haptics.success();
            }
            
        } catch (error) {
            console.error('❌ Ethos search failed:', error);
            
            // Error haptic
            if (this.sdk && this.sdk.haptics) {
                await this.sdk.haptics.error();
            }
            
            this.searchResults = this.createDemoData(username);
        } finally {
            this.isLoading = false;
            this.render();
        }
        
        return this.searchResults;
    },

    processEthosData(data, username) {
        // Process real Ethos API response
        return {
            username: username,
            ethosScore: data.score || data.ethos_score || 0,
            credibilityScore: data.credibility || data.credibility_score || 0,
            reviews: data.reviews || data.review_count || 0,
            vouches: data.vouches || data.vouch_count || 0,
            attestations: data.attestations || data.attestation_count || 0,
            reputation: data.reputation || 'Unknown',
            trustLevel: this.calculateTrustLevel(data.score || 0),
            profileUrl: `https://ethos.network/profile/${username}`,
            lastUpdated: new Date().toISOString(),
            source: 'ethos_api'
        };
    },

    createDemoData(username) {
        // Create realistic demo data for popular usernames
        const demoProfiles = {
            'serpinxbt': {
                ethosScore: 95,
                credibilityScore: 92,
                reviews: 247,
                vouches: 156,
                attestations: 89,
                reputation: 'Highly Trusted',
                description: 'Crypto researcher and analyst with strong reputation in DeFi space'
            },
            'newtonhere': {
                ethosScore: 88,
                credibilityScore: 85,
                reviews: 189,
                vouches: 134,
                attestations: 67,
                reputation: 'Trusted',
                description: 'Active Farcaster contributor and blockchain developer'
            },
            'hrithik': {
                ethosScore: 91,
                credibilityScore: 89,
                reviews: 203,
                vouches: 142,
                attestations: 78,
                reputation: 'Highly Trusted',
                description: 'Tech entrepreneur and Web3 community builder'
            }
        };

        const profile = demoProfiles[username.toLowerCase()] || {
            ethosScore: Math.floor(Math.random() * 40) + 60, // 60-100
            credibilityScore: Math.floor(Math.random() * 30) + 70, // 70-100
            reviews: Math.floor(Math.random() * 100) + 20,
            vouches: Math.floor(Math.random() * 80) + 10,
            attestations: Math.floor(Math.random() * 50) + 5,
            reputation: 'Active User',
            description: 'Farcaster community member with growing reputation'
        };

        return {
            username: username,
            ethosScore: profile.ethosScore,
            credibilityScore: profile.credibilityScore,
            reviews: profile.reviews,
            vouches: profile.vouches,
            attestations: profile.attestations,
            reputation: profile.reputation,
            description: profile.description,
            trustLevel: this.calculateTrustLevel(profile.ethosScore),
            profileUrl: `https://ethos.network/profile/${username}`,
            lastUpdated: new Date().toISOString(),
            source: 'demo_data'
        };
    },

    calculateTrustLevel(score) {
        if (score >= 90) return 'Exceptional';
        if (score >= 80) return 'Highly Trusted';
        if (score >= 70) return 'Trusted';
        if (score >= 60) return 'Reliable';
        if (score >= 50) return 'Developing';
        return 'New User';
    },
    
    async waitForSDK() {
        console.log('⏳ Waiting for Farcaster SDK...');
        
        for (let i = 0; i < 100; i++) {
            if (window.sdk) {
                this.sdk = window.sdk;
                console.log('✅ Farcaster SDK found!');
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (i % 10 === 0) {
                console.log(`⏳ Still waiting... ${i}/100`);
            }
        }
        
        console.warn('⚠️ SDK not found, creating fallback');
        this.createFallbackSDK();
    },
    
    createFallbackSDK() {
        this.sdk = {
            actions: {
                ready: async () => console.log('🌐 Fallback ready()'),
                openUrl: (url) => window.open(url, '_blank')
            },
            auth: {
                authenticate: async () => {
                    throw new Error('SDK not available - please open in Farcaster app');
                }
            },
            haptics: {
                success: async () => console.log('🌐 Fallback haptic'),
                error: async () => console.log('🌐 Fallback haptic')
            }
        };
        this.context = { client: { name: 'web' } };
    },
    
    render() {
        const app = document.getElementById('app');
        if (!app) return;
        
        const isInMiniApp = this.context?.client?.name !== 'web';
        const fromFrame = new URLSearchParams(window.location.search).get('from') === 'frame';
        
        app.innerHTML = `
            <style>
                body {
                    margin: 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    color: white;
                    padding: 20px;
                }
                .container {
                    max-width: 500px;
                    margin: 0 auto;
                    text-align: center;
                }
                .header {
                    margin-bottom: 40px;
                }
                .header h1 {
                    font-size: 2.5rem;
                    margin-bottom: 10px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }
                .status {
                    background: rgba(255,255,255,0.2);
                    padding: 10px 20px;
                    border-radius: 25px;
                    margin: 20px 0;
                    backdrop-filter: blur(10px);
                }
                .connect-section {
                    background: rgba(255,255,255,0.1);
                    padding: 30px;
                    border-radius: 20px;
                    margin: 20px 0;
                    backdrop-filter: blur(10px);
                }
                .btn {
                    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
                    border: none;
                    padding: 15px 30px;
                    border-radius: 50px;
                    color: white;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                }
                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .profile {
                    background: rgba(255,255,255,0.1);
                    padding: 25px;
                    border-radius: 20px;
                    margin: 20px 0;
                    backdrop-filter: blur(10px);
                }
                .profile-pic {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    margin: 0 auto 15px;
                    background: rgba(255,255,255,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                }
                .profile h2 {
                    margin: 10px 0;
                    font-size: 1.5rem;
                }
                .profile p {
                    margin: 5px 0;
                    opacity: 0.8;
                }
                .error {
                    background: rgba(255, 59, 48, 0.2);
                    border: 2px solid rgba(255, 59, 48, 0.5);
                    padding: 20px;
                    border-radius: 15px;
                    margin: 20px 0;
                }
                                            .web-notice {
                                background: rgba(255, 193, 7, 0.2);
                                border: 2px solid rgba(255, 193, 7, 0.5);
                                padding: 20px;
                                border-radius: 15px;
                                margin: 20px 0;
                            }
                            .search-section {
                                background: rgba(255,255,255,0.1);
                                padding: 30px;
                                border-radius: 20px;
                                margin: 20px 0;
                                backdrop-filter: blur(10px);
                                text-align: center;
                            }
                            .search-input {
                                margin: 20px 0;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                flex-wrap: wrap;
                                gap: 10px;
                            }
                            .example-profiles {
                                margin: 20px 0;
                            }
                            .btn-small {
                                background: rgba(255,255,255,0.2);
                                border: none;
                                padding: 8px 16px;
                                border-radius: 20px;
                                color: white;
                                font-size: 0.9rem;
                                cursor: pointer;
                                margin: 5px;
                                transition: all 0.3s ease;
                            }
                            .btn-small:hover {
                                background: rgba(255,255,255,0.3);
                                transform: translateY(-1px);
                            }
                            .connected-user {
                                background: rgba(40, 167, 69, 0.2);
                                border: 2px solid rgba(40, 167, 69, 0.5);
                                padding: 20px;
                                border-radius: 15px;
                                margin: 20px 0;
                            }
                            .loading-section {
                                text-align: center;
                                padding: 40px;
                            }
                            .spinner {
                                font-size: 3rem;
                                animation: spin 2s linear infinite;
                            }
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                            .ethos-analysis {
                                background: rgba(255,255,255,0.1);
                                padding: 30px;
                                border-radius: 20px;
                                margin: 20px 0;
                                backdrop-filter: blur(10px);
                            }
                            .profile-header {
                                text-align: center;
                                margin-bottom: 30px;
                            }
                            .trust-level {
                                font-size: 1.2rem;
                                font-weight: bold;
                                margin: 10px 0;
                            }
                            .score-section {
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                margin: 30px 0;
                            }
                            .main-score {
                                margin-bottom: 30px;
                            }
                            .score-circle {
                                width: 120px;
                                height: 120px;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                position: relative;
                            }
                            .score-inner {
                                width: 90px;
                                height: 90px;
                                background: rgba(255,255,255,0.9);
                                border-radius: 50%;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                color: #333;
                            }
                            .score-number {
                                font-size: 2rem;
                                font-weight: bold;
                                line-height: 1;
                            }
                            .score-label {
                                font-size: 0.8rem;
                                opacity: 0.8;
                            }
                            .metrics-grid {
                                display: grid;
                                grid-template-columns: repeat(2, 1fr);
                                gap: 20px;
                                width: 100%;
                                max-width: 300px;
                            }
                            .metric {
                                text-align: center;
                                background: rgba(255,255,255,0.1);
                                padding: 15px;
                                border-radius: 15px;
                            }
                            .metric-value {
                                font-size: 1.5rem;
                                font-weight: bold;
                                margin-bottom: 5px;
                            }
                            .metric-label {
                                font-size: 0.9rem;
                                opacity: 0.8;
                            }
                            .reputation-section {
                                text-align: center;
                                margin: 30px 0;
                                background: rgba(255,255,255,0.05);
                                padding: 20px;
                                border-radius: 15px;
                            }
                            .action-buttons {
                                display: flex;
                                gap: 10px;
                                justify-content: center;
                                flex-wrap: wrap;
                                margin-top: 30px;
                            }
            </style>
            
            <div class="container">
                <div class="header">
                                    <h1>🗺️ Ethos Mapper</h1>
                <p>Analyze Farcaster profiles with Ethos Network data</p>
                </div>
                
                <div class="status">
                    ${isInMiniApp ? '📱 Running in Farcaster Mini App' : '🌐 Running in Web Browser'}
                    ${fromFrame ? ' (Opened from Frame)' : ''}
                </div>
                
                ${this.renderContent(isInMiniApp, fromFrame)}
            </div>
        `;
        
        this.attachEvents();
    },
    
    renderContent(isInMiniApp, fromFrame) {
        // If loading, show loading state
        if (this.isLoading) {
            return `
                <div class="loading-section">
                    <div class="spinner">🔄</div>
                    <h2>Analyzing Profile...</h2>
                    <p>Fetching Ethos Network data...</p>
                </div>
            `;
        }

        // If we have search results, show them
        if (this.searchResults) {
            return this.renderEthosAnalysis();
        }
        
        // Show search interface
        return `
            <div class="search-section">
                <h2>🔍 Search Farcaster Profile</h2>
                <p>Enter a Farcaster username to analyze their Ethos Network reputation</p>
                
                <div class="search-input">
                    <input type="text" id="usernameInput" placeholder="Enter username (e.g. serpinxbt)" 
                           onkeypress="if(event.key==='Enter') EthosMapper.handleSearch()"
                           style="padding: 12px; border: 2px solid rgba(255,255,255,0.3); border-radius: 25px; background: rgba(255,255,255,0.1); color: white; width: 250px; margin-right: 10px;">
                    <button class="btn" onclick="EthosMapper.handleSearch()" id="searchBtn">
                        🔍 Analyze
                    </button>
                </div>
                
                <div class="example-profiles">
                    <p><strong>Try these profiles:</strong></p>
                    <button class="btn-small" onclick="EthosMapper.searchExample('serpinxbt')">serpinxbt</button>
                    <button class="btn-small" onclick="EthosMapper.searchExample('newtonhere')">newtonhere</button>
                    <button class="btn-small" onclick="EthosMapper.searchExample('hrithik')">hrithik</button>
                </div>
                
                ${this.user ? `
                    <div class="connected-user">
                        <h3>👤 Connected as @${this.user.username || this.user.displayName}</h3>
                        <button class="btn" onclick="EthosMapper.searchExample('${this.user.username || this.user.displayName}')" 
                                style="background: linear-gradient(45deg, #28a745, #20c997);">
                            🗺️ Analyze My Profile
                        </button>
                    </div>
                ` : ''}
                
                ${!isInMiniApp ? `
                    <div class="web-notice">
                        <p>💡 <strong>Tip:</strong> Open this in Warpcast for full Mini App experience!</p>
                    </div>
                ` : ''}
            </div>
        `;
    },
    
    renderEthosAnalysis() {
        if (!this.searchResults) return '';
        
        const data = this.searchResults;
        const scoreColor = data.ethosScore >= 80 ? '#28a745' : data.ethosScore >= 60 ? '#ffc107' : '#dc3545';
        
        return `
            <div class="ethos-analysis">
                <div class="profile-header">
                    <h2>📊 @${data.username}</h2>
                    <p class="trust-level" style="color: ${scoreColor};">${data.trustLevel}</p>
                </div>
                
                <div class="score-section">
                    <div class="main-score">
                        <div class="score-circle" style="background: conic-gradient(${scoreColor} ${data.ethosScore * 3.6}deg, rgba(255,255,255,0.2) 0deg);">
                            <div class="score-inner">
                                <span class="score-number">${data.ethosScore}</span>
                                <span class="score-label">Ethos Score</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metrics-grid">
                        <div class="metric">
                            <div class="metric-value">${data.credibilityScore}</div>
                            <div class="metric-label">Credibility</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${data.reviews}</div>
                            <div class="metric-label">Reviews</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${data.vouches}</div>
                            <div class="metric-label">Vouches</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${data.attestations}</div>
                            <div class="metric-label">Attestations</div>
                        </div>
                    </div>
                </div>
                
                <div class="reputation-section">
                    <h3>🏆 Reputation: ${data.reputation}</h3>
                    ${data.description ? `<p>${data.description}</p>` : ''}
                    <p><small>Data source: ${data.source === 'ethos_api' ? 'Ethos Network API' : 'Demo Data'}</small></p>
                </div>
                
                <div class="action-buttons">
                    <button class="btn" onclick="EthosMapper.openEthosProfile('${data.username}')" 
                            style="background: linear-gradient(45deg, #007bff, #0056b3);">
                        🔗 View on Ethos.Network
                    </button>
                    <button class="btn" onclick="EthosMapper.newSearch()" 
                            style="background: linear-gradient(45deg, #6f42c1, #5a32a3);">
                        🔍 Search Another
                    </button>
                </div>
            </div>
        `;
    },

    async handleSearch() {
        const input = document.getElementById('usernameInput');
        const username = input?.value?.trim();
        
        if (!username) {
            alert('Please enter a username');
            return;
        }
        
        await this.searchEthosProfile(username);
    },

    async searchExample(username) {
        await this.searchEthosProfile(username);
    },

    newSearch() {
        this.searchResults = null;
        this.render();
    },

    openEthosProfile(username) {
        const url = `https://ethos.network/profile/${username}`;
        if (this.sdk && this.sdk.actions && this.sdk.actions.openUrl) {
            this.sdk.actions.openUrl(url);
        } else {
            window.open(url, '_blank');
        }
    },
    
    attachEvents() {
        // No additional events needed - using onclick in HTML
    },
    
    async connect() {
        const btn = document.getElementById('connectBtn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Connecting...';
        }
        
        try {
            console.log('🔐 Starting Farcaster authentication...');
            
            if (!this.sdk) {
                throw new Error('Farcaster SDK not available');
            }
            
            // Check if we have context with user info
            if (this.context && this.context.user) {
                console.log('✅ Using context user:', this.context.user);
                this.user = this.context.user;
                
                // Success haptic
                if (this.sdk.haptics) {
                    await this.sdk.haptics.success();
                }
                
                this.render();
                return;
            }
            
            // Try to get user info from SDK context
            try {
                const contextData = await this.sdk.context;
                console.log('📱 Full context data:', contextData);
                
                if (contextData && contextData.user) {
                    this.user = contextData.user;
                    
                    // Success haptic
                    if (this.sdk.haptics) {
                        await this.sdk.haptics.success();
                    }
                    
                    this.render();
                    return;
                }
            } catch (contextError) {
                console.warn('⚠️ Context fetch error:', contextError);
            }
            
            // If no user in context, show instructions
            throw new Error('User authentication requires opening this app directly in Farcaster client (like Warpcast)');
            
        } catch (error) {
            console.error('❌ Authentication failed:', error);
            
            // Error haptic
            if (this.sdk.haptics) {
                await this.sdk.haptics.error();
            }
            
            this.showError(error.message);
            
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Connect Farcaster Account';
            }
        }
    },
    
    disconnect() {
        console.log('🔓 Disconnecting...');
        this.user = null;
        
        if (this.sdk.haptics) {
            this.sdk.haptics.success();
        }
        
        this.render();
    },
    
    showError(message) {
        const container = document.querySelector('.container');
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.innerHTML = `
                <h3>❌ Connection Failed</h3>
                <p>${message}</p>
            `;
            container.appendChild(errorDiv);
            
            // Remove error after 5 seconds
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EthosMapper.init());
} else {
    EthosMapper.init();
}

// Export for global access
window.EthosMapper = EthosMapper;
window.FarcasterConnect = EthosMapper; // Backward compatibility