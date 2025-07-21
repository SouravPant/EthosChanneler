// Farcaster Hub API Integration
class FarcasterAPI {
    constructor() {
        // Neynar API (free tier) - easier than running own hub
        this.neynarApiKey = 'NEYNAR_API_DOCS'; // Free tier key for testing
        this.neynarBaseUrl = 'https://api.neynar.com/v2/farcaster';
        
        // Warpcast API endpoints
        this.warpcastBaseUrl = 'https://api.warpcast.com/v2';
        
        // Hub endpoints (if you want to use direct hub)
        this.hubUrl = 'https://hub-api.neynar.com';
    }

    // Get user by FID (Farcaster ID)
    async getUserByFid(fid) {
        try {
            const response = await fetch(`${this.neynarBaseUrl}/user/bulk?fids=${fid}`, {
                headers: {
                    'Accept': 'application/json',
                    'api_key': this.neynarApiKey
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.users && data.users.length > 0 ? data.users[0] : null;
        } catch (error) {
            console.error('Error fetching user by FID:', error);
            return null;
        }
    }

    // Get user by username
    async getUserByUsername(username) {
        try {
            // Remove @ if present
            const cleanUsername = username.replace('@', '');
            
            const response = await fetch(`${this.neynarBaseUrl}/user/by_username?username=${cleanUsername}`, {
                headers: {
                    'Accept': 'application/json',
                    'api_key': this.neynarApiKey
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.user || null;
        } catch (error) {
            console.error('Error fetching user by username:', error);
            return null;
        }
    }

    // Get user's casts (posts)
    async getUserCasts(fid, limit = 10) {
        try {
            const response = await fetch(`${this.neynarBaseUrl}/casts?fid=${fid}&limit=${limit}`, {
                headers: {
                    'Accept': 'application/json',
                    'api_key': this.neynarApiKey
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.casts || [];
        } catch (error) {
            console.error('Error fetching user casts:', error);
            return [];
        }
    }

    // Get user's followers
    async getUserFollowers(fid, limit = 100) {
        try {
            const response = await fetch(`${this.neynarBaseUrl}/followers?fid=${fid}&limit=${limit}`, {
                headers: {
                    'Accept': 'application/json',
                    'api_key': this.neynarApiKey
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.users || [];
        } catch (error) {
            console.error('Error fetching followers:', error);
            return [];
        }
    }

    // Get user's following
    async getUserFollowing(fid, limit = 100) {
        try {
            const response = await fetch(`${this.neynarBaseUrl}/following?fid=${fid}&limit=${limit}`, {
                headers: {
                    'Accept': 'application/json',
                    'api_key': this.neynarApiKey
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.users || [];
        } catch (error) {
            console.error('Error fetching following:', error);
            return [];
        }
    }

    // Verify Frame signature (for real Frame authentication)
    async verifyFrameSignature(frameData) {
        try {
            const response = await fetch(`${this.neynarBaseUrl}/frame/validate`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'api_key': this.neynarApiKey
                },
                body: JSON.stringify(frameData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.valid === true ? data : null;
        } catch (error) {
            console.error('Error verifying frame signature:', error);
            return null;
        }
    }

    // Convert Farcaster user to our format
    formatFarcasterUser(fcUser) {
        if (!fcUser) return null;
        
        return {
            fid: fcUser.fid,
            username: fcUser.username,
            displayName: fcUser.display_name || fcUser.username,
            bio: fcUser.profile?.bio?.text || '',
            avatarUrl: fcUser.pfp_url,
            followerCount: fcUser.follower_count || 0,
            followingCount: fcUser.following_count || 0,
            verifications: fcUser.verifications || [],
            activeStatus: fcUser.active_status || 'active'
        };
    }
}

// Export for use in main app
window.FarcasterAPI = FarcasterAPI;