// Official Farcaster Mini App SDK Implementation
// Using @farcaster/miniapp-sdk from https://miniapps.farcaster.xyz/

class OfficialFarcasterSDK {
    constructor() {
        this.sdk = null;
        this.isInitialized = false;
        this.context = null;
        this.user = null;
        
        console.log('🚀 Initializing Official @farcaster/miniapp-sdk');
        this.init();
    }

    async init() {
        try {
            // Import the official SDK
            if (typeof window !== 'undefined' && window.sdk) {
                this.sdk = window.sdk;
            } else {
                // Fallback for CDN import
                const module = await import('https://esm.sh/@farcaster/miniapp-sdk');
                this.sdk = module.sdk;
            }

            // Initialize context
            this.context = await this.sdk.context;
            
            // Mark app as ready - this is CRITICAL
            await this.sdk.actions.ready();
            
            this.isInitialized = true;
            console.log('✅ Official Farcaster SDK initialized', this.context);
            
            // Setup event listeners
            this.setupEventListeners();
            
        } catch (error) {
            console.error('❌ Failed to initialize Official Farcaster SDK:', error);
            this.initializeFallback();
        }
    }

    setupEventListeners() {
        if (!this.sdk) return;

        // Listen for context changes
        this.sdk.on('contextChanged', (newContext) => {
            this.context = newContext;
            console.log('📱 Context updated:', newContext);
        });

        // Listen for user changes
        this.sdk.on('userChanged', (newUser) => {
            this.user = newUser;
            console.log('👤 User updated:', newUser);
        });
    }

    // Context API
    async getContext() {
        if (!this.sdk) return null;
        return await this.sdk.context;
    }

    // Quick Auth API
    async authenticate() {
        if (!this.sdk) throw new Error('SDK not initialized');
        
        try {
            console.log('🔐 Starting Quick Auth');
            const authResult = await this.sdk.auth.authenticate();
            this.user = authResult.user;
            
            // Trigger haptic feedback for success
            await this.success('Authentication successful!');
            
            return authResult;
        } catch (error) {
            console.error('❌ Authentication failed:', error);
            await this.error('Authentication failed');
            throw error;
        }
    }

    // Actions API
    async openUrl(url) {
        if (!this.sdk) throw new Error('SDK not initialized');
        return await this.sdk.actions.openUrl(url);
    }

    async close() {
        if (!this.sdk) throw new Error('SDK not initialized');
        return await this.sdk.actions.close();
    }

    // Haptics API
    async success(message = 'Success') {
        if (!this.sdk) return;
        try {
            await this.sdk.haptics.success();
            console.log(`✅ ${message}`);
        } catch (error) {
            console.warn('⚠️ Haptics not supported:', error);
        }
    }

    async error(message = 'Error') {
        if (!this.sdk) return;
        try {
            await this.sdk.haptics.error();
            console.log(`❌ ${message}`);
        } catch (error) {
            console.warn('⚠️ Haptics not supported:', error);
        }
    }

    async impact(style = 'medium') {
        if (!this.sdk) return;
        try {
            await this.sdk.haptics.impact(style);
        } catch (error) {
            console.warn('⚠️ Haptics not supported:', error);
        }
    }

    // Back Navigation API
    setupBackButton(callback) {
        if (!this.sdk) return;
        try {
            this.sdk.navigation.onBack(callback);
            console.log('🔙 Back button handler registered');
        } catch (error) {
            console.warn('⚠️ Back navigation not supported:', error);
        }
    }

    // Ethereum Wallet API
    async getEthereumProvider() {
        if (!this.sdk) throw new Error('SDK not initialized');
        try {
            return await this.sdk.wallet.ethereum.getProvider();
        } catch (error) {
            console.warn('⚠️ Ethereum wallet not supported:', error);
            return null;
        }
    }

    async requestEthereumAccounts() {
        if (!this.sdk) throw new Error('SDK not initialized');
        try {
            return await this.sdk.wallet.ethereum.requestAccounts();
        } catch (error) {
            console.warn('⚠️ Ethereum wallet not supported:', error);
            return [];
        }
    }

    // Solana Wallet API
    async getSolanaProvider() {
        if (!this.sdk) throw new Error('SDK not initialized');
        try {
            return await this.sdk.wallet.solana.getProvider();
        } catch (error) {
            console.warn('⚠️ Solana wallet not supported:', error);
            return null;
        }
    }

    // Events API
    on(event, callback) {
        if (!this.sdk) return;
        this.sdk.on(event, callback);
    }

    off(event, callback) {
        if (!this.sdk) return;
        this.sdk.off(event, callback);
    }

    // Utility methods
    isInMiniApp() {
        return this.context?.client?.name !== 'web';
    }

    getCurrentUser() {
        return this.user || this.context?.user;
    }

    // Fallback initialization for web browsers
    initializeFallback() {
        console.log('🌐 Initializing fallback for web browsers');
        this.context = {
            client: { name: 'web' },
            user: null
        };
        this.isInitialized = true;
    }

    // Connection method for backward compatibility
    async connect() {
        if (this.isInMiniApp()) {
            return await this.authenticate();
        } else {
            throw new Error('Mini App required for authentication. Please open in a Farcaster client.');
        }
    }
}

// Global instance
window.OfficialFarcasterSDK = OfficialFarcasterSDK;