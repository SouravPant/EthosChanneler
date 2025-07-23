// Simple Farcaster Search App - Immediate Loading
// Works with or without official SDK

console.log('🚀 Simple Farcaster App Loading...');

// Application state
const SimpleApp = {
    isReady: false,
    user: null,
    
    init() {
        console.log('✅ Simple App Initializing...');
        this.isReady = true;
        this.render();
        
        // Try to load SDK in background
        this.tryLoadSDK();
    },
    
    async tryLoadSDK() {
        try {
            // Wait a bit for SDK to load
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (window.sdk) {
                console.log('✅ SDK found, calling ready()');
                await window.sdk.actions.ready();
            } else {
                console.log('🌐 No SDK found, continuing in web mode');
            }
        } catch (error) {
            console.warn('⚠️ SDK error:', error);
        }
    },
    
    render() {
        const app = document.getElementById('app');
        if (!app) return;
        
        app.innerHTML = `
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    color: white;
                    min-height: 100vh;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
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
                    background: rgba(16, 185, 129, 0.2);
                    color: #10b981;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    margin-top: 10px;
                    display: inline-block;
                }
                .search-section {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 20px;
                    margin-bottom: 20px;
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
                }
                .btn.primary {
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                    color: white;
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
                .user-card, .loading-card, .error-card {
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
            </style>
            
            <div class="container">
                <div class="header">
                    <h1>🔍 Farcaster Search</h1>
                    <p>Discover user reputation on Ethos Network</p>
                    <div class="status">✅ App Ready - ${window.sdk ? 'SDK Loaded' : 'Web Mode'}</div>
                </div>
                
                <div class="search-section">
                    <div class="search-form">
                        <input type="text" 
                               id="searchInput" 
                               placeholder="Enter Farcaster username..." 
                               class="search-input">
                        <button class="btn primary" onclick="SimpleApp.searchUser()">
                            🔍 Search
                        </button>
                    </div>
                    
                    <div class="examples">
                        <p>Try these examples:</p>
                        <button class="btn example" onclick="SimpleApp.searchExample('serpinxbt')">@serpinxbt</button>
                        <button class="btn example" onclick="SimpleApp.searchExample('newtonhere')">@newtonhere</button>
                        <button class="btn example" onclick="SimpleApp.searchExample('hrithik')">@hrithik</button>
                    </div>
                </div>
                
                <div id="results"></div>
            </div>
        `;
        
        // Add event listeners
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchUser();
                }
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
            const response = await fetch(`https://api.ethos.network/api/v2/user/by/farcaster/username/${username}`);
            
            if (response.ok) {
                const data = await response.json();
                this.displayUser(data.user || data, username);
                
                // Try haptic feedback if SDK is available
                if (window.sdk?.haptics) {
                    await window.sdk.haptics.success();
                }
            } else {
                this.showError(`User @${username} not found`);
                
                if (window.sdk?.haptics) {
                    await window.sdk.haptics.error();
                }
            }
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Search failed. Please try again.');
            
            if (window.sdk?.haptics) {
                await window.sdk.haptics.error();
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
        
        const score = (userData.user && userData.user.score) || userData.score || 0;
        const xpTotal = (userData.user && userData.user.xpTotal) || userData.xpTotal || 0;
        const reviews = (userData.user && userData.user.reviews) || userData.reviews || 0;
        const vouches = (userData.user && userData.user.vouches) || userData.vouches || 0;
        // Use Ethos profile link from API if available, otherwise fallback
        const profileUrl = (userData.user && userData.user.links && userData.user.links.profile) || (userData.links && userData.links.profile) || `https://ethos.network/profile/${username}`;
        console.log('userData:', userData);
        console.log('Ethos profile URL:', profileUrl);
        
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
                    <button class="btn primary" onclick="SimpleApp.openProfile('${profileUrl}')">
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
    
    async openProfile(profileUrl) {
        if (window.sdk?.actions) {
            await window.sdk.actions.openUrl(profileUrl);
        } else {
            window.open(profileUrl, '_blank');
        }
    }
};

// Initialize immediately when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SimpleApp.init());
} else {
    SimpleApp.init();
}

// Export for global access
window.SimpleApp = SimpleApp;