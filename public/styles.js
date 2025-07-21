// CSS Styles for Farcaster Frame App
// This file contains all styles as JavaScript strings

const styles = `
    body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 600px; 
        margin: 0 auto; 
        padding: 20px; 
        background: #1a1a2e;
        color: #ffffff;
        line-height: 1.6;
        min-height: 100vh;
    }
    .header {
        text-align: center;
        padding: 30px 0;
        border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        margin-bottom: 30px;
    }
    .logo {
        font-size: 2.2rem;
        font-weight: 800;
        background: linear-gradient(135deg, #8b5cf6, #06b6d4);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 10px;
    }
    .tagline {
        color: rgba(255, 255, 255, 0.7);
        font-size: 1rem;
        margin: 0;
    }
    .connection-section {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 20px;
        backdrop-filter: blur(10px);
        text-align: center;
    }
    .connect-btn {
        background: linear-gradient(135deg, #8b5cf6, #06b6d4);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 16px 24px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-right: 10px;
    }
    .connect-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
    }
    .connect-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
    .disconnect-btn {
        background: rgba(239, 68, 68, 0.8);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .disconnect-btn:hover {
        background: rgba(239, 68, 68, 1);
    }
    .connected-info {
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 12px;
        padding: 16px;
        margin: 16px 0;
        color: #10b981;
    }
    .my-profile-btn {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 16px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
        margin-top: 12px;
    }
    .my-profile-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
    }
    .my-profile-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
    .tab-buttons {
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 8px;
    }
    .tab-btn {
        flex: 1;
        padding: 12px 16px;
        background: transparent;
        color: rgba(255, 255, 255, 0.7);
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .tab-btn.active {
        background: linear-gradient(135deg, #8b5cf6, #06b6d4);
        color: white;
    }
    .tab-btn:not(.active):hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
    }
    .search-container {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 30px;
        backdrop-filter: blur(10px);
    }
    .search-input {
        width: 100%;
        padding: 16px 20px;
        border: 2px solid rgba(139, 92, 246, 0.3);
        background: rgba(0, 0, 0, 0.3);
        color: white;
        border-radius: 12px;
        font-size: 16px;
        margin-bottom: 16px;
        transition: all 0.3s ease;
        box-sizing: border-box;
    }
    .search-input:focus {
        outline: none;
        border-color: #8b5cf6;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }
    .search-input::placeholder {
        color: rgba(255, 255, 255, 0.5);
    }
    .search-btn {
        width: 100%;
        padding: 16px;
        background: linear-gradient(135deg, #8b5cf6, #06b6d4);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .search-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
    }
    .search-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
    .examples {
        display: flex;
        gap: 8px;
        margin-top: 16px;
        flex-wrap: wrap;
        justify-content: center;
    }
    .example-chip {
        background: rgba(139, 92, 246, 0.2);
        color: #8b5cf6;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.85rem;
        cursor: pointer;
        border: 1px solid rgba(139, 92, 246, 0.3);
        transition: all 0.2s ease;
    }
    .example-chip:hover {
        background: rgba(139, 92, 246, 0.3);
        transform: scale(1.05);
    }
    .user-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(139, 92, 246, 0.2);
        border-radius: 20px;
        padding: 24px;
        margin: 20px 0;
        backdrop-filter: blur(10px);
    }
    .my-profile-card {
        border: 2px solid #10b981;
        background: rgba(16, 185, 129, 0.1);
    }
    .user-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .user-avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #8b5cf6;
    }
    .my-profile-card .user-avatar {
        border-color: #10b981;
    }
    .avatar-fallback {
        width: 64px;
        height: 64px;
        background: linear-gradient(135deg, #8b5cf6, #06b6d4);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: bold;
        color: white;
    }
    .my-profile-card .avatar-fallback {
        background: linear-gradient(135deg, #10b981, #059669);
    }
    .user-info h3 {
        margin: 0;
        font-size: 1.3rem;
        color: white;
    }
    .user-handle {
        color: #8b5cf6;
        font-size: 0.95rem;
        margin: 4px 0;
    }
    .my-profile-card .user-handle {
        color: #10b981;
    }
    .user-status {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.85rem;
    }
    .profile-badge {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-left: 8px;
    }
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 16px;
        margin: 20px 0;
    }
    .stat-card {
        background: rgba(0, 0, 0, 0.2);
        padding: 16px;
        border-radius: 12px;
        text-align: center;
        border: 1px solid rgba(139, 92, 246, 0.1);
    }
    .my-profile-card .stat-card {
        border-color: rgba(16, 185, 129, 0.2);
    }
    .stat-value {
        font-size: 1.4rem;
        font-weight: bold;
        color: #06b6d4;
        margin-bottom: 4px;
    }
    .my-profile-card .stat-value {
        color: #10b981;
    }
    .stat-label {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.7);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .reviews-section {
        margin: 20px 0;
        padding: 16px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 12px;
        border: 1px solid rgba(139, 92, 246, 0.1);
    }
    .my-profile-card .reviews-section {
        border-color: rgba(16, 185, 129, 0.2);
    }
    .reviews-title {
        font-size: 1rem;
        font-weight: 600;
        color: #8b5cf6;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .my-profile-card .reviews-title {
        color: #10b981;
    }
    .review-stats {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 12px;
    }
    .review-stat {
        text-align: center;
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
    }
    .review-positive { border-left: 3px solid #10b981; }
    .review-neutral { border-left: 3px solid #f59e0b; }
    .review-negative { border-left: 3px solid #ef4444; }
    .review-count {
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 4px;
    }
    .review-label {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.6);
        text-transform: uppercase;
    }
    .vouches-section {
        margin: 20px 0;
        padding: 16px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 12px;
        border: 1px solid rgba(139, 92, 246, 0.1);
    }
    .my-profile-card .vouches-section {
        border-color: rgba(16, 185, 129, 0.2);
    }
    .vouches-title {
        font-size: 1rem;
        font-weight: 600;
        color: #8b5cf6;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .my-profile-card .vouches-title {
        color: #10b981;
    }
    .vouch-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .vouch-item:last-child {
        border-bottom: none;
    }
    .vouch-label {
        color: rgba(255, 255, 255, 0.8);
    }
    .vouch-value {
        color: #06b6d4;
        font-weight: 600;
    }
    .my-profile-card .vouch-value {
        color: #10b981;
    }
    .error-card {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 16px;
        padding: 24px;
        text-align: center;
        color: #ef4444;
    }
    .loading-card {
        background: rgba(96, 165, 250, 0.1);
        border: 1px solid rgba(96, 165, 250, 0.3);
        border-radius: 16px;
        padding: 24px;
        text-align: center;
        color: #60a5fa;
    }
    .loading-spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid rgba(96, 165, 250, 0.3);
        border-radius: 50%;
        border-top-color: #60a5fa;
        animation: spin 1s ease-in-out infinite;
        margin-right: 8px;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .footer {
        text-align: center;
        margin-top: 40px;
        padding: 20px;
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.85rem;
        border-top: 1px solid rgba(139, 92, 246, 0.2);
    }
    .hidden {
        display: none;
    }
`;

// Function to inject styles into the page
function injectStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}

// Auto-inject styles when this script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
} else {
    injectStyles();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        styles,
        injectStyles
    };
}