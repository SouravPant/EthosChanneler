// Farcaster Frame App - Pure JavaScript Implementation
// Main application file

const API_BASE = 'https://api.ethos.network/api/v2';
let connectedUser = null;
let currentTab = 'search';
let frameHandler = null;
let farcasterAPI = null;

// Check if running in Farcaster Frame context
const isInFrame = window.parent !== window || window.location !== window.parent.location;

// Application state management
const AppState = {
    user: null,
    tab: 'search',
    loading: false,
    
    setUser(user) {
        this.user = user;
        this.render();
    },
    
    setTab(tab) {
        this.tab = tab;
        this.render();
    },
    
    setLoading(loading) {
        this.loading = loading;
        this.render();
    },
    
    render() {
        renderApp();
    }
};

// Utility functions
const utils = {
    weiToEth(weiAmount) {
        if (!weiAmount || weiAmount === 0) return '0';
        return (parseFloat(weiAmount) / 1000000000000000000).toFixed(6);
    },
    
    createElement(tag, props = {}, children = []) {
        const element = document.createElement(tag);
        
        // Set properties
        Object.keys(props).forEach(key => {
            if (key === 'className') {
                element.className = props[key];
            } else if (key === 'onClick') {
                element.addEventListener('click', props[key]);
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, props[key]);
            } else {
                element[key] = props[key];
            }
        });
        
        // Add children
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
        
        return element;
    }
};

// Component: Header
function createHeader() {
    return utils.createElement('div', { className: 'header' }, [
        utils.createElement('div', { className: 'logo' }, ['🟣 Farcaster Search']),
        utils.createElement('p', { className: 'tagline' }, ['Discover user reputation on Ethos Network'])
    ]);
}

// Component: Connection Section
function createConnectionSection() {
    const connectionSection = utils.createElement('div', { className: 'connection-section' });
    
    if (!connectedUser) {
        // Disconnected state
        const disconnectedDiv = utils.createElement('div', { id: 'disconnectedState' }, [
            utils.createElement('h3', { style: 'margin: 0 0 12px 0; color: #8b5cf6;' }, ['🔗 Connect to Farcaster']),
            utils.createElement('p', { style: 'margin: 0 0 16px 0; color: rgba(255,255,255,0.7); font-size: 0.9rem;' }, [
                'Connect your Farcaster account to view your own profile'
            ]),
            utils.createElement('button', {
                className: 'connect-btn',
                onClick: connectFarcaster
            }, ['Connect Farcaster'])
        ]);
        connectionSection.appendChild(disconnectedDiv);
    } else {
        // Connected state
        const connectedDiv = utils.createElement('div', { id: 'connectedState' }, [
            utils.createElement('div', { className: 'connected-info' }, [
                utils.createElement('strong', {}, ['✅ Connected to Farcaster']),
                utils.createElement('div', { style: 'margin-top: 8px; font-size: 0.9rem;' }, [`@${connectedUser.username}`])
            ]),
            utils.createElement('button', {
                className: 'my-profile-btn',
                onClick: showMyProfile
            }, ['👤 View My Profile']),
            utils.createElement('button', {
                className: 'disconnect-btn',
                onClick: disconnectFarcaster
            }, ['Disconnect'])
        ]);
        connectionSection.appendChild(connectedDiv);
    }
    
    return connectionSection;
}

// Component: Tab Navigation
function createTabNavigation() {
    return utils.createElement('div', { className: 'tab-buttons' }, [
        utils.createElement('button', {
            className: `tab-btn ${currentTab === 'search' ? 'active' : ''}`,
            onClick: () => switchTab('search')
        }, ['🔍 Search Users']),
        utils.createElement('button', {
            className: `tab-btn ${currentTab === 'profile' ? 'active' : ''}`,
            onClick: () => switchTab('profile'),
            style: connectedUser ? '' : 'opacity: 0.5; pointer-events: none;'
        }, ['👤 My Profile'])
    ]);
}

// Component: Search Section
function createSearchSection() {
    const searchSection = utils.createElement('div', {
        id: 'searchSection',
        className: 'search-container',
        style: currentTab === 'search' ? '' : 'display: none;'
    });
    
    const input = utils.createElement('input', {
        type: 'text',
        id: 'searchInput',
        className: 'search-input',
        placeholder: 'Enter Farcaster username (without @)',
        value: ''
    });
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchUser();
        }
    });
    
    const searchBtn = utils.createElement('button', {
        className: 'search-btn',
        onClick: searchUser
    }, ['Search User']);
    
    const examples = utils.createElement('div', { className: 'examples' }, [
        utils.createElement('span', {
            className: 'example-chip',
            onClick: () => searchExample('serpinxbt')
        }, ['serpinxbt']),
        utils.createElement('span', {
            className: 'example-chip',
            onClick: () => searchExample('newtonhere')
        }, ['newtonhere']),
        utils.createElement('span', {
            className: 'example-chip',
            onClick: () => searchExample('hrithik')
        }, ['hrithik'])
    ]);
    
    searchSection.appendChild(input);
    searchSection.appendChild(searchBtn);
    searchSection.appendChild(examples);
    
    return searchSection;
}

// Component: Profile Section
function createProfileSection() {
    const profileSection = utils.createElement('div', {
        id: 'profileSection',
        className: 'search-container',
        style: currentTab === 'profile' ? '' : 'display: none;'
    });
    
    const content = utils.createElement('div', { style: 'text-align: center; padding: 20px;' }, [
        utils.createElement('h3', { style: 'color: #10b981; margin-bottom: 16px;' }, ['👤 My Farcaster Profile']),
        utils.createElement('p', { style: 'color: rgba(255,255,255,0.7); margin-bottom: 20px;' }, [
            'Your personal Ethos Network reputation data'
        ]),
        utils.createElement('button', {
            className: 'my-profile-btn',
            onClick: showMyProfile
        }, ['🔄 Refresh My Profile'])
    ]);
    
    profileSection.appendChild(content);
    return profileSection;
}

// Component: Results Section
function createResultsSection() {
    return utils.createElement('div', { id: 'results' });
}

// Component: Footer
function createFooter() {
    return utils.createElement('div', { className: 'footer' }, [
        'Powered by Ethos Network API v2 | Farcaster Frame Compatible'
    ]);
}

// Main Functions
async function connectFarcaster() {
    const connectBtn = document.querySelector('.connect-btn');
    if (connectBtn) {
        connectBtn.disabled = true;
        connectBtn.textContent = 'Connecting...';
    }
    
    try {
        if (frameHandler && frameHandler.isInFrame) {
            // Real Frame connection
            const fcUser = await frameHandler.connectFarcaster();
            if (fcUser) {
                connectedUser = {
                    ...fcUser,
                    source: 'farcaster_frame'
                };
                AppState.setUser(connectedUser);
                
                if (connectBtn) {
                    connectBtn.disabled = false;
                    connectBtn.textContent = `Connected as @${fcUser.username}`;
                    connectBtn.style.backgroundColor = '#10b981';
                }
                
                // Show success message
                displayConnectionSuccess(fcUser);
                return;
            }
        }
        
        // Fallback for non-Frame context
        if (connectBtn) {
            connectBtn.disabled = false;
            connectBtn.textContent = 'Open in Farcaster';
            connectBtn.style.backgroundColor = '#8b5cf6';
        }
        
        // Show Frame required message
        displayFrameRequired();
        
    } catch (error) {
        console.error('Farcaster connection error:', error);
        
        if (connectBtn) {
            connectBtn.disabled = false;
            connectBtn.textContent = 'Connection Failed';
            connectBtn.style.backgroundColor = '#ef4444';
        }
        
        displayConnectionError(error.message);
    }
}

function displayConnectionSuccess(user) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = `
        <div class="success-card">
            <h4>✅ Connected to Farcaster!</h4>
            <div class="connected-user-info">
                ${user.avatarUrl ? `<img src="${user.avatarUrl}" alt="${user.displayName}" class="connected-avatar">` : ''}
                <div>
                    <p><strong>${user.displayName}</strong> (@${user.username})</p>
                    <p>FID: ${user.fid}</p>
                    <p>Followers: ${user.followerCount?.toLocaleString() || 0}</p>
                </div>
            </div>
            <p style="margin-top: 15px; color: rgba(255,255,255,0.8);">
                You can now view your profile and search for other users!
            </p>
        </div>
    `;
}

function displayFrameRequired() {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = `
        <div class="info-card">
            <h4>🖼️ Farcaster Frame Required</h4>
            <p>To connect your Farcaster profile, this app needs to be opened as a Frame within Farcaster.</p>
            <div style="margin: 15px 0;">
                <strong>How to use as a Frame:</strong>
                <ol style="text-align: left; margin: 10px 0; padding-left: 20px;">
                    <li>Copy this URL: <code>https://ethoschannel.netlify.app</code></li>
                    <li>Paste it in a Warpcast cast</li>
                    <li>The Frame will appear with interactive buttons</li>
                    <li>Your Farcaster profile will be automatically connected</li>
                </ol>
            </div>
            <p style="color: rgba(255,255,255,0.8);">
                You can still search for other users without connecting.
            </p>
        </div>
    `;
}

function displayConnectionError(message) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = `
        <div class="error-card">
            <h4>❌ Connection Failed</h4>
            <p>${message}</p>
            <p style="margin-top: 10px; color: rgba(255,255,255,0.8);">
                Please try again or use the app as a Farcaster Frame.
            </p>
        </div>
    `;
}

function disconnectFarcaster() {
    connectedUser = null;
    AppState.setUser(null);
    switchTab('search');
    clearResults();
}

function switchTab(tab) {
    currentTab = tab;
    AppState.setTab(tab);
    clearResults();
}

function searchExample(username) {
    const input = document.getElementById('searchInput');
    if (input) {
        input.value = username;
        searchUser();
    }
}

async function searchUser() {
    const input = document.getElementById('searchInput');
    const resultsDiv = document.getElementById('results');
    const searchBtn = document.querySelector('.search-btn');
    
    if (!input || !resultsDiv) return;
    
    const username = input.value.trim();
    
    if (!username) {
        displayError('⚠️ Username Required', 'Please enter a Farcaster username to search');
        return;
    }
    
    if (searchBtn) {
        searchBtn.disabled = true;
        searchBtn.textContent = 'Searching...';
    }
    
    displayLoading(`Searching for @${username} on Ethos Network and Farcaster...`);
    
    try {
        // Search both Ethos and Farcaster simultaneously
        const [ethosResponse, farcasterData] = await Promise.allSettled([
            fetch(`${API_BASE}/user/by/farcaster/username/${username}`),
            farcasterAPI ? farcasterAPI.getUserByUsername(username) : Promise.resolve(null)
        ]);
        
        let ethosData = null;
        let fcData = null;
        
        // Process Ethos response
        if (ethosResponse.status === 'fulfilled' && ethosResponse.value.ok) {
            const data = await ethosResponse.value.json();
            ethosData = data.user || data;
            console.log('📊 Ethos API Response:', data); // Debug log
        } else if (ethosResponse.status === 'fulfilled') {
            console.log('❌ Ethos API Error:', ethosResponse.value.status, ethosResponse.value.statusText);
        }
        
        // Process Farcaster response
        if (farcasterData.status === 'fulfilled' && farcasterData.value) {
            fcData = farcasterData.value;
        }
        
        if (ethosData || fcData) {
            // Merge data from both sources
            const mergedData = mergeFarcasterAndEthosData(ethosData, fcData);
            console.log('🔄 Merged User Data:', mergedData); // Debug log
            displayUser(mergedData, username, false);
        } else {
            displayError('❌ User Not Found', 
                `No user found for Farcaster username: @${username}`, 
                'Try a different username or check the spelling');
        }
        
    } catch (error) {
        console.error('Search error:', error);
        displayError('🌐 Connection Error', 'Unable to connect to search services', error.message);
    } finally {
        if (searchBtn) {
            searchBtn.disabled = false;
            searchBtn.textContent = 'Search User';
        }
    }
}

function mergeFarcasterAndEthosData(ethosData, farcasterData) {
    if (!ethosData && !farcasterData) return null;
    if (!ethosData) return formatFarcasterOnlyData(farcasterData);
    if (!farcasterData) return ethosData;
    
    // Merge both datasets, preferring Farcaster for profile info
    return {
        ...ethosData,
        displayName: farcasterData.display_name || ethosData.displayName,
        avatarUrl: farcasterData.pfp_url || ethosData.avatarUrl,
        bio: farcasterData.profile?.bio?.text || ethosData.description,
        farcaster: {
            fid: farcasterData.fid,
            followerCount: farcasterData.follower_count,
            followingCount: farcasterData.following_count,
            verifications: farcasterData.verifications || [],
            activeStatus: farcasterData.active_status
        }
    };
}

function formatFarcasterOnlyData(farcasterData) {
    return {
        displayName: farcasterData.display_name || farcasterData.username,
        username: farcasterData.username,
        avatarUrl: farcasterData.pfp_url,
        description: farcasterData.profile?.bio?.text || '',
        farcasterOnly: true,
        farcaster: {
            fid: farcasterData.fid,
            followerCount: farcasterData.follower_count,
            followingCount: farcasterData.following_count,
            verifications: farcasterData.verifications || [],
            activeStatus: farcasterData.active_status
        }
    };
}

async function showMyProfile() {
    if (!connectedUser) {
        displayError('🔗 Not Connected', 'Please connect your Farcaster account first');
        return;
    }
    
    const resultsDiv = document.getElementById('results');
    const refreshBtn = document.querySelector('#profileSection .my-profile-btn');
    const myProfileBtn = document.querySelector('#connectedState .my-profile-btn');
    
    if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.textContent = '🔄 Loading...';
    }
    if (myProfileBtn) {
        myProfileBtn.disabled = true;
        myProfileBtn.textContent = '👤 Loading...';
    }
    
    displayLoading('Loading your Farcaster profile from Ethos Network...');
    
    try {
        const url = `${API_BASE}/user/by/farcaster/username/${connectedUser.username}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok && data) {
            displayUser(data.user || data, connectedUser.username, true);
            switchTab('profile');
        } else {
            displayError('❌ Profile Not Found', 'Your Farcaster profile was not found on Ethos Network', 'You may need to create an Ethos Network profile first');
        }
    } catch (error) {
        displayError('🌐 Connection Error', 'Unable to load your profile', error.message);
    } finally {
        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.textContent = '🔄 Refresh My Profile';
        }
        if (myProfileBtn) {
            myProfileBtn.disabled = false;
            myProfileBtn.textContent = '👤 View My Profile';
        }
    }
}

// Format large numbers with K, M suffixes
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function displayUser(userData, searchTerm, isMyProfile = false) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;
    
    console.log('🎨 Displaying user data:', userData); // Debug log
    
    const name = userData.displayName || userData.username || searchTerm;
    
    // Handle different possible data structures for score and XP
    const score = userData.score || userData.credibilityScore || userData.reputation?.score || 0;
    const rawXpTotal = userData.xpTotal || userData.xp?.total || userData.stats?.xp?.total || 0;
    const xpTotal = formatNumber(rawXpTotal);
    const xpStreakDays = userData.xpStreakDays || userData.xp?.streak || userData.stats?.xp?.streak || 0;
    const status = userData.status || userData.activeStatus || 'Active';
    
    const cardClass = isMyProfile ? 'user-card my-profile-card' : 'user-card';
    const profileBadge = isMyProfile ? '<span class="profile-badge">MY PROFILE</span>' : '';
    
    // Avatar HTML
    let avatarHtml = '';
    if (userData.avatarUrl) {
        avatarHtml = `
            <img src="${userData.avatarUrl}" alt="${name}" class="user-avatar" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="avatar-fallback" style="display: none;">${name.charAt(0).toUpperCase()}</div>
        `;
    } else {
        avatarHtml = `<div class="avatar-fallback">${name.charAt(0).toUpperCase()}</div>`;
    }
    
    // Reviews section - handle different data structures
    let reviewsHtml = '';
    const reviewData = userData.stats?.review?.received || userData.reviews?.received || userData.reviews;
    if (reviewData) {
        const positive = reviewData.positive || reviewData.positiveCount || 0;
        const neutral = reviewData.neutral || reviewData.neutralCount || 0;
        const negative = reviewData.negative || reviewData.negativeCount || 0;
        
        reviewsHtml = `
            <div class="reviews-section">
                <div class="reviews-title">📊 Community Reviews</div>
                <div class="review-stats">
                    <div class="review-stat review-positive">
                        <div class="review-count" style="color: #10b981;">${positive}</div>
                        <div class="review-label">Positive</div>
                    </div>
                    <div class="review-stat review-neutral">
                        <div class="review-count" style="color: #f59e0b;">${neutral}</div>
                        <div class="review-label">Neutral</div>
                    </div>
                    <div class="review-stat review-negative">
                        <div class="review-count" style="color: #ef4444;">${negative}</div>
                        <div class="review-label">Negative</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Vouches section - handle different data structures
    let vouchesHtml = '';
    const vouchData = userData.stats?.vouch || userData.vouches || userData.vouch;
    if (vouchData) {
        const givenCount = vouchData.given?.count || vouchData.givenCount || 0;
        const givenAmount = vouchData.given?.amountWeiTotal || vouchData.givenAmountWei || 0;
        const receivedCount = vouchData.received?.count || vouchData.receivedCount || 0;
        const receivedAmount = vouchData.received?.amountWeiTotal || vouchData.receivedAmountWei || 0;
        
        vouchesHtml = `
            <div class="vouches-section">
                <div class="vouches-title">💎 Vouches</div>
                <div class="vouch-item">
                    <span class="vouch-label">Given</span>
                    <span class="vouch-value">${givenCount} vouches (${utils.weiToEth(givenAmount)} ETH)</span>
                </div>
                <div class="vouch-item">
                    <span class="vouch-label">Received</span>
                    <span class="vouch-value">${receivedCount} vouches (${utils.weiToEth(receivedAmount)} ETH)</span>
                </div>
            </div>
        `;
    }
    
    resultsDiv.innerHTML = `
        <div class="${cardClass}">
            <div class="user-header">
                ${avatarHtml}
                <div class="user-info">
                    <h3>${name}${profileBadge}</h3>
                    <div class="user-handle">@${searchTerm}</div>
                    <div class="user-status">Status: ${status}</div>
                    ${userData.description ? `<p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.8); font-size: 0.9rem;">${userData.description}</p>` : ''}
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${score}</div>
                    <div class="stat-label">Credibility</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${xpTotal}</div>
                    <div class="stat-label">XP Total</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${xpStreakDays}</div>
                    <div class="stat-label">XP Streak</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${userData.profileId || 'N/A'}</div>
                    <div class="stat-label">Profile ID</div>
                </div>
            </div>
            
            ${reviewsHtml}
            ${vouchesHtml}
            
            ${userData.links?.profile ? `
                <div style="margin-top: 20px; text-align: center;">
                    <a href="${userData.links.profile}" target="_blank" 
                       style="color: ${isMyProfile ? '#10b981' : '#8b5cf6'}; text-decoration: none; font-weight: 600;">
                        🔗 View Full Profile
                    </a>
                </div>
            ` : ''}
        </div>
    `;
}

function displayError(title, message, detail = '') {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = `
        <div class="error-card">
            <h4>${title}</h4>
            <p>${message}</p>
            ${detail ? `<p style="font-size: 0.85rem; margin-top: 10px;">${detail}</p>` : ''}
        </div>
    `;
}

function displayLoading(message) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = `
        <div class="loading-card">
            <div class="loading-spinner"></div>
            ${message}
        </div>
    `;
}

function clearResults() {
    const resultsDiv = document.getElementById('results');
    if (resultsDiv) {
        resultsDiv.innerHTML = '';
    }
}

// Frame API endpoint simulation
if (isInFrame) {
    window.addEventListener('message', function(event) {
        if (event.data.type === 'frame_button_clicked') {
            if (event.data.button === 1) {
                switchTab('search');
            } else if (event.data.button === 2) {
                if (connectedUser) {
                    showMyProfile();
                } else {
                    connectFarcaster();
                }
            }
        }
    });
}

// Main render function
function renderApp() {
    const app = document.getElementById('app');
    if (!app) return;
    
    // Clear existing content
    app.innerHTML = '';
    
    // Add all components
    app.appendChild(createHeader());
    app.appendChild(createConnectionSection());
    app.appendChild(createTabNavigation());
    app.appendChild(createSearchSection());
    app.appendChild(createProfileSection());
    app.appendChild(createResultsSection());
    app.appendChild(createFooter());
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Farcaster integration
    if (window.FarcasterAPI) {
        farcasterAPI = new FarcasterAPI();
        console.log('🔗 Official Farcaster API initialized');
    }
    
    if (window.FrameHandler) {
        frameHandler = new FrameHandler();
        frameHandler.init();
        
        // Set up Frame event listeners
        frameHandler.on('userConnected', (user) => {
            console.log('👤 Farcaster user connected:', user);
            connectedUser = user;
            AppState.setUser(user);
        });
        
        frameHandler.on('buttonClick', (data) => {
            console.log('🔘 Frame button clicked:', data);
            if (data.buttonIndex === 1) {
                // Search button
                if (data.inputText) {
                    const input = document.getElementById('searchInput');
                    if (input) {
                        input.value = data.inputText;
                        searchUser();
                    }
                }
            } else if (data.buttonIndex === 2) {
                // Connect & Search button
                connectFarcaster();
            }
        });
        
        console.log('🖼️ Frame Handler initialized');
    }
    
    // Initialize Farcaster Mini App
    let miniApp = null;
    if (window.FarcasterMiniApp) {
        miniApp = new FarcasterMiniApp();
        
        // Listen for Mini App events
        document.addEventListener('farcasterUserConnected', (event) => {
            console.log('👤 Mini App user connected:', event.detail);
            connectedUser = event.detail;
            AppState.setUser(event.detail);
        });
        
        document.addEventListener('frameSearch', (event) => {
            console.log('🔍 Mini App search triggered:', event.detail);
            const input = document.getElementById('searchInput');
            if (input) {
                input.value = event.detail;
                searchUser();
            }
        });
        
        console.log('🚀 Farcaster Mini App initialized');
    }
    
    renderApp();
    console.log('🟣 Farcaster Search App with Official SDK loaded');
    console.log('Environment:', miniApp?.isFrameEnvironment() ? 'Farcaster Frame' : 'Web Browser');
    console.log('Integrations:', {
        farcasterAPI: !!farcasterAPI,
        frameHandler: !!frameHandler,
        miniApp: !!miniApp
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppState,
        utils,
        connectFarcaster,
        disconnectFarcaster,
        searchUser,
        showMyProfile,
        renderApp
    };
}