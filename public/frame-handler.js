// Advanced Farcaster Frame Handler
class FrameHandler {
    constructor() {
        this.isInFrame = window.parent !== window;
        this.frameData = null;
        this.farcasterAPI = new FarcasterAPI();
        this.callbacks = {};
    }

    // Initialize Frame detection and listeners
    init() {
        this.detectFrameContext();
        this.setupMessageListeners();
        this.setupFrameButtons();
        
        console.log('🖼️ Frame Handler initialized', {
            isInFrame: this.isInFrame,
            frameData: this.frameData
        });
    }

    // Detect if we're running in a Frame
    detectFrameContext() {
        try {
            // Check for Frame-specific URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const frameParam = urlParams.get('frame');
            
            // Check for Frame-specific headers or context
            if (frameParam || this.isInFrame) {
                this.isInFrame = true;
                
                // Try to extract Frame data from URL or postMessage
                this.extractFrameData();
            }
        } catch (error) {
            console.warn('Frame detection error:', error);
        }
    }

    // Extract Frame data from various sources
    extractFrameData() {
        try {
            // Method 1: URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('fid')) {
                this.frameData = {
                    fid: urlParams.get('fid'),
                    username: urlParams.get('username'),
                    buttonIndex: urlParams.get('buttonIndex'),
                    inputText: urlParams.get('inputText')
                };
                return;
            }

            // Method 2: PostMessage from parent
            if (this.isInFrame) {
                window.parent.postMessage({
                    type: 'FRAME_REQUEST_DATA'
                }, '*');
            }

            // Method 3: Check for Frame signature in form data
            const frameSignature = this.getFrameSignatureFromRequest();
            if (frameSignature) {
                this.frameData = frameSignature;
            }
        } catch (error) {
            console.warn('Frame data extraction error:', error);
        }
    }

    // Setup message listeners for Frame communication
    setupMessageListeners() {
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
                console.warn('Frame message handling error:', error);
            }
        });
    }

    // Setup Frame button interactions
    setupFrameButtons() {
        // Add Frame-specific button behaviors
        document.addEventListener('click', (event) => {
            const button = event.target.closest('[data-frame-action]');
            if (button && this.isInFrame) {
                event.preventDefault();
                const action = button.dataset.frameAction;
                const target = button.dataset.frameTarget;
                
                this.executeFrameAction(action, target, button);
            }
        });
    }

    // Execute Frame actions
    executeFrameAction(action, target, element) {
        switch (action) {
            case 'post':
                this.postFrameAction(target, element);
                break;
            case 'link':
                this.linkFrameAction(target);
                break;
            case 'mint':
                this.mintFrameAction(target, element);
                break;
            case 'tx':
                this.transactionFrameAction(target, element);
                break;
            default:
                console.warn('Unknown Frame action:', action);
        }
    }

    // Handle Frame POST actions
    async postFrameAction(target, element) {
        try {
            const inputValue = this.getFrameInputValue();
            const buttonIndex = this.getButtonIndex(element);
            
            const postData = {
                untrustedData: {
                    fid: this.frameData?.fid || 0,
                    url: window.location.href,
                    messageHash: '0x' + Math.random().toString(16).substr(2, 8),
                    timestamp: Math.floor(Date.now() / 1000),
                    network: 1,
                    buttonIndex: buttonIndex,
                    inputText: inputValue,
                    castId: {
                        fid: this.frameData?.fid || 0,
                        hash: '0x' + Math.random().toString(16).substr(2, 8)
                    }
                },
                trustedData: {
                    messageBytes: 'simulated_frame_data'
                }
            };

            // Send POST to Frame endpoint
            const response = await fetch(target, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData)
            });

            if (response.ok) {
                const result = await response.json();
                this.handleFrameResponse(result);
            }
        } catch (error) {
            console.error('Frame POST action error:', error);
        }
    }

    // Handle Frame LINK actions
    linkFrameAction(target) {
        if (this.isInFrame) {
            // In Frame, send message to parent
            window.parent.postMessage({
                type: 'FRAME_REDIRECT',
                url: target
            }, '*');
        } else {
            // Regular browser
            window.open(target, '_blank');
        }
    }

    // Handle Frame user data
    async handleFrameUserData(userData) {
        this.frameData = { ...this.frameData, ...userData };
        
        if (userData.fid) {
            // Fetch full user data from Farcaster API
            const fcUser = await this.farcasterAPI.getUserByFid(userData.fid);
            if (fcUser) {
                const formattedUser = this.farcasterAPI.formatFarcasterUser(fcUser);
                this.triggerCallback('userConnected', formattedUser);
            }
        }
    }

    // Handle Frame button clicks
    handleFrameButtonClick(data) {
        const { buttonIndex, inputText } = data;
        this.triggerCallback('buttonClick', { buttonIndex, inputText });
    }

    // Handle Frame input submissions
    handleFrameInputSubmit(data) {
        const { inputText } = data;
        this.triggerCallback('inputSubmit', { inputText });
    }

    // Get Frame input value
    getFrameInputValue() {
        const input = document.querySelector('input[name="frame-input"]') || 
                     document.querySelector('input[type="text"]');
        return input ? input.value : '';
    }

    // Get button index
    getButtonIndex(element) {
        const buttons = document.querySelectorAll('[data-frame-action]');
        return Array.from(buttons).indexOf(element) + 1;
    }

    // Handle Frame responses
    handleFrameResponse(response) {
        if (response.image) {
            this.updateFrameImage(response.image);
        }
        
        if (response.buttons) {
            this.updateFrameButtons(response.buttons);
        }
        
        this.triggerCallback('frameResponse', response);
    }

    // Update Frame image
    updateFrameImage(imageUrl) {
        const frameImage = document.querySelector('.frame-image');
        if (frameImage) {
            frameImage.src = imageUrl;
        }
    }

    // Update Frame buttons
    updateFrameButtons(buttons) {
        const buttonContainer = document.querySelector('.frame-buttons');
        if (buttonContainer) {
            buttonContainer.innerHTML = '';
            buttons.forEach((button, index) => {
                const btn = document.createElement('button');
                btn.textContent = button.label;
                btn.dataset.frameAction = button.action;
                btn.dataset.frameTarget = button.target;
                buttonContainer.appendChild(btn);
            });
        }
    }

    // Register callbacks
    on(event, callback) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
    }

    // Trigger callbacks
    triggerCallback(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Callback error for ${event}:`, error);
                }
            });
        }
    }

    // Get Frame signature from request (for server-side validation)
    getFrameSignatureFromRequest() {
        try {
            // This would typically come from a server endpoint
            // For client-side, we simulate it
            return null;
        } catch (error) {
            return null;
        }
    }

    // Public API for connecting to Farcaster
    async connectFarcaster() {
        if (!this.isInFrame) {
            throw new Error('Farcaster connection only available in Frame context');
        }

        if (this.frameData?.fid) {
            const fcUser = await this.farcasterAPI.getUserByFid(this.frameData.fid);
            if (fcUser) {
                return this.farcasterAPI.formatFarcasterUser(fcUser);
            }
        }

        throw new Error('Unable to connect to Farcaster');
    }

    // Search Farcaster users
    async searchFarcasterUser(username) {
        const fcUser = await this.farcasterAPI.getUserByUsername(username);
        if (fcUser) {
            return this.farcasterAPI.formatFarcasterUser(fcUser);
        }
        return null;
    }
}

// Export for use in main app
window.FrameHandler = FrameHandler;