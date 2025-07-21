// Official Farcaster Mini App Implementation
// Following https://docs.farcaster.xyz/reference/ patterns

class FarcasterMiniApp {
    constructor() {
        this.isFrame = this.detectFrameEnvironment();
        this.userData = null;
        this.initialized = false;
        
        console.log('🚀 Farcaster Mini App initializing...');
        this.init();
    }

    // Detect if running in Farcaster Frame environment
    detectFrameEnvironment() {
        // Check for Farcaster-specific environment variables
        const isFrame = window.parent !== window || 
                       window.location.search.includes('frame=') ||
                       document.referrer.includes('warpcast') ||
                       window.navigator.userAgent.includes('farcaster');
        
        console.log('🖼️ Frame environment detected:', isFrame);
        return isFrame;
    }

    async init() {
        try {
            // Initialize based on environment
            if (this.isFrame) {
                await this.initializeFrameApp();
            } else {
                await this.initializeWebApp();
            }
            
            this.setupEventListeners();
            this.initialized = true;
            
            console.log('✅ Farcaster Mini App initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Farcaster Mini App:', error);
        }
    }

    async initializeFrameApp() {
        console.log('🖼️ Initializing as Farcaster Frame');
        
        // Try to get Frame context data
        this.frameData = this.extractFrameData();
        
        // Setup Frame-specific functionality
        this.setupFrameInteractions();
        
        // Auto-connect if user data is available
        if (this.frameData?.fid) {
            await this.connectFrameUser(this.frameData.fid);
        }
    }

    async initializeWebApp() {
        console.log('🌐 Initializing as Web App');
        
        // Show Frame instructions for web users
        this.showFrameInstructions();
    }

    extractFrameData() {
        try {
            // Method 1: URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('fid')) {
                return {
                    fid: urlParams.get('fid'),
                    username: urlParams.get('username'),
                    buttonIndex: urlParams.get('buttonIndex'),
                    inputText: urlParams.get('inputText')
                };
            }

            // Method 2: PostMessage from parent frame
            if (window.parent !== window) {
                window.parent.postMessage({ type: 'REQUEST_FRAME_DATA' }, '*');
            }

            // Method 3: Check for Farcaster context in localStorage
            const storedContext = localStorage.getItem('farcaster_context');
            if (storedContext) {
                return JSON.parse(storedContext);
            }

            return null;
        } catch (error) {
            console.warn('Error extracting Frame data:', error);
            return null;
        }
    }

    setupFrameInteractions() {
        // Listen for Frame messages
        window.addEventListener('message', (event) => {
            try {
                const { type, data } = event.data;
                
                switch (type) {
                    case 'FRAME_USER_DATA':
                        this.handleFrameUserData(data);
                        break;
                    case 'FRAME_BUTTON_CLICK':
                        this.handleFrameButtonClick(data);
                        break;
                    case 'FRAME_INPUT_SUBMIT':
                        this.handleFrameInputSubmit(data);
                        break;
                    default:
                        console.log('Unknown Frame message:', type, data);
                }
            } catch (error) {
                console.warn('Error handling Frame message:', error);
            }
        });

        // Setup Frame action handlers
        document.addEventListener('click', (event) => {
            const frameAction = event.target.closest('[data-frame-action]');
            if (frameAction && this.isFrame) {
                event.preventDefault();
                this.handleFrameAction(frameAction);
            }
        });
    }

    async connectFrameUser(fid) {
        try {
            console.log(`👤 Connecting Frame user with FID: ${fid}`);
            
            // Get user data from Farcaster API
            if (window.farcasterAPI) {
                const userData = await window.farcasterAPI.getUserByFid(fid);
                if (userData) {
                    this.userData = window.farcasterAPI.formatFarcasterUser(userData);
                    this.onUserConnected(this.userData);
                    return this.userData;
                }
            }
            
            throw new Error('Unable to fetch user data');
        } catch (error) {
            console.error('Error connecting Frame user:', error);
            return null;
        }
    }

    handleFrameUserData(data) {
        console.log('📨 Received Frame user data:', data);
        this.userData = data;
        this.onUserConnected(data);
    }

    handleFrameButtonClick(data) {
        console.log('🔘 Frame button clicked:', data);
        
        // Trigger custom events for button clicks
        const event = new CustomEvent('frameButtonClick', { detail: data });
        document.dispatchEvent(event);
    }

    handleFrameInputSubmit(data) {
        console.log('📝 Frame input submitted:', data);
        
        // Trigger search with input text
        if (data.inputText) {
            const event = new CustomEvent('frameSearch', { detail: data.inputText });
            document.dispatchEvent(event);
        }
    }

    handleFrameAction(element) {
        const action = element.dataset.frameAction;
        const target = element.dataset.frameTarget;
        
        console.log(`🎯 Executing Frame action: ${action} -> ${target}`);
        
        switch (action) {
            case 'link':
                this.openLink(target);
                break;
            case 'post':
                this.postToFrame(target, element);
                break;
            case 'mint':
                this.handleMint(target, element);
                break;
            case 'tx':
                this.handleTransaction(target, element);
                break;
            default:
                console.warn('Unknown Frame action:', action);
        }
    }

    openLink(url) {
        if (this.isFrame) {
            // In Frame, send message to parent
            window.parent.postMessage({
                type: 'FRAME_REDIRECT',
                url: url
            }, '*');
        } else {
            // In web app, open in new tab
            window.open(url, '_blank');
        }
    }

    async postToFrame(url, element) {
        try {
            const inputValue = this.getFrameInputValue();
            const postData = this.buildFramePostData(element, inputValue);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });
            
            if (response.ok) {
                const result = await response.json();
                this.handleFrameResponse(result);
            }
        } catch (error) {
            console.error('Frame POST error:', error);
        }
    }

    buildFramePostData(element, inputValue) {
        return {
            untrustedData: {
                fid: this.userData?.fid || 0,
                url: window.location.href,
                messageHash: '0x' + Math.random().toString(16).substr(2, 8),
                timestamp: Math.floor(Date.now() / 1000),
                network: 1,
                buttonIndex: this.getButtonIndex(element),
                inputText: inputValue || '',
                castId: {
                    fid: this.userData?.fid || 0,
                    hash: '0x' + Math.random().toString(16).substr(2, 8)
                }
            },
            trustedData: {
                messageBytes: this.generateMessageBytes()
            }
        };
    }

    generateMessageBytes() {
        // In a real implementation, this would be properly signed
        return 'simulated_frame_signature_' + Math.random().toString(16).substr(2, 8);
    }

    getFrameInputValue() {
        const input = document.querySelector('input[data-frame-input]') || 
                     document.querySelector('#searchInput');
        return input ? input.value.trim() : '';
    }

    getButtonIndex(element) {
        const buttons = document.querySelectorAll('[data-frame-action]');
        return Array.from(buttons).indexOf(element) + 1;
    }

    handleFrameResponse(response) {
        console.log('📨 Frame response received:', response);
        
        // Update UI based on Frame response
        if (response.image) {
            this.updateFrameImage(response.image);
        }
        
        if (response.buttons) {
            this.updateFrameButtons(response.buttons);
        }
        
        // Trigger custom event
        const event = new CustomEvent('frameResponse', { detail: response });
        document.dispatchEvent(event);
    }

    updateFrameImage(imageUrl) {
        const frameImage = document.querySelector('.frame-image');
        if (frameImage) {
            frameImage.src = imageUrl;
        }
    }

    updateFrameButtons(buttons) {
        const buttonContainer = document.querySelector('.frame-buttons');
        if (buttonContainer) {
            buttonContainer.innerHTML = '';
            buttons.forEach((button, index) => {
                const btn = document.createElement('button');
                btn.textContent = button.label;
                btn.dataset.frameAction = button.action;
                btn.dataset.frameTarget = button.target;
                btn.className = 'frame-btn';
                buttonContainer.appendChild(btn);
            });
        }
    }

    showFrameInstructions() {
        // Show instructions for web users on how to use as Frame
        const event = new CustomEvent('showFrameInstructions');
        document.dispatchEvent(event);
    }

    setupEventListeners() {
        // Custom event listeners for the main app
        document.addEventListener('frameButtonClick', (event) => {
            console.log('🔘 Button click event:', event.detail);
        });

        document.addEventListener('frameSearch', (event) => {
            console.log('🔍 Search event:', event.detail);
            // Trigger search in main app
            if (window.searchUser) {
                const input = document.getElementById('searchInput');
                if (input) {
                    input.value = event.detail;
                    window.searchUser();
                }
            }
        });

        document.addEventListener('frameResponse', (event) => {
            console.log('📨 Frame response event:', event.detail);
        });

        document.addEventListener('showFrameInstructions', () => {
            this.displayFrameInstructions();
        });
    }

    displayFrameInstructions() {
        const resultsDiv = document.getElementById('results');
        if (!resultsDiv) return;
        
        resultsDiv.innerHTML = `
            <div class="frame-instructions-card">
                <h3>🖼️ Farcaster Mini App</h3>
                <p>This is a Farcaster Mini App! For the best experience:</p>
                <div class="instructions-list">
                    <div class="instruction-item">
                        <span class="step">1.</span>
                        <span>Copy this URL: <code>https://ethoschannel.netlify.app</code></span>
                    </div>
                    <div class="instruction-item">
                        <span class="step">2.</span>
                        <span>Paste it in a Warpcast cast</span>
                    </div>
                    <div class="instruction-item">
                        <span class="step">3.</span>
                        <span>The Frame will appear with interactive features</span>
                    </div>
                    <div class="instruction-item">
                        <span class="step">4.</span>
                        <span>Your Farcaster profile will be automatically connected</span>
                    </div>
                </div>
                <p style="margin-top: 15px; color: rgba(255,255,255,0.8);">
                    You can still search for users in this web version!
                </p>
            </div>
        `;
    }

    onUserConnected(userData) {
        console.log('✅ User connected to Mini App:', userData);
        
        // Trigger connection event for main app
        const event = new CustomEvent('farcasterUserConnected', { detail: userData });
        document.dispatchEvent(event);
    }

    // Public API methods
    getCurrentUser() {
        return this.userData;
    }

    isFrameEnvironment() {
        return this.isFrame;
    }

    isInitialized() {
        return this.initialized;
    }
}

// Export for global access
window.FarcasterMiniApp = FarcasterMiniApp;