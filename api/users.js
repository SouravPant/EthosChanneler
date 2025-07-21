export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Mock database - in production this would connect to a real database
  const mockUsers = [
    {
      id: 1,
      address: '0x1234567890abcdef1234567890abcdef12345678',
      username: 'alice.eth',
      displayName: 'Alice Cooper',
      credibilityScore: 847,
      vouchesReceived: 23,
      vouchesGiven: 12,
      reviewsGiven: 156,
      networkSize: 89,
      pfpUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      bio: 'Web3 enthusiast and DeFi researcher',
      createdAt: new Date('2023-01-15').toISOString()
    },
    {
      id: 2,
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      username: 'bob.eth',
      displayName: 'Bob Builder',
      credibilityScore: 1205,
      vouchesReceived: 45,
      vouchesGiven: 28,
      reviewsGiven: 203,
      networkSize: 156,
      pfpUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      bio: 'Smart contract developer and auditor',
      createdAt: new Date('2022-11-20').toISOString()
    }
  ];

  try {
    switch (req.method) {
      case 'GET':
        if (req.query.address) {
          const user = mockUsers.find(u => u.address.toLowerCase() === req.query.address.toLowerCase());
          if (user) {
            res.status(200).json(user);
          } else {
            res.status(404).json({ error: 'User not found' });
          }
        } else {
          // Return paginated users
          const page = parseInt(req.query.page) || 1;
          const limit = parseInt(req.query.limit) || 10;
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          
          res.status(200).json({
            users: mockUsers.slice(startIndex, endIndex),
            total: mockUsers.length,
            page,
            totalPages: Math.ceil(mockUsers.length / limit)
          });
        }
        break;

      case 'POST':
        const { address, username, displayName, bio } = req.body;
        
        if (!address || !username || !displayName) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if user already exists
        const existingUser = mockUsers.find(u => u.address.toLowerCase() === address.toLowerCase());
        if (existingUser) {
          return res.status(409).json({ error: 'User already exists' });
        }

        const newUser = {
          id: mockUsers.length + 1,
          address,
          username,
          displayName,
          bio: bio || '',
          credibilityScore: 100, // Starting score
          vouchesReceived: 0,
          vouchesGiven: 0,
          reviewsGiven: 0,
          networkSize: 0,
          pfpUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          createdAt: new Date().toISOString()
        };

        mockUsers.push(newUser);
        res.status(201).json(newUser);
        break;

      case 'PUT':
        const userId = parseInt(req.query.id);
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
          return res.status(404).json({ error: 'User not found' });
        }

        const updatedUser = {
          ...mockUsers[userIndex],
          ...req.body,
          id: userId, // Prevent ID changes
          address: mockUsers[userIndex].address, // Prevent address changes
          updatedAt: new Date().toISOString()
        };

        mockUsers[userIndex] = updatedUser;
        res.status(200).json(updatedUser);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}