// Official Farcaster Mini App SDK Integration
// Following https://miniapps.farcaster.xyz/docs/sdk/

class FarcasterSDK {
    constructor() {
        this.isInitialized = false;
        this.context = null;
        this.user = null;
        this.capabilities = {
            quickAuth: false,
            actions: false,
            wallet: false,
            haptics: false,
            backNavigation: false
        };
        
        console.log('🚀 Initializing Official Farcaster SDK');
        this.init();
    }

    async init() {
        try {
            // Check if we're in a Farcaster Mini App context
            this.context = await this.detectContext();
            
            if (this.context.isInMiniApp) {
                await this.initializeMiniApp();
            } else {
                await this.initializeWebApp();
            }
            
            this.isInitialized = true;
            console.log('✅ Farcaster SDK initialized', this.context);
        } catch (error) {
            console.error('❌ Failed to initialize Farcaster SDK:', error);
            this.initializeFallback();
        }
    }

    async detectContext() {
        // Official Mini App detection
        const isInMiniApp = window.parent !== window || 
                           window.location.search.includes('farcaster=') ||
                           document.referrer.includes('warpcast') ||
                           window.navigator.userAgent.includes('Farcaster');

        // Check for SDK availability
        const hasFarcasterSDK = typeof window.farcaster !== 'undefined';
        
        return {
            isInMiniApp,
            hasFarcasterSDK,
            userAgent: window.navigator.userAgent,
            referrer: document.referrer,
            url: window.location.href
        };
    }

    async initializeMiniApp() {
        console.log('🖼️ Initializing as Farcaster Mini App');
        
        // Check available capabilities
        await this.checkCapabilities();
        
        // Initialize SDK features
        if (this.capabilities.quickAuth) {
            await this.initializeQuickAuth();
        }
        
        if (this.capabilities.haptics) {
            this.initializeHaptics();
        }
        
        if (this.capabilities.backNavigation) {
            this.initializeBackNavigation();
        }
        
        // Try to get user context
        await this.getCurrentUser();
    }

    async initializeWebApp() {
        console.log('🌐 Initializing as Web App (not in Mini App)');
        
        // Show Mini App instructions
        this.showMiniAppInstructions();
    }

    initializeFallback() {
        console.log('🔄 Initializing fallback mode');
        this.isInitialized = true;
        this.context = {
            isInMiniApp: false,
            hasFarcasterSDK: false,
            fallbackMode: true
        };
    }

    async checkCapabilities() {
        // Check what's supported based on compatibility matrix
        try {
            // Quick Auth - supported
            this.capabilities.quickAuth = typeof window.farcaster?.quickAuth !== 'undefined';
            
            // Actions - ETA 1-2 weeks (as of compatibility page)
            this.capabilities.actions = false; // Not yet supported
            
            // Wallet - ETA 1-2 weeks
            this.capabilities.wallet = false; // Not yet supported
            
            // Haptics - supported
            this.capabilities.haptics = typeof window.farcaster?.haptics !== 'undefined';
            
            // Back Navigation - supported
            this.capabilities.backNavigation = typeof window.farcaster?.back !== 'undefined';
            
            console.log('📋 SDK Capabilities:', this.capabilities);
        } catch (error) {
            console.warn('⚠️ Error checking capabilities:', error);
        }
    }

    async initializeQuickAuth() {
        try {
            if (!this.capabilities.quickAuth) {
                console.log('⚠️ Quick Auth not supported');
                return;
            }

            // Initialize Quick Auth
            console.log('🔐 Initializing Quick Auth');
            
            // Note: Based on compatibility, getToken() cannot be retriggered if user dismisses on Base
            // So we need to handle this gracefully
            
        } catch (error) {
            console.error('❌ Quick Auth initialization failed:', error);
        }
    }

    initializeHaptics() {
        try {
            if (!this.capabilities.haptics) {
                console.log('⚠️ Haptics not supported');
                return;
            }

            console.log('📳 Haptics initialized');
            
            // Add haptic feedback methods
            this.haptics = {
                light: () => this.triggerHaptic('light'),
                medium: () => this.triggerHaptic('medium'),
                heavy: () => this.triggerHaptic('heavy'),
                success: () => this.triggerHaptic('success'),
                warning: () => this.triggerHaptic('warning'),
                error: () => this.triggerHaptic('error')
            };
        } catch (error) {
            console.error('❌ Haptics initialization failed:', error);
        }
    }

    initializeBackNavigation() {
        try {
            if (!this.capabilities.backNavigation) {
                console.log('⚠️ Back Navigation not supported');
                return;
            }

            console.log('⬅️ Back Navigation initialized');
            
            // Set up back button handler
            this.setupBackButton();
        } catch (error) {
            console.error('❌ Back Navigation initialization failed:', error);
        }
    }

    async getCurrentUser() {
        try {
            // Try to get current user from Farcaster context
            if (window.farcaster?.user) {
                this.user = window.farcaster.user;
                console.log('👤 User context available:', this.user);
                this.onUserAvailable(this.user);
                return this.user;
            }
            
            // Try Quick Auth if available
            if (this.capabilities.quickAuth) {
                return await this.authenticateUser();
            }
            
            console.log('👤 No user context available');
            return null;
        } catch (error) {
            console.error('❌ Error getting current user:', error);
            return null;
        }
    }

    async authenticateUser() {
        try {
            if (!this.capabilities.quickAuth) {
                throw new Error('Quick Auth not supported');
            }

            console.log('🔐 Starting Quick Auth flow');
            
            // Note: Based on compatibility matrix, this may have limitations on Base
            // Handle dismissal gracefully
            
            const token = await window.farcaster.quickAuth.getToken();
            if (token) {
                // Verify token and get user data
                const userData = await this.verifyToken(token);
                this.user = userData;
                this.onUserAvailable(userData);
                return userData;
            }
            
            throw new Error('Authentication cancelled or failed');
        } catch (error) {
            console.error('❌ Authentication failed:', error);
            this.onAuthenticationFailed(error);
            return null;
        }
    }

    async verifyToken(token) {
        try {
            // In a real implementation, verify token with your backend
            // For now, return mock user data
            return {
                fid: Math.floor(Math.random() * 100000),
                username: 'authenticated_user',
                displayName: 'Authenticated User',
                pfpUrl: null,
                isAuthenticated: true,
                token: token
            };
        } catch (error) {
            console.error('❌ Token verification failed:', error);
            throw error;
        }
    }

    triggerHaptic(type) {
        try {
            if (!this.capabilities.haptics) {
                console.log(`📳 Haptic ${type} (simulated - not supported)`);
                return;
            }

            if (window.farcaster?.haptics) {
                window.farcaster.haptics[type]?.();
                console.log(`📳 Haptic ${type} triggered`);
            }
        } catch (error) {
            console.error(`❌ Haptic ${type} failed:`, error);
        }
    }

    setupBackButton() {
        try {
            if (!this.capabilities.backNavigation) {
                return;
            }

            // Set up back button behavior
            if (window.farcaster?.back) {
                window.farcaster.back.setHandler(() => {
                    console.log('⬅️ Back button pressed');
                    this.onBackPressed();
                });
            }
        } catch (error) {
            console.error('❌ Back button setup failed:', error);
        }
    }

    onUserAvailable(user) {
        console.log('✅ User available:', user);
        
        // Trigger custom event
        const event = new CustomEvent('farcasterUserAuthenticated', { 
            detail: user 
        });
        document.dispatchEvent(event);
    }

    onAuthenticationFailed(error) {
        console.log('❌ Authentication failed:', error.message);
        
        // Trigger custom event
        const event = new CustomEvent('farcasterAuthFailed', { 
            detail: { error: error.message } 
        });
        document.dispatchEvent(event);
    }

    onBackPressed() {
        // Handle back button press
        const event = new CustomEvent('farcasterBackPressed');
        document.dispatchEvent(event);
        
        // Default behavior - go back in history
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // Close mini app or navigate to default page
            console.log('⬅️ At root - cannot go back further');
        }
    }

    showMiniAppInstructions() {
        // Show instructions for web users
        const event = new CustomEvent('showFarcasterMiniAppInstructions');
        document.dispatchEvent(event);
    }

    // Public API methods
    isInMiniApp() {
        return this.context?.isInMiniApp || false;
    }

    isReady() {
        return this.isInitialized;
    }

    getUser() {
        return this.user;
    }

    getCapabilities() {
        return this.capabilities;
    }

    async connect() {
        if (this.user) {
            return this.user;
        }
        
        return await this.authenticateUser();
    }

    disconnect() {
        this.user = null;
        console.log('👤 User disconnected');
        
        const event = new CustomEvent('farcasterUserDisconnected');
        document.dispatchEvent(event);
    }

    // Utility methods for UI feedback
    success(message) {
        console.log('✅', message);
        if (this.capabilities.haptics) {
            this.haptics.success();
        }
    }

    error(message) {
        console.error('❌', message);
        if (this.capabilities.haptics) {
            this.haptics.error();
        }
    }

    warning(message) {
        console.warn('⚠️', message);
        if (this.capabilities.haptics) {
            this.haptics.warning();
        }
    }
}

// Export for global access
window.FarcasterSDK = FarcasterSDK;