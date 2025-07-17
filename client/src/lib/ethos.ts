// Ethos Network API integration

export interface EthosData {
  address: string;
  credibilityScore: number;
  vouchesReceived: number;
  vouchesGiven: number;
  reviewsGiven: number;
  networkSize: number;
  trustLevel: string;
  lastUpdated: string;
}

export interface VouchData {
  voucherId: number;
  voucheeId: number;
  stakeAmount: string;
  reason?: string;
}

export interface ReviewData {
  reviewerId: number;
  revieweeId: number;
  rating: number; // 1 = down, 2 = neutral, 3 = up
  comment?: string;
}

class EthosAPI {
  private baseUrl = "/api";

  async getEthosData(address: string): Promise<EthosData> {
    const response = await fetch(`${this.baseUrl}/ethos/${address}`);
    if (!response.ok) {
      throw new Error("Failed to fetch Ethos data");
    }
    return response.json();
  }

  async vouchForUser(vouchData: VouchData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/vouches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vouchData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to vouch for user");
    }
    
    return response.json();
  }

  async reviewUser(reviewData: ReviewData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to review user");
    }
    
    return response.json();
  }

  async getUserActivities(userId: number, limit: number = 20): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/users/${userId}/activities?limit=${limit}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user activities");
    }
    return response.json();
  }

  async getSuggestedUsers(userId: number, limit: number = 10): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/users/${userId}/suggested?limit=${limit}`);
    if (!response.ok) {
      throw new Error("Failed to fetch suggested users");
    }
    return response.json();
  }

  async createConnection(userId: number, connectedUserId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/connections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, connectedUserId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create connection");
    }
    
    return response.json();
  }
}

export const ethosAPI = new EthosAPI();
