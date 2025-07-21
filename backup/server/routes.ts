import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertVouchSchema, insertReviewSchema, insertActivitySchema, insertConnectionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/fid/:fid", async (req, res) => {
    try {
      const fid = parseInt(req.params.fid);
      const user = await storage.getUserByFid(fid);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:id/suggested", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 10;
      const users = await storage.getSuggestedUsers(id, limit);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Vouch routes
  app.post("/api/vouches", async (req, res) => {
    try {
      const vouchData = insertVouchSchema.parse(req.body);
      
      // Check if vouch already exists
      const existingVouch = await storage.getVouchBetweenUsers(vouchData.voucherId, vouchData.voucheeId);
      if (existingVouch) {
        return res.status(400).json({ message: "Vouch already exists between these users" });
      }
      
      const vouch = await storage.createVouch(vouchData);
      
      // Update user stats
      const voucher = await storage.getUser(vouchData.voucherId);
      const vouchee = await storage.getUser(vouchData.voucheeId);
      
      if (voucher && vouchee) {
        await storage.updateUser(vouchData.voucherId, { 
          vouchesGiven: voucher.vouchesGiven + 1 
        });
        await storage.updateUser(vouchData.voucheeId, { 
          vouchesReceived: vouchee.vouchesReceived + 1,
          credibilityScore: vouchee.credibilityScore + 12
        });
        
        // Create activity
        await storage.createActivity({
          userId: vouchData.voucheeId,
          actorId: vouchData.voucherId,
          type: "vouch_received",
          description: `User ${voucher.username} vouched for you`,
          scoreChange: 12,
        });
      }
      
      res.status(201).json(vouch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vouch data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:id/vouches-given", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vouches = await storage.getVouchesByUser(id);
      res.json(vouches);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:id/vouches-received", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vouches = await storage.getVouchesForUser(id);
      res.json(vouches);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Review routes
  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      
      // Update user stats
      const reviewer = await storage.getUser(reviewData.reviewerId);
      const reviewee = await storage.getUser(reviewData.revieweeId);
      
      if (reviewer && reviewee) {
        await storage.updateUser(reviewData.reviewerId, { 
          reviewsGiven: reviewer.reviewsGiven + 1 
        });
        
        const scoreChange = reviewData.rating === 3 ? 3 : reviewData.rating === 1 ? -2 : 0;
        await storage.updateUser(reviewData.revieweeId, { 
          credibilityScore: reviewee.credibilityScore + scoreChange 
        });
        
        // Create activity
        await storage.createActivity({
          userId: reviewData.revieweeId,
          actorId: reviewData.reviewerId,
          type: "review_received",
          description: `User ${reviewer.username} reviewed you`,
          scoreChange,
        });
      }
      
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:id/reviews-given", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reviews = await storage.getReviewsByUser(id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:id/reviews-received", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reviews = await storage.getReviewsForUser(id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Activity routes
  app.get("/api/users/:id/activities", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 20;
      const activities = await storage.getActivitiesByUser(id, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Connection routes
  app.post("/api/connections", async (req, res) => {
    try {
      const connectionData = insertConnectionSchema.parse(req.body);
      
      // Check if connection already exists
      const exists = await storage.areUsersConnected(connectionData.userId, connectionData.connectedUserId);
      if (exists) {
        return res.status(400).json({ message: "Connection already exists" });
      }
      
      const connection = await storage.createConnection(connectionData);
      
      // Update network sizes
      const user = await storage.getUser(connectionData.userId);
      const connectedUser = await storage.getUser(connectionData.connectedUserId);
      
      if (user && connectedUser) {
        await storage.updateUser(connectionData.userId, { 
          networkSize: user.networkSize + 1 
        });
        await storage.updateUser(connectionData.connectedUserId, { 
          networkSize: connectedUser.networkSize + 1 
        });
      }
      
      res.status(201).json(connection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid connection data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:id/connections", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const connections = await storage.getConnectionsByUser(id);
      res.json(connections);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Ethos Network integration endpoint
  app.get("/api/ethos/:address", async (req, res) => {
    try {
      const address = req.params.address;
      
      // Mock Ethos Network API response
      const ethosData = {
        address,
        credibilityScore: 847,
        vouchesReceived: 23,
        vouchesGiven: 12,
        reviewsGiven: 156,
        networkSize: 89,
        trustLevel: "Highly Trusted",
        lastUpdated: new Date().toISOString(),
      };
      
      res.json(ethosData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Ethos data" });
    }
  });

  // Farcaster Mini App webhook endpoint
  app.post("/api/webhook", async (req, res) => {
    try {
      console.log("Received webhook:", req.body);
      
      // Handle Farcaster webhook events
      const { type, data } = req.body;
      
      switch (type) {
        case "frame_interaction":
          // Handle frame interactions
          break;
        case "cast_mention":
          // Handle cast mentions
          break;
        default:
          console.log("Unknown webhook type:", type);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
