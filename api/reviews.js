export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Mock reviews database
  const mockReviews = [
    {
      id: 1,
      reviewerId: 1,
      revieweeId: 2,
      reviewerAddress: '0x1234567890abcdef1234567890abcdef12345678',
      revieweeAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      rating: 3, // 1 = down, 2 = neutral, 3 = up
      comment: 'Excellent work on the DeFi protocol audit. Very thorough and professional.',
      scoreChange: 3,
      transactionHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
      createdAt: new Date('2024-01-10').toISOString()
    },
    {
      id: 2,
      reviewerId: 2,
      revieweeId: 1,
      reviewerAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      revieweeAddress: '0x1234567890abcdef1234567890abcdef12345678',
      rating: 3,
      comment: 'Great research insights and valuable community contributions.',
      scoreChange: 3,
      transactionHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
      createdAt: new Date('2024-01-12').toISOString()
    },
    {
      id: 3,
      reviewerId: 1,
      revieweeId: 2,
      reviewerAddress: '0x1234567890abcdef1234567890abcdef12345678',
      revieweeAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      rating: 2,
      comment: 'Good work overall, but could improve communication.',
      scoreChange: 0,
      transactionHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
      createdAt: new Date('2024-01-18').toISOString()
    }
  ];

  try {
    switch (req.method) {
      case 'GET':
        if (req.query.address) {
          // Get reviews for a specific address
          const address = req.query.address.toLowerCase();
          const type = req.query.type; // 'given' or 'received'
          
          let filteredReviews;
          if (type === 'given') {
            filteredReviews = mockReviews.filter(r => r.reviewerAddress.toLowerCase() === address);
          } else if (type === 'received') {
            filteredReviews = mockReviews.filter(r => r.revieweeAddress.toLowerCase() === address);
          } else {
            // Return both given and received
            filteredReviews = mockReviews.filter(r => 
              r.reviewerAddress.toLowerCase() === address || 
              r.revieweeAddress.toLowerCase() === address
            );
          }

          // Calculate review statistics
          const receivedReviews = filteredReviews.filter(r => r.revieweeAddress.toLowerCase() === address);
          const stats = {
            total: receivedReviews.length,
            positive: receivedReviews.filter(r => r.rating === 3).length,
            neutral: receivedReviews.filter(r => r.rating === 2).length,
            negative: receivedReviews.filter(r => r.rating === 1).length,
            averageRating: receivedReviews.length > 0 
              ? receivedReviews.reduce((sum, r) => sum + r.rating, 0) / receivedReviews.length 
              : 0
          };

          res.status(200).json({
            reviews: filteredReviews,
            stats,
            total: filteredReviews.length
          });
        } else {
          // Return all reviews with pagination
          const page = parseInt(req.query.page) || 1;
          const limit = parseInt(req.query.limit) || 10;
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          
          res.status(200).json({
            reviews: mockReviews.slice(startIndex, endIndex),
            total: mockReviews.length,
            page,
            totalPages: Math.ceil(mockReviews.length / limit)
          });
        }
        break;

      case 'POST':
        const { reviewerAddress, revieweeAddress, rating, comment } = req.body;
        
        if (!reviewerAddress || !revieweeAddress || !rating) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        if (reviewerAddress.toLowerCase() === revieweeAddress.toLowerCase()) {
          return res.status(400).json({ error: 'Cannot review yourself' });
        }

        if (![1, 2, 3].includes(rating)) {
          return res.status(400).json({ error: 'Rating must be 1 (down), 2 (neutral), or 3 (up)' });
        }

        // Calculate score change based on rating
        let scoreChange = 0;
        switch (rating) {
          case 1: // Down
            scoreChange = -2;
            break;
          case 2: // Neutral
            scoreChange = 0;
            break;
          case 3: // Up
            scoreChange = 3;
            break;
        }

        // Simulate transaction hash generation
        const transactionHash = '0x' + Array.from({length: 64}, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('');

        const newReview = {
          id: mockReviews.length + 1,
          reviewerId: Math.floor(Math.random() * 1000) + 1,
          revieweeId: Math.floor(Math.random() * 1000) + 1,
          reviewerAddress,
          revieweeAddress,
          rating,
          comment: comment || '',
          scoreChange,
          transactionHash,
          createdAt: new Date().toISOString()
        };

        mockReviews.push(newReview);

        // Simulate blockchain delay
        setTimeout(() => {
          res.status(201).json({
            ...newReview,
            message: 'Review submitted successfully',
            reputationChange: scoreChange
          });
        }, 800);
        break;

      case 'PUT':
        const reviewId = parseInt(req.query.id);
        const reviewIndex = mockReviews.findIndex(r => r.id === reviewId);
        
        if (reviewIndex === -1) {
          return res.status(404).json({ error: 'Review not found' });
        }

        // Recalculate score change if rating is updated
        const updatedData = { ...req.body };
        if (updatedData.rating && [1, 2, 3].includes(updatedData.rating)) {
          switch (updatedData.rating) {
            case 1:
              updatedData.scoreChange = -2;
              break;
            case 2:
              updatedData.scoreChange = 0;
              break;
            case 3:
              updatedData.scoreChange = 3;
              break;
          }
        }

        const updatedReview = {
          ...mockReviews[reviewIndex],
          ...updatedData,
          id: reviewId,
          updatedAt: new Date().toISOString()
        };

        mockReviews[reviewIndex] = updatedReview;
        res.status(200).json(updatedReview);
        break;

      case 'DELETE':
        const deleteReviewId = parseInt(req.query.id);
        const deleteReviewIndex = mockReviews.findIndex(r => r.id === deleteReviewId);
        
        if (deleteReviewIndex === -1) {
          return res.status(404).json({ error: 'Review not found' });
        }

        // Remove the review (in production, you might want to mark as deleted instead)
        const deletedReview = mockReviews.splice(deleteReviewIndex, 1)[0];

        res.status(200).json({ 
          message: 'Review deleted successfully',
          review: deletedReview
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Reviews API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}