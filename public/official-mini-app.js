// Official Farcaster Mini App Implementation
// Using @farcaster/miniapp-sdk from https://miniapps.farcaster.xyz/

// Import the SDK (this will be loaded via CDN)
let sdk = null;

// Application state
const AppState = {
    user: null,
    context: null,
    isReady: false,
    
    async init() {
        try {
            // Wait for SDK to be available
            await this.waitForSDK();
            
            // Get context
            this.context = await sdk.context;
            console.log('📱 Context loaded:', this.context);
            
            // Mark app as ready (CRITICAL - prevents infinite loading)
            await sdk.actions.ready();
            this.isReady = true;
            
            console.log('✅ Official Farcaster Mini App initialized');
            this.render();
            
        } catch (error) {
            console.error('❌ Failed to initialize Mini App:', error);
            this.initWebFallback();
        }
    },
    
    async waitForSDK() {
        let attempts = 0;
        while (!window.sdk && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.sdk) {
            sdk = window.sdk;
        } else {
            throw new Error('SDK not available');
        }
    },
    
    initWebFallback() {
        console.log('🌐 Initializing web fallback');
        this.context = { client: { name: 'web' } };
        this.isReady = true;
        this.render();
    },
    
    isInMiniApp() {
        return this.context?.client?.name !== 'web';
    },
    
    async authenticate() {
        if (!sdk) throw new Error('SDK not available');
        
        try {
            console.log('🔐 Starting authentication');
            const result = await sdk.auth.authenticate();
            this.user = result.user;
            
            // Success haptic
            if (sdk.haptics) {
                await sdk.haptics.success();
            }
            
            this.render();
            return result;
            
        } catch (error) {
            console.error('❌ Authentication failed:', error);
            
            // Error haptic
            if (sdk.haptics) {
                await sdk.haptics.error();
            }
            
            throw error;
        }
    },
    
    render() {
        this.renderApp();
    },
    
    renderApp() {
        const app = document.getElementById('app');
        if (!app) return;
        
        app.innerHTML = `
            <div class="container">
                <div class="header">
                    <h1>🔍 Farcaster Search</h1>
                    <p>Discover user reputation on Ethos Network</p>
                    ${this.renderStatus()}
                </div>
                
                ${this.renderAuth()}
                ${this.renderSearch()}
                ${this.renderResults()}
            </div>
        `;
        
        this.attachEventListeners();
    },
    
    renderStatus() {
        if (!this.isReady) {
            return '<div class="status loading">⏳ Loading...</div>';
        }
        
        const env = this.isInMiniApp() ? 'Farcaster Mini App' : 'Web Browser';
        return `<div class="status ready">✅ Running in ${env}</div>`;
    },
    
    renderAuth() {
        if (this.user) {
            return `
                <div class="auth-section connected">
                    <div class="user-info">
                        <h3>👤 Connected as @${this.user.username || this.user.displayName}</h3>
                        <p>FID: ${this.user.fid}</p>
                    </div>
                    <button class="btn secondary" onclick="AppState.disconnect()">Disconnect</button>
                </div>
            `;
        }
        
        if (this.isInMiniApp()) {
            return `
                <div class="auth-section">
                    <button class="btn primary" onclick="AppState.authenticate()">
                        🔐 Connect Farcaster Account
                    </button>
                </div>
            `;
        }
        
        return `
            <div class="auth-section web-notice">
                <div class="notice">
                    <h3>📱 Mini App Required</h3>
                    <p>To connect your Farcaster account, please open this app in a Farcaster client like Warpcast.</p>
                    <button class="btn secondary" onclick="AppState.openInFarcaster()">
                        Open in Farcaster
                    </button>
                </div>
            </div>
        `;
    },
    
    renderSearch() {
        return `
            <div class="search-section">
                <div class="search-form">
                    <input type="text" 
                           id="searchInput" 
                           placeholder="Enter Farcaster username..." 
                           class="search-input">
                    <button class="btn primary" onclick="AppState.searchUser()">
                        🔍 Search
                    </button>
                </div>
                
                <div class="examples">
                    <p>Try these examples:</p>
                    <button class="btn example" onclick="AppState.searchExample('serpinxbt')">@serpinxbt</button>
                    <button class="btn example" onclick="AppState.searchExample('newtonhere')">@newtonhere</button>
                    <button class="btn example" onclick="AppState.searchExample('hrithik')">@hrithik</button>
                </div>
            </div>
        `;
    },
    
    renderResults() {
        return '<div id="results" class="results-section"></div>';
    },
    
    attachEventListeners() {
        // Enter key for search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchUser();
                }
            });
        }
        
        // Back navigation for Mini Apps
        if (sdk && sdk.navigation) {
            sdk.navigation.onBack(() => {
                console.log('🔙 Back button pressed');
                // Handle back navigation
            });
        }
    },
    
    async searchUser() {
        const input = document.getElementById('searchInput');
        const username = input?.value?.trim();
        
        if (!username) {
            this.showError('Please enter a username');
            return;
        }
        
        this.showLoading(`Searching for @${username}...`);
        
        try {
            // Search via Ethos Network API
            const response = await fetch(`${API_BASE}/user/by/farcaster/username/${username}`);
            
            if (response.ok) {
                const data = await response.json();
                this.displayUser(data.user || data, username);
                
                // Success haptic
                if (sdk?.haptics) {
                    await sdk.haptics.success();
                }
            } else {
                this.showError(`User @${username} not found`);
                
                // Error haptic
                if (sdk?.haptics) {
                    await sdk.haptics.error();
                }
            }
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Search failed. Please try again.');
            
            // Error haptic
            if (sdk?.haptics) {
                await sdk.haptics.error();
            }
        }
    },
    
    searchExample(username) {
        const input = document.getElementById('searchInput');
        if (input) {
            input.value = username;
            this.searchUser();
        }
    },
    
    displayUser(userData, username) {
        const results = document.getElementById('results');
        if (!results) return;
        
        const score = userData.score || 0;
        const xpTotal = userData.xpTotal || 0;
        const reviews = userData.reviews || 0;
        const vouches = userData.vouches || 0;
        
        results.innerHTML = `
            <div class="user-card">
                <div class="user-header">
                    <h2>👤 @${username}</h2>
                    <div class="score">Score: ${score}</div>
                </div>
                
                <div class="user-stats">
                    <div class="stat">
                        <span class="label">XP Total:</span>
                        <span class="value">${xpTotal}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Reviews:</span>
                        <span class="value">${reviews}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Vouches:</span>
                        <span class="value">${vouches}</span>
                    </div>
                </div>
                
                <div class="actions">
                    <button class="btn secondary" onclick="AppState.openEthosProfile('${username}')">
                        📊 View Full Profile
                    </button>
                </div>
            </div>
        `;
    },
    
    showLoading(message) {
        const results = document.getElementById('results');
        if (results) {
            results.innerHTML = `
                <div class="loading-card">
                    <div class="spinner"></div>
                    <p>${message}</p>
                </div>
            `;
        }
    },
    
    showError(message) {
        const results = document.getElementById('results');
        if (results) {
            results.innerHTML = `
                <div class="error-card">
                    <h3>❌ Error</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    },
    
    async openEthosProfile(username) {
        const url = `https://ethos.network/profile/${username}`;
        
        if (sdk?.actions) {
            await sdk.actions.openUrl(url);
        } else {
            window.open(url, '_blank');
        }
    },
    
    async openInFarcaster() {
        const url = 'https://ethoschannel.netlify.app/';
        
        if (sdk?.actions) {
            await sdk.actions.openUrl(`farcaster://miniapp/${encodeURIComponent(url)}`);
        } else {
            window.open(url, '_blank');
        }
    },
    
    disconnect() {
        this.user = null;
        this.render();
        
        // Success haptic
        if (sdk?.haptics) {
            sdk.haptics.success();
        }
    }
};

// API Base URL
const API_BASE = 'https://api.ethos.network/api/v2';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Starting Official Farcaster Mini App');
    
    // Add CSS styles
    if (!document.getElementById('miniapp-styles')) {
        const style = document.createElement('style');
        style.id = 'miniapp-styles';
        style.textContent = `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                color: white;
                min-height: 100vh;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .header h1 {
                font-size: 2rem;
                margin-bottom: 10px;
                background: linear-gradient(135deg, #8b5cf6, #3b82f6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .status {
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.9rem;
                margin-top: 10px;
            }
            
            .status.loading {
                background: rgba(251, 191, 36, 0.2);
                color: #fbbf24;
            }
            
            .status.ready {
                background: rgba(16, 185, 129, 0.2);
                color: #10b981;
            }
            
            .auth-section, .search-section {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 20px;
                margin-bottom: 20px;
            }
            
            .user-info h3 {
                color: #10b981;
                margin-bottom: 5px;
            }
            
            .search-form {
                display: flex;
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .search-input {
                flex: 1;
                padding: 12px 16px;
                border: 2px solid rgba(139, 92, 246, 0.3);
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                font-size: 16px;
            }
            
            .search-input:focus {
                outline: none;
                border-color: #8b5cf6;
            }
            
            .btn {
                padding: 12px 20px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                display: inline-block;
                text-align: center;
            }
            
            .btn.primary {
                background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                color: white;
            }
            
            .btn.secondary {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .btn.example {
                background: rgba(59, 130, 246, 0.2);
                color: #3b82f6;
                margin: 5px;
                padding: 8px 12px;
                font-size: 0.9rem;
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
            
            .examples {
                text-align: center;
            }
            
            .examples p {
                margin-bottom: 10px;
                opacity: 0.7;
            }
            
            .user-card, .loading-card, .error-card, .web-notice .notice {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 20px;
                margin-top: 20px;
            }
            
            .user-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .score {
                background: linear-gradient(135deg, #10b981, #059669);
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 600;
            }
            
            .user-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .stat {
                display: flex;
                justify-content: space-between;
                padding: 10px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
            }
            
            .loading-card {
                text-align: center;
            }
            
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid rgba(139, 92, 246, 0.3);
                border-left-color: #8b5cf6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .error-card {
                border: 2px solid #ef4444;
                background: rgba(239, 68, 68, 0.1);
            }
            
            .web-notice {
                text-align: center;
            }
            
            .web-notice .notice {
                background: rgba(251, 191, 36, 0.1);
                border: 2px solid #fbbf24;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize the app
    await AppState.init();
});

// Export for global access
window.AppState = AppState;