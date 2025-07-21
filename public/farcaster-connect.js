// Simple Farcaster SDK Connection App
// Focus: Connect with Farcaster and show profile

console.log('🚀 Starting Farcaster Connection App...');

const FarcasterConnect = {
    sdk: null,
    user: null,
    context: null,
    
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
            </style>
            
            <div class="container">
                <div class="header">
                                    <h1>🗺️ Ethos Mapper</h1>
                <p>Connect your Farcaster account for Ethos network analysis</p>
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
        if (this.user) {
            return this.renderProfile();
        }
        
        if (!isInMiniApp) {
            return `
                <div class="web-notice">
                    <h3>📱 ${fromFrame ? 'Frame Opened in Browser' : 'Farcaster Mini App Required'}</h3>
                    <p>${fromFrame ? 
                        'This Frame opened in your default browser. For full Farcaster integration, please open this link directly in Warpcast or another Farcaster client.' : 
                        'To connect your Farcaster account, please open this app in a Farcaster client like Warpcast.'
                    }</p>
                    <p><strong>Try this:</strong><br>
                    ${fromFrame ? 
                        '1. Copy this URL: https://ethoschannel.netlify.app<br>2. Open Warpcast<br>3. Paste and visit the URL directly' :
                        'Copy this URL: https://ethoschannel.netlify.app'
                    }</p>
                </div>
            `;
        }
        
        return `
            <div class="connect-section">
                <h2>🔐 Connect Your Account</h2>
                <p>Your Farcaster account should automatically connect when opened in a Farcaster client. If not, tap the button below:</p>
                <button class="btn" id="connectBtn" onclick="FarcasterConnect.connect()">
                    Connect Farcaster Account
                </button>
            </div>
        `;
    },
    
    renderProfile() {
        return `
            <div class="profile">
                <div class="profile-pic">
                    ${this.user.pfpUrl ? `<img src="${this.user.pfpUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : '👤'}
                </div>
                <h2>@${this.user.username || this.user.displayName || 'Unknown'}</h2>
                <p><strong>FID:</strong> ${this.user.fid}</p>
                ${this.user.displayName ? `<p><strong>Display Name:</strong> ${this.user.displayName}</p>` : ''}
                ${this.user.bio ? `<p><strong>Bio:</strong> ${this.user.bio}</p>` : ''}
                ${this.user.followerCount ? `<p><strong>Followers:</strong> ${this.user.followerCount}</p>` : ''}
                ${this.user.followingCount ? `<p><strong>Following:</strong> ${this.user.followingCount}</p>` : ''}
                
                <button class="btn" onclick="FarcasterConnect.disconnect()" style="background: linear-gradient(45deg, #6c757d, #495057); margin-top: 15px;">
                    Disconnect
                </button>
            </div>
        `;
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
    document.addEventListener('DOMContentLoaded', () => FarcasterConnect.init());
} else {
    FarcasterConnect.init();
}

// Export for global access
window.FarcasterConnect = FarcasterConnect;