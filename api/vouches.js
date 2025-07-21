export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Mock vouches database
  const mockVouches = [
    {
      id: 1,
      voucherId: 1,
      voucheeId: 2,
      voucherAddress: '0x1234567890abcdef1234567890abcdef12345678',
      voucheeAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      stakeAmount: '0.1',
      reason: 'Excellent smart contract auditor with proven track record',
      isActive: true,
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
      createdAt: new Date('2024-01-15').toISOString()
    },
    {
      id: 2,
      voucherId: 2,
      voucheeId: 1,
      voucherAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      voucheeAddress: '0x1234567890abcdef1234567890abcdef12345678',
      stakeAmount: '0.05',
      reason: 'Great researcher and community contributor',
      isActive: true,
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
      createdAt: new Date('2024-01-20').toISOString()
    }
  ];

  try {
    switch (req.method) {
      case 'GET':
        if (req.query.address) {
          // Get vouches for a specific address
          const address = req.query.address.toLowerCase();
          const type = req.query.type; // 'given' or 'received'
          
          let filteredVouches;
          if (type === 'given') {
            filteredVouches = mockVouches.filter(v => v.voucherAddress.toLowerCase() === address);
          } else if (type === 'received') {
            filteredVouches = mockVouches.filter(v => v.voucheeAddress.toLowerCase() === address);
          } else {
            // Return both given and received
            filteredVouches = mockVouches.filter(v => 
              v.voucherAddress.toLowerCase() === address || 
              v.voucheeAddress.toLowerCase() === address
            );
          }

          res.status(200).json({
            vouches: filteredVouches,
            total: filteredVouches.length
          });
        } else {
          // Return all vouches with pagination
          const page = parseInt(req.query.page) || 1;
          const limit = parseInt(req.query.limit) || 10;
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          
          res.status(200).json({
            vouches: mockVouches.slice(startIndex, endIndex),
            total: mockVouches.length,
            page,
            totalPages: Math.ceil(mockVouches.length / limit)
          });
        }
        break;

      case 'POST':
        const { voucherAddress, voucheeAddress, stakeAmount, reason } = req.body;
        
        if (!voucherAddress || !voucheeAddress || !stakeAmount) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        if (voucherAddress.toLowerCase() === voucheeAddress.toLowerCase()) {
          return res.status(400).json({ error: 'Cannot vouch for yourself' });
        }

        // Check if vouch already exists
        const existingVouch = mockVouches.find(v => 
          v.voucherAddress.toLowerCase() === voucherAddress.toLowerCase() &&
          v.voucheeAddress.toLowerCase() === voucheeAddress.toLowerCase() &&
          v.isActive
        );

        if (existingVouch) {
          return res.status(409).json({ error: 'Active vouch already exists between these users' });
        }

        // Simulate transaction hash generation
        const transactionHash = '0x' + Array.from({length: 64}, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('');

        const newVouch = {
          id: mockVouches.length + 1,
          voucherId: Math.floor(Math.random() * 1000) + 1,
          voucheeId: Math.floor(Math.random() * 1000) + 1,
          voucherAddress,
          voucheeAddress,
          stakeAmount,
          reason: reason || '',
          isActive: true,
          transactionHash,
          createdAt: new Date().toISOString()
        };

        mockVouches.push(newVouch);

        // Simulate blockchain delay
        setTimeout(() => {
          res.status(201).json({
            ...newVouch,
            message: 'Vouch created successfully',
            reputationBonus: 12
          });
        }, 1000);
        break;

      case 'PUT':
        const vouchId = parseInt(req.query.id);
        const vouchIndex = mockVouches.findIndex(v => v.id === vouchId);
        
        if (vouchIndex === -1) {
          return res.status(404).json({ error: 'Vouch not found' });
        }

        const updatedVouch = {
          ...mockVouches[vouchIndex],
          ...req.body,
          id: vouchId,
          updatedAt: new Date().toISOString()
        };

        mockVouches[vouchIndex] = updatedVouch;
        res.status(200).json(updatedVouch);
        break;

      case 'DELETE':
        const deleteVouchId = parseInt(req.query.id);
        const deleteVouchIndex = mockVouches.findIndex(v => v.id === deleteVouchId);
        
        if (deleteVouchIndex === -1) {
          return res.status(404).json({ error: 'Vouch not found' });
        }

        // Mark as inactive instead of deleting
        mockVouches[deleteVouchIndex].isActive = false;
        mockVouches[deleteVouchIndex].updatedAt = new Date().toISOString();

        res.status(200).json({ 
          message: 'Vouch deactivated successfully',
          vouch: mockVouches[deleteVouchIndex]
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Vouches API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}