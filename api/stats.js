export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    // Simulate real-time stats (in production, these would come from a database)
    const baseStats = {
      users: 12847,
      vouches: 45293,
      ethStaked: 2.4,
      reviews: 89156
    };

    // Add some randomness to simulate real-time updates
    const variance = 0.05; // 5% variance
    const stats = {
      totalUsers: Math.floor(baseStats.users * (1 + (Math.random() - 0.5) * variance)),
      totalVouches: Math.floor(baseStats.vouches * (1 + (Math.random() - 0.5) * variance)),
      totalEthStaked: Number((baseStats.ethStaked * (1 + (Math.random() - 0.5) * variance)).toFixed(2)),
      totalReviews: Math.floor(baseStats.reviews * (1 + (Math.random() - 0.5) * variance)),
      // Additional stats
      activeUsers24h: Math.floor(baseStats.users * 0.15), // 15% daily active
      avgCredibilityScore: Math.floor(450 + Math.random() * 200),
      topUsers: [
        {
          address: '0xabcdef1234567890abcdef1234567890abcdef12',
          username: 'bob.eth',
          credibilityScore: 1205,
          rank: 1
        },
        {
          address: '0x1234567890abcdef1234567890abcdef12345678',
          username: 'alice.eth',
          credibilityScore: 847,
          rank: 2
        },
        {
          address: '0x9876543210fedcba9876543210fedcba98765432',
          username: 'charlie.eth',
          credibilityScore: 723,
          rank: 3
        }
      ],
      recentActivity: [
        {
          type: 'vouch',
          voucherAddress: '0x1234567890abcdef1234567890abcdef12345678',
          voucheeAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
          stakeAmount: '0.1',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString()
        },
        {
          type: 'review',
          reviewerAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
          revieweeAddress: '0x9876543210fedcba9876543210fedcba98765432',
          rating: 3,
          timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString()
        },
        {
          type: 'user_joined',
          userAddress: '0x5555555555555555555555555555555555555555',
          username: 'newuser.eth',
          timestamp: new Date(Date.now() - Math.random() * 1800000).toISOString()
        }
      ],
      networkHealth: {
        vouchSuccessRate: 0.89,
        avgReviewRating: 2.7,
        slashingEvents: 23,
        totalStakeSlashed: 1.2
      }
    };

    // Calculate growth metrics
    const growthMetrics = {
      usersGrowth: '+12.5%',
      vouchesGrowth: '+8.3%',
      stakeGrowth: '+15.7%',
      reviewsGrowth: '+6.9%'
    };

    res.status(200).json({
      ...stats,
      growth: growthMetrics,
      lastUpdated: new Date().toISOString(),
      status: 'healthy'
    });

  } catch (error) {
    console.error('Stats API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch platform statistics'
    });
  }
}